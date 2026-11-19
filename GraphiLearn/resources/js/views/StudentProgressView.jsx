import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Camera, Clock3, FileText, Image as ImageIcon, ClipboardCheck, MessageSquareText, History } from 'lucide-react';
import { formatLocalDate, formatLocalDateTime } from '../utils/dateFormat';

const tabs = [
  { id: 'evaluate', label: 'Evaluar', icon: ClipboardCheck },
  { id: 'observations', label: 'Observaciones', icon: MessageSquareText },
  { id: 'history', label: 'Historial', icon: History },
];

const indicators = [
  ['longitud_trazo', 'Longitud del trazo', 'px'],
  ['alto', 'Alto del trazo', 'px'],
  ['ancho', 'Ancho del trazo', 'px'],
  ['proporcion', 'Relación ancho/alto', 'sin unidad'],
  ['inclinacion', 'Orientación del trazo', 'grados'],
  ['curvatura', 'Variación de dirección', 'rad/px'],
  ['separacion_componentes', 'Distancia entre componentes', 'px'],
  ['desviacion', 'Desviación del patrón', 'sin unidad'],
  ['rugosidad', 'Variación angular', 'rad'],
  ['continuidad', 'Continuidad', 'índice 0–1'],
  ['regularidad', 'Regularidad geométrica', 'índice 0–1'],
];

const ratingLabels = { S: 'Satisfactorio', ED: 'En desarrollo', NA: 'Necesita apoyo' };

