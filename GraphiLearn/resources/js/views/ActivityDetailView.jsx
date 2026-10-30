import React, { useState, useRef } from 'react';
import axios from 'axios';
import {
  ArrowLeft,
  UploadCloud,
  FileImage,
  CheckCircle2,
  AlertCircle,
  Cpu,
  User,
  Compass,
  Calendar,
  Trash2,
  Sparkles,
  Play,
  FileCheck2,
  GraduationCap
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function ActivityDetailView({
  activity,
  updateActivity,
  setCurrentView
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(activity.imageUrl || null);
  const [feedback, setFeedback] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  const fileInputRef = useRef(null);

  if (!activity) {
    return (
      <div className="text-center py-20 text-slate-600">
        <p>No se ha seleccionado ninguna actividad.</p>
        <button
          onClick={() => setCurrentView('activities')}
          className="mt-4 px-4 py-2 rounded-2xl bg-indigo-600 text-white text-xs font-bold"
        >
          Volver a actividades
        </button>
      </div>
    );
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    validateAndSelectFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    validateAndSelectFile(file);
  };

  const validateAndSelectFile = (file) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      showFeedback('Formato no válido. Solo se permiten fotografías JPG, JPEG o PNG.', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showFeedback('La fotografía supera el tamaño máximo permitido de 10 MB.', 'error');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadImage = async () => {
    if (!selectedFile && !previewUrl) return;

    setIsUploading(true);
    try {
      if (selectedFile && activity.id) {
        const formData = new FormData();
        formData.append('imagen', selectedFile);

        const response = await axios.post(`/api/v1/actividades/${activity.id}/imagen`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        const updated = {
          ...activity,
          status: 'Imagen cargada',
          imageUrl: previewUrl,
          imagenId: response.data?.data?.id,
          imageMetadata: {
            fileName: selectedFile.name,
            fileSize: `${(selectedFile.size / 1024).toFixed(1)} KB`,
            uploadDate: new Date().toLocaleDateString('es-ES')
          }
        };
        updateActivity(updated);
        showFeedback('Fotografía cargada y registrada exitosamente en el servidor.', 'success');
      } else {
        const updated = {
          ...activity,
          status: 'Imagen cargada',
          imageUrl: previewUrl,
          imageMetadata: {
            fileName: selectedFile ? selectedFile.name : 'ficha_trazo_nino.png',
            fileSize: selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : '420.5 KB',
            uploadDate: new Date().toLocaleDateString('es-ES')
          }
        };
        updateActivity(updated);
        showFeedback('Fotografía de la ficha física cargada correctamente.', 'success');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error al almacenar la imagen en el servidor.';
      showFeedback(errMsg, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleTriggerAnalysis = async () => {
    if (!activity.id) {
      showFeedback('No se puede analizar: identificador de actividad no válido.', 'error');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep(1); // 1. Contactando microservicio

    try {
      setAnalysisStep(2); // 2. Binarización y Esqueletización OpenCV
      const response = await axios.post(`/api/v1/actividades/${activity.id}/procesar`);

      setAnalysisStep(3); // 3. Extracción de características
      const resultData = response.data?.data || response.data;
      const geom = resultData.caracteristicas_geometricas || resultData;
      const ind = resultData.indicadores_cuantitativos || resultData;
      const clas = resultData.clasificacion || {};

      setAnalysisStep(4); // 4. Persistencia confirmada

      const updated = {
        ...activity,
        status: 'Procesada',
        estado: 'procesado',
        estadoRevision: resultData.estado_revision || 'pendiente',
        analysisResult: resultData,
        features: {
          longitudTrazo: geom.longitud_trazo !== undefined && geom.longitud_trazo !== null ? `${geom.longitud_trazo} px` : '—',
          continuidad: ind.continuidad !== undefined && ind.continuidad !== null ? ind.continuidad.toString() : '—',
          curvatura: geom.curvatura !== undefined && geom.curvatura !== null ? `${geom.curvatura} rad/px` : '—',
          desviacion: ind.desviacion !== undefined && ind.desviacion !== null ? ind.desviacion.toString() : '—',
          regularidad: ind.regularidad !== undefined && ind.regularidad !== null ? ind.regularidad.toString() : '—',
          inclinacion: geom.inclinacion !== undefined && geom.inclinacion !== null ? `${geom.inclinacion}°` : '—',
          proporcion: geom.proporcion !== undefined && geom.proporcion !== null ? geom.proporcion.toString() : '—',
          alto: geom.alto ? `${geom.alto} px` : '—',
          ancho: geom.ancho ? `${geom.ancho} px` : '—',
          separacion: geom.separacion_componentes !== undefined && geom.separacion_componentes !== null ? `${geom.separacion_componentes} px` : '—',
        },
        classification: {
          disponible: !!clas.disponible,
          riskLabel: clas.risk_label || resultData.risk_label || 'no_disponible',
          riskScore: clas.risk_score ?? resultData.risk_score ?? null,
          modelVersion: clas.model_version || resultData.model_version_id || null,
          estadoRevision: resultData.estado_revision || 'pendiente',
        }
      };

      updateActivity(updated);
      showFeedback('Procesamiento completado y características geométricas reales extraídas.', 'success');
    } catch (err) {
      setAnalysisStep(0);
      const errMsg = err.response?.data?.message || 'Error al comunicarse con el servicio de análisis computacional.';
      showFeedback(errMsg, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const showFeedback = (message, type) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4500);
  };

  const hasImage = !!(activity.imageUrl || previewUrl);
  const isImageLoaded = activity.status === 'Imagen cargada' || hasImage;
  const isProcessed = (activity.status || '').toLowerCase().includes('procesad');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back button & Status */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentView('activities')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a actividades</span>
        </button>

        <StatusBadge status={activity.status} />
      </div>

      {/* Feedback message */}
      {feedback && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in ${
          feedback.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium'
            : 'bg-rose-50 border border-rose-200 text-rose-800 font-medium'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Grid: Activity Info & Upload Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Activity Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-800 tracking-tight pb-3 border-b border-slate-100">
              Datos de la Evaluación
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-600 uppercase font-bold text-[10px] tracking-wider block mb-1">
                  Estudiante Evaluado
                </span>
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>{activity.studentName}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-600 uppercase font-bold text-[10px] tracking-wider block mb-1">
                  Ejercicio de Trazo
                </span>
                <div className="flex items-center gap-2 text-slate-800 font-medium text-sm">
                  <Compass className="w-4 h-4 text-sky-600" />
                  <span>{activity.exerciseName}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-600 uppercase font-bold text-[10px] tracking-wider block mb-1">
                  Patrón Geométrico
                </span>
                <span className="inline-flex px-3 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 font-semibold">
                  {activity.patternType}
                </span>
              </div>

              <div>
                <span className="text-slate-600 uppercase font-bold text-[10px] tracking-wider block mb-1">
                  Fecha de Realización en Aula
                </span>
                <div className="flex items-center gap-2 text-slate-700 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activity.date}</span>
                </div>
              </div>
            </div>

            {/* Pedagogical Explanation Note */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed">
              <p className="font-bold text-indigo-950 mb-1">¿Cómo funciona esta prueba?</p>
              El niño realiza el trazo con lápiz sobre la ficha física de papel. La maestra toma la foto de la hoja y el sistema analiza la regularidad del trazo sin alterar la dinámica de aula.
            </div>

            {isProcessed && (
              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => setCurrentView('analysis-detail')}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-100 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Ver Métricas Calculadas</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: HU-05 Upload & HU-06 Analyze */}
        <div className="lg:col-span-2 space-y-6">
          {/* HU-05: Carga de imagen */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800 tracking-tight">Fotografía de la Hoja de Trabajo</h3>
                <p className="text-xs text-slate-600 mt-0.5">Suba la imagen clara del trazo realizado por el niño (JPG, PNG - Máx. 5 MB)</p>
              </div>
              {activity.imageUrl && (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Fotografía cargada</span>
                </span>
              )}
            </div>

            {/* Dropzone Area */}
            {!previewUrl ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-indigo-500 bg-indigo-50/60'
                    : 'border-slate-200 hover:border-indigo-400 bg-slate-50/70 hover:bg-indigo-50/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  Arrastra aquí la foto del ejercicio
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  o haz clic para <span className="text-indigo-600 underline font-semibold">explorar en tu computadora</span>
                </p>
              </div>
            ) : (
              /* Preview Area */
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 p-4 flex items-center justify-center max-h-72">
                  <img
                    src={previewUrl}
                    alt="Vista previa del ejercicio grafomotor"
                    className="max-h-64 object-contain rounded-xl shadow-xs"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <FileImage className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold truncate max-w-xs">
                      {selectedFile ? selectedFile.name : (activity.imageMetadata?.fileName || 'trazo_nino.png')}
                    </span>
                    <span className="text-slate-600 font-mono">
                      ({selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : (activity.imageMetadata?.fileSize || '380 KB')})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {activity.status !== 'Imagen cargada' && !isProcessed && (
                      <button
                        onClick={handleUploadImage}
                        disabled={isUploading}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors"
                      >
                        {isUploading ? 'Guardando...' : 'Confirmar fotografía'}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="p-2 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors"
                      title="Cambiar fotografía"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* HU-06: Analizar imagen */}
          {isImageLoaded && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-indigo-600" />
                    <span>Pipeline de Análisis Computacional</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Filtrado morfológico, binarización Otsu y esqueletización del trazo infantil
                  </p>
                </div>

                {!isProcessed && (
                  <button
                    onClick={handleTriggerAnalysis}
                    disabled={isAnalyzing}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Procesando trazo...
                      </span>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Extraer Características</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Pipeline Flow Indicator */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                  Fases del procesamiento:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs">
                  <div className={`p-3 rounded-2xl border flex flex-col justify-between ${
                    analysisStep >= 0 || hasImage
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <span className="font-bold text-[11px]">1. Imagen</span>
                    <span className="text-[10px] text-emerald-700 font-bold mt-1">✓ Recibida</span>
                  </div>

                  <div className={`p-3 rounded-2xl border flex flex-col justify-between ${
                    analysisStep >= 1 || isProcessed
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : isAnalyzing && analysisStep === 1
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-800 animate-pulse'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <span className="font-bold text-[11px]">2. Filtrado</span>
                    <span className="text-[10px] mt-1 font-semibold">
                      {analysisStep >= 1 || isProcessed ? '✓ Otsu' : 'Pendiente'}
                    </span>
                  </div>

                  <div className={`p-3 rounded-2xl border flex flex-col justify-between ${
                    analysisStep >= 2 || isProcessed
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : isAnalyzing && analysisStep === 2
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-800 animate-pulse'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <span className="font-bold text-[11px]">3. Esqueleto</span>
                    <span className="text-[10px] mt-1 font-semibold">
                      {analysisStep >= 2 || isProcessed ? '✓ Trazo 1px' : 'Pendiente'}
                    </span>
                  </div>

                  <div className={`p-3 rounded-2xl border flex flex-col justify-between ${
                    analysisStep >= 3 || isProcessed
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : isAnalyzing && analysisStep === 3
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-800 animate-pulse'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <span className="font-bold text-[11px]">4. Descriptores</span>
                    <span className="text-[10px] mt-1 font-semibold">
                      {analysisStep >= 3 || isProcessed ? '✓ Métricas' : 'Pendiente'}
                    </span>
                  </div>

                  <div className={`p-3 rounded-2xl border flex flex-col justify-between ${
                    analysisStep >= 4 || isProcessed
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <span className="font-bold text-[11px]">5. Base de Datos</span>
                    <span className="text-[10px] mt-1 font-semibold">
                      {analysisStep >= 4 || isProcessed ? '✓ Guardado' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Geometric Features Extracted */}
              {(isProcessed || analysisStep >= 4) && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Descriptores geométricos cuantificados</h4>
                      <p className="text-xs text-slate-600">Variables matemáticas listas para la futura clasificación</p>
                    </div>
                    <button
                      onClick={() => setCurrentView('analysis-detail')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
                    >
                      Abrir reporte detallado →
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-600 block">Longitud</span>
                      <span className="text-base font-black text-slate-800 font-mono mt-1 block">
                        {activity.features?.longitudTrazo || '—'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-600 block">Continuidad</span>
                      <span className="text-base font-black text-slate-800 font-mono mt-1 block">
                        {activity.features?.continuidad || '—'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-600 block">Curvatura</span>
                      <span className="text-base font-black text-slate-800 font-mono mt-1 block">
                        {activity.features?.curvatura || '—'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-600 block">Desviación</span>
                      <span className="text-base font-black text-slate-800 font-mono mt-1 block">
                        {activity.features?.desviacion || '—'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-600 block">Regularidad</span>
                      <span className="text-base font-black text-slate-800 font-mono mt-1 block">
                        {activity.features?.regularidad || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
