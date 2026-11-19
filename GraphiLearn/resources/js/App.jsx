import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import StudentsView from './views/StudentsView';
import ExercisesView from './views/ExercisesView';
import ActivitiesView from './views/ActivitiesView';
import NewActivityView from './views/NewActivityView';
import ActivityDetailView from './views/ActivityDetailView';
import CoursesView from './views/CoursesView';
import ProfileView from './views/ProfileView';
import ProgrammedActivitiesView from './views/ProgrammedActivitiesView';
import TeachersView from './views/TeachersView';
import ModelVersionsView from './views/ModelVersionsView';
import StudentProgressView from './views/StudentProgressView';
import StudentReportsView from './views/StudentReportsView';
import EvaluationGridView from './views/EvaluationGridView';
import EvaluationCaptureView from './views/EvaluationCaptureView';
import StudentSheetView from './views/StudentSheetView';
import CourseReportView, { ResumenInforme } from './views/CourseReportView';
import DirectionCoursesView from './views/DirectionCoursesView';

export default function App() {
  // Authentication State from LocalStorage or false
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Se configura aquí (antes del primer render) y no en un useEffect: los efectos de las
    // vistas hijas se ejecutan antes que los del padre y sus primeras peticiones salían sin token
    // al recargar la página (401 en "Mis cursos").
    const token = sessionStorage.getItem('token');
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return !!token;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = sessionStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // Setup axios default authorization header if token exists
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Current Navigation View
  const [currentView, setCurrentView] = useState(() => {
    const saved = sessionStorage.getItem('user');
    const role = saved ? JSON.parse(saved).rol : null;
    return role === 'administrador' ? 'model-versions' : 'courses';
  });

  // Initial Mock Data (Section 14: Datos de prueba requeridos)
  const [students, setStudents] = useState([]);

  const [exercises, setExercises] = useState([]);

  const [activities, setActivities] = useState([]);

  const [selectedActivity, setSelectedActivity] = useState(activities[0]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentReturnView, setStudentReturnView] = useState('students');
  const [evaluationContext, setEvaluationContext] = useState(null);
  // Curso abierto en el Cuadro de la Evaluación.
  const [evaluationCourse, setEvaluationCourse] = useState(null);
  // Trimestre visible en el cuadro y celda abierta en la captura ({ id_estudiante, ejercicio }).
  const [evaluationTerm, setEvaluationTerm] = useState(null);
  const [captureCell, setCaptureCell] = useState(null);
  // Ficha abierta: { id, from } (from = vista a la que vuelve: course-evaluation, reports o direction-course).
  const [sheetStudent, setSheetStudent] = useState(null);
  const openSheet = (id, from) => { setSheetStudent({ id, from }); setCurrentView('student-sheet'); };

  useEffect(() => {
    if (!isAuthenticated) return;
    const loadData = async () => {
      const [studentsResult, exercisesResult, activitiesResult] = await Promise.allSettled([
        axios.get(`/api/v1/students?per_page=50${currentUser?.rol === 'administrador' ? '&include_inactive=1' : ''}`),
        axios.get('/api/v1/exercises?per_page=50'),
        currentUser?.rol === 'docente' ? axios.get('/api/v1/actividades?per_page=50') : Promise.resolve({ data: { data: [] } }),
      ]);
      if (studentsResult.status === 'fulfilled') {
        setStudents((studentsResult.value.data.data || []).map((student) => ({
          id: student.id, firstName: student.nombre, lastName: '', birthDate: student.fecha_nacimiento,
          courseName: student.curso?.nombre || '', courseId: student.id_curso, status: student.administrative_status || 'Activo',
        })));
      } else setStudents([]);
      if (exercisesResult.status === 'fulfilled') {
        const labels = { linea: 'Líneas', circulo: 'Círculos', espiral: 'Espirales', zigzag: 'Zigzag' };
        setExercises((exercisesResult.value.data.data || []).map((exercise) => ({
          id: exercise.id, name: exercise.nombre, patternType: labels[exercise.tipo_trazo] || exercise.tipo_trazo,
          description: exercise.descripcion || '', status: exercise.activo ? 'Activo' : 'Inactivo',
        })));
      } else setExercises([]);
      if (activitiesResult.status === 'fulfilled') {
        const loaded = (activitiesResult.value.data.data || []).map((activity) => ({
          id: activity.id, studentId: activity.id_estudiante, studentName: activity.estudiante?.nombre || '',
          exerciseId: activity.id_ejercicio, exerciseName: activity.ejercicio?.nombre || '',
          patternType: activity.ejercicio?.tipo_trazo || '', date: activity.fecha,
          status: activity.estado === 'procesado' ? 'Análisis completado' : activity.imagen ? 'Fotografía cargada' : 'Pendiente de fotografía',
          imageUrl: null, imageId: activity.imagen?.id, imageMetadata: activity.imagen || null,
          features: activity.analysis_result?.caracteristicas_geometricas || null,
          estado: activity.estado, analysisResult: activity.analysis_result || null,
          pedagogical_rating: activity.pedagogical_rating, pedagogical_observations: activity.pedagogical_observations,
          period_reference: activity.period_reference, scheduledActivityId: activity.scheduled_activity_id,
          returnView: 'activities',
        }));
        setActivities(loaded);
        setSelectedActivity(loaded[0] || null);
      } else { setActivities([]); setSelectedActivity(null); }
    };
    loadData();
  }, [isAuthenticated, currentUser?.rol]);

  useEffect(() => {
    if (currentUser?.rol === 'docente' && currentView === 'analysis') {
      setCurrentView('reports');
    }
    if (currentUser?.rol === 'administrador' && ['activities', 'new-activity', 'activity-detail', 'analysis', 'analysis-detail'].includes(currentView)) {
      setCurrentView(currentView === 'activities' || currentView === 'new-activity' ? 'programmed-activities' : 'dashboard');
    }
  }, [currentUser?.rol, currentView]);

  const handleLoginSuccess = (userData, token) => {
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setCurrentUser(userData);
    setIsAuthenticated(true);
    setCurrentView(userData?.rol === 'administrador' ? 'model-versions' : 'courses');
  };

  const handleLogout = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (token) {
        await axios.post('/api/v1/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (e) {
      console.warn('Logout API error:', e);
    } finally {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  };

  const handleUpdateActivity = (updated) => {
    setActivities(prev => [updated, ...prev.filter(a => a.id !== updated.id)]);
    setSelectedActivity(updated);
  };

  const handleBeginEvaluation = (context) => {
    setEvaluationContext(context);
    setSelectedStudent(context.student);
    setStudentReturnView('courses');
    setCurrentView('new-activity');
  };

  const finishEvaluation = () => {
    setEvaluationContext(null);
    setCurrentView('student-profile');
  };

  // Render Login View if unauthenticated
  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
      <div className="gl-page">
        <div className="gl-shell">
          <Sidebar
            currentView={currentView === 'student-sheet' && sheetStudent?.from === 'reports' ? 'reports' : currentView}
            setCurrentView={setCurrentView}
            onLogout={handleLogout}
            user={currentUser}
          />
          <div className="gl-workspace">
            <main className="gl-main">
          {currentView === 'dashboard' && (
            <DashboardView
              students={students}
              exercises={exercises}
              activities={activities}
              setCurrentView={setCurrentView}
              setSelectedActivity={setSelectedActivity}
              user={currentUser}
            />
          )}

          {currentUser?.rol === 'docente' && currentView === 'reports' && (
            <CourseReportView onOpenStudent={(estudiante, curso) => { setEvaluationCourse(curso); openSheet(estudiante.id_estudiante, 'reports'); }} />
          )}
          {/* Legado: informe por estudiante anterior al flujo de Evaluación (ya no se muestra). */}
          {false && <StudentReportsView students={students} onOpenStudent={(student) => { setSelectedStudent(student); setStudentReturnView('reports'); setCurrentView('student-profile'); }} />}

          {currentUser?.rol === 'direccion' && currentView === 'courses' && (
            <DirectionCoursesView onOpenCourse={(course) => { setEvaluationCourse(course); setEvaluationTerm(Number(course.trimestre_actual) || 1); setCurrentView('direction-course'); }} />
          )}
          {currentUser?.rol === 'direccion' && currentView === 'direction-course' && evaluationCourse && (
            <EvaluationGridView
              key={`dir-${evaluationCourse.id}`}
              course={evaluationCourse}
              readOnly
              backLabel="Cursos"
              trimestreInicial={evaluationTerm}
              onTrimestreChange={setEvaluationTerm}
              onBack={() => setCurrentView('courses')}
              onOpenStudent={(estudiante) => openSheet(estudiante.id_estudiante, 'direction-course')}
              renderResumen={(trimestre) => (
                <ResumenInforme
                  key={`${evaluationCourse.id}-${trimestre}`}
                  courseId={evaluationCourse.id}
                  trimestre={trimestre}
                  mostrarVacio={false}
                  onOpenStudent={(estudiante) => openSheet(estudiante.id_estudiante, 'direction-course')}
                />
              )}
            />
          )}
          {['docente', 'direccion'].includes(currentUser?.rol) && currentView === 'student-sheet' && sheetStudent && (
            <StudentSheetView
              key={sheetStudent.id}
              studentId={sheetStudent.id}
              rootLabel={sheetStudent.from === 'reports' ? 'Informes' : currentUser?.rol === 'direccion' ? 'Cursos' : 'Mis cursos'}
              onBackRoot={() => setCurrentView(sheetStudent.from === 'reports' ? 'reports' : 'courses')}
              courseName={evaluationCourse?.nombre}
              onBackCourse={sheetStudent.from === 'reports' ? undefined : () => setCurrentView(sheetStudent.from)}
            />
          )}

          {currentUser?.rol !== 'direccion' && currentView === 'courses' && (
            <CoursesView
              user={currentUser}
              setCurrentView={setCurrentView}
              onOpenStudent={(student) => { setSelectedStudent(student); setStudentReturnView('courses'); setCurrentView('student-profile'); }}
              onOpenEvaluation={currentUser?.rol === 'docente' ? (course) => { setEvaluationCourse(course); setEvaluationTerm(Number(course.trimestre_actual) || 1); setCurrentView('course-evaluation'); } : undefined}
            />
          )}
          {currentUser?.rol === 'docente' && currentView === 'course-evaluation' && evaluationCourse && (
            <EvaluationGridView
              key={evaluationCourse.id}
              course={evaluationCourse}
              trimestreInicial={evaluationTerm}
              onTrimestreChange={setEvaluationTerm}
              onBack={() => setCurrentView('courses')}
              onOpenStudent={(estudiante) => openSheet(estudiante.id_estudiante, 'course-evaluation')}
              onOpenCell={({ trimestre, estudiante, celda }) => {
                setEvaluationTerm(trimestre);
                setCaptureCell({ id_estudiante: estudiante.id_estudiante, ejercicio: celda.ejercicio });
                setCurrentView('evaluation-capture');
              }}
            />
          )}
          {currentUser?.rol === 'docente' && currentView === 'evaluation-capture' && evaluationCourse && captureCell && (
            <EvaluationCaptureView
              key={`${evaluationCourse.id}-${evaluationTerm}`}
              course={evaluationCourse}
              trimestre={evaluationTerm}
              inicial={captureCell}
              onBackToGrid={() => setCurrentView('course-evaluation')}
              onBackToCourses={() => setCurrentView('courses')}
            />
          )}

          {currentView === 'programmed-activities' && <ProgrammedActivitiesView user={currentUser} />}
          {currentUser?.rol === 'administrador' && currentView === 'teachers' && <TeachersView />}
          {currentUser?.rol === 'administrador' && currentView === 'model-versions' && <ModelVersionsView />}

          {currentView === 'students' && (
            <StudentsView
              students={students}
              setStudents={setStudents}
              isAdmin={currentUser?.rol === 'administrador'}
              onOpenStudent={(student) => { setSelectedStudent(student); setStudentReturnView('students'); setCurrentView('student-profile'); }}
            />
          )}

          {currentUser?.rol === 'docente' && currentView === 'student-profile' && selectedStudent && (
            <StudentProgressView student={selectedStudent} onBack={() => setCurrentView(studentReturnView)} onEvaluate={handleBeginEvaluation} />
          )}

          {currentView === 'exercises' && (
            <ExercisesView
              exercises={exercises}
              setExercises={setExercises}
              isAdmin={currentUser?.rol === 'administrador'}
            />
          )}

          {currentUser?.rol === 'docente' && currentView === 'activities' && (
            <ActivitiesView
              activities={activities}
              setCurrentView={setCurrentView}
              setSelectedActivity={setSelectedActivity}
              initialContext={evaluationContext}
              onCancel={() => setEvaluationContext(null)}
            />
          )}

          {currentUser?.rol === 'docente' && currentView === 'new-activity' && (
            <NewActivityView
              students={students}
              exercises={exercises}
              setActivities={setActivities}
              setCurrentView={setCurrentView}
              setSelectedActivity={setSelectedActivity}
            />
          )}

          {currentUser?.rol === 'docente' && currentView === 'activity-detail' && (
            <ActivityDetailView
              activity={selectedActivity}
              updateActivity={handleUpdateActivity}
              setCurrentView={setCurrentView}
              onEvaluationComplete={finishEvaluation}
            />
          )}

          {currentUser?.rol === 'docente' && currentView === 'analysis' && (
            <ActivitiesView activities={activities} setCurrentView={setCurrentView} setSelectedActivity={setSelectedActivity} />
          )}

          {currentUser?.rol === 'docente' && currentView === 'analysis-detail' && (
            <ActivityDetailView activity={selectedActivity} updateActivity={handleUpdateActivity} setCurrentView={setCurrentView} onEvaluationComplete={finishEvaluation} />
          )}

          {currentView === 'profile' && (
            <ProfileView user={currentUser} />
          )}
            </main>
          </div>
        </div>
      </div>
  );
}
