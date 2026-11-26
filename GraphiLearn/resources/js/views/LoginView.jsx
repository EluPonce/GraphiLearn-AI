import React, { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, UserCheck, School, Building2, ArrowLeft } from 'lucide-react';

export default function LoginView({ onLoginSuccess, onBackToLanding }) {
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
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 sm:p-6 bg-slate-50">
      {/* Botón superior sutil para volver al Sitio Web */}
      {onBackToLanding && (
        <div className="w-full max-w-md mb-4 flex justify-start">
          <button
            type="button"
            onClick={onBackToLanding}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-700 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-200/60"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Sitio Web</span>
          </button>
        </div>
      )}

      <div className="w-full max-w-md">
        {/* Cabecera del Login */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-700 shadow-md shadow-teal-700/20 mb-3">
            <School className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">
            GraphiLearn <span className="text-teal-700 font-extrabold text-sm px-2 py-0.5 rounded-lg bg-teal-50 border border-teal-200 align-middle ml-1">AI</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Plataforma de Detección Temprana de Riesgo Grafomotor
          </p>
        </div>

        {/* Tarjeta de Inicio de Sesión Limpia */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-1">Iniciar Sesión</h2>
          <p className="text-xs text-slate-500 mb-5">Ingresa tus credenciales institucionales para acceder</p>

          {error && (
            <div role="alert" className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@graphilearn.test"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Ingresando...</span>
                </span>
              ) : (
                <>
                  <span>Ingresar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Accesos Rápidos para Demostración */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
              Acceso rápido para defensa y pruebas:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('docente@graphilearn.test', 'password')}
                className="flex flex-col items-center p-2 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 transition-all text-center"
              >
                <UserCheck className="w-4 h-4 text-teal-700 mb-0.5" />
                <span className="text-xs font-bold text-slate-800">Docente</span>
                <span className="text-[10px] text-slate-500 font-mono">docente@</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('direccion.ejemplo@graphilearn.test', 'password')}
                className="flex flex-col items-center p-2 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 transition-all text-center"
              >
                <Building2 className="w-4 h-4 text-purple-700 mb-0.5" />
                <span className="text-xs font-bold text-slate-800">Dirección</span>
                <span className="text-[10px] text-slate-500 font-mono">direccion@</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin@graphilearn.test', 'password')}
                className="flex flex-col items-center p-2 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 transition-all text-center"
              >
                <ShieldCheck className="w-4 h-4 text-amber-700 mb-0.5" />
                <span className="text-xs font-bold text-slate-800">Admin</span>
                <span className="text-[10px] text-slate-500 font-mono">admin@</span>
              </button>
            </div>
            <p className="text-[11px] text-center text-slate-400 mt-2 font-mono">
              Contraseña: <strong className="text-slate-600">password</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
