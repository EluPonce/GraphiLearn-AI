import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Power, Pencil } from 'lucide-react';

export default function TeachersView() {
  const [teachers, setTeachers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: '', correo: '', password: '' });
  const [message, setMessage] = useState('');
  const load = async () => { const response = await axios.get('/api/v1/docentes'); setTeachers(response.data.data || []); };
  useEffect(() => { load().catch(() => setMessage('No fue posible cargar docentes.')); }, []);
  const save = async event => {
    event.preventDefault(); setMessage('');
    try {
      if (editing) {
        const payload = { nombre: form.nombre, correo: form.correo, ...(form.password ? { password: form.password } : {}) };
        await axios.put(`/api/v1/docentes/${editing.id}`, payload);
      } else await axios.post('/api/v1/docentes', form);
      setEditing(null); setForm({ nombre: '', correo: '', password: '' }); await load();
    } catch (error) { setMessage(error.response?.data?.message || 'No fue posible guardar la cuenta docente.'); }
  };
  const toggle = async teacher => {
    try { await axios.patch(`/api/v1/docentes/${teacher.id}`, { active: !teacher.active }); await load(); }
    catch (error) { setMessage(error.response?.data?.message || 'No fue posible cambiar el estado.'); }
  };
  return <section className="space-y-5">
    <header><h2 className="text-xl font-bold text-slate-800">Gestión de docentes</h2><p className="text-sm text-slate-600">Cuentas docentes de la institución y asignación posterior desde Cursos.</p></header>
    {message && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{message}</p>}
    <form onSubmit={save} className="grid grid-cols-1 gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
      <input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre completo" className="rounded-xl border p-3" />
      <input required type="email" value={form.correo} onChange={e => setForm({ ...form, correo: e.target.value })} placeholder="Correo" className="rounded-xl border p-3" />
      {!editing && <input required minLength="8" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Contraseña inicial" className="rounded-xl border p-3" />}
      {editing && <input minLength="8" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Nueva contraseña (opcional)" className="rounded-xl border p-3" />}
      <button className="rounded-xl bg-indigo-600 p-3 font-semibold text-white"><Plus size={16} className="mr-1 inline"/>{editing ? 'Guardar' : 'Crear docente'}</button>
    </form>
    <div className="overflow-x-auto rounded-2xl border bg-white"><table className="w-full text-left text-sm"><thead><tr className="border-b bg-slate-50"><th className="p-3">Docente</th><th className="p-3">Correo</th><th className="p-3">Estado</th><th className="p-3">Acciones</th></tr></thead><tbody>
      {teachers.map(teacher => <tr key={teacher.id} className="border-b last:border-0"><td className="p-3">{teacher.nombre}</td><td className="p-3">{teacher.correo}</td><td className="p-3">{teacher.active ? 'Activo' : 'Desactivado'}</td><td className="flex gap-2 p-3"><button aria-label="Editar docente" onClick={() => { setEditing(teacher); setForm({ nombre: teacher.nombre, correo: teacher.correo, password: '' }); }} className="rounded-lg p-2 text-indigo-700 hover:bg-indigo-50"><Pencil size={16}/></button><button aria-label={teacher.active ? 'Desactivar docente' : 'Activar docente'} onClick={() => toggle(teacher)} className="rounded-lg p-2 text-rose-700 hover:bg-rose-50"><Power size={16}/></button></td></tr>)}
      {!teachers.length && <tr><td colSpan="4" className="p-6 text-center text-slate-500">Sin docentes registrados.</td></tr>}
    </tbody></table></div>
  </section>;
}
