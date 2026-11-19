import React from 'react';
import { ChevronRight, ShieldCheck } from 'lucide-react';

export default function Navbar({ currentView, selectedActivity }) {
  const titles = {
    dashboard: 'Panel principal',
    courses: 'Cursos y aulas',
    students: 'Gestión de Estudiantes',
    exercises: 'Catálogo de Ejercicios Grafomotores',
    activities: 'Trabajos y evaluaciones',
    'new-activity': 'Registrar trabajo',
    'activity-detail': selectedActivity ? `Trabajo #${selectedActivity.id}` : 'Detalle del trabajo',
    analysis: 'Informes de seguimiento',
    reports: 'Informes de seguimiento',
    'analysis-detail': 'Análisis del ejercicio',
    profile: 'Perfil'
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md px-8 flex items-center justify-between shrink-0 shadow-xs">
      {/* Breadcrumbs / View Title */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
          GraphiLearn AI
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-sm font-bold text-slate-800">
          {titles[currentView] || 'Módulo'}
        </span>
      </div>

      {/* Status & Indicators */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-800 font-medium text-[11px]">Acceso por rol</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
          <span>Sprint 1 • Nivel Inicial</span>
        </div>
      </div>
    </header>
  );
}
