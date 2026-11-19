import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  GraduationCap,
  UserCheck,
  Users,
  Calendar,
  BookOpen,
  Search,
  ChevronRight,
  School,
  Plus,
  Power,
  Pencil
} from 'lucide-react';
import { formatLocalDate } from '../utils/dateFormat';
import { textoNivel } from '../utils/evaluacion';

function TeacherCourseCard({ course, onOpen }) {
  const total = Number(course.total_estudiantes) || 0;
  const completos = Number(course.estudiantes_completos) || 0;
  const porcentaje = total > 0 ? Math.round((completos / total) * 100) : 0;
  const tieneEvaluacion = !!course.trimestre_actual;

  // Textos y estructura según docs/graphilearn_prototipo.html (vCursos).
  return (
    <article className="gl-card flex flex-col">
      <h2 className="gl-h2">{course.nombre}</h2>
      <p className="gl-muted">{total} estudiantes</p>
      <p className="mt-3 flex flex-wrap items-center gap-2">
        {tieneEvaluacion
          ? <><span className="gl-chip gl-chip-P">Trimestre {course.trimestre_actual}</span> <span className="gl-muted">{textoNivel(course.nivel)}</span></>
          : <span className="gl-chip gl-chip-0">Sin Evaluación</span>}
      </p>
      <div
        className="gl-meter"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={completos}
        aria-label={`${completos} de ${total} estudiantes con los 4 ejercicios valorados`}
      >
        <span style={{ width: `${porcentaje}%` }} />
      </div>
      <p className="gl-muted">{completos} de {total} estudiantes con los 4 ejercicios valorados</p>
      <div className="mt-auto pt-3.5">
        <button type="button" className="gl-btn" onClick={() => onOpen(course)}>Abrir evaluación</button>
      </div>
    </article>
  );
}

