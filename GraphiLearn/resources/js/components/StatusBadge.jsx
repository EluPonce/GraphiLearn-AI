import React from 'react';

export default function StatusBadge({ status }) {
  const normalized = (status || '').toLowerCase().trim();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';
  let label = status;

  if (normalized.includes('pendiente')) {
    styles = 'bg-amber-50 text-amber-800 border-amber-200';
    dotColor = 'bg-amber-500 animate-pulse';
    label = 'Pendiente de imagen';
  } else if (normalized.includes('cargada')) {
    styles = 'bg-sky-50 text-sky-800 border-sky-200';
    dotColor = 'bg-sky-500';
    label = 'Imagen cargada';
  } else if (normalized.includes('procesando')) {
    styles = 'bg-indigo-50 text-indigo-800 border-indigo-200';
    dotColor = 'bg-indigo-500 animate-spin';
    label = 'Procesando trazo...';
  } else if (normalized.includes('procesad')) {
    styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dotColor = 'bg-emerald-500';
    label = 'Procesada';
  } else if (normalized === 'activo') {
    styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dotColor = 'bg-emerald-500';
    label = 'Activo';
  } else if (normalized === 'inactivo') {
    styles = 'bg-rose-50 text-rose-800 border-rose-200';
    dotColor = 'bg-rose-500';
    label = 'Inactivo';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {label}
    </span>
  );
}
