import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import StudentsView from './views/StudentsView';
import ExercisesView from './views/ExercisesView';
import ActivitiesView from './views/ActivitiesView';
import NewActivityView from './views/NewActivityView';
import ActivityDetailView from './views/ActivityDetailView';
import AnalysisView from './views/AnalysisView';
import CoursesView from './views/CoursesView';
import ProfileView from './views/ProfileView';

export default function App() {
  // Authentication State from LocalStorage or false
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!sessionStorage.getItem('token');
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
  const [currentView, setCurrentView] = useState('dashboard');

  // Initial Mock Data (Section 14: Datos de prueba requeridos)
  const [students, setStudents] = useState([
    { id: 1, firstName: 'Mateo', lastName: 'PÃ©rez GÃ³mez', birthDate: '2020-03-15', status: 'Activo' },
    { id: 2, firstName: 'LucÃ­a', lastName: 'FernÃ¡ndez Rojas', birthDate: '2020-07-22', status: 'Activo' },
    { id: 3, firstName: 'JoaquÃ­n', lastName: 'Mamani Quispe', birthDate: '2020-11-05', status: 'Activo' },
  ]);

  const [exercises, setExercises] = useState([
    {
      id: 1,
      name: 'Trazo de LÃ­nea Recta',
      patternType: 'LÃ­neas',
      description: 'Ejercicio de continuidad y rectitud del trazo horizontal.',
      status: 'Activo'
    },
    {
      id: 2,
      name: 'Trazo de CÃ­rculo',
      patternType: 'CÃ­rculos',
      description: 'Ejercicio de cierre y redondez de trazo circular.',
      status: 'Activo'
    },
    {
      id: 3,
      name: 'Trazo de Espiral',
      patternType: 'Espirales',
      description: 'Ejercicio de modulaciÃ³n de curvatura y espaciado progresivo.',
      status: 'Activo'
    },
    {
      id: 4,
      name: 'Trazo de Zigzag',
      patternType: 'Zigzag',
      description: 'Ejercicio de cambio angular y conservaciÃ³n de vÃ©rtices.',
      status: 'Activo'
    },
  ]);

  const [activities, setActivities] = useState([
    {
      id: 101,
      studentId: 1,
      studentName: 'Mateo PÃ©rez GÃ³mez',
      exerciseId: 2,
      exerciseName: 'Trazo de CÃ­rculo',
      patternType: 'CÃ­rculos',
      date: '2026-09-15',
      status: 'Procesada',
      imageUrl: null,
      imageMetadata: {
        fileName: 'ejercicio_mateo_circulo.png',
        fileSize: '342.1 KB',
        uploadDate: '2026-09-15'
      },
      features: {
        longitudTrazo: '125.4 px',
        continuidad: '0.87',
        curvatura: '0.62',
        desviacion: '14.3 px',
        regularidad: '0.79'
      }
    },
    {
      id: 102,
      studentId: 2,
      studentName: 'LucÃ­a FernÃ¡ndez Rojas',
      exerciseId: 1,
      exerciseName: 'Trazo de LÃ­nea Recta',
      patternType: 'LÃ­neas',
      date: '2026-09-18',
      status: 'Imagen cargada',
      imageUrl: null,
      imageMetadata: {
        fileName: 'lucia_lineas.jpg',
        fileSize: '512.4 KB',
        uploadDate: '2026-09-18'
      },
      features: null
    },
    {
      id: 103,
      studentId: 3,
      studentName: 'JoaquÃ­n Mamani Quispe',
      exerciseId: 3,
      exerciseName: 'Trazo de Espiral',
      patternType: 'Espirales',
      date: '2026-09-20',
      status: 'Pendiente de imagen',
      imageUrl: null,
      imageMetadata: null,
      features: null
    }
  ]);

  const [selectedActivity, setSelectedActivity] = useState(activities[0]);

  const handleLoginSuccess = (userData, token) => {
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setCurrentUser(userData);
    setIsAuthenticated(true);
    setCurrentView('dashboard');
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
    setActivities(prev => prev.map(a => a.id === updated.id ? updated : a));
    setSelectedActivity(updated);
  };

  // Render Login View if unauthenticated
  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-800 overflow-hidden font-sans">
      {/* Navigation Sidebar */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onLogout={handleLogout}
        user={currentUser}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          currentView={currentView}
          selectedActivity={selectedActivity}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
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

          {currentView === 'courses' && (
            <CoursesView user={currentUser} />
          )}

          {currentView === 'students' && (
            <StudentsView
              students={students}
              setStudents={setStudents}
            />
          )}

          {currentView === 'exercises' && (
            <ExercisesView
              exercises={exercises}
              setExercises={setExercises}
            />
          )}

          {currentView === 'activities' && (
            <ActivitiesView
              activities={activities}
              setCurrentView={setCurrentView}
              setSelectedActivity={setSelectedActivity}
            />
          )}

          {currentView === 'new-activity' && (
            <NewActivityView
              students={students}
              exercises={exercises}
              setActivities={setActivities}
              setCurrentView={setCurrentView}
              setSelectedActivity={setSelectedActivity}
            />
          )}

          {currentView === 'activity-detail' && (
            <ActivityDetailView
              activity={selectedActivity}
              updateActivity={handleUpdateActivity}
              setCurrentView={setCurrentView}
            />
          )}

          {currentView === 'analysis' && (
            <AnalysisView
              activity={selectedActivity}
              activities={activities}
              setCurrentView={setCurrentView}
              setSelectedActivity={setSelectedActivity}
            />
          )}

          {currentView === 'analysis-detail' && (
            <AnalysisView
              activity={selectedActivity}
              activities={activities}
              setCurrentView={setCurrentView}
              setSelectedActivity={setSelectedActivity}
            />
          )}

          {currentView === 'profile' && (
            <ProfileView user={currentUser} />
          )}
        </main>
      </div>
    </div>
  );
}
