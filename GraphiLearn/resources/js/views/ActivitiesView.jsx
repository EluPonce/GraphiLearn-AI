import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, Search, Eye, Filter } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { formatLocalDate } from '../utils/dateFormat';

export default function ActivitiesView({
  activities,
  setCurrentView,
  setSelectedActivity
}) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [programs, setPrograms] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    axios.get('/api/v1/actividades-programadas')
      .then(response => { if (!cancelled) setPrograms((response.data.data || []).filter(program => program.active)); })
      .catch(() => { if (!cancelled) setPrograms([]); })
      .finally(() => { if (!cancelled) setProgramsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filteredActivities = activities.filter((act) => {
    const matchesSearch = (act.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (act.exerciseName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'pendiente' && act.status.toLowerCase().includes('pendiente')) ||
      (filterStatus === 'cargada' && act.status.toLowerCase().includes('cargada')) ||
      (filterStatus === 'procesada' && ((act.status || '').toLowerCase().includes('completado') || act.estado === 'procesado'));
    return matchesSearch && matchesFilter;
  });

  const handleOpenDetail = (activity) => {
    setSelectedActivity(activity);
    if ((activity.status || '').toLowerCase().includes('procesad')) {
      setCurrentView('analysis-detail');
    } else {
      setCurrentView('activity-detail');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Trabajos de los estudiantes</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Fotografía, análisis automático y valoración docente de cada ejercicio realizado
          </p>
        </div>
      </div>

      <section className="space-y-3 rounded-3xl border border-indigo-100 bg-white p-4 shadow-xs sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold text-slate-900">Actividades programadas para tus cursos</h3><p className="text-xs text-slate-600">Selecciona estudiante y ejercicio al registrar cada trabajo.</p></div><button type="button" onClick={() => setCurrentView('new-activity')} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white">Registrar un trabajo</button></div>
        {programsLoading ? <p role="status" className="text-sm text-slate-500">Cargando programaciones…</p> : programs.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{programs.map(program => <article key={program.id} className="rounded-2xl border bg-slate-50 p-4"><h4 className="font-semibold text-slate-900">{program.name}</h4><p className="mt-1 text-xs text-slate-600">{program.course?.nombre || 'Curso asignado'}{program.scheduled_for ? ` · ${formatLocalDate(program.scheduled_for)}` : ''}</p><ul className="mt-3 flex flex-wrap gap-1.5">{(program.exercises || (program.exercise ? [program.exercise] : [])).map((exercise, index) => <li key={exercise.id} className="rounded-full border bg-white px-2.5 py-1 text-xs text-slate-700">{index + 1}. {exercise.nombre}</li>)}</ul></article>)}</div> : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No hay actividades programadas activas para tus cursos.</p>}
      </section>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por estudiante o ejercicio..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 transition-all font-medium"
          >
            <option value="all">Todos los estados</option>
            <option value="pendiente">Pendiente de fotografía</option>
            <option value="cargada">Fotografía guardada</option>
            <option value="procesada">Análisis completado</option>
          </select>
        </div>
      </div>

      {/* Activities Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-slate-600 border-b border-slate-100 bg-slate-50/70">
              <tr>
                <th className="py-3.5 px-6 font-bold">Estudiante</th>
                <th className="py-3.5 px-6 font-bold">Ejercicio</th>
                <th className="py-3.5 px-6 font-bold">Fecha</th>
                <th className="py-3.5 px-6 font-bold">Estado del trabajo</th>
                <th className="py-3.5 px-6 font-bold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-600 font-medium">
                    No se encontraron trabajos con los filtros actuales.
                  </td>
                </tr>
              ) : (
                filteredActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          {activity.studentName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{activity.studentName}</p>
                        <p className="text-xs text-slate-600">Registro #{activity.id.toString().slice(-4)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-700">
                      <div>
                        <p className="font-semibold text-slate-800">{activity.exerciseName}</p>
                        <span className="text-[11px] text-indigo-700 font-bold">[{activity.patternType}]</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-mono text-xs">
                      {formatLocalDate(activity.date)}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={activity.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleOpenDetail(activity)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver detalle</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
