import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Camera, CheckCircle2, FileText, Image as ImageIcon, LoaderCircle, RefreshCw } from 'lucide-react';
import { formatLocalDate, formatLocalDateTime } from '../utils/dateFormat';

const ratingLabels = { S: 'Satisfactorio', ED: 'En desarrollo', NA: 'Necesita apoyo' };
const metricInfo = {
  longitud_trazo: ['Longitud del trazo', 'px'], alto: ['Alto del trazo', 'px'], ancho: ['Ancho del trazo', 'px'],
  proporcion: ['Relación ancho/alto', 'sin unidad'], inclinacion: ['Orientación del trazo', 'grados'],
  curvatura: ['Variación de dirección', 'rad/px'], separacion_componentes: ['Distancia entre componentes', 'px'],
  desviacion: ['Desviación del patrón', 'sin unidad'], rugosidad: ['Variación angular', 'rad'],
  continuidad: ['Continuidad', 'índice 0–1'], regularidad: ['Regularidad geométrica', 'índice 0–1'],
};

const localizeActivity = (data, fallback) => {
  const result = data.analysis_result || data.analysisResult || fallback.analysisResult || null;
  const image = data.imagen || null;
  return {
    ...fallback,
    id: data.id,
    studentId: data.id_estudiante ?? fallback.studentId,
    studentName: data.estudiante?.nombre || fallback.studentName,
    exerciseId: data.id_ejercicio ?? fallback.exerciseId,
    exerciseName: data.ejercicio?.nombre || fallback.exerciseName,
    patternType: data.ejercicio?.tipo_trazo || fallback.patternType,
    date: data.fecha || fallback.date,
    estado: data.estado || fallback.estado,
    status: data.estado === 'procesado' ? 'Análisis completado' : image ? 'Fotografía cargada' : 'Pendiente de fotografía',
    imageId: image?.id || fallback.imageId || null,
    imageMetadata: image || fallback.imageMetadata || null,
    analysisResult: result,
    pedagogical_rating: data.pedagogical_rating ?? fallback.pedagogical_rating ?? null,
    pedagogical_observations: data.pedagogical_observations ?? fallback.pedagogical_observations ?? '',
    period_reference: data.period_reference ?? fallback.period_reference ?? '',
    evaluation_history: data.evaluation_history || fallback.evaluation_history || [],
  };
};

