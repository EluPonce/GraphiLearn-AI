import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Activity,
  Compass,
  Cpu,
  UserCircle,
  LogOut,
  Sparkles,
  School
} from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView, onLogout, user }) {
  const userName = user?.nombre || user?.name || 'Usuario';
  const userEmail = user?.correo || user?.email || 'usuario@graphilearn.test';
  const userRole = user?.rol || user?.role || 'docente';
  const isAdmin = userRole === 'administrador';

  const menuItems = [
    { id: 'dashboard', label: 'Panel Principal', icon: LayoutDashboard },
    { id: 'courses', label: 'Cursos y Aulas', icon: GraduationCap },
    { id: 'students', label: 'Estudiantes', icon: Users },
    { id: 'exercises', label: 'Catálogo de Trazo', icon: Compass },
    { id: 'activities', label: 'Actividades', icon: Activity },
    { id: 'analysis', label: 'Análisis IA', icon: Cpu, badge: 'IA' },
    { id: 'profile', label: 'Perfil y Sistema', icon: UserCircle },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none shadow-sm">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-md shadow-indigo-100">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-slate-800 flex items-center gap-1.5">
                GraphiLearn <span className="text-indigo-600 font-extrabold text-[11px] px-1.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200">AI</span>
              </h1>
              <p className="text-[11px] text-slate-600 leading-tight">
                Nivel Inicial y Guarderías
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
            Módulos Escolares
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id ||
              (item.id === 'activities' && (currentView === 'new-activity' || currentView === 'activity-detail')) ||
              (item.id === 'analysis' && currentView === 'analysis-detail');

            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-600'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 border border-sky-200">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer & Logout */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs mb-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`w-8 h-8 rounded-xl ${isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-700'} flex items-center justify-center font-bold text-xs shrink-0`}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-800 truncate">{userName}</p>
              <p className="text-[10px] text-slate-600 truncate">{userEmail}</p>
            </div>
          </div>
          <span className={`text-[10px] font-semibold ${isAdmin ? 'text-amber-700 bg-amber-50 border border-amber-200' : 'text-indigo-700 bg-indigo-50 border border-indigo-200'} px-2 py-0.5 rounded-md capitalize`}>
            {userRole}
          </span>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 hover:border-rose-200 border border-transparent transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
