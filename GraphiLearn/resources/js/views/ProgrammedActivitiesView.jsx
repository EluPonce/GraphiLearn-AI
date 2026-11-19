import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Plus, Power, Pencil, ArrowDown, ArrowUp, X } from 'lucide-react';
import { formatLocalDate } from '../utils/dateFormat';

export default function ProgrammedActivitiesView({ user }) {
  const isAdmin = user?.rol === 'administrador';
  const [items, setItems] = useState([]);
  const [courses, setCourses] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [form, setForm] = useState({ course_id: '', exercise_ids: [], name: '', instructions: '', scheduled_for: '' });
  const [exerciseToAdd, setExerciseToAdd] = useState('');
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const load = async () => {
    const [activities, courseList, exerciseList] = await Promise.all([
      axios.get('/api/v1/actividades-programadas'), axios.get('/api/v1/cursos'), axios.get('/api/v1/exercises?per_page=50'),
    ]);
    setItems(activities.data.data || []);
    setCourses(courseList.data.data || []);
    setExercises((exerciseList.data.data || []).filter(x => x.activo));
  };
  useEffect(() => { load().catch(() => setMessage('No fue posible cargar actividades programadas.')); }, []);

  const create = async (event) => {
    event.preventDefault();
    try {
      if (!form.exercise_ids.length) { setMessage('Agregue al menos un ejercicio.'); return; }
      const payload = { ...form, course_id: Number(form.course_id), exercise_ids: form.exercise_ids.map(Number), scheduled_for: form.scheduled_for || null };
      if (editingId) await axios.put(`/api/v1/actividades-programadas/${editingId}`, payload);
      else await axios.post('/api/v1/actividades-programadas', payload);
      setEditingId(null);
      setForm({ course_id: '', exercise_ids: [], name: '', instructions: '', scheduled_for: '' });
      setExerciseToAdd('');
      setMessage('Actividad programada guardada.');
      await load();
    } catch (error) { setMessage(error.response?.data?.message || 'No fue posible guardar la programación.'); }
  };

  const toggleActive = async (item) => {
    try { await axios.patch(`/api/v1/actividades-programadas/${item.id}`, { active: !item.active }); await load(); }
    catch (error) { setMessage(error.response?.data?.message || 'No fue posible cambiar el estado de la evaluación programada.'); }
  };

  const addExercise = () => {
    const id = Number(exerciseToAdd);
    if (!id || form.exercise_ids.includes(id)) return;
    setForm(previous => ({ ...previous, exercise_ids: [...previous.exercise_ids, id] }));
    setExerciseToAdd('');
  };
  const removeExercise = (exerciseId) => setForm(previous => ({ ...previous, exercise_ids: previous.exercise_ids.filter(id => id !== exerciseId) }));
  const moveExercise = (index, delta) => setForm(previous => {
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= previous.exercise_ids.length) return previous;
    const exercise_ids = [...previous.exercise_ids];
    [exercise_ids[index], exercise_ids[nextIndex]] = [exercise_ids[nextIndex], exercise_ids[index]];
    return { ...previous, exercise_ids };
  });

  return <section className="space-y-5">
    <header><h2 className="text-xl font-bold text-slate-800">Evaluaciones programadas</h2><p className="text-sm text-slate-600">Define por curso los ejercicios que la docente realizará y registrará individualmente.</p></header>
    {message && <p role="status" className="rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800">{message}</p>}
    {isAdmin && <form onSubmit={create} className="grid grid-cols-1 gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-2 lg:grid-cols-3">
      <input required maxLength="150" placeholder="Nombre de la actividad" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="rounded-xl border p-3" />
      <select required value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })} className="rounded-xl border p-3"><option value="">Curso</option>{courses.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select>
      <input type="date" value={form.scheduled_for} onChange={e => setForm({ ...form, scheduled_for: e.target.value })} className="rounded-xl border p-3" />
      <input placeholder="Instrucciones (opcional)" value={form.instructions} onChange={e => setForm({ ...form, instructions: e.target.value })} className="rounded-xl border p-3 sm:col-span-2" />
      <fieldset className="space-y-3 rounded-xl border p-3 sm:col-span-2 lg:col-span-3">
        <legend className="px-1 text-sm font-semibold">Ejercicios y orden</legend>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select value={exerciseToAdd} onChange={e => setExerciseToAdd(e.target.value)} className="min-w-0 flex-1 rounded-xl border p-3"><option value="">Seleccionar ejercicio</option>{exercises.filter(x => !form.exercise_ids.includes(Number(x.id))).map(x => <option key={x.id} value={x.id}>{x.nombre}</option>)}</select>
          <button type="button" onClick={addExercise} disabled={!exerciseToAdd} className="rounded-xl border px-4 py-2 font-medium disabled:opacity-50"><Plus size={16} className="mr-1 inline"/>Agregar</button>
        </div>
        <ol className="space-y-2">{form.exercise_ids.map((id, index) => {
          const exercise = exercises.find(item => Number(item.id) === Number(id));
          return <li key={id} className="flex items-center gap-2 rounded-lg bg-slate-50 p-2"><span className="w-7 text-center text-xs font-bold text-slate-500">{index + 1}.</span><span className="min-w-0 flex-1 text-sm">{exercise?.nombre || `Ejercicio ${id}`}</span><button type="button" aria-label={`Mover ${exercise?.nombre || 'ejercicio'} arriba`} onClick={() => moveExercise(index, -1)} disabled={index === 0} className="rounded p-2 text-slate-600 disabled:opacity-30"><ArrowUp size={16}/></button><button type="button" aria-label={`Mover ${exercise?.nombre || 'ejercicio'} abajo`} onClick={() => moveExercise(index, 1)} disabled={index === form.exercise_ids.length - 1} className="rounded p-2 text-slate-600 disabled:opacity-30"><ArrowDown size={16}/></button><button type="button" aria-label={`Quitar ${exercise?.nombre || 'ejercicio'}`} onClick={() => removeExercise(id)} className="rounded p-2 text-rose-600"><X size={16}/></button></li>;
        })}</ol>
      </fieldset>
      <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 p-3 font-semibold text-white"><Plus size={16}/>{editingId ? 'Guardar cambios' : 'Crear programación'}</button>
    </form>}
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {items.map(item => <article key={item.id} className={`flex items-start justify-between gap-3 rounded-2xl border bg-white p-4 ${item.active === false ? 'opacity-70' : ''}`}>
        <div><h3 className="font-semibold">{item.name}</h3><p className="text-sm text-slate-600">{item.course?.nombre}</p><ol className="mt-2 list-inside list-decimal text-sm text-slate-700">{(item.exercises || (item.exercise ? [item.exercise] : [])).map(exercise => <li key={exercise.id}>{exercise.nombre}</li>)}</ol>{item.scheduled_for && <p className="mt-2 flex items-center gap-2 text-xs text-slate-500"><Calendar size={14}/>{formatLocalDate(item.scheduled_for)}</p>}<span className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${item.active === false ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-800'}`}>{item.active === false ? 'Inactiva' : 'Activa'}</span></div>
        {isAdmin && <div className="flex"><button aria-label="Editar evaluación programada" onClick={() => { const ordered = [...(item.exercises || (item.exercise ? [item.exercise] : []))].sort((a,b) => (a.pivot?.position || 0) - (b.pivot?.position || 0)); setEditingId(item.id); setForm({ course_id: String(item.course_id), exercise_ids: ordered.map(exercise => Number(exercise.id)), name: item.name, instructions: item.instructions || '', scheduled_for: item.scheduled_for || '' }); }} className="rounded-lg p-2 text-indigo-700 hover:bg-indigo-50"><Pencil size={17}/></button><button aria-label={item.active === false ? 'Activar evaluación programada' : 'Desactivar evaluación programada'} onClick={() => toggleActive(item)} className={`rounded-lg p-2 ${item.active === false ? 'text-emerald-700 hover:bg-emerald-50' : 'text-rose-700 hover:bg-rose-50'}`}><Power size={17}/></button></div>}
      </article>)}
      {!items.length && <p className="rounded-2xl border bg-white p-6 text-sm text-slate-500">No hay actividades programadas disponibles.</p>}
    </div>
  </section>;
}
