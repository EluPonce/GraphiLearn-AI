import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, ArrowLeft, ArrowRight, AlertCircle, Calendar, Camera } from 'lucide-react';

export default function NewActivityView({ students, exercises, setActivities, setCurrentView, setSelectedActivity, initialContext, onCancel }) {
  const activeStudents = students.filter(student => student.status === 'Activo');
  const activeExercises = exercises.filter(exercise => exercise.status === 'Activo');
  const [programs, setPrograms] = useState([]);
  const [programId, setProgramId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [exerciseId, setExerciseId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!!initialContext);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    axios.get('/api/v1/actividades-programadas')
      .then(({ data }) => {
        if (cancelled) return;
        const active = (data.data || []).filter(program => program.active);
        setPrograms(active);
        setProgramId(active[0] ? String(active[0].id) : '');
      })
      .catch(() => { if (!cancelled) setError('No fue posible cargar las evaluaciones programadas.'); });
    return () => { cancelled = true; };
  }, []);

  const selectedProgram = programs.find(program => Number(program.id) === Number(programId));
  const studentOptions = selectedProgram
    ? activeStudents.filter(student => Number(student.courseId) === Number(selectedProgram.course_id))
    : [];
  const programExerciseIds = selectedProgram?.exercises?.length
    ? selectedProgram.exercises.map(exercise => Number(exercise.id))
    : selectedProgram ? [Number(selectedProgram.exercise_id)] : [];
  const exerciseOptions = activeExercises.filter(exercise => programExerciseIds.includes(Number(exercise.id)));

  const buildActivity = (saved, context) => ({
    id: saved.id,
    studentId: saved.id_estudiante,
    studentName: saved.estudiante?.nombre || context.student.nombre,
    exerciseId: saved.id_ejercicio,
    exerciseName: saved.ejercicio?.nombre || context.exercise.nombre || context.exercise.name,
    patternType: saved.ejercicio?.tipo_trazo || context.exercise.tipo_trazo || context.exercise.patternType,
    date: saved.fecha,
    status: saved.estado === 'procesado' ? 'Análisis completado' : saved.imagen ? 'Fotografía cargada' : 'Pendiente de fotografía',
    estado: saved.estado,
    imageId: saved.imagen?.id || null,
    imageMetadata: saved.imagen || null,
    analysisResult: saved.analysis_result || null,
    pedagogical_rating: saved.pedagogical_rating || null,
    pedagogical_observations: saved.pedagogical_observations || '',
    period_reference: saved.period_reference || context.program.period_reference || '',
    scheduledActivityId: saved.scheduled_activity_id || context.program.id,
    returnView: context.returnView || 'activities',
  });

  const openActivity = (saved, context) => {
    const activity = buildActivity(saved, context);
    setActivities(previous => [activity, ...previous.filter(item => item.id !== activity.id)]);
    setSelectedActivity(activity);
    setCurrentView('activity-detail');
  };

  useEffect(() => {
    if (!initialContext?.student || !initialContext?.program || !initialContext?.exercise) return;
    let cancelled = false;
    const context = { ...initialContext, returnView: 'student-profile' };
    const begin = async () => {
      setLoading(true);
      setError('');
      try {
        if (context.execution?.id) {
          if (!cancelled) openActivity(context.execution, context);
          return;
        }
        const payload = {
          id_estudiante: Number(context.student.id),
          id_ejercicio: Number(context.exercise.id),
          scheduled_activity_id: Number(context.program.id),
          fecha: date,
        };
        let response;
        try {
          response = await axios.post('/api/v1/actividades', payload);
        } catch (requestError) {
          if (requestError.response?.status !== 409) throw requestError;
          const list = await axios.get(`/api/v1/actividades?per_page=50&id_estudiante=${context.student.id}`);
          const existing = (list.data.data || []).find(item => Number(item.scheduled_activity_id) === Number(context.program.id) && Number(item.id_ejercicio) === Number(context.exercise.id));
          if (!existing) throw requestError;
          response = { data: { data: existing } };
        }
        if (!cancelled) openActivity(response.data.data, context);
      } catch (requestError) {
        if (!cancelled) setError(requestError.response?.data?.message || 'No fue posible abrir este ejercicio.');
      } finally { if (!cancelled) setLoading(false); }
    };
    begin();
    return () => { cancelled = true; };
  // Context is a deliberate one-shot navigation payload supplied by the ficha.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialContext?.program?.id, initialContext?.exercise?.id, initialContext?.student?.id]);

  useEffect(() => {
    if (selectedProgram && !studentId && studentOptions[0]) setStudentId(String(studentOptions[0].id));
    const ids = selectedProgram?.exercises?.length ? selectedProgram.exercises.map(item => Number(item.id)) : selectedProgram ? [Number(selectedProgram.exercise_id)] : [];
    if (ids.length && (!exerciseId || !ids.includes(Number(exerciseId)))) setExerciseId(String(ids[0]));
  }, [selectedProgram?.id, studentOptions.length, exerciseOptions.length]);

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    const program = selectedProgram;
    const student = studentOptions.find(item => Number(item.id) === Number(studentId));
    const exercise = exerciseOptions.find(item => Number(item.id) === Number(exerciseId));
    if (!program || !student || !exercise || !date) {
      setError('Seleccione una evaluación, estudiante, ejercicio y fecha.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await axios.post('/api/v1/actividades', {
        id_estudiante: Number(student.id), id_ejercicio: Number(exercise.id),
        scheduled_activity_id: Number(program.id), fecha: date,
      });
      openActivity(response.data.data, { student: { id: student.id, nombre: `${student.firstName} ${student.lastName}`.trim() }, program, exercise, returnView: 'activities' });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No fue posible registrar el trabajo.');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div role="status" className="mx-auto max-w-xl rounded-2xl border bg-white p-6 text-center text-sm text-slate-600">Preparando el ejercicio…</div>;

  return <div className="mx-auto max-w-2xl space-y-5">
    <button type="button" onClick={() => { onCancel?.(); setCurrentView(initialContext ? 'student-profile' : 'activities'); }} className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700"><ArrowLeft size={16}/> Volver</button>
    <section className="rounded-3xl border bg-white p-5 sm:p-7">
      <div className="mb-5 flex items-center gap-3 border-b pb-4"><span className="rounded-2xl bg-indigo-50 p-3 text-indigo-700"><Activity size={22}/></span><div><h2 className="text-xl font-bold text-slate-900">Registrar trabajo del estudiante</h2><p className="text-sm text-slate-600">Selecciona un ejercicio programado para continuar con la fotografía.</p></div></div>
      {error && <p role="alert" className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800"><AlertCircle className="mr-1 inline h-4 w-4"/>{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium">Evaluación programada<select required value={programId} onChange={event => { setProgramId(event.target.value); setStudentId(''); setExerciseId(''); }} className="mt-1 w-full rounded-xl border p-3"><option value="">Seleccionar</option>{programs.map(program => <option key={program.id} value={program.id}>{program.name} · {program.course?.nombre}</option>)}</select></label>
        <label className="block text-sm font-medium">Estudiante<select required value={studentId} onChange={event => setStudentId(event.target.value)} className="mt-1 w-full rounded-xl border p-3"><option value="">Seleccionar</option>{studentOptions.map(item => <option key={item.id} value={item.id}>{item.firstName} {item.lastName}</option>)}</select></label>
        <label className="block text-sm font-medium">Ejercicio<select required value={exerciseId} onChange={event => setExerciseId(event.target.value)} className="mt-1 w-full rounded-xl border p-3"><option value="">Seleccionar</option>{exerciseOptions.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="block text-sm font-medium">Fecha de realización<span className="relative mt-1 block"><Calendar className="absolute left-3 top-3.5 h-4 w-4 text-slate-400"/><input required type="date" max={new Date().toISOString().slice(0,10)} value={date} onChange={event => setDate(event.target.value)} className="w-full rounded-xl border p-3 pl-10"/></span></label>
        <button type="submit" disabled={submitting || !programs.length} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 p-3 font-semibold text-white disabled:opacity-50">{submitting ? 'Abriendo…' : 'Continuar a la fotografía'}<Camera size={17}/><ArrowRight size={17}/></button>
      </form>
      {!programs.length && <p className="mt-3 text-sm text-amber-800">No hay evaluaciones activas para tus cursos.</p>}
    </section>
  </div>;
}
