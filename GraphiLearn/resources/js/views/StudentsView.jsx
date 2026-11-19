import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  Users,
  Search,
  Plus,
  Edit,
  UserX,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  GraduationCap,
  FileSpreadsheet,
  UploadCloud,
  FileText
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { formatLocalDate } from '../utils/dateFormat';

export default function StudentsView({ students, setStudents, isAdmin = false, onOpenStudent }) {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [selectedAdminStudent, setSelectedAdminStudent] = useState(null);
  const [selectedAdminCourse, setSelectedAdminCourse] = useState(null);

  // Excel Upload State
  const [excelCourse, setExcelCourse] = useState('Kinder A (Nivel Inicial)');
  const [excelFile, setExcelFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    axios.get('/api/v1/cursos').then(response => setCourses(response.data.data || [])).catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    if (!isAdmin || !selectedAdminStudent?.courseId) { setSelectedAdminCourse(null); return; }
    let cancelled = false;
    axios.get(`/api/v1/cursos/${selectedAdminStudent.courseId}`)
      .then(response => { if (!cancelled) setSelectedAdminCourse(response.data.data); })
      .catch(() => { if (!cancelled) setSelectedAdminCourse(null); });
    return () => { cancelled = true; };
  }, [isAdmin, selectedAdminStudent?.courseId]);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    courseName: '', courseId: '',
    birthDate: '',
    status: 'Activo'
  });

  const filteredStudents = students.filter(s =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.courseName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingStudent(null);
    setFormData({
      firstName: '',
      lastName: '',
      courseName: '', courseId: courses[0]?.id || '',
      birthDate: '2020-05-15',
      status: 'Activo'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      courseName: student.courseName || 'Kinder A (Nivel Inicial)',
      courseId: student.courseId || '',
      birthDate: student.birthDate,
      status: student.status
    });
    setIsModalOpen(true);
  };

  const toggleStudentStatus = async (student) => {
    try {
      if (student.status === 'Inactivo') await axios.patch(`/api/v1/students/${student.id}/restore`);
      else await axios.delete(`/api/v1/students/${student.id}`);
      const suffix = isAdmin ? '&include_inactive=1' : '';
      const response = await axios.get(`/api/v1/students?per_page=50${suffix}`);
      setStudents((response.data.data || []).map(s => ({ id: s.id, firstName: s.nombre, lastName: '', birthDate: s.fecha_nacimiento, courseName: s.curso?.nombre || '', courseId: s.id_curso, status: s.administrative_status || 'Activo' })));
      showFeedback(student.status === 'Inactivo' ? 'Inscripción reactivada.' : 'Inscripción desactivada.', 'success');
    } catch (error) { showFeedback(error.response?.data?.message || 'No fue posible cambiar el estado administrativo.', 'error'); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.birthDate) {
      showFeedback('Por favor complete todos los campos requeridos.', 'error');
      return;
    }

    const save = async () => {
      try {
        const payload = { nombre: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(), fecha_nacimiento: formData.birthDate, id_curso: Number(formData.courseId) };
        if (editingStudent) await axios.put(`/api/v1/students/${editingStudent.id}`, payload);
        else await axios.post('/api/v1/students', payload);
        const response = await axios.get(`/api/v1/students?per_page=50${isAdmin ? '&include_inactive=1' : ''}`);
        setStudents((response.data.data || []).map(s => ({ id: s.id, firstName: s.nombre, lastName: '', birthDate: s.fecha_nacimiento, courseName: s.curso?.nombre || '', courseId: s.id_curso, status: s.administrative_status || 'Activo' })));
        setIsModalOpen(false);
        showFeedback(editingStudent ? 'Estudiante actualizado.' : 'Estudiante inscrito.', 'success');
      } catch (error) { showFeedback(error.response?.data?.message || 'No fue posible guardar el estudiante.', 'error'); }
    };
    save();
  };

  const handleExcelSubmit = (e) => {
    e.preventDefault();
    if (!excelFile) {
      showFeedback('Por favor seleccione un archivo Excel (.xlsx) o CSV.', 'error');
      return;
    }

    setIsImporting(true);
    setTimeout(() => {
      // Simulación de importación masiva de curso
      const importedStudents = [
        { id: Date.now() + 1, firstName: 'Santiago', lastName: 'Flores Condori', courseName: excelCourse, birthDate: '2020-08-14', status: 'Activo' },
        { id: Date.now() + 2, firstName: 'Micaela', lastName: 'Ortiz Salvatierra', courseName: excelCourse, birthDate: '2020-04-03', status: 'Activo' },
        { id: Date.now() + 3, firstName: 'Gabriel', lastName: 'Navarro Rios', courseName: excelCourse, birthDate: '2020-10-19', status: 'Activo' },
      ];

      setStudents(prev => [...importedStudents, ...prev]);
      setIsImporting(false);
      setIsExcelModalOpen(false);
      setExcelFile(null);
      showFeedback(`Se importaron exitosamente ${importedStudents.length} estudiantes al curso ${excelCourse}.`, 'success');
    }, 800);
  };

  const showFeedback = (message, type) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Gestión de Estudiantes</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Registro, nómina e inscripción de niños de nivel inicial asignados a cada curso
          </p>
        </div>
        {isAdmin && <div className="flex items-center gap-2.5">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-100 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nuevo estudiante</span>
          </button>
        </div>}
      </div>

      {isAdmin && selectedAdminStudent && <section className="space-y-4 rounded-3xl border border-indigo-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-indigo-700">Ficha administrativa</p><h3 className="mt-1 text-lg font-bold text-slate-900">{selectedAdminStudent.firstName} {selectedAdminStudent.lastName}</h3></div><button type="button" onClick={() => setSelectedAdminStudent(null)} className="rounded-lg border px-3 py-2 text-sm">Cerrar ficha</button></div>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-3"><dt className="text-xs text-slate-500">Fecha de nacimiento</dt><dd className="mt-1 text-sm font-semibold">{formatLocalDate(selectedAdminStudent.birthDate)}</dd></div><div className="rounded-xl bg-slate-50 p-3"><dt className="text-xs text-slate-500">Curso asignado</dt><dd className="mt-1 text-sm font-semibold">{selectedAdminCourse?.nombre || selectedAdminStudent.courseName}</dd></div><div className="rounded-xl bg-slate-50 p-3"><dt className="text-xs text-slate-500">Docente responsable</dt><dd className="mt-1 text-sm font-semibold">{selectedAdminCourse?.docente?.nombre || 'Sin docente asignada'}</dd></div><div className="rounded-xl bg-slate-50 p-3"><dt className="text-xs text-slate-500">Estado de inscripción</dt><dd className="mt-1 text-sm font-semibold">{selectedAdminStudent.status}</dd></div></dl>
        <div className="grid gap-3 md:grid-cols-2"><div className="rounded-xl border border-dashed p-4"><h4 className="font-semibold text-slate-800">Seguimiento pedagógico</h4><p className="mt-1 text-sm text-slate-600">Espacio reservado. La consulta de información pedagógica individual requiere autorización institucional pendiente.</p></div><div className="rounded-xl border border-dashed p-4"><h4 className="font-semibold text-slate-800">Historial de evaluaciones</h4><p className="mt-1 text-sm text-slate-600">No se muestran valoraciones, observaciones ni fotografías en este panel administrativo.</p></div></div>
      </section>}

      {/* Feedback Alert */}
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

      {/* Filter / Search Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, apellido o curso..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>
        <div className="text-xs text-slate-600 font-medium">
          Mostrando <strong className="text-slate-800">{filteredStudents.length}</strong> alumnos
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-slate-600 border-b border-slate-100 bg-slate-50/70">
              <tr>
                <th className="py-3.5 px-6 font-bold">Estudiante</th>
                <th className="py-3.5 px-6 font-bold">Curso Asignado</th>
                <th className="py-3.5 px-6 font-bold">Fecha de Nacimiento</th>
                <th className="py-3.5 px-6 font-bold">Estado administrativo</th>
                <th className="py-3.5 px-6 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-600 font-medium">
                    No se encontraron estudiantes registrados con el término ingresado.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                        </div>
                        <div>
                          {!isAdmin && onOpenStudent ? <button type="button" onClick={() => onOpenStudent(student)} className="text-left font-bold text-indigo-700 hover:underline">{student.firstName} {student.lastName}</button> : <p className="font-bold text-slate-800">{student.firstName} {student.lastName}</p>}
                          <p className="text-xs text-slate-600 font-mono">ID #{student.id.toString().slice(-4)}</p>
                          {isAdmin && <button type="button" onClick={() => setSelectedAdminStudent(student)} className="mt-1 text-xs font-semibold text-indigo-700 hover:underline">Abrir ficha administrativa</button>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-700 text-xs">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{student.courseName || 'Kinder A (Nivel Inicial)'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-700 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatLocalDate(student.birthDate)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={student.status} />
                    </td>
                    {isAdmin && <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(student)}
                          title="Editar estudiante"
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStudentStatus(student)}
                          title={student.status === 'Activo' ? 'Desactivar estudiante' : 'Activar estudiante'}
                          className={`p-2 rounded-xl border transition-colors ${
                            student.status === 'Activo'
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {student.status === 'Activo' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear / Editar Estudiante */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Editar Estudiante' : 'Registrar Nuevo Estudiante'}
        subtitle="Complete la ficha del alumno de nivel inicial"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Nombre
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="Ej. María"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Apellido
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Ej. López"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Curso Asignado
            </label>
            <select
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            >
              <option value="">Seleccione un curso</option>
              {courses.map(course => <option key={course.id} value={course.id}>{course.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-mono"
              required
            />
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
              {editingStudent ? 'Actualizar estudiante' : 'Registrar estudiante'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Importar Excel / CSV */}
      <Modal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        title="Importar Lista de Curso (Excel / CSV)"
        subtitle="Inscriba a la nómina completa de un curso desde un archivo de hoja de cálculo"
      >
        <form onSubmit={handleExcelSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Seleccionar Curso Destino
            </label>
            <select
              value={excelCourse}
              onChange={(e) => setExcelCourse(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            >
              <option value="Kinder A (Nivel Inicial)">Kinder A (Nivel Inicial) - Prof. Carlos Morales</option>
              <option value="Pre-Kinder A (Nivel Inicial)">Pre-Kinder A (Nivel Inicial) - Prof. Carlos Morales</option>
              <option value="Kinder B (Nivel Inicial)">Kinder B (Nivel Inicial) - Prof. Laura Gutiérrez</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Archivo Excel / CSV (.xlsx, .xls, .csv)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40 rounded-2xl p-6 text-center cursor-pointer transition-all"
            >
              <FileSpreadsheet className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              {excelFile ? (
                <div>
                  <p className="text-sm font-bold text-slate-800">{excelFile.name}</p>
                  <p className="text-xs text-emerald-700 font-mono mt-0.5">{(excelFile.size / 1024).toFixed(1)} KB - Listo para procesar</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold text-slate-700">Haga clic para seleccionar archivo Excel</p>
                  <p className="text-xs text-slate-600 mt-1">Formato: Nombre, Apellido, Fecha de Nacimiento (AAAA-MM-DD)</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <p className="font-bold text-slate-700 mb-0.5">Estructura recomendada:</p>
            <p>Columna A: <code>Nombre</code> | Columna B: <code>Apellido</code> | Columna C: <code>Fecha_Nacimiento</code></p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsExcelModalOpen(false)}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isImporting || !excelFile}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-100 transition-all disabled:opacity-50"
            >
              {isImporting ? 'Importando alumnos...' : 'Importar Lista de Curso'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