export default function StudentProgressView({ student, onBack, onEvaluate }) {
  const [record, setRecord] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('evaluate');
  const [imageUrls, setImageUrls] = useState({});
  const [editingObservation, setEditingObservation] = useState(null);
  const [observationDraft, setObservationDraft] = useState('');
  const [savingObservation, setSavingObservation] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/v1/students/${student.id}/progress`);
      setRecord(response.data.data);
      setError('');
    } catch (e) {
      setError(e.response?.data?.message || 'No fue posible cargar la ficha de seguimiento.');
    } finally { setLoading(false); }
  }, [student.id]);

  useEffect(() => { refresh(); }, [refresh]);

  const executions = record?.executions || [];
  const imagesToLoad = useMemo(() => executions.filter(activity => activity.imagen?.id), [executions]);
  useEffect(() => {
    let cancelled = false;
    const urls = [];
    Promise.all(imagesToLoad.map(async activity => {
      try {
        const response = await axios.get(`/api/v1/imagenes/${activity.imagen.id}/download`, { responseType: 'blob' });
        const url = URL.createObjectURL(response.data);
        urls.push(url);
        if (cancelled) URL.revokeObjectURL(url);
        else setImageUrls(previous => ({ ...previous, [activity.id]: url }));
      } catch { /* La ficha sigue disponible aunque no se encuentre una imagen. */ }
    }));
    return () => { cancelled = true; urls.forEach(URL.revokeObjectURL); };
  }, [imagesToLoad]);

  const startEvaluation = (program, exercise) => {
    const existing = executions.find(activity => Number(activity.scheduled_activity_id) === Number(program.id)
      && Number(activity.id_ejercicio) === Number(exercise.id));
    onEvaluate?.({ student: record.student, program, exercise, execution: existing || null });
  };

  const saveObservation = async (activity) => {
    setSavingObservation(true);
    try {
      await axios.put(`/api/v1/actividades/${activity.id}/evaluacion`, {
        pedagogical_rating: activity.pedagogical_rating,
        pedagogical_observations: observationDraft.trim() || null,
        period_reference: activity.period_reference || null,
      });
      setEditingObservation(null);
      setObservationDraft('');
      await refresh();
    } catch (e) {
      setError(e.response?.data?.message || 'No fue posible guardar la observación.');
    } finally { setSavingObservation(false); }
  };

  if (loading && !record) return <p role="status" className="rounded-2xl border bg-white p-6 text-sm text-slate-600">Cargando ficha…</p>;
  if (error && !record) return <section className="space-y-4"><button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-indigo-700"><ArrowLeft size={16}/> Volver</button><p role="alert" className="rounded-xl bg-rose-50 p-4 text-rose-800">{error}</p></section>;

  const profile = record?.student;
  const programs = record?.scheduled_activities || [];
  const evaluated = executions.filter(activity => activity.pedagogical_rating);
  const observations = evaluated;

  return <section className="space-y-5">
    <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-indigo-700"><ArrowLeft size={16}/> Volver al aula</button>
    <header className="rounded-3xl border bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Ficha de seguimiento</p><h2 className="mt-1 text-2xl font-bold text-slate-900">{profile?.nombre}</h2><p className="mt-1 text-sm text-slate-600">Curso: {profile?.course?.nombre} · {profile?.course?.nivel}</p><p className="text-sm text-slate-600">Docente: {profile?.course?.teacher || 'No asignado'} · Nacimiento: {formatLocalDate(profile?.fecha_nacimiento)}</p></div>
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">Estado administrativo: {profile?.administrative_status || 'Activo'}</span>
      </div>
    </header>

    <nav aria-label="Secciones de seguimiento" className="flex gap-2 overflow-x-auto rounded-2xl border bg-white p-2">
      {tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setActiveTab(id)} aria-current={activeTab === id ? 'page' : undefined} className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${activeTab === id ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}><Icon size={16}/>{label}</button>)}
    </nav>
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}

    {activeTab === 'evaluate' && <section className="space-y-4">
      <header><h3 className="text-lg font-bold text-slate-900">Actividades del curso</h3><p className="text-sm text-slate-600">Cada ejercicio se registra y evalúa por separado.</p></header>
      {programs.map(program => {
        const orderedExercises = [...(program.exercises || (program.exercise ? [program.exercise] : []))].sort((a, b) => (a.pivot?.position || 0) - (b.pivot?.position || 0));
        return <article key={program.id} className="rounded-2xl border bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2"><div><h4 className="font-bold text-slate-900">{program.name}</h4>{program.scheduled_for && <p className="mt-1 text-xs text-slate-500">Fecha: {formatLocalDate(program.scheduled_for)}</p>}</div><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-800">{program.period_reference || 'Periodo no especificado'}</span></div>
          <ol className="mt-4 space-y-3">{orderedExercises.map((exercise, index) => {
            const activity = executions.find(item => Number(item.scheduled_activity_id) === Number(program.id) && Number(item.id_ejercicio) === Number(exercise.id));
            const hasRating = !!activity?.pedagogical_rating;
            const buttonLabel = hasRating ? 'Consultar resultado' : activity?.imagen ? 'Completar evaluación' : activity ? 'Continuar evaluación' : 'Evaluar';
            return <li key={exercise.id} className="flex flex-col gap-3 rounded-xl border bg-slate-50 p-3 sm:flex-row sm:items-center">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-indigo-700">{index + 1}</span>
              <div className="min-w-0 flex-1"><p className="font-medium text-slate-900">{exercise.nombre}</p><p className="mt-0.5 text-xs text-slate-600">Estado: {hasRating ? 'Evaluado' : 'Sin evaluar'}{hasRating ? ` · ${activity.pedagogical_rating} — ${ratingLabels[activity.pedagogical_rating]}` : ''}</p>{activity && <p className="text-xs text-slate-500">Trabajo del {formatLocalDate(activity.fecha)}</p>}</div>
              <button type="button" onClick={() => startEvaluation(program, exercise)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"><Camera size={16}/>{buttonLabel}</button>
            </li>;
          })}</ol>
          {!orderedExercises.length && <p className="mt-3 text-sm text-slate-500">Esta actividad aún no tiene ejercicios.</p>}
        </article>;
      })}
      {!programs.length && <p className="rounded-2xl border bg-white p-6 text-sm text-slate-500">No hay actividades programadas para este curso.</p>}
    </section>}

    {activeTab === 'observations' && <section className="space-y-3">
      <header><h3 className="text-lg font-bold text-slate-900">Observaciones docentes</h3><p className="text-sm text-slate-600">Cada nota permanece vinculada a su ejercicio y valoración; los cambios quedan en el historial.</p></header>
      {observations.map(activity => <article key={activity.id} className="rounded-2xl border bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-2"><div><h4 className="font-semibold">{activity.ejercicio?.nombre}</h4><p className="text-xs text-slate-500">{formatLocalDate(activity.fecha)} · {activity.evaluated_by_name || 'Docente'} · {activity.period_reference || 'Periodo no especificado'}</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">{activity.pedagogical_rating} — {ratingLabels[activity.pedagogical_rating]}</span></div>
        {editingObservation === activity.id ? <div className="mt-3 space-y-2"><textarea value={observationDraft} onChange={event => setObservationDraft(event.target.value)} rows={3} maxLength={5000} className="w-full rounded-xl border p-3 text-sm" aria-label="Editar observación pedagógica"/><div className="flex gap-2"><button type="button" disabled={savingObservation} onClick={() => saveObservation(activity)} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">Guardar cambio</button><button type="button" onClick={() => setEditingObservation(null)} className="rounded-lg border px-3 py-2 text-sm">Cancelar</button></div></div> : <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><p className="whitespace-pre-wrap text-sm text-slate-700">{activity.pedagogical_observations || 'Sin observación registrada.'}</p><button type="button" onClick={() => { setEditingObservation(activity.id); setObservationDraft(activity.pedagogical_observations || ''); }} className="shrink-0 rounded-lg border px-3 py-2 text-sm font-medium text-indigo-700">{activity.pedagogical_observations ? 'Editar observación' : 'Agregar observación'}</button></div>}
      </article>)}
      {!observations.length && <p className="rounded-2xl border bg-white p-6 text-sm text-slate-500">Todavía no hay valoraciones a las que asociar una observación.</p>}
    </section>}

    {activeTab === 'history' && <section className="space-y-4">
      <header><h3 className="text-lg font-bold text-slate-900">Historial de trabajos</h3><p className="text-sm text-slate-600">El análisis automático se presenta separado de la valoración pedagógica manual.</p></header>
      {(record?.comparable_evolution || []).length > 0 && <section className="rounded-2xl border bg-white p-4"><h4 className="font-semibold">Comparación entre periodos disponibles</h4><p className="mt-1 text-xs text-slate-500">Muestra datos observados para el mismo ejercicio; no calcula niveles ni recomendaciones.</p><div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">{record.comparable_evolution.map(comparison => <article key={comparison.exercise_id} className="rounded-xl border p-3"><h5 className="font-medium">{comparison.exercise_name}</h5>{comparison.periods.map(period => <div key={period.period_reference} className="mt-2"><p className="text-sm font-semibold">{period.period_reference}</p>{period.evaluations.map(item => <p key={item.activity_id} className="text-xs text-slate-600">{formatLocalDate(item.date)} · {item.rating}{item.observations ? ` · ${item.observations}` : ''}</p>)}</div>)}</article>)}</div></section>}
      {executions.map(activity => {
        const result = activity.analysis_result;
        const geometric = result?.caracteristicas_geometricas || {};
        const quantitative = result?.indicadores_cuantitativos || {};
        const availableIndicators = indicators.map(([key, label, unit]) => ({ key, label, unit, value: geometric[key] ?? quantitative[key] })).filter(item => item.value !== null && item.value !== undefined && typeof item.value !== 'object');
        const classification = result?.clasificacion || {};
        return <article key={activity.id} className="space-y-4 rounded-2xl border bg-white p-4 sm:p-5">
          <header className="flex flex-wrap items-start justify-between gap-2"><div><h4 className="font-bold text-slate-900">{activity.ejercicio?.nombre}{activity.scheduled_activity?.name ? ` · ${activity.scheduled_activity.name}` : ''}</h4><p className="mt-1 text-xs text-slate-500">Realizado el {formatLocalDate(activity.fecha)}{activity.period_reference ? ` · ${activity.period_reference}` : ''}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">Valoración docente: {activity.pedagogical_rating ? `${activity.pedagogical_rating} — ${ratingLabels[activity.pedagogical_rating]}` : 'Sin evaluar'}</span></header>
          {activity.pedagogical_observations && <div className="rounded-xl bg-indigo-50 p-3"><p className="text-xs font-semibold text-indigo-900">Observación docente</p><p className="mt-1 whitespace-pre-wrap text-sm text-indigo-950">{activity.pedagogical_observations}</p></div>}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.2fr)]">
            <div className="flex min-h-40 items-center justify-center overflow-hidden rounded-xl bg-slate-50 p-2">{imageUrls[activity.id] ? <img src={imageUrls[activity.id]} alt={`Fotografía original: ${activity.ejercicio?.nombre || 'ejercicio'}`} className="max-h-72 w-full object-contain"/> : activity.imagen ? <p className="text-sm text-slate-500">Cargando fotografía…</p> : <p className="text-sm text-slate-400"><ImageIcon className="mr-1 inline h-4 w-4"/>Sin fotografía registrada</p>}</div>
            <div className="space-y-3">
              <div className="rounded-xl border p-3"><div className="flex flex-wrap items-center justify-between gap-2"><h5 className="font-semibold">Análisis automático</h5><span className={`rounded-full px-3 py-1 text-xs font-semibold ${result?.estado === 'procesado' ? 'bg-emerald-50 text-emerald-800' : result?.estado === 'error' ? 'bg-rose-50 text-rose-800' : 'bg-amber-50 text-amber-800'}`}>{result?.estado === 'procesado' ? 'Completado' : result?.estado === 'error' ? 'Error' : 'Pendiente'}</span></div>
                {result && <><dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">{availableIndicators.map(item => <div key={item.key} className="rounded-lg bg-slate-50 p-2"><dt className="text-xs text-slate-600">{item.label}</dt><dd className="font-semibold text-slate-900">{item.value} <span className="text-xs font-normal text-slate-500">{item.unit}</span></dd></div>)}</dl>{!availableIndicators.length && <p className="mt-2 text-sm text-slate-500">El servicio no devolvió indicadores disponibles.</p>}
                  {classification.sugerencia ? <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm"><p className="font-semibold text-amber-900">Sugerencia experimental: {classification.sugerencia}</p><p className="mt-1 text-xs text-amber-900">La valoración final corresponde a la docente.</p></div> : <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">Sugerencia no disponible; el análisis geométrico se conserva.</p>}
                  {result.detalles_computacionales?.imagen_procesada_url && <a className="mt-3 inline-block text-sm text-indigo-700 underline" href={result.detalles_computacionales.imagen_procesada_url} target="_blank" rel="noreferrer">Ver imagen procesada</a>}
                </>}
              </div>
              {activity.evaluation_history?.length > 0 && <details className="rounded-xl border p-3"><summary className="cursor-pointer text-sm font-semibold"><Clock3 className="mr-1 inline h-4 w-4"/>Historial de cambios ({activity.evaluation_history.length})</summary><ul className="mt-2 space-y-2">{activity.evaluation_history.map(item => <li key={item.id} className="border-t pt-2 text-xs text-slate-600">{formatLocalDateTime(item.created_at)} · {item.changed_by?.nombre || 'Docente'} · {item.pedagogical_rating ? `${item.pedagogical_rating} — ${ratingLabels[item.pedagogical_rating]}` : 'Sin valoración'}{item.pedagogical_observations ? ` · ${item.pedagogical_observations}` : ''}</li>)}</ul></details>}
            </div>
          </div>
        </article>;
      })}
      {!executions.length && <p className="rounded-2xl border bg-white p-6 text-sm text-slate-500">Todavía no hay trabajos registrados.</p>}
    </section>}
  </section>;
}
