import React from 'react';
import { FileText, GraduationCap, LogOut, UserCircle, Cpu, Users, UserCheck, Layers, CalendarCheck } from 'lucide-react';

const teacherItems = [
  { id: 'courses', label: 'Mis cursos', icon: GraduationCap },
  { id: 'reports', label: 'Informes', icon: FileText },
  { id: 'profile', label: 'Perfil', icon: UserCircle },
];

const directionItems = [
  { id: 'courses', label: 'Cursos', icon: GraduationCap },
  { id: 'reports', label: 'Informes', icon: FileText },
  { id: 'profile', label: 'Perfil', icon: UserCircle },
];

const adminItems = [
  { id: 'courses', label: 'Cursos y Aulas', icon: GraduationCap },
  { id: 'teachers', label: 'Gestión de Docentes', icon: UserCheck },
  { id: 'students', label: 'Estudiantes', icon: Users },
  { id: 'exercises', label: 'Catálogo de Ejercicios', icon: Layers },
  { id: 'programmed-activities', label: 'Actividades Programadas', icon: CalendarCheck },
  { id: 'model-versions', label: 'Versiones del Modelo IA', icon: Cpu },
  { id: 'profile', label: 'Perfil', icon: UserCircle },
];

export default function Sidebar({ currentView, setCurrentView, onLogout, user, isOpen, onClose }) {
  const role = user?.rol || user?.role;
  const isDirection = role === 'direccion';
  const isAdmin = role === 'administrador';
  const menuItems = isDirection ? directionItems : isAdmin ? adminItems : teacherItems;
  const userName = user?.nombre || user?.name || 'Usuario';
  const userEmail = user?.correo || user?.email || '';
  const roleLabel = isDirection ? 'Dirección · Solo lectura' : isAdmin ? 'Administración del Sistema' : 'Docente';
  const activeView = currentView === 'student-profile' ? 'courses' : currentView;

  const handleSelectView = (id) => {
    setCurrentView(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Overlay para cerrar sidebar en móvil al tocar afuera */}
      <div 
        className={`gl-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`gl-sidebar ${isOpen ? 'open' : ''}`} aria-label="GraphiLearn AI">
        <div className="flex items-center justify-between w-full">
          <a className="gl-brand" href="#inicio" onClick={event => event.preventDefault()} aria-label="GraphiLearn AI, inicio">
            <span className="gl-brand-mark" aria-hidden="true" />
            <span>GraphiLearn AI<small>Nivel Inicial y Guarderías</small></span>
          </a>
        </div>

        <nav className="gl-nav" aria-label="Menú principal">
          {menuItems.map(({ id, label, icon: Icon }) => {
            const active = activeView === id || (id === 'courses' && ['course-evaluation', 'evaluation-capture', 'direction-course', 'student-sheet'].includes(currentView));
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleSelectView(id)}
                aria-current={active ? 'page' : undefined}
                className="gl-nav-button"
              >
                <Icon aria-hidden="true" size={18} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="gl-account">
          <div className="gl-identity">
            <span className="gl-avatar" aria-hidden="true">{userName.charAt(0).toLocaleUpperCase('es')}</span>
            <span className="gl-identity-copy"><strong>{userName}</strong>{userEmail && <small>{userEmail}</small>}<small>{roleLabel}</small></span>
          </div>
          <button type="button" onClick={() => { if (onClose) onClose(); onLogout(); }} className="gl-logout">
            <LogOut aria-hidden="true" size={16} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
