import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, ArrowRight, CalendarDays, CheckCircle2, GraduationCap, RefreshCw, School, Users, UserRoundCheck, ClipboardList } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { formatLocalDate } from '../utils/dateFormat';

export default function DashboardView({ activities = [], setCurrentView, setSelectedActivity, user }) {
  const isAdmin = user?.rol === 'administrador' || user?.role === 'administrador';
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const response = await axios.get('/api/v1/dashboard');
      setStats(response.data.stats || null);
    } catch (requestError) {
      setStats(null);
      setError(requestError.response?.data?.message || 'No fue posible consultar las métricas del panel.');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [user?.rol, user?.role]);

  const value = key => stats && stats[key] !== null && stats[key] !== undefined ? stats[key] : '—';
  const metrics = isAdmin ? [
    ['Estudiantes', 'total_estudiantes', Users, 'Inscripciones activas de la institución'],
    ['Docentes', 'total_docentes', UserRoundCheck, 'Cuentas docentes de la institución'],
    ['Cursos', 'total_cursos', GraduationCap, 'Aulas disponibles'],
    ['Actividades programadas', 'actividades_programadas', CalendarDays, 'Programaciones activas'],
    ['Trabajos registrados', 'trabajos_registrados', Activity, 'Registros individuales existentes'],
    ['Trabajos pendientes', 'trabajos_pendientes', ClipboardList, 'Ejercicios programados aún sin registro'],
  ] : [
    ['Mis cursos', 'mis_cursos', GraduationCap, 'Aulas asignadas'],
    ['Estudiantes', 'mis_estudiantes', Users, 'En tus cursos asignados'],
    ['Actividades programadas', 'actividades_programadas', CalendarDays, 'Programaciones activas de tus cursos'],
    ['Trabajos pendientes', 'trabajos_pendientes', ClipboardList, 'Ejercicios programados aún sin registro'],
    ['Evaluaciones realizadas', 'evaluaciones_realizadas', CheckCircle2, 'Con valoración docente registrada'],
  ];

  const openActivity = activity => {
    setSelectedActivity(activity);
    setCurrentView(activity.estado === 'procesado' ? 'analysis-detail' : 'activity-detail');
  };

  return <div className="space-y-6 animate-in fade-in duration-300">
    <header className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-700 to-sky-600 p-6 text-white shadow-lg sm:p-8">
      <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="max-w-2xl"><span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold"><School size={15}/> GraphiLearn · Nivel Inicial</span><h2 className="mt-3 text-2xl font-black sm:text-3xl">{isAdmin ? 'Panel institucional' : `Bienvenida, ${user?.nombre || 'docente'}`}</h2><p className="mt-2 text-sm text-indigo-100">{isAdmin ? 'Resumen de cursos, docentes y actividades programadas.' : 'Acceso rápido a tus aulas, trabajos y seguimiento pedagógico.'}</p></div>
        <div className="flex flex-wrap gap-2">{isAdmin ? <button type="button" onClick={() => setCurrentView('programmed-activities')} className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-indigo-700">Programar actividad</button> : <button type="button" onClick={() => setCurrentView('activities')} className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-indigo-700">Abrir trabajos y evaluaciones</button>}<button type="button" onClick={() => setCurrentView('courses')} className="rounded-xl border border-white/40 bg-indigo-900/30 px-4 py-2.5 text-sm font-semibold text-white">{isAdmin ? 'Ver cursos' : 'Mis cursos'}</button></div>
      </div>
    </header>

    {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><span>{error} Las métricas se muestran como no disponibles, no como cero.</span><button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-rose-300 px-3 py-2 font-semibold"><RefreshCw size={15}/>Reintentar</button></div>}
    <section aria-label="Resumen por rol" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map(([label, key, Icon, description], index) => <article key={key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-3xl font-black tabular-nums text-slate-900">{loading ? '…' : value(key)}</p></div><span className={`rounded-xl p-2.5 ${index % 2 ? 'bg-sky-50 text-sky-700' : 'bg-indigo-50 text-indigo-700'}`}><Icon size={20}/></span></div><p className="mt-2 text-xs text-slate-500">{description}</p></article>)}
    </section>

    {isAdmin ? <section className="grid gap-4 md:grid-cols-2"><button type="button" onClick={() => setCurrentView('teachers')} className="flex items-center justify-between rounded-2xl border bg-white p-5 text-left hover:border-indigo-300"><span><strong className="block text-slate-900">Gestionar docentes</strong><span className="text-sm text-slate-600">Cuentas y asignaciones por curso</span></span><ArrowRight className="text-indigo-600"/></button><button type="button" onClick={() => setCurrentView('students')} className="flex items-center justify-between rounded-2xl border bg-white p-5 text-left hover:border-indigo-300"><span><strong className="block text-slate-900">Gestionar estudiantes del aula</strong><span className="text-sm text-slate-600">Inscripciones y datos administrativos</span></span><ArrowRight className="text-indigo-600"/></button></section> : <section className="rounded-2xl border bg-white p-5"><div className="flex items-center justify-between gap-3"><div><h3 className="font-bold text-slate-900">Trabajos recientes</h3><p className="text-xs text-slate-600">Registros de estudiantes de tus cursos.</p></div><button type="button" onClick={() => setCurrentView('activities')} className="text-sm font-semibold text-indigo-700">Ver trabajos</button></div>{activities.length ? <div className="mt-4 divide-y">{activities.slice(0, 5).map(activity => <div key={activity.id} className="flex flex-wrap items-center justify-between gap-2 py-3"><div><p className="text-sm font-semibold text-slate-900">{activity.studentName} · {activity.exerciseName}</p><p className="text-xs text-slate-500">{formatLocalDate(activity.date)}</p></div><div className="flex items-center gap-2"><StatusBadge status={activity.status}/><button type="button" onClick={() => openActivity(activity)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-indigo-700">Abrir</button></div></div>)}</div> : <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No hay trabajos recientes disponibles.</p>}</section>}
  </div>;
}
