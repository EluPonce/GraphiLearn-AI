import React, { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff, Lock, Mail, Sparkles, AlertCircle, ArrowRight, ShieldCheck, UserCheck, School } from 'lucide-react';

export default function LoginView({ onLoginSuccess }) {
  const [email, setEmail] = useState('docente@graphilearn.test');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuickFill = (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Por favor complete todos los campos requeridos.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/v1/auth/login', {
        correo: email.trim(),
        password: password,
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (response.data && response.data.access_token) {
        onLoginSuccess(response.data.user, response.data.access_token);
      } else {
        setError('Respuesta de autenticación inesperada.');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (data.errors && data.errors.correo) {
          setError(data.errors.correo[0]);
        } else if (data.message) {
          setError(data.message);
        } else {
          setError('Credenciales incorrectas. Verifique su correo y contraseña.');
        }
      } else {
        setError('Error al conectar con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-gradient-to-br from-indigo-50/70 via-white to-amber-50/50">
      <div className="w-full max-w-md">
        {/* Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-sky-500 shadow-xl shadow-indigo-100 mb-4">
            <School className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">
            GraphiLearn <span className="text-indigo-600 font-extrabold text-sm px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 align-middle ml-1">AI</span>
          </h1>
          <p className="text-sm font-semibold text-slate-600 mt-2">
            Plataforma de Detección Temprana de Riesgo Grafomotor
          </p>
          <p className="text-xs text-slate-600 mt-0.5">
            Educación Inicial, Kínder y Guarderías
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xl shadow-slate-100/80">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Ingreso Institucional</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Acceso seguro para administradores y docentes evaluadores
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@graphilearn.test"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-11 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Validando usuario...
                </span>
              ) : (
                <>
                  <span>Ingresar a la Plataforma</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Cuentas de Acceso Rápido */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider text-center mb-3">
              Cuentas de demostración (Seeder):
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@graphilearn.test', 'password')}
                className="flex flex-col items-center p-2.5 rounded-2xl bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200 transition-all text-left group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Admin</span>
                </div>
                <span className="text-[10px] text-amber-700 font-mono mt-0.5 truncate w-full text-center">
                  admin@graphilearn.test
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('docente@graphilearn.test', 'password')}
                className="flex flex-col items-center p-2.5 rounded-2xl bg-sky-50/70 hover:bg-sky-100/70 border border-sky-200 transition-all text-left group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800">
                  <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                  <span>Docente</span>
                </div>
                <span className="text-[10px] text-sky-700 font-mono mt-0.5 truncate w-full text-center">
                  docente@graphilearn.test
                </span>
              </button>
            </div>
            <p className="text-[11px] text-center text-slate-600 mt-2 font-mono">
              Contraseña: <strong className="text-slate-700">password</strong>
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-[11px] text-slate-600 mt-6 max-w-xs mx-auto leading-relaxed">
          Herramienta pedagógica y computacional de apoyo al seguimiento del desarrollo motriz en primera infancia.
        </p>
      </div>
    </div>
  );
}
