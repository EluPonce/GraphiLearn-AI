import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  GraduationCap,
  UserCheck,
  Users,
  Calendar,
  BookOpen,
  Search,
  ChevronRight,
  School
} from 'lucide-react';

export default function CoursesView({ user }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = user?.rol === 'administrador' || user?.role === 'administrador';

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/v1/cursos');
      if (res.data && res.data.data) {
        setCourses(res.data.data);
      }
    } catch (err) {
      console.error('Error al cargar cursos:', err);
      setCourses([
        {
          id: 1,
          nombre: 'Kinder A (Nivel Inicial)',
          nivel: 'Inicial',
          gestion: '2026',
          id_docente: 2,
          docente: { id: 2, nombre: 'Prof. Carlos Morales', correo: 'docente@graphilearn.test', rol: 'docente' },
          estudiantes_count: 3
        },
        {
          id: 2,
          nombre: 'Pre-Kinder A (Nivel Inicial)',
          nivel: 'Inicial',
          gestion: '2026',
          id_docente: 2,
          docente: { id: 2, nombre: 'Prof. Carlos Morales', correo: 'docente@graphilearn.test', rol: 'docente' },
          estudiantes_count: 1
        },
        {
          id: 3,
          nombre: 'Kinder B (Nivel Inicial)',
          nivel: 'Inicial',
          gestion: '2026',
          id_docente: 3,
          docente: { id: 3, nombre: 'Prof. Laura Gutiérrez', correo: 'laura@graphilearn.test', rol: 'docente' },
          estudiantes_count: 2
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(c =>
    c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.docente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nivel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.gestion?.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                Cursos y Aulas Asignadas
              </h2>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                isAdmin
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}>
                {isAdmin ? 'Visión Institucional' : 'Mis Cursos'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {isAdmin
                ? 'Supervisión de cursos escolares y asignación de profesores responsables.'
                : 'Cursos bajo su responsabilidad pedagógica en nivel inicial.'}
            </p>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200">
            <School className="w-4 h-4 text-indigo-600" />
            <div className="text-left">
              <p className="text-[10px] text-slate-600 font-bold leading-none">Total Cursos</p>
              <p className="text-sm font-black text-slate-800 leading-tight">{courses.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200">
            <Users className="w-4 h-4 text-sky-600" />
            <div className="text-left">
              <p className="text-[10px] text-slate-600 font-bold leading-none">Estudiantes</p>
              <p className="text-sm font-black text-slate-800 leading-tight">
                {courses.reduce((acc, c) => acc + (c.estudiantes_count || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por curso, docente o nivel..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-600">Cargando catálogo de cursos...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white border border-slate-200 rounded-3xl shadow-xs">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-800 font-bold">No se encontraron cursos</p>
            <p className="text-xs text-slate-600 mt-0.5">Intenta con otro término de búsqueda.</p>
          </div>
        ) : (
          filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white border border-slate-200 hover:border-indigo-300 rounded-3xl p-5 shadow-xs hover:shadow-md flex flex-col justify-between transition-all group"
            >
              <div>
                {/* Course Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                      {course.nombre.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {course.nombre}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-indigo-700 font-bold px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200">
                          {course.nivel}
                        </span>
                        <span className="text-[10px] text-slate-600 flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3" />
                          Gestión {course.gestion}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Teacher in Charge (Docente a cargo) */}
                <div className="my-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Docente Responsable</span>
                  </p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      {course.docente?.nombre ? course.docente.nombre.charAt(0) : 'D'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {course.docente?.nombre || 'Docente sin asignar'}
                      </p>
                      <p className="text-[10px] text-slate-600 truncate font-mono">
                        {course.docente?.correo || 'Sin correo'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span><strong>{course.estudiantes_count || 0}</strong> alumnos matriculados</span>
                </div>

                <span className="text-[11px] text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1 font-bold transition-colors">
                  <span>Aula activa</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
