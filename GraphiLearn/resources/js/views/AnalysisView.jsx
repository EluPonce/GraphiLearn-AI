import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ArrowLeft,
  Cpu,
  User,
  Compass,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Info,
  BarChart3,
  FileCheck2,
  Sparkles,
  School,
  Clock,
  Layers,
  ShieldAlert
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function AnalysisView({
  activity,
  activities,
  setCurrentView,
  setSelectedActivity
}) {
  const activeActivity = (activity && (activity.status || '').toLowerCase().includes('procesad'))
    ? activity
    : (activities || []).find(a => (a.status || '').toLowerCase().includes('procesad')) || activity;

  const [loadingResult, setLoadingResult] = useState(false);
  const [remoteResult, setRemoteResult] = useState(activeActivity?.analysisResult || null);

  useEffect(() => {
    if (activeActivity?.id && !remoteResult) {
      setLoadingResult(true);
      axios.get(`/api/v1/actividades/${activeActivity.id}/resultado`)
        .then(res => {
          if (res.data?.data) {
            setRemoteResult(res.data.data);
          }
        })
        .catch(err => {
          // Si no hay resultado en backend aún, se mantendrán los datos locales de la actividad
        })
        .finally(() => setLoadingResult(false));
    }
  }, [activeActivity?.id]);

  if (!activeActivity) {
    return (
      <div className="text-center py-20 text-slate-600">
        <p>No hay actividades procesadas disponibles para analizar.</p>
        <button
          onClick={() => setCurrentView('activities')}
          className="mt-4 px-4 py-2 rounded-2xl bg-indigo-600 text-white text-xs font-bold"
        >
          Ir a actividades
        </button>
      </div>
    );
  }

  // Combinar datos locales de la actividad con el resultado remoto de la base de datos
  const res = remoteResult || activeActivity.analysisResult || {};
  const geom = res.caracteristicas_geometricas || res || {};
  const ind = res.indicadores_cuantitativos || res || {};
  const clas = res.clasificacion || activeActivity.classification || {};

  const features = activeActivity.features || {};

  // Formatear valores reales sin inventar scores simulados
  const longitudVal = geom.longitud_trazo ?? (features.longitudTrazo ? parseFloat(features.longitudTrazo) : null);
  const continuidadVal = ind.continuidad ?? (features.continuidad ? parseFloat(features.continuidad) : null);
  const curvaturaVal = geom.curvatura ?? (features.curvatura ? parseFloat(features.curvatura) : null);
  const desviacionVal = ind.desviacion ?? (features.desviacion ? parseFloat(features.desviacion) : null);
  const regularidadVal = ind.regularidad ?? (features.regularidad ? parseFloat(features.regularidad) : null);
  const inclinacionVal = geom.inclinacion ?? (features.inclinacion ? parseFloat(features.inclinacion) : null);
  const proporcionVal = geom.proporcion ?? (features.proporcion ? parseFloat(features.proporcion) : null);
  const separacionVal = geom.separacion_componentes ?? (features.separacion ? parseFloat(features.separacion) : null);
  const altoVal = geom.alto ?? null;
  const anchoVal = geom.ancho ?? null;

  const featureTable = [
    {
      name: 'Longitud del Trazo',
      value: longitudVal !== null ? `${longitudVal} px` : '—',
      unit: 'px euclidianos',
      desc: 'Suma de la distancia euclidiana del trazo sobre el esqueleto de 1 píxel (Zhang-Suen).'
    },
    {
      name: 'Continuidad Motriz',
      value: continuidadVal !== null ? continuidadVal.toFixed(3) : '—',
      unit: 'índice [0.0 - 1.0]',
      desc: 'Proporción del componente principal frente al total de píxeles sin cortes aparentes.'
    },
    {
      name: 'Variación de Curvatura',
      value: curvaturaVal !== null ? `${curvaturaVal.toFixed(4)} rad/px` : '—',
      unit: 'rad/px',
      desc: 'Medición de la suavidad tangencial en el trazado de la curva frente a esquinas involuntarias.'
    },
    {
      name: 'Desviación de la Pauta',
      value: desviacionVal !== null ? desviacionVal.toFixed(4) : '—',
      unit: 'adimensional (normalizada)',
      desc: 'Error medio absoluto normalizado frente al patrón geométrico ideal ajustado.'
    },
    {
      name: 'Regularidad Espacial',
      value: regularidadVal !== null ? regularidadVal.toFixed(3) : '—',
      unit: 'índice [0.0 - 1.0]',
      desc: 'Uniformidad geométrica y consistencia espacial global en la figura realizada.'
    },
    {
      name: 'Inclinación del Trazo',
      value: inclinacionVal !== null ? `${inclinacionVal}°` : '—',
      unit: 'grados [-90° a 90°]',
      desc: 'Orientación del eje principal de inercia del trazo (análisis de momentos de segundo orden).'
    },
    {
      name: 'Relación de Aspecto',
      value: proporcionVal !== null ? proporcionVal.toFixed(3) : (anchoVal && altoVal ? (anchoVal / altoVal).toFixed(3) : '—'),
      unit: 'proporción ancho/alto',
      desc: 'Relación dimensional horizontal frente a vertical del bounding box.'
    },
    {
      name: 'Separación entre Componentes',
      value: separacionVal !== null ? `${separacionVal} px` : '0.0 px',
      unit: 'px',
      desc: 'Distancia euclidiana mínima entre trazos desconectados visibles (0.0 px si es continuo).'
    },
  ];

  const isModelAvailable = !!clas.disponible;
  const riskLabel = clas.risk_label || res.risk_label || 'no_disponible';
  const estadoRevision = res.estado_revision || activeActivity.estadoRevision || 'pendiente';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => setCurrentView('activities')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a actividades</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-600 font-mono">
            Evaluación #{activeActivity.id.toString().slice(-4)}
          </span>
          <StatusBadge status="Procesada" />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metadata & Process Steps */}
        <div className="lg:col-span-1 space-y-6">
          {/* Metadata Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-800 tracking-tight pb-3 border-b border-slate-100">
              Datos de la Ficha
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-600 uppercase font-bold text-[10px] tracking-wider block mb-1">
                  Estudiante Evaluado
                </span>
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>{activeActivity.studentName}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-600 uppercase font-bold text-[10px] tracking-wider block mb-1">
                  Ejercicio Grafomotor
                </span>
                <div className="flex items-center gap-2 text-slate-800 font-medium text-sm">
                  <Compass className="w-4 h-4 text-sky-600" />
                  <span>{activeActivity.exerciseName}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-600 uppercase font-bold text-[10px] tracking-wider block mb-1">
                  Patrón Pautado
                </span>
                <span className="inline-flex px-3 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 font-semibold">
                  {activeActivity.patternType}
                </span>
              </div>

              <div>
                <span className="text-slate-600 uppercase font-bold text-[10px] tracking-wider block mb-1">
                  Fecha de Aplicación
                </span>
                <div className="flex items-center gap-2 text-slate-700 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activeActivity.date}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Classification & Revision Card (HU-10 / HU-11) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-800 tracking-tight">
                Estado del Clasificador (ML)
              </h3>
            </div>

            {!isModelAvailable || riskLabel === 'no_disponible' ? (
              <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Clasificación no disponible</span>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  No se cuenta con un modelo de Machine Learning validado con dataset clínico para niños de nivel inicial.
                  Las características cuantitativas han sido extraídas y preservadas de forma objetiva sin asignar riesgo arbitrario.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-600 block">
                    Etiqueta Orientativa
                  </span>
                  <span className="text-sm font-black text-indigo-700">
                    {riskLabel === 'bajo_riesgo' ? 'Bajo Riesgo' : 'Riesgo Potencial'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-700 block flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Estado de Revisión Docente
                  </span>
                  <span className="text-xs font-bold text-indigo-950">
                    {estadoRevision === 'pendiente' ? 'Pendiente de revisión pedagógica' : estadoRevision}
                  </span>
                </div>
              </div>
            )}

            <div className="pt-2 text-[11px] text-slate-600 leading-relaxed border-t border-slate-100">
              <span className="font-bold text-slate-700">Nota ética:</span> El sistema no emite diagnóstico clínico. Toda categorización orientativa requiere la revisión del educador.
            </div>
          </div>
        </div>

        {/* Right Column: Analyzed Image & Extracted Features */}
        <div className="lg:col-span-2 space-y-6">
          {/* Analyzed Image Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800 tracking-tight">Captura de la Ficha en Papel</h3>
                <p className="text-xs text-slate-600 mt-0.5">Fotografía registrada para la extracción computacional con OpenCV</p>
              </div>
              <span className="text-xs text-indigo-700 font-bold px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200">
                Trazo procesado
              </span>
            </div>

            <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 flex flex-col items-center justify-center min-h-64">
              {activeActivity.imageUrl ? (
                <img
                  src={activeActivity.imageUrl}
                  alt="Trazo analizado"
                  className="max-h-72 object-contain rounded-2xl border border-slate-200 shadow-sm"
                />
              ) : (
                <div className="w-full max-w-sm p-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center text-center space-y-3">
                  <svg className="w-40 h-40 stroke-indigo-600 fill-none stroke-2" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="36" strokeDasharray="3 2" className="stroke-slate-300" />
                    <path d="M 50,14 C 70,16 86,30 86,50 C 87,68 74,84 50,86 C 30,87 14,72 15,48 C 16,30 30,17 50,14"
                      className="stroke-indigo-600 stroke-[2.5]"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Ficha física registrada</p>
                    <p className="text-[11px] text-slate-600 font-medium">Patrón evaluado: {activeActivity.patternType}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Extracted Features Table */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <span>Variables Geométricas e Indicadores Reales</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Mediciones numéricas objetivas obtenidas por visión computacional (HU-08 y HU-09)
                </p>
              </div>
              <span className="text-[11px] text-emerald-800 font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                8 descriptores cuantificados
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-[11px] uppercase tracking-wider text-slate-600 border-b border-slate-100 bg-slate-50/70">
                  <tr>
                    <th className="py-3 px-4 font-bold">Métrica / Indicador</th>
                    <th className="py-3 px-4 font-bold">Definición Matemática / Técnica</th>
                    <th className="py-3 px-4 font-bold text-right">Valor Extraído</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {featureTable.map((f, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                        {f.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs leading-relaxed">
                        {f.desc}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-indigo-700 text-sm whitespace-nowrap">
                        {f.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Academic Notice Banner */}
            <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200 flex items-start gap-3 text-xs text-sky-950 mt-4">
              <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-sky-950">
                  Enfoque del Proyecto de Grado (Sprint 2):
                </p>
                <p className="text-sky-900 leading-relaxed text-[11px]">
                  El sistema <strong>GraphiLearn AI</strong> extrae características geométricas objetivas del trazo físico para apoyar al docente en el aula. <strong>No realiza diagnósticos clínicos ni médicos</strong>, no mide presión o velocidad dinámica (al tratarse de fotografías estáticas), y conserva los datos para la posterior revisión del docente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
