import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, RefreshCw, Users } from 'lucide-react';
import { formatLocalDate } from '../utils/dateFormat';

const labels = { S: 'Satisfactorio', ED: 'En desarrollo', NA: 'Necesita apoyo' };
const fields = [
  ['longitud_trazo', 'Longitud', 'px'], ['alto', 'Alto', 'px'], ['ancho', 'Ancho', 'px'],
  ['proporcion', 'Relación ancho/alto', 'sin unidad'], ['inclinacion', 'Orientación', 'grados'],
  ['curvatura', 'Variación de dirección', 'rad/px'], ['separacion_componentes', 'Separación', 'px'],
  ['desviacion', 'Desviación', 'sin unidad'], ['rugosidad', 'Variación angular', 'rad'],
  ['continuidad', 'Continuidad', 'índice 0–1'], ['regularidad', 'Regularidad', 'índice 0–1'],
];

export default function StudentReportsView({ students, onOpenStudent }) {
  const [studentId, setStudentId] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!students.length) { setStudentId(''); setReport(null); return; }
    if (!students.some(student => Number(student.id) === Number(studentId))) setStudentId(String(students[0].id));
  }, [students, studentId]);

  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;
    setLoading(true); setError(''); setReport(null);
    axios.get(`/api/v1/students/${studentId}/progress`)
      .then(response => { if (!cancelled) setReport(response.data.data); })
      .catch(requestError => { if (!cancelled) setError(requestError.response?.data?.message || 'No fue posible consultar este informe.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [studentId, retry]);

  const executions = report?.executions || [];
  return <section className="space-y-5">
    <header className="rounded-3xl border bg-white p-5 sm:p-7">
      <div className="flex items-center gap-3"><span className="rounded-2xl bg-indigo-50 p-3 text-indigo-700"><FileText size={22}/></span><div><h2 className="text-xl font-bold text-slate-900">Informes de seguimiento</h2><p className="text-sm text-slate-600">Evolución, historial e indicadores registrados para tus estudiantes.</p></div></div>
      <label className="mt-5 block max-w-xl text-sm font-medium">Estudiante<select value={studentId} onChange={event => setStudentId(event.target.value)} className="mt-1 w-full rounded-xl border p-3"><option value="">Selecciona un estudiante</option>{students.map(student => <option key={student.id} value={student.id}>{student.firstName} {student.lastName} · {student.courseName}</option>)}</select></label>
    </header>

    {error && <div role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{error} <button type="button" onClick={() => setRetry(value => value + 1)} className="ml-2 underline">Volver a intentar</button></div>}
    {loading && <p role="status" className="rounded-2xl border bg-white p-5 text-sm text-slate-600"><RefreshCw className="mr-2 inline h-4 w-4 animate-spin"/>Cargando historial autorizado…</p>}
    {!loading && !error && !students.length && <div className="rounded-2xl border bg-white p-8 text-center text-sm text-slate-600"><Users className="mx-auto mb-2 h-6 w-6"/>No hay estudiantes disponibles en tus cursos.</div>}

    {!loading && report && <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4"><div><h3 className="font-bold text-slate-900">{report.student?.nombre}</h3><p className="text-sm text-slate-600">{report.student?.course?.nombre} · Docente: {report.student?.course?.teacher || 'No asignada'}</p></div><button type="button" onClick={() => onOpenStudent?.(students.find(student => Number(student.id) === Number(studentId)))} className="rounded-xl border px-3 py-2 text-sm font-semibold text-indigo-700">Abrir ficha de seguimiento</button></div>

      <section className="space-y-3"><h3 className="text-lg font-bold text-slate-900">Comparación entre periodos</h3>
        {(report.comparable_evolution || []).length ? <div className="grid gap-3 md:grid-cols-2">{report.comparable_evolution.map(item => <article key={item.exercise_id} className="rounded-2xl border bg-white p-4"><h4 className="font-semibold">{item.exercise_name}</h4>{item.periods.map(period => <div key={period.period_reference} className="mt-3 border-t pt-2"><p className="text-sm font-semibold">{period.period_reference}</p>{period.evaluations.map(evaluation => <p key={evaluation.activity_id} className="mt-1 text-xs text-slate-600">{formatLocalDate(evaluation.date)} · {evaluation.rating} — {labels[evaluation.rating] || 'Valoración registrada'}{evaluation.observations ? ` · ${evaluation.observations}` : ''}</p>)}</div>)}</article>)}</div> : <p className="rounded-2xl border bg-white p-4 text-sm text-slate-600">Aún no hay registros comparables con referencias de periodo.</p>}
      </section>

      <section className="space-y-3"><h3 className="text-lg font-bold text-slate-900">Historial de evaluaciones</h3>
        {executions.length ? executions.map(item => {
          const result = item.analysis_result;
          const geometric = result?.caracteristicas_geometricas || {};
          const quantitative = result?.indicadores_cuantitativos || {};
          const available = fields.map(([key, label, unit]) => ({ key, label, unit, value: geometric[key] ?? quantitative[key] })).filter(metric => metric.value !== null && metric.value !== undefined && typeof metric.value !== 'object');
          return <article key={item.id} className="space-y-3 rounded-2xl border bg-white p-4 sm:p-5"><header className="flex flex-wrap items-start justify-between gap-2"><div><h4 className="font-bold">{item.ejercicio?.nombre}</h4><p className="text-xs text-slate-500">{formatLocalDate(item.fecha)}{item.period_reference ? ` · ${item.period_reference}` : ''}</p></div><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-800">{item.pedagogical_rating ? `${item.pedagogical_rating} — ${labels[item.pedagogical_rating]}` : 'Sin evaluar'}</span></header>
            {item.pedagogical_observations && <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm">{item.pedagogical_observations}</p>}
            <div><p className="text-sm font-semibold">Indicadores geométricos registrados</p>{available.length ? <dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">{available.map(metric => <div key={metric.key} className="rounded-lg bg-slate-50 p-2"><dt className="text-xs text-slate-600">{metric.label}</dt><dd className="text-sm font-semibold">{metric.value} <span className="text-xs font-normal text-slate-500">{metric.unit}</span></dd></div>)}</dl> : <p className="mt-1 text-xs text-slate-500">No hay indicadores disponibles para este registro.</p>}</div>
            {item.evaluation_history?.length > 0 && <details className="rounded-xl border p-3"><summary className="cursor-pointer text-sm font-semibold">Historial de cambios ({item.evaluation_history.length})</summary><ul className="mt-2 space-y-2">{item.evaluation_history.map(change => <li key={change.id} className="border-t pt-2 text-xs text-slate-600">{formatLocalDate(change.created_at)} · {change.changed_by?.nombre || 'Docente'} · {change.pedagogical_rating || 'Sin valoración'}{change.pedagogical_observations ? ` · ${change.pedagogical_observations}` : ''}</li>)}</ul></details>}
          </article>;
        }) : <p className="rounded-2xl border bg-white p-5 text-sm text-slate-600">No hay evaluaciones registradas para este estudiante.</p>}
      </section>
    </>}
  </section>;
}
