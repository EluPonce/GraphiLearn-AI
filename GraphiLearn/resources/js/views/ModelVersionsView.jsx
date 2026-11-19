import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Power, Plus } from 'lucide-react';

export default function ModelVersionsView() {
  const [versions, setVersions] = useState([]);
  const [form, setForm] = useState({ name: '', version: '', algorithm: 'RandomForest', description: '', file_path: '' });
  const [message, setMessage] = useState('');
  const load = async () => { const response = await axios.get('/api/v1/model-versions'); setVersions(response.data.data || []); };
  useEffect(() => { load().catch(() => setMessage('No fue posible cargar versiones.')); }, []);
  const create = async event => {
    event.preventDefault();
    try { await axios.post('/api/v1/model-versions', form); setForm({ name: '', version: '', algorithm: 'RandomForest', description: '', file_path: '' }); await load(); setMessage('Versión registrada.'); }
    catch (error) { setMessage(error.response?.data?.message || 'No fue posible registrar la versión.'); }
  };
  const toggle = async model => {
    try { await axios.post(`/api/v1/model-versions/${model.id}/${model.active ? 'deactivate' : 'activate'}`); await load(); }
    catch (error) { setMessage(error.response?.data?.message || 'No fue posible cambiar el estado del modelo.'); }
  };
  return <section className="space-y-5">
    <header><h2 className="text-xl font-bold text-slate-800">Versiones de modelos de IA</h2><p className="text-sm text-slate-600">Registro y activación de versiones existentes; esta pantalla no modifica el pipeline ni reentrena modelos.</p></header>
    {message && <p role="status" className="rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800">{message}</p>}
    <form onSubmit={create} className="grid grid-cols-1 gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-2">
      <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nombre" className="rounded-xl border p-3" />
      <input required value={form.version} onChange={e => setForm({ ...form, version: e.target.value })} placeholder="Versión" className="rounded-xl border p-3" />
      <input value={form.algorithm} onChange={e => setForm({ ...form, algorithm: e.target.value })} placeholder="Algoritmo" className="rounded-xl border p-3" />
      <input required value={form.file_path} onChange={e => setForm({ ...form, file_path: e.target.value })} placeholder="Ruta relativa del artefacto" className="rounded-xl border p-3" />
      <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descripción" className="rounded-xl border p-3 sm:col-span-2" />
      <button className="rounded-xl bg-indigo-600 p-3 font-semibold text-white sm:col-span-2"><Plus size={16} className="mr-1 inline"/>Registrar versión</button>
    </form>
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{versions.map(model => <article key={model.id} className="flex items-center justify-between gap-3 rounded-2xl border bg-white p-4"><div><h3 className="font-semibold">{model.name} · {model.version}</h3><p className="text-sm text-slate-600">{model.algorithm} · {model.file_path}</p><p className="text-xs">{model.active ? 'Activa' : 'Inactiva'}</p></div><button aria-label={model.active ? 'Desactivar modelo' : 'Activar modelo'} onClick={() => toggle(model)} className="rounded-lg p-2 text-indigo-700 hover:bg-indigo-50"><Power size={17}/></button></article>)}</div>
  </section>;
}
