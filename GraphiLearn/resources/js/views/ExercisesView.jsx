import React, { useState } from 'react';
import axios from 'axios';
import {
  Compass,
  Plus,
  Edit,
  Power,
  CheckCircle2,
  AlertCircle,
  Shapes
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

export default function ExercisesView({ exercises, setExercises, isAdmin = false }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    patternType: 'Círculos',
    description: '',
    status: 'Activo'
  });

  const patternTypes = ['Líneas', 'Círculos', 'Espirales', 'Zigzag'];

  const openCreateModal = () => {
    setEditingExercise(null);
    setFormData({
      name: '',
      patternType: 'Círculos',
      description: '',
      status: 'Activo'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (exercise) => {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name,
      patternType: exercise.patternType,
      description: exercise.description,
      status: exercise.status
    });
    setIsModalOpen(true);
  };

  const toggleStatus = async (exercise) => {
    const newStatus = exercise.status === 'Activo' ? 'Inactivo' : 'Activo';
    try {
      await axios.patch(`/api/v1/exercises/${exercise.id}`, { activo: newStatus === 'Activo' });
      setExercises(prev => prev.map(e => e.id === exercise.id ? { ...e, status: newStatus } : e));
      showFeedback(`Estado del ejercicio cambiado a ${newStatus}.`, 'success');
    } catch (error) { showFeedback(error.response?.data?.message || 'No fue posible cambiar el estado.', 'error'); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) {
      showFeedback('Por favor complete todos los campos requeridos.', 'error');
      return;
    }

    const codes = { 'Líneas': 'linea', 'Círculos': 'circulo', 'Espirales': 'espiral', Zigzag: 'zigzag' };
    const payload = { nombre: formData.name.trim(), tipo_trazo: codes[formData.patternType], descripcion: formData.description.trim() };
    const save = async () => {
      try {
        if (editingExercise) await axios.put(`/api/v1/exercises/${editingExercise.id}`, payload);
        else await axios.post('/api/v1/exercises', payload);
        const response = await axios.get('/api/v1/exercises?per_page=50');
        const labels = { linea: 'Líneas', circulo: 'Círculos', espiral: 'Espirales', zigzag: 'Zigzag' };
        setExercises((response.data.data || []).map(x => ({ id: x.id, name: x.nombre, patternType: labels[x.tipo_trazo], description: x.descripcion || '', status: x.activo ? 'Activo' : 'Inactivo' })));
        setIsModalOpen(false);
        showFeedback('Catálogo guardado.', 'success');
      } catch (error) { showFeedback(error.response?.data?.message || 'No fue posible guardar el ejercicio.', 'error'); }
    };
    save();
  };

  const showFeedback = (message, type) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Ejercicios Grafomotores</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Catálogo pedagógico de patrones de trazo base para la evaluación de motricidad fina
          </p>
        </div>
        {isAdmin && <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-100 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nuevo ejercicio</span>
        </button>}
      </div>

      {/* Feedback Banner */}
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

      {/* Exercises Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-slate-600 border-b border-slate-100 bg-slate-50/70">
              <tr>
                <th className="py-3.5 px-6 font-bold">Ejercicio</th>
                <th className="py-3.5 px-6 font-bold">Tipo de Trazo</th>
                <th className="py-3.5 px-6 font-bold">Descripción Pedagógica</th>
                <th className="py-3.5 px-6 font-bold">Estado</th>
                <th className="py-3.5 px-6 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exercises.map((exercise) => (
                <tr key={exercise.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-xs">
                        <Shapes className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{exercise.name}</p>
                        <p className="text-xs text-slate-600 font-mono">Patrón #{exercise.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                      {exercise.patternType}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-600 text-xs max-w-xs leading-relaxed">
                    {exercise.description}
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={exercise.status} />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                        {isAdmin && <button
                        onClick={() => openEditModal(exercise)}
                        title="Editar ejercicio"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        </button>}
                        {isAdmin && <button
                        onClick={() => toggleStatus(exercise)}
                        title={exercise.status === 'Activo' ? 'Desactivar ejercicio' : 'Activar ejercicio'}
                        className={`p-2 rounded-xl border transition-colors ${
                          exercise.status === 'Activo'
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        <Power className="w-4 h-4" />
                        </button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear / Editar Ejercicio */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExercise ? 'Editar Ejercicio Grafomotor' : 'Nuevo Ejercicio Grafomotor'}
        subtitle="Defina las pautas del trazo a evaluar en la ficha de trabajo"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Nombre del Ejercicio
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej. Trazo de Línea Recta Horizontal"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Tipo de Trazo
            </label>
            <select
              value={formData.patternType}
              onChange={(e) => setFormData({ ...formData, patternType: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            >
              {patternTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Descripción Pedagógica
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describa la instrucción del ejercicio en la hoja física..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Estado
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-100 transition-all"
            >
              {editingExercise ? 'Actualizar ejercicio' : 'Registrar ejercicio'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
