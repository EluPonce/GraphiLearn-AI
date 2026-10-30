import React from 'react';
import { Shield, Cpu, Database, Globe, Code2, School, GraduationCap } from 'lucide-react';

export default function ProfileView({ user }) {
  const userName = user?.nombre || user?.name || 'Usuario';
  const userEmail = user?.correo || user?.email || 'usuario@graphilearn.test';
  const userRole = user?.rol || user?.role || 'docente';
  const isAdmin = userRole === 'administrador';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Profile Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className={`w-20 h-20 rounded-3xl ${isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-700'} font-black text-2xl flex items-center justify-center shadow-xs shrink-0`}>
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">{userName}</h2>
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${isAdmin ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-indigo-50 border border-indigo-200 text-indigo-700'} self-center sm:self-auto capitalize`}>
              Rol: {userRole}
            </span>
          </div>
          <p className="text-sm text-slate-600 font-mono">{userEmail}</p>
          <p className="text-xs text-slate-600">
            {isAdmin
              ? 'Administración global de cursos, matrícula de estudiantes e infraestructura institucional.'
              : 'Evaluación y registro de actividades grafomotoras en aulas de nivel inicial.'}
          </p>
        </div>
      </div>

      {/* System Technical Specifications */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <span>Arquitectura Técnica del Sistema (Taller de Grado)</span>
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Estructura desacoplada para el procesamiento computacional de imágenes y la gestión escolar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <Globe className="w-4 h-4 text-indigo-600" />
              <span>Backend Principal (API REST)</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Laravel 11, PHP 8.2+, Laravel Sanctum (Tokens Bearer), arquitectura MVC con Service Layer, Policies de aislamiento y FormRequests.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <Code2 className="w-4 h-4 text-sky-600" />
              <span>Frontend Educativo Limpio</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              React SPA con diseño escolar acogedor, componentes interactivos y retroalimentación en tiempo real.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span>Microservicio de IA (Python)</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              FastAPI, OpenCV (binarización Otsu y esqueletizado) y NumPy para extracción de descriptores del trazo.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <Database className="w-4 h-4 text-amber-600" />
              <span>Base de Datos Relacional</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              PostgreSQL (persistencia relacional de cursos, docentes, niños, imágenes y variables numéricas).
            </p>
          </div>
        </div>

        {/* Academic Principles */}
        <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 space-y-2">
          <p className="font-bold text-indigo-900 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>Fundamentación Académica y Pedagógica</span>
          </p>
          <p className="text-indigo-900/80 text-[11px] leading-relaxed">
            GraphiLearn AI se fundamenta en la transformación computacional de trazos realizados por niños en hojas físicas de papel (líneas, círculos, espirales, zigzag) en variables numéricas objetivas (longitud, curvatura, continuidad, desviación y regularidad), facilitando el seguimiento preventivo sin sustituir la labor pedagógica de la maestra ni constituir diagnóstico clínico.
          </p>
        </div>
      </div>
    </div>
  );
}