export default function ActivityDetailView({ activity, updateActivity, setCurrentView, onEvaluationComplete }) {
  const [current, setCurrent] = useState(activity);
  const [selectedFile, setSelectedFile] = useState(null);
  const [remoteImageUrl, setRemoteImageUrl] = useState(null);
  const [imageNonce, setImageNonce] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [analysisError, setAnalysisError] = useState('');
  const [busy, setBusy] = useState('');
  const [rating, setRating] = useState(activity?.pedagogical_rating || '');
  const [observations, setObservations] = useState(activity?.pedagogical_observations || '');
  const [periodReference, setPeriodReference] = useState(activity?.period_reference || '');
  const [history, setHistory] = useState(activity?.evaluation_history || []);
  const cameraInput = useRef(null);
  const uploadInput = useRef(null);
  const localPreviewUrl = useMemo(() => selectedFile ? URL.createObjectURL(selectedFile) : null, [selectedFile]);

  useEffect(() => () => { if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl); }, [localPreviewUrl]);
  useEffect(() => {
    setCurrent(activity);
    setRating(activity?.pedagogical_rating || '');
    setObservations(activity?.pedagogical_observations || '');
    setPeriodReference(activity?.period_reference || '');
    setHistory(activity?.evaluation_history || []);
    setSelectedFile(null);
    setAnalysisError('');
  }, [activity?.id]);

  useEffect(() => {
    if (!current?.id) return;
    let cancelled = false;
    axios.get(`/api/v1/actividades/${current.id}`)
      .then(response => {
        if (cancelled) return;
        const refreshed = localizeActivity(response.data.data, current);
        setCurrent(refreshed);
        updateActivity(refreshed);
        setRating(refreshed.pedagogical_rating || '');
        setObservations(refreshed.pedagogical_observations || '');
        setPeriodReference(refreshed.period_reference || '');
        setHistory(refreshed.evaluation_history || []);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [current?.id]);

  useEffect(() => {
    if (!current?.imageId || localPreviewUrl) { setRemoteImageUrl(null); return; }
    let cancelled = false;
    let objectUrl;
    axios.get(`/api/v1/imagenes/${current.imageId}/download`, { responseType: 'blob' })
      .then(response => {
        objectUrl = URL.createObjectURL(response.data);
        if (cancelled) URL.revokeObjectURL(objectUrl);
        else setRemoteImageUrl(objectUrl);
      })
      .catch(() => setRemoteImageUrl(null));
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [current?.imageId, localPreviewUrl, imageNonce]);

  useEffect(() => {
    if (!current?.id) return;
    axios.get(`/api/v1/actividades/${current.id}/evaluacion/historial`)
      .then(response => setHistory(response.data.data || []))
      .catch(() => {});
  }, [current?.id]);

  const setActivity = data => {
    setCurrent(data);
    updateActivity(data);
  };
  const chooseFile = event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) { setFeedback('Selecciona una imagen JPG o PNG.'); return; }
    if (file.size > 5 * 1024 * 1024) { setFeedback('La imagen supera el máximo permitido de 5 MB.'); return; }
    setFeedback('');
    setSelectedFile(file);
  };

  const savePhoto = async () => {
    if (!selectedFile || !current?.id) return;
    setBusy('upload'); setFeedback('');
    try {
      const form = new FormData();
      form.append('imagen', selectedFile);
      const response = await axios.post(`/api/v1/actividades/${current.id}/imagen`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      const updated = { ...current, imageId: response.data.data.id, imageMetadata: response.data.data, status: 'Fotografía cargada' };
      setActivity(updated);
      setSelectedFile(null);
      setImageNonce(value => value + 1);
      setFeedback('La fotografía se guardó de forma privada.');
    } catch (error) { setFeedback(error.response?.data?.message || 'No fue posible guardar la fotografía.'); }
    finally { setBusy(''); }
  };

  const analyze = async () => {
    if (!current?.id || !current.imageId) { setFeedback('Primero toma o selecciona una fotografía y guárdala.'); return; }
    setBusy('analysis'); setFeedback(''); setAnalysisError('');
    try {
      const response = await axios.post(`/api/v1/actividades/${current.id}/procesar`);
      const result = response.data.data;
      const updated = { ...current, estado: 'procesado', status: 'Análisis completado', analysisResult: result };
      setActivity(updated);
      setFeedback('Análisis completado. Revisa los indicadores y registra tu valoración manual.');
    } catch (error) {
      const message = error.response?.data?.message || 'No fue posible completar el análisis.';
      setAnalysisError(message);
      setFeedback('El análisis no pudo completarse. Puedes intentarlo de nuevo si el servicio vuelve a estar disponible.');
    } finally { setBusy(''); }
  };

  const saveEvaluation = async event => {
    event.preventDefault();
    if (!rating) { setFeedback('Selecciona una valoración manual para guardar.'); return; }
    setBusy('evaluation'); setFeedback('');
    try {
      const response = await axios.put(`/api/v1/actividades/${current.id}/evaluacion`, {
        pedagogical_rating: rating,
        pedagogical_observations: observations.trim() || null,
        period_reference: periodReference.trim() || null,
      });
      const saved = localizeActivity(response.data.data, current);
      setActivity(saved);
      const historyResponse = await axios.get(`/api/v1/actividades/${current.id}/evaluacion/historial`);
      setHistory(historyResponse.data.data || []);
      if (current.returnView === 'student-profile') onEvaluationComplete?.();
      else setFeedback('Valoración y observación guardadas con su historial.');
    } catch (error) { setFeedback(error.response?.data?.message || 'No fue posible guardar la valoración.'); }
    finally { setBusy(''); }
  };

  if (!current) return <p className="rounded-2xl border bg-white p-6 text-sm">No hay un ejercicio seleccionado.</p>;
  const result = current.analysisResult || {};
  const geom = result.caracteristicas_geometricas || {};
  const quantitative = result.indicadores_cuantitativos || {};
  const availableMetrics = Object.entries(metricInfo).map(([key, [label, unit]]) => ({ key, label, unit, value: geom[key] ?? quantitative[key] })).filter(item => item.value !== null && item.value !== undefined && typeof item.value !== 'object');
  const classification = result.clasificacion || {};
  const analyzingState = result.estado === 'procesado' || current.estado === 'procesado';
  const imageSrc = localPreviewUrl || remoteImageUrl;
  const canReplace = !analyzingState;

  const back = () => current.returnView === 'student-profile' ? onEvaluationComplete?.() : setCurrentView('activities');

  return <section className="mx-auto max-w-4xl space-y-5">
    <button type="button" onClick={back} className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-indigo-700"><ArrowLeft size={16}/>{current.returnView === 'student-profile' ? 'Volver a la ficha' : 'Volver a trabajos'}</button>
    <header className="rounded-3xl border bg-white p-5 sm:p-7"><p className="text-xs font-bold uppercase tracking-wide text-indigo-700">Fotografía y evaluación</p><h2 className="mt-1 text-xl font-bold text-slate-900">{current.exerciseName}</h2><p className="mt-1 text-sm text-slate-600">Estudiante: {current.studentName} · Fecha: {formatLocalDate(current.date)}{current.period_reference ? ` · ${current.period_reference}` : ''}</p></header>

    {feedback && <p role="status" className="rounded-xl border bg-indigo-50 p-3 text-sm text-indigo-900">{feedback}</p>}
    <section className="space-y-4 rounded-3xl border bg-white p-4 sm:p-6">
      <div><h3 className="font-bold text-slate-900">1. Fotografía del ejercicio</h3><p className="mt-1 text-sm text-slate-600">En celular, usa “Tomar foto”. La captura requiere permiso de cámara y HTTPS o localhost.</p></div>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={!canReplace} onClick={() => cameraInput.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Camera size={17}/>Tomar foto</button>
        <button type="button" disabled={!canReplace} onClick={() => uploadInput.current?.click()} className="rounded-xl border px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50">Subir imagen</button>
        {selectedFile && <button type="button" onClick={() => setSelectedFile(null)} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold"><RefreshCw size={16}/>Descartar y conservar guardada</button>}
        <input ref={cameraInput} type="file" accept="image/jpeg,image/png" capture="environment" onChange={chooseFile} className="hidden" aria-label="Tomar foto del ejercicio" />
        <input ref={uploadInput} type="file" accept="image/jpeg,image/png" onChange={chooseFile} className="hidden" aria-label="Subir imagen del ejercicio" />
      </div>
      <div className="flex min-h-56 items-center justify-center overflow-hidden rounded-2xl border bg-slate-50 p-2">{imageSrc ? <img src={imageSrc} alt="Vista previa de la fotografía original del ejercicio" className="max-h-[28rem] w-full object-contain"/> : <p className="text-center text-sm text-slate-500"><ImageIcon className="mx-auto mb-2 h-7 w-7"/>La vista previa aparecerá aquí.</p>}</div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-slate-500">{selectedFile ? `${selectedFile.name} · ${(selectedFile.size / 1024).toFixed(0)} KB · Vista previa, aún sin guardar` : current.imageId ? 'Fotografía guardada de forma privada.' : 'Fotografía pendiente.'}</p><button type="button" disabled={!selectedFile || !!busy || !canReplace} onClick={savePhoto} className="rounded-xl border px-4 py-2.5 text-sm font-semibold text-indigo-700 disabled:opacity-50">{busy === 'upload' ? 'Guardando foto…' : selectedFile && current.imageId ? 'Reemplazar fotografía' : 'Guardar fotografía'}</button></div>
    </section>

    <section className="space-y-4 rounded-3xl border bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold text-slate-900">2. Análisis automático</h3><p className="mt-1 text-sm text-slate-600">El análisis calcula medidas de la imagen; no asigna la valoración pedagógica.</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${analyzingState ? 'bg-emerald-50 text-emerald-800' : analysisError ? 'bg-rose-50 text-rose-800' : 'bg-amber-50 text-amber-800'}`}>{analyzingState ? 'Completado' : analysisError ? 'Error' : 'Pendiente'}</span></div>
      {!analyzingState && <button type="button" disabled={!current.imageId || !!busy} onClick={analyze} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy === 'analysis' ? <><LoaderCircle className="animate-spin" size={17}/>Analizando…</> : 'Analizar fotografía'}</button>}
      {analysisError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{analysisError}</p>}
      {analyzingState && <div className="space-y-4">
        <div className="rounded-2xl border p-4"><h4 className="font-semibold text-slate-900">Indicadores geométricos disponibles</h4>{availableMetrics.length ? <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">{availableMetrics.map(metric => <div key={metric.key} className="rounded-lg bg-slate-50 p-3"><dt className="text-xs text-slate-600">{metric.label}</dt><dd className="mt-1 font-semibold text-slate-900">{metric.value} <span className="text-xs font-normal text-slate-500">{metric.unit}</span></dd></div>)}</dl> : <p className="mt-2 text-sm text-slate-500">No hay indicadores disponibles en la respuesta.</p>}</div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><h4 className="font-semibold text-amber-950">Sugerencia del sistema</h4>{classification.sugerencia ? <><p className="mt-1 text-sm text-amber-950">Sugerencia experimental: {classification.sugerencia}</p><p className="mt-1 text-xs text-amber-900">La valoración final siempre corresponde a la docente.</p></> : <p className="mt-1 text-sm text-amber-950">Sugerencia no disponible; el análisis geométrico continúa funcionando.</p>}</div>
        {result.detalles_computacionales?.imagen_procesada_url && <div className="rounded-2xl border p-4"><h4 className="font-semibold">Representación procesada devuelta por FastAPI</h4><img src={result.detalles_computacionales.imagen_procesada_url} alt="Representación procesada del trazo" className="mt-3 max-h-80 w-full object-contain"/></div>}
        {result.detalles_computacionales?.tiempo_procesamiento_segundos !== undefined && <p className="text-xs text-slate-500">Fecha registrada: {formatLocalDateTime(result.created_at)} · Tiempo devuelto por servicio: {result.detalles_computacionales.tiempo_procesamiento_segundos} s</p>}
      </div>}
    </section>

    <form onSubmit={saveEvaluation} className="space-y-4 rounded-3xl border bg-white p-4 sm:p-6">
      <div><h3 className="font-bold text-slate-900">3. Valoración y observación docente</h3><p className="mt-1 text-sm text-slate-600">Registra tu valoración manual. No se obtiene de la clasificación automática.</p></div>
      <fieldset className="grid grid-cols-1 gap-2 sm:grid-cols-3"><legend className="mb-2 text-sm font-semibold">Valoración pedagógica</legend>{['S', 'ED', 'NA'].map(value => <label key={value} className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm ${rating === value ? 'border-indigo-500 bg-indigo-50' : ''}`}><input type="radio" name="pedagogical-rating" value={value} required checked={rating === value} onChange={() => setRating(value)}/><span><strong>{value}</strong> — {ratingLabels[value]}</span></label>)}</fieldset>
      <label className="block text-sm font-medium">Periodo de evaluación <span className="font-normal text-slate-500">(si corresponde)</span><input value={periodReference} onChange={event => setPeriodReference(event.target.value)} maxLength={100} placeholder="Referencia acordada para el periodo" className="mt-1 w-full rounded-xl border p-3"/></label>
      <label className="block text-sm font-medium">Observaciones pedagógicas<textarea value={observations} onChange={event => setObservations(event.target.value)} maxLength={5000} rows={4} placeholder="Escribe observaciones relacionadas con este ejercicio" className="mt-1 w-full rounded-xl border p-3"/></label>
      <button type="submit" disabled={!!busy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy === 'evaluation' ? <><LoaderCircle className="animate-spin" size={17}/>Guardando…</> : <><CheckCircle2 size={17}/>{current.returnView === 'student-profile' ? 'Guardar y volver a la ficha' : 'Guardar valoración'}</>}</button>
      {history.length > 0 && <details className="rounded-xl border p-3"><summary className="cursor-pointer text-sm font-semibold"><FileText className="mr-1 inline h-4 w-4"/>Cambios anteriores ({history.length})</summary><ul className="mt-2 space-y-2">{history.map(item => <li key={item.id} className="border-t pt-2 text-xs text-slate-600">{formatLocalDateTime(item.created_at)} · {item.changed_by?.nombre || 'Docente'} · {item.pedagogical_rating ? `${item.pedagogical_rating} — ${ratingLabels[item.pedagogical_rating]}` : 'Sin valoración'}{item.pedagogical_observations ? ` · ${item.pedagogical_observations}` : ''}</li>)}</ul></details>}
    </form>
  </section>;
}