function DirectionCourseCard({ course, onOpen }) {
  return (
    <article className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
      <div>
        <h3 className="text-sm font-bold text-slate-800">{course.nombre}</h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
          <UserCheck className="h-3.5 w-3.5 text-indigo-600" /> {course.docente?.nombre || 'Docente sin asignar'}
        </p>
      </div>
      <div className="flex justify-end border-t border-slate-100 pt-3">
        <button type="button" onClick={() => onOpen(course)} className="rounded-lg px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">
          Abrir curso <ChevronRight className="ml-1 inline h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

export default function CoursesView({ user, setCurrentView, onOpenStudent, onOpenEvaluation }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ nombre: '', nivel: '', gestion: new Date().getFullYear().toString(), id_docente: '' });
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetail, setCourseDetail] = useState(null);
  const [coursePrograms, setCoursePrograms] = useState([]);
  const [courseTracking, setCourseTracking] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const role = user?.rol || user?.role;
  const isAdmin = role === 'administrador';
  const isTeacher = role === 'docente';
  const isDirection = role === 'direccion';

  useEffect(() => {
    fetchCourses();
    if (isAdmin) axios.get('/api/v1/docentes').then(response => setTeachers(response.data.data || [])).catch(() => setTeachers([]));
  }, [isAdmin]);

  useEffect(() => {
    if (!selectedCourse) return;
    let cancelled = false;
    setDetailLoading(true);
    Promise.all([
      axios.get(`/api/v1/cursos/${selectedCourse.id}`),
      axios.get('/api/v1/actividades-programadas'),
      isAdmin ? Promise.resolve(null) : axios.get(`/api/v1/cursos/${selectedCourse.id}/seguimiento`),
    ]).then(([courseResponse, programResponse, trackingResponse]) => {
      if (cancelled) return;
      setCourseDetail(courseResponse.data.data);
      setCoursePrograms((programResponse.data.data || []).filter(item => Number(item.course_id) === Number(selectedCourse.id)));
      setCourseTracking(trackingResponse?.data?.data || null);
    }).catch(error => {
      if (!cancelled) setError(error.response?.data?.message || 'No fue posible abrir el aula.');
    }).finally(() => { if (!cancelled) setDetailLoading(false); });
    return () => { cancelled = true; };
  }, [selectedCourse?.id, isAdmin]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      if (isDirection) {
        // Dirección tiene su propia ruta; se adapta al formato de tarjeta.
        const res = await axios.get('/api/v1/direccion/cursos');
        setCourses((res.data?.data || []).map(item => ({
          id: item.id,
          nombre: item.curso,
          docente: item.docente ? { nombre: item.docente } : null,
        })));
      } else {
        // Docente: "Mis cursos" con trimestre, nivel y estudiantes completos.
        const res = await axios.get('/api/v1/cursos');
        setCourses(res.data?.data || []);
      }
    } catch (err) {
      setCourses([]);
      setError(err.response?.data?.message || 'No fue posible cargar los cursos.');
    } finally {
      setLoading(false);
    }
  };

  const term = searchTerm.toLowerCase();
  const filteredCourses = courses.filter(c =>
    [c.nombre, c.docente?.nombre, c.nivel, c.gestion]
      .some(value => value !== null && value !== undefined && String(value).toLowerCase().includes(term))
  );

  const saveCourse = async (event) => {
    event.preventDefault(); setError('');
    try {
      const payload = { ...form, id_docente: form.id_docente ? Number(form.id_docente) : null };
      if (editingId) await axios.put(`/api/v1/cursos/${editingId}`, payload);
      else await axios.post('/api/v1/cursos', payload);
      setEditingId(null); setForm({ nombre: '', nivel: '', gestion: new Date().getFullYear().toString(), id_docente: '' });
      await fetchCourses();
    } catch (e) { setError(e.response?.data?.message || 'No fue posible guardar el curso.'); }
  };

  const deactivateCourse = async (course) => {
    try { await axios.delete(`/api/v1/cursos/${course.id}`); await fetchCourses(); }
    catch (e) { setError(e.response?.data?.message || 'No fue posible desactivar el curso.'); }
  };

  if (selectedCourse) {
    const detail = courseDetail;
    const studentsInCourse = detail?.estudiantes || [];
    const totalExecutions = courseTracking?.executions_count || 0;
    const totalEvaluated = courseTracking?.evaluated_count || 0;
    return <section className="space-y-5">
      <button type="button" onClick={() => { setSelectedCourse(null); setCourseDetail(null); }} className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">← Volver a cursos</button>
      {detailLoading ? <p role="status" className="rounded-2xl bg-white p-6 text-sm text-slate-600">Cargando aula…</p> : <>
        <header className="rounded-3xl border bg-white p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Aula · Gestión {detail?.gestion}</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">{detail?.nombre || selectedCourse.nombre}</h2>
          <p className="mt-1 text-sm text-slate-600">{detail?.nivel} · Docente responsable: {detail?.docente?.nombre || 'Sin asignar'}</p>
          {isAdmin && <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => { setEditingId(detail.id); setForm({ nombre: detail.nombre, nivel: detail.nivel, gestion: String(detail.gestion), id_docente: detail.id_docente || '' }); setSelectedCourse(null); }} className="rounded-xl border px-3 py-2 text-sm font-medium">Editar curso</button>
            <button type="button" onClick={() => setCurrentView?.('teachers')} className="rounded-xl border px-3 py-2 text-sm font-medium">Gestionar docentes</button>
            <button type="button" onClick={() => setCurrentView?.('students')} className="rounded-xl border px-3 py-2 text-sm font-medium">Gestionar estudiantes del aula</button>
            <button type="button" onClick={() => setCurrentView?.('programmed-activities')} className="rounded-xl border px-3 py-2 text-sm font-medium">Gestionar actividades</button>
          </div>}
        </header>

        {!isAdmin && totalExecutions > 0 && <section className="space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border bg-white p-4"><p className="text-xs text-slate-500">Ejercicios realizados</p><p className="text-2xl font-bold">{totalExecutions}</p></div>
          <div className="rounded-2xl border bg-white p-4"><p className="text-xs text-slate-500">Con valoración docente</p><p className="text-2xl font-bold">{totalEvaluated}</p></div>
          <div className="rounded-2xl border bg-white p-4"><p className="text-xs text-slate-500">Estudiantes inscritos</p><p className="text-2xl font-bold">{studentsInCourse.length}</p></div>
          </div>
          <div className="flex flex-wrap gap-2">{(courseTracking?.by_exercise || []).map(exercise => <span key={exercise.id} className="rounded-full border bg-white px-3 py-1.5 text-xs text-slate-700">{exercise.nombre}: {exercise.executions_count} trabajos · {exercise.evaluated_count} valorados</span>)}</div>
        </section>}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <section className="rounded-3xl border bg-white p-5">
            <h3 className="font-bold text-slate-900">Estudiantes inscritos ({studentsInCourse.length})</h3>
            <div className="mt-3 divide-y">
              {studentsInCourse.map(student => <div key={student.id} className="flex items-center justify-between gap-3 py-3">
                <div><p className="font-medium">{student.nombre}</p><p className="text-xs text-slate-500">Nacimiento: {student.fecha_nacimiento || 'No registrado'}</p></div>
                {!isAdmin && <button type="button" onClick={() => onOpenStudent?.(student)} className="shrink-0 rounded-lg px-3 py-2 text-sm text-indigo-700 hover:bg-indigo-50">Abrir ficha</button>}
              </div>)}
              {!studentsInCourse.length && <p className="py-4 text-sm text-slate-500">No hay matrículas activas en este curso.</p>}
            </div>
          </section>
          <section className="rounded-3xl border bg-white p-5">
            <h3 className="font-bold text-slate-900">Actividades programadas</h3>
            <div className="mt-3 space-y-3">
              {coursePrograms.map(program => <article key={program.id} className="rounded-xl border p-3">
                <div className="flex items-start justify-between gap-3"><div><p className="font-medium">{program.name}</p><p className="text-xs text-slate-600">{(program.exercises || []).map(exercise => exercise.nombre).join(' · ') || program.exercise?.nombre}</p></div>{program.scheduled_for && <time className="shrink-0 text-xs text-slate-500">{formatLocalDate(program.scheduled_for)}</time>}</div>
                {!isAdmin && <p className="mt-2 text-xs text-slate-500">{program.executions_count || 0} trabajos registrados · {program.evaluated_executions_count || 0} con valoración docente</p>}
              </article>)}
              {!coursePrograms.length && <p className="py-4 text-sm text-slate-500">No hay actividades programadas para este curso.</p>}
            </div>
          </section>
        </div>
      </>}
    </section>;
  }

  if (isTeacher) {
    // Pantalla "Mis cursos" del prototipo (vCursos).
    return (
      <section className="flex flex-col gap-[18px]">
        <div className="gl-head">
          <div>
            <h1 className="gl-h1">Mis cursos</h1>
            <p>Elige un curso para ver o registrar su evaluación del trimestre.</p>
          </div>
        </div>
        {error && <div role="alert" className="gl-alert flex flex-wrap items-center justify-between gap-3">
          <span>{error}</span>
          <button type="button" className="gl-btn ghost" onClick={fetchCourses}>Reintentar</button>
        </div>}
        {loading
          ? <p role="status" className="gl-card gl-muted">Cargando cursos…</p>
          : !error && courses.length === 0
            ? <p className="gl-card gl-muted">No tienes cursos asignados.</p>
            : <div className="gl-grid">
                {courses.map(course => <TeacherCourseCard key={course.id} course={course} onOpen={onOpenEvaluation || setSelectedCourse} />)}
              </div>}
      </section>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                {isTeacher ? 'Mis cursos' : isDirection ? 'Cursos de la institución' : 'Cursos y Aulas Asignadas'}
              </h2>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                isAdmin
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}>
                {isAdmin ? 'Visión Institucional' : isDirection ? 'Solo lectura' : 'Docente'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {isAdmin
                ? 'Supervisión de cursos escolares y asignación de profesores responsables.'
                : isDirection
                  ? 'Cursos de su institución y docente responsable.'
                  : 'Evaluación actual de cada curso y avance de sus estudiantes.'}
            </p>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200">
            <School className="w-4 h-4 text-indigo-600" />
            <div className="text-left">
              <p className="text-[10px] text-slate-600 font-bold leading-none">Total Cursos</p>
              <p className="text-sm font-black text-slate-800 leading-tight">{courses.length}</p>
            </div>
          </div>

          {!isDirection && <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200">
            <Users className="w-4 h-4 text-sky-600" />
            <div className="text-left">
              <p className="text-[10px] text-slate-600 font-bold leading-none">Estudiantes</p>
              <p className="text-sm font-black text-slate-800 leading-tight">
                {courses.reduce((acc, c) => acc + (Number(c.total_estudiantes ?? c.estudiantes_count) || 0), 0)}
              </p>
            </div>
          </div>}
        </div>
      </div>

      {isAdmin && <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5">
        <h3 className="font-bold text-slate-800">{editingId ? 'Editar curso' : 'Crear curso'}</h3>
        {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        <form onSubmit={saveCourse} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre" className="rounded-xl border p-3" />
          <input required value={form.nivel} onChange={e => setForm({ ...form, nivel: e.target.value })} placeholder="Nivel" className="rounded-xl border p-3" />
          <input required value={form.gestion} onChange={e => setForm({ ...form, gestion: e.target.value })} placeholder="Gestión" className="rounded-xl border p-3" />
          <select value={form.id_docente} onChange={e => setForm({ ...form, id_docente: e.target.value })} className="rounded-xl border p-3"><option value="">Sin docente</option>{teachers.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}</select>
          <button className="rounded-xl bg-indigo-600 p-3 font-semibold text-white"><Plus size={15} className="mr-1 inline"/>{editingId ? 'Guardar' : 'Crear'}</button>
        </form>
      </section>}

      {!isAdmin && error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        <span>{error}</span>
        <button type="button" onClick={fetchCourses} className="rounded-xl border border-rose-300 bg-white px-3 py-1.5 font-semibold">Reintentar</button>
      </div>}

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por curso, docente o nivel..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-600">Cargando catálogo de cursos...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white border border-slate-200 rounded-3xl shadow-xs">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-800 font-bold">No se encontraron cursos</p>
            <p className="text-xs text-slate-600 mt-0.5">Intenta con otro término de búsqueda.</p>
          </div>
        ) : (
          filteredCourses.map((course) => isTeacher ? (
            <TeacherCourseCard key={course.id} course={course} onOpen={onOpenEvaluation || setSelectedCourse} />
          ) : isDirection ? (
            <DirectionCourseCard key={course.id} course={course} onOpen={setSelectedCourse} />
          ) : (
            <article
              key={course.id}
              className="bg-white border border-slate-200 hover:border-indigo-300 rounded-3xl p-5 shadow-xs hover:shadow-md flex flex-col justify-between transition-all group"
            >
              <div>
                {/* Course Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                      {course.nombre.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {course.nombre}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-indigo-700 font-bold px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200">
                          {course.nivel}
                        </span>
                        <span className="text-[10px] text-slate-600 flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3" />
                          Gestión {course.gestion}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Teacher in Charge (Docente a cargo) */}
                <div className="my-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Docente Responsable</span>
                  </p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      {course.docente?.nombre ? course.docente.nombre.charAt(0) : 'D'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {course.docente?.nombre || 'Docente sin asignar'}
                      </p>
                      <p className="text-[10px] text-slate-600 truncate font-mono">
                        {course.docente?.correo || 'Sin correo'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span><strong>{course.estudiantes_count || 0}</strong> alumnos matriculados</span>
                </div>

                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => setSelectedCourse(course)} className="rounded-lg px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">Abrir aula <ChevronRight className="ml-1 inline h-4 w-4"/></button>
                  {isAdmin && <>
                    <button aria-label="Editar curso" onClick={() => { setEditingId(course.id); setForm({ nombre: course.nombre, nivel: course.nivel, gestion: String(course.gestion), id_docente: course.id_docente || '' }); }} className="rounded-lg p-2 text-indigo-700 hover:bg-indigo-50"><Pencil size={16}/></button>
                    {course.active !== false && <button aria-label="Desactivar curso" onClick={() => deactivateCourse(course)} className="rounded-lg p-2 text-rose-700 hover:bg-rose-50"><Power size={16}/></button>}
                  </>}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
