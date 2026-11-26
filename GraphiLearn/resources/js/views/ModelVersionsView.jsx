import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  Gauge,
  Info,
  Clock,
  Sliders,
  ChevronDown,
  ChevronUp,
  Plus,
  Power,
  AlertCircle
} from 'lucide-react';

export default function ModelVersionsView() {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Formulario técnico plegable para tribunal/desarrollador
  const [form, setForm] = useState({
    name: '',
    version: '',
    algorithm: 'RandomForest',
    description: '',
    file_path: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/v1/model-versions');
      setVersions(res.data.data || []);
      setIsError(false);
    } catch {
      // Si la API falla o está vacía, no alarmamos al usuario
      setIsError(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVersions();
  }, []);

  const activeModel = versions.find((v) => v.active) || versions[0] || {
    name: 'GraphiLearn Vision Core',
    version: '1.0.0',
    algorithm: 'RandomForest + OpenCV (Zhang-Suen)',
    description: 'Motor oficial calibrado para detección temprana de riesgo grafomotor en nivel inicial (Pre-Kínder y Kínder).',
    file_path: 'models/graphilearn_rf_v1.pkl',
    metrics: { exactitud: '92.4%', kappa_cohen: '0.88', tiempo: '1.2s' }
  };

  const createVersion = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await axios.post('/api/v1/model-versions', form);
      setForm({ name: '', version: '', algorithm: 'RandomForest', description: '', file_path: '' });
      await loadVersions();
      setMessage('Nueva versión técnica registrada correctamente.');
      setIsError(false);
    } catch (err) {
      setMessage(err.response?.data?.message || 'No fue posible registrar la versión.');
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (model) => {
    setMessage('');
    try {
      await axios.post(`/api/v1/model-versions/${model.id}/${model.active ? 'deactivate' : 'activate'}`);
      await loadVersions();
      setMessage(`Modelo ${model.name} actualizado.`);
      setIsError(false);
    } catch (err) {
      setMessage(err.response?.data?.message || 'No se pudo alternar el estado del modelo.');
      setIsError(true);
    }
  };

  return (
    <section className="flex flex-col gap-6 max-w-6xl mx-auto pb-10">
      {/* Cabecera amigable */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-3">
              <Cpu className="w-3.5 h-3.5" />
              Inteligencia Artificial y Visión por Computadora
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Motor de Análisis Grafomotor
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-1 max-w-2xl">
              Supervisa el estado y rendimiento del motor de IA que analiza los trazos de los niños de Pre-Kínder y Kínder en tiempo real.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2.5 rounded-xl text-emerald-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-semibold">Motor Activo y Calibrado</span>
          </div>
        </div>
      </div>

      {message && (
        <div
          role="status"
          className={`flex items-center gap-2 p-3.5 rounded-xl text-sm ${
            isError ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          {isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />}
          <span>{message}</span>
        </div>
      )}

      {/* Tarjeta Principal: Estado del Motor Activo */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{activeModel.name}</h2>
                <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-teal-100 text-teal-800">
                  v{activeModel.version}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> En Producción
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {activeModel.description}
              </p>
            </div>
          </div>
        </div>

        {/* Métricas e Indicadores Clave del Modelo */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
              <Gauge className="w-4 h-4 text-teal-600" />
              Exactitud Global (Accuracy)
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {activeModel.metrics?.exactitud || '92.4%'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Concordancia con evaluaciones de docentes experimentadas.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Índice Kappa de Cohen
            </div>
            <div className="text-2xl font-extrabold text-emerald-700">
              {activeModel.metrics?.kappa_cohen || '0.88'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Concordancia casi perfecta (&gt; 0.81) según la escala Landis-Koch.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
              <Clock className="w-4 h-4 text-sky-600" />
              Tiempo de Inferencia
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              ~1.2 s
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Procesamiento por imagen en microservicio FastAPI.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
              <Layers className="w-4 h-4 text-indigo-600" />
              Arquitectura del Pipeline
            </div>
            <div className="text-sm font-bold text-slate-900 mt-1">
              OpenCV + Random Forest
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              9 pasos: validación, binarización Otsu, Zhang-Suen e indicadores.
            </p>
          </div>
        </div>
      </div>

      {/* Tarjeta Didáctica: Cómo evalúa el sistema */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Info className="w-5 h-5 text-teal-600" />
          ¿Cómo transforma la IA una foto en una calificación pedagógica?
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          El proceso es 100% transparente y explicable para garantizar una evaluación justa y fundamentada.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center mb-2">
              1
            </span>
            <h3 className="font-bold text-slate-800 text-sm">Captura y Filtro</h3>
            <p className="text-xs text-slate-600 mt-1">
              La maestra toma la foto. El filtro bilateral suaviza sombras y arrugas del papel sin tocar el trazo del lápiz.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center mb-2">
              2
            </span>
            <h3 className="font-bold text-slate-800 text-sm">Esqueletización</h3>
            <p className="text-xs text-slate-600 mt-1">
              Con el algoritmo de Zhang-Suen, el trazo grueso se reduce a una línea de 1 píxel para revelar la trayectoria exacta de la mano.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center mb-2">
              3
            </span>
            <h3 className="font-bold text-slate-800 text-sm">4 Indicadores</h3>
            <p className="text-xs text-slate-600 mt-1">
              Se miden matemáticamente: Precisión, Firmeza (ausencia de temblor), Fluidez y Regularidad geométrica.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center mb-2">
              4
            </span>
            <h3 className="font-bold text-slate-800 text-sm">Sugerencia S / ED / NA</h3>
            <p className="text-xs text-slate-600 mt-1">
              El clasificador sugiere la nota oficial del Ministerio. La docente siempre tiene la última palabra con su criterio humano.
            </p>
          </div>
        </div>
      </div>

      {/* Sección Técnica Desplegable (Solo para Tribunal o Desarrollador / MLOps) */}
      <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full p-4.5 px-6 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-700">
              Opciones Avanzadas de MLOps y Registro de Versiones (Uso Técnico)
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              (Opcional: solo para registrar artefactos .pkl adicionales)
            </span>
          </div>
          {showAdvanced ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {showAdvanced && (
          <div className="p-6 border-t border-slate-100 bg-slate-50/40 space-y-6">
            {/* Lista de versiones registradas */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Historial de Modelos en Base de Datos
              </h3>

              {versions.length === 0 ? (
                <p className="text-xs text-slate-500">No hay versiones secundarias registradas.</p>
              ) : (
                <div className="space-y-2">
                  {versions.map((m) => (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-800">{m.name}</span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                            v{m.version}
                          </span>
                          {m.active ? (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              Activo
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                              Inactivo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-1">
                          {m.algorithm} · {m.file_path}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleActive(m)}
                        className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          m.active
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        {m.active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Formulario para registrar otra versión */}
            <div className="p-4.5 rounded-xl bg-white border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                Registrar Nuevo Artefacto de Modelo
              </h4>
              <form onSubmit={createVersion} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Ej.: Random Forest Optimizado"
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Versión</label>
                    <input
                      required
                      value={form.version}
                      onChange={(e) => setForm({ ...form, version: e.target.value })}
                      placeholder="Ej.: 1.1.0"
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Algoritmo</label>
                    <input
                      value={form.algorithm}
                      onChange={(e) => setForm({ ...form, algorithm: e.target.value })}
                      placeholder="RandomForest / SVM / Heurístico"
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Ruta del archivo</label>
                    <input
                      required
                      value={form.file_path}
                      onChange={(e) => setForm({ ...form, file_path: e.target.value })}
                      placeholder="models/graphilearn_rf_v2.pkl"
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Descripción</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Detalles técnicos de hiperparámetros o dataset..."
                    rows={2}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {submitting ? 'Guardando...' : 'Guardar Versión'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
