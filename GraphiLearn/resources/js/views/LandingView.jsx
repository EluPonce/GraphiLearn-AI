import React from 'react';
import {
  School,
  Camera,
  Cpu,
  CheckCircle2,
  BarChart3,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  ArrowRight,
  Sparkles,
  Clock
} from 'lucide-react';

export default function LandingView({ onGoToLogin }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-teal-600 selection:text-white">
      {/* 1. NAVBAR PÚBLICO (Tema Claro) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-700 flex items-center justify-center shadow-md shadow-teal-700/20">
              <School className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                GraphiLearn <span className="text-xs px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">AI</span>
              </span>
              <p className="text-[10px] text-slate-500 -mt-0.5 hidden sm:block">Inteligencia Artificial para Educación Inicial</p>
            </div>
          </div>

          {/* Enlaces de navegación */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <a href="#funciones" className="hover:text-teal-700 transition-colors">Funciones</a>
            <a href="#como-funciona" className="hover:text-teal-700 transition-colors">Cómo Funciona</a>
            <a href="#planes" className="hover:text-teal-700 transition-colors">Planes</a>
            <a href="#contacto" className="hover:text-teal-700 transition-colors">Contacto</a>
          </nav>

          {/* Botón Ingreso al Sistema */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onGoToLogin}
              className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Ingresar a la Plataforma</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Innovación para Unidades Educativas y Kínders en Bolivia</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            Detección Temprana del Desempeño <span className="text-teal-700">Grafomotor</span> con IA
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Elimina el cuaderno de notas manual. La maestra toma una foto con su celular y en <strong>3 segundos</strong> el sistema mide continuidad, presión y curvatura, sugiriendo la calificación oficial del Ministerio de Educación (<strong>S / ED / NA</strong>).
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={onGoToLogin}
              className="px-6 py-3.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm shadow-md transition-all flex items-center gap-2 hover:scale-105 cursor-pointer"
            >
              <span>Ingresar al Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="https://wa.me/59178012345?text=Hola,%20deseo%20solicitar%20una%20demostración%20de%20GraphiLearn%20AI%20para%20mi%20colegio"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-xs transition-all flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Solicitar Demo por WhatsApp</span>
            </a>
          </div>

          {/* Tarjetas de métricas del Piloto */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-2xl sm:text-3xl font-black text-teal-700">3 seg</span>
              <p className="text-xs text-slate-600 mt-1 font-medium">Análisis de trazo en tiempo real</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-2xl sm:text-3xl font-black text-teal-700">90%</span>
              <p className="text-xs text-slate-600 mt-1 font-medium">Ahorro de tiempo docente en aula</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-2xl sm:text-3xl font-black text-teal-700">4</span>
              <p className="text-xs text-slate-600 mt-1 font-medium">Trazos: Línea, Círculo, Espiral, Zigzag</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-2xl sm:text-3xl font-black text-teal-700">100%</span>
              <p className="text-xs text-slate-600 mt-1 font-medium">Adaptado a la escala boliviana (S/ED/NA)</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FUNCIONES DEL SOFTWARE */}
      <section id="funciones" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold text-teal-700 uppercase tracking-widest mb-1.5">Capacidades del Sistema</h2>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">¿Qué funciones ofrece GraphiLearn AI?</p>
            <p className="text-sm text-slate-600 mt-2">Diseñado para maestras, directores y gabinetes psicopedagógicos de nivel inicial.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mb-4">
                  <Camera className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">1. Captura con Cámara Móvil (PWA)</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  No requiere escáneres. La maestra enfoca la hoja bond con su celular y la PWA recorta y alinea automáticamente la muestra.
                </p>
              </div>
              <ul className="mt-5 space-y-2 text-xs text-slate-700 font-medium border-t border-slate-100 pt-3">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Compatible con cualquier Android / iPhone</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Instalable en 1 clic como app nativa</li>
              </ul>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center mb-4">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">2. Motor de Visión por Computadora</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cálculo automático de 5 indicadores: continuidad, presión estimada, índice de temblor, cierre de trazo y curvatura modular.
                </p>
              </div>
              <ul className="mt-5 space-y-2 text-xs text-slate-700 font-medium border-t border-slate-100 pt-3">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-sky-600" /> Procesamiento en FastAPI + OpenCV 5</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-sky-600" /> Respuesta cuantitativa en menos de 2 segundos</li>
              </ul>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">3. Enfoque Human-in-the-Loop</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  La IA actúa como apoyo orientativo; la maestra de aula siempre tiene la última palabra para confirmar la nota cualitativa oficial.
                </p>
              </div>
              <ul className="mt-5 space-y-2 text-xs text-slate-700 font-medium border-t border-slate-100 pt-3">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Calificación: Superado, En Desarrollo, Apoyo</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Historial evolutivo y reportes en PDF</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CÓMO FUNCIONA */}
      <section id="como-funciona" className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold text-teal-700 uppercase tracking-widest mb-1.5">Metodología en el Aula</h2>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">Flujo Sencillo en 3 Pasos</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200">
              <span className="inline-block text-3xl font-black text-teal-700 mb-2">Paso 1</span>
              <h3 className="text-base font-bold text-slate-900 mb-1">Toma de Foto</h3>
              <p className="text-xs text-slate-600">
                La maestra enfoca la ficha impresa con los 4 ejercicios grafomotores desde el celular.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200">
              <span className="inline-block text-3xl font-black text-teal-700 mb-2">Paso 2</span>
              <h3 className="text-base font-bold text-slate-900 mb-1">Análisis Instantáneo</h3>
              <p className="text-xs text-slate-600">
                OpenCV extrae las métricas del trazo y genera la sugerencia preliminar con barras de progreso.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200">
              <span className="inline-block text-3xl font-black text-teal-700 mb-2">Paso 3</span>
              <h3 className="text-base font-bold text-slate-900 mb-1">Valoración y Ficha</h3>
              <p className="text-xs text-slate-600">
                La maestra confirma la valoración oficial (S/ED/NA) y el sistema actualiza la ficha del niño.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PLANES DE PRODUCTO (B2B SaaS) */}
      <section id="planes" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold text-teal-700 uppercase tracking-widest mb-1.5">Software como Producto Comercial</h2>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">Planes de Licenciamiento Institucional</p>
            <p className="text-xs text-slate-500 mt-1">Suscripción anual por colegio con garantía de servicio (SLA 99.5%).</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {/* Plan Semillero */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Guarderías Pequeñas</span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">Plan Semillero</h3>
                <div className="mt-3 mb-5">
                  <span className="text-3xl font-black text-slate-900">$180</span>
                  <span className="text-xs text-slate-500"> USD / año (Bs 1.250)</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" /> Hasta 50 estudiantes</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" /> Hasta 3 docentes habilitadas</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" /> Los 4 ejercicios grafomotores</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" /> Soporte vía correo electrónico</li>
                </ul>
              </div>
              <a
                href="https://wa.me/59178012345?text=Deseo%20cotizar%20el%20Plan%20Semillero%20de%20GraphiLearn%20AI"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 block text-center py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
              >
                Solicitar Plan
              </a>
            </div>

            {/* Plan Kínder Estándar (Destacado) */}
            <div className="p-6 rounded-3xl bg-white border-2 border-teal-700 shadow-md flex flex-col justify-between relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-teal-700 text-white text-[10px] font-black uppercase tracking-wider">
                Más Elegido por Kínders
              </div>
              <div>
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Kínders y Centros Infantiles</span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">Plan Kínder Estándar</h3>
                <div className="mt-3 mb-5">
                  <span className="text-3xl font-black text-teal-700">$380</span>
                  <span className="text-xs text-slate-500"> USD / año (Bs 2.640)</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" /> Hasta 120 estudiantes</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" /> Hasta 6 docentes de aula</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" /> Panel de Supervisión para Directora</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" /> 1 Taller de inducción presencial</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" /> Soporte prioritario por WhatsApp</li>
                </ul>
              </div>
              <a
                href="https://wa.me/59178012345?text=Deseo%20cotizar%20el%20Plan%20Kínder%20Estándar%20de%20GraphiLearn%20AI"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 block text-center py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-sm transition-all"
              >
                Contratar Plan Kínder
              </a>
            </div>

            {/* Plan Colegial Integral */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unidades Educativas Grandes</span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">Plan Colegial Integral</h3>
                <div className="mt-3 mb-5">
                  <span className="text-3xl font-black text-slate-900">$650</span>
                  <span className="text-xs text-slate-500"> USD / año (Bs 4.520)</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" /> Hasta 250 estudiantes</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" /> Docentes ilimitados</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" /> Acceso para Gabinete Psicopedagógico</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" /> 2 Talleres de capacitación en aula</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" /> Soporte telefónico prioritario 24/7</li>
                </ul>
              </div>
              <a
                href="https://wa.me/59178012345?text=Deseo%20cotizar%20el%20Plan%20Colegial%20Integral%20de%20GraphiLearn%20AI"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 block text-center py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
              >
                Solicitar Plan
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECCIÓN DE CONTACTO EXCLUSIVA (Punto 7 del Índice) */}
      <section id="contacto" className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto rounded-3xl bg-slate-50 border border-slate-200 p-6 sm:p-10 shadow-xs">
            <div className="text-center mb-8">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">Atención Comercial y Soporte Técnico</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Contáctanos</h2>
              <p className="text-xs text-slate-600 mt-1">Estamos disponibles para demostraciones en tu unidad educativa y asistencia técnica.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Celular y WhatsApp */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-start gap-3.5 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Línea Directa y WhatsApp</span>
                  <p className="text-base font-black text-slate-900 mt-0.5">+591 78012345</p>
                  <p className="text-xs text-slate-500 mt-0.5">Atención: Lunes a Viernes (08:00 - 18:00)</p>
                  <a
                    href="https://wa.me/59178012345?text=Hola,%20quisiera%20más%20información%20sobre%20GraphiLearn%20AI"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Abrir Chat de WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Correo Electrónico */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-start gap-3.5 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Correo Electrónico</span>
                  <p className="text-base font-black text-slate-900 mt-0.5">contacto@graphilearn.bo</p>
                  <p className="text-xs text-slate-500 mt-0.5">Consultas institucionales y convenios</p>
                  <span className="inline-block mt-2 text-xs text-slate-400">Respuesta en menos de 24 horas</span>
                </div>
              </div>

              {/* Ubicación Institucional */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-start gap-3.5 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Ubicación y Sede</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">Santa Cruz de la Sierra, Bolivia</p>
                  <p className="text-xs text-slate-500 mt-0.5">Facultad de Ciencias de la Computación (FICCT - UAGRM)</p>
                </div>
              </div>

              {/* Garantía SLA */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-start gap-3.5 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Garantía de Servicio (SLA)</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">Disponibilidad 99.5%</p>
                  <p className="text-xs text-slate-500 mt-0.5">Tiempo de resolución ante incidentes críticos: menos de 2 horas.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER LIMPIO */}
      <footer className="bg-slate-100 py-8 border-t border-slate-200 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="font-semibold text-slate-700">GraphiLearn S.R.L. © 2026</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Sistema Inteligente para la Detección Temprana de Riesgo Grafomotor · Santa Cruz, Bolivia</p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button type="button" onClick={onGoToLogin} className="hover:text-teal-700 font-semibold cursor-pointer">Ingreso Institucional</button>
            <span>·</span>
            <a href="tel:+59178012345" className="hover:text-teal-700 font-semibold">+591 78012345</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
