import React from 'react';
import { FileText, GraduationCap, LogOut, UserCircle, Cpu } from 'lucide-react';

const teacherItems = [
  { id: 'courses', label: 'Mis cursos', icon: GraduationCap },
  { id: 'reports', label: 'Informes', icon: FileText },
  { id: 'profile', label: 'Perfil', icon: UserCircle },
];

const directionItems = [
  { id: 'courses', label: 'Cursos', icon: GraduationCap },
  { id: 'profile', label: 'Perfil', icon: UserCircle },
];

const adminItems = [
  { id: 'model-versions', label: 'Versiones del modelo', icon: Cpu },
  { id: 'profile', label: 'Perfil', icon: UserCircle },
];

export default function Sidebar({ currentView, setCurrentView, onLogout, user }) {
  const role = user?.rol || user?.role;
  const isDirection = role === 'direccion';
  const isAdmin = role === 'administrador';
  const menuItems = isDirection ? directionItems : isAdmin ? adminItems : teacherItems;
  const userName = user?.nombre || user?.name || 'Usuario';
  const userEmail = user?.correo || user?.email || '';
  const roleLabel = isDirection ? 'Dirección · Solo lectura' : isAdmin ? 'Administración de modelos' : 'Docente';
  const activeView = currentView === 'student-profile' ? 'courses' : currentView;

  return (
    <aside className="gl-sidebar" aria-label="GraphiLearn AI">
      <a className="gl-brand" href="#inicio" onClick={event => event.preventDefault()} aria-label="GraphiLearn AI, inicio">
        <span className="gl-brand-mark" aria-hidden="true" />
        <span>GraphiLearn AI<small>Nivel Inicial y Guarderías</small></span>
      </a>

      <nav className="gl-nav" aria-label="Menú principal">
        {menuItems.map(({ id, label, icon: Icon }) => {
          const active = activeView === id || (id === 'courses' && ['course-evaluation', 'evaluation-capture', 'direction-course', 'student-sheet'].includes(currentView));
          return (
            <button
              key={id}
              type="button"
              onClick={() => setCurrentView(id)}
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
        <button type="button" onClick={onLogout} className="gl-logout">
          <LogOut aria-hidden="true" size={16} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
