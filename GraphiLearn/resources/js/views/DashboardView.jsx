import React from 'react';
import {
  Users,
  Compass,
  Activity,
  Cpu,
  PlusCircle,
  ArrowUpRight,
  Sparkles,
  Calendar,
  GraduationCap,
  School,
  FileCheck2
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function DashboardView({
  students,
  exercises,
  activities,
  setCurrentView,
  setSelectedActivity,
  user
}) {
  const isAdmin = user?.rol === 'administrador' || user?.role === 'administrador';
  const processedCount = activities.filter(a => (a.status || '').toLowerCase().includes('procesad')).length;

  const handleSelectActivity = (activity) => {
    setSelectedActivity(activity);
    if ((activity.status || '').toLowerCase().includes('procesad')) {
      setCurrentView('analysis-detail');
    } else {
      setCurrentView('activity-detail');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 p-7 md:p-9 shadow-lg text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold">
              <School className="w-3.5 h-3.5" />
              <span>Nivel Inicial • Kínder y Pre-Kínder</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              {isAdmin ? 'Panel Institucional GraphiLearn' : `Bienvenido(a), ${user?.nombre || 'Docente'}`}
            </h2>
            <p className="text-sm text-indigo-100 leading-relaxed font-medium">
              Seguimiento cuantitativo del desarrollo grafomotor mediante análisis computacional del trazo en papel.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setCurrentView('new-activity')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 text-sm font-bold shadow-md transition-all active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              <span>Nueva actividad</span>
            </button>
            <button
              onClick={() => setCurrentView('courses')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-800/60 hover:bg-indigo-800 text-white border border-indigo-400/40 text-sm font-medium transition-all"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Ver cursos</span>
            </button>
            <button
              onClick={() => setCurrentView('students')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-800/60 hover:bg-indigo-800 text-white border border-indigo-400/40 text-sm font-medium transition-all"
            >
              <Users className="w-4 h-4" />
              <span>Estudiantes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Total Estudiantes</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800 mt-3 font-mono">{students.length}</p>
          <p className="text-xs text-slate-600 mt-1">Registrados en el aula</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Patrones Base</span>
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800 mt-3 font-mono">{exercises.length}</p>
          <p className="text-xs text-slate-600 mt-1">Línea, círculo, espiral, zigzag</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Actividades Registradas</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800 mt-3 font-mono">{activities.length}</p>
          <p className="text-xs text-slate-600 mt-1">Sesiones de práctica</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Trazos Procesados</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800 mt-3 font-mono">{processedCount}</p>
          <p className="text-xs text-slate-600 mt-1">Métricas calculadas</p>
        </div>
      </div>

      {/* Section: Últimas Actividades */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">Últimas actividades en aula</h3>
            <p className="text-xs text-slate-600 mt-0.5">Fichas de trabajo capturadas y evaluadas</p>
          </div>
          <button
            onClick={() => setCurrentView('activities')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
          >
            <span>Ver todas</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-10 text-slate-600 text-sm">
            No hay actividades registradas aún.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-slate-600 border-b border-slate-100 bg-slate-50/70">
                <tr>
                  <th className="py-3 px-4 font-bold">Estudiante</th>
                  <th className="py-3 px-4 font-bold">Ejercicio</th>
                  <th className="py-3 px-4 font-bold">Fecha</th>
                  <th className="py-3 px-4 font-bold">Estado</th>
                  <th className="py-3 px-4 font-bold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activities.slice(0, 5).map((activity) => (
                  <tr key={activity.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {activity.studentName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        {activity.exerciseName}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs font-mono">
                      {activity.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={activity.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleSelectActivity(activity)}
                        className="text-xs px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200 transition-colors"
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
