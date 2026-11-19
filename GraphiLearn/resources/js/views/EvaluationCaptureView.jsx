import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { EvaluacionChip } from '../components/EvaluacionChip';
import {
  AVISO_SIN_DIAGNOSTICO, NOMBRE_EJERCICIO, RUBRICA, TEXTO_ED, VALORACION_LARGA,
  estadoCelda, palabraIndicador, resumenAnalisis, siguientePendiente, textoNivel,
} from '../utils/evaluacion';

function primerMensaje(error, porDefecto) {
  const data = error.response?.data;
  const errores = data?.errors ? Object.values(data.errors).flat() : [];
  return errores[0] || data?.message || porDefecto;
}

const PASOS = ['Foto', 'Análisis', 'Valoración'];

function Pasos({ paso }) {
  return (
    <div className="gl-steps" aria-label="Pasos de la captura">
      {PASOS.map((nombre, i) => {
        const n = i + 1;
        const clase = paso === n ? 'on' : paso > n ? 'done' : '';
        return <div key={n} className={clase} aria-current={paso === n ? 'step' : undefined}>{n} {nombre}</div>;
      })}
    </div>
  );
}

function HojaConMarcas() {
  return (
    <svg width="220" height="130" viewBox="0 0 220 130" role="img" aria-label="Hoja con cuatro marcas en las esquinas">
      <rect x="20" y="10" width="180" height="110" rx="4" fill="none" stroke="currentColor" strokeOpacity=".4" />
      {[[20, 10], [200, 10], [20, 120], [200, 120]].map(([x, y]) => <rect key={`${x}-${y}`} x={x - 6} y={y - 6} width="12" height="12" fill="currentColor" />)}
      <text x="110" y="70" textAnchor="middle" fontSize="12" fill="currentColor" fillOpacity=".7">Hoja completa</text>
    </svg>
  );
}

/**
 * Captura de un Ejercicio en 3 pasos: 1 Foto, 2 Análisis, 3 Valoración.
 * Carga el cuadro del trimestre para conocer el estado de la celda, la descripción del Ejercicio
 * y la siguiente celda pendiente.
 */
export default function EvaluationCaptureView({ course, trimestre, inicial, onBackToGrid, onBackToCourses }) {
  const [cuadro, setCuadro] = useState(null);
  const [actual, setActual] = useState(inicial); // { id_estudiante, ejercicio }
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');

  const [paso, setPaso] = useState(1);
  const [archivo, setArchivo] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const [mensajeAnalisis, setMensajeAnalisis] = useState('');
  const [seleccion, setSeleccion] = useState(null);
  const [observacion, setObservacion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setErrorCarga('');
    try {
      const response = await axios.get(`/api/v1/cursos/${course.id}/evaluaciones/${trimestre}`);
      setCuadro(response.data?.data || null);
    } catch (requestError) {
      setErrorCarga(primerMensaje(requestError, 'No fue posible cargar la Evaluación.'));
    } finally {
      setCargando(false);
    }
  }, [course.id, trimestre]);

  useEffect(() => { cargar(); }, [cargar]);

  const evaluacion = cuadro?.evaluacion || null;
  const estudiante = cuadro?.estudiantes?.find((e) => e.id_estudiante === actual.id_estudiante) || null;
  const celda = estudiante?.ejercicios?.find((c) => c.ejercicio === actual.ejercicio) || null;
  const ejercicioInfo = cuadro?.ejercicios?.find((e) => e.ejercicio === actual.ejercicio) || null;
  const nombreEjercicio = NOMBRE_EJERCICIO[actual.ejercicio] || ejercicioInfo?.nombre || actual.ejercicio;
  const analisis = useMemo(() => resumenAnalisis(celda?.analisis), [celda?.analisis]);
  const valorActual = estadoCelda(celda);
  const yaValorado = ['S', 'ED', 'NA'].includes(celda?.valoracion);

  // Al cambiar de celda (o al cargarla por primera vez) se elige el paso inicial, como en el prototipo:
  // sin foto → paso 1; con foto → paso 2.
  const claveCelda = celda ? `${actual.id_estudiante}:${actual.ejercicio}` : null;
  useEffect(() => {
    if (!claveCelda) return;
    setPaso(celda.estado === 'sin_foto' ? 1 : 2);
    setSeleccion(yaValorado ? celda.valoracion : null);
    setObservacion('');
    setArchivo(null);
    setVistaPrevia('');
    setMensajeAnalisis('');
    setGuardado(false);
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claveCelda]);

  useEffect(() => () => { if (vistaPrevia) URL.revokeObjectURL(vistaPrevia); }, [vistaPrevia]);

  const actualizarCelda = (cambios) => {
    setCuadro((prev) => ({
      ...prev,
      estudiantes: prev.estudiantes.map((e) => e.id_estudiante !== actual.id_estudiante ? e : {
        ...e,
        ejercicios: e.ejercicios.map((c) => c.ejercicio !== actual.ejercicio ? c : { ...c, ...cambios }),
      }),
    }));
  };

  const rutaBase = evaluacion && `/api/v1/evaluaciones/${evaluacion.id}/estudiantes/${actual.id_estudiante}/ejercicios/${actual.ejercicio}`;

  const elegirArchivo = (event) => {
    const file = event.target.files?.[0] || null;
    setError('');
    setArchivo(file);
    setVistaPrevia(file ? URL.createObjectURL(file) : '');
  };

  const subirFoto = async () => {
    if (!archivo) return;
    setSubiendo(true);
    setError('');
    try {
      const form = new FormData();
      form.append('foto', archivo);
      const response = await axios.post(`${rutaBase}/foto`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      const data = response.data?.data || {};
      const resumen = data.analisis_disponible && data.analisis ? {
        indicadores: data.analisis.indicadores,
        sugerencia: data.analisis.sugerencia,
        aviso_pedagogico: data.analisis.detalles_computacionales?.aviso_pedagogico ?? null,
      } : null;
      actualizarCelda({ id_foto: data.id, estado: 'foto_lista', analisis_disponible: !!data.analisis_disponible, analisis: resumen });
      setMensajeAnalisis(data.mensaje_analisis || '');
      setPaso(2);
    } catch (requestError) {
      setError(primerMensaje(requestError, 'No fue posible subir la foto.'));
    } finally {
      setSubiendo(false);
    }
  };

  const guardarValoracion = async () => {
    if (!seleccion) return;
    setGuardando(true);
    setError('');
    try {
      await axios.put(`${rutaBase}/valoracion`, { valoracion: seleccion, observacion: observacion.trim() || null });
      actualizarCelda({ valoracion: seleccion, estado: 'valorado' });
      setGuardado(true);
    } catch (requestError) {
      setError(primerMensaje(requestError, 'No fue posible guardar la valoración.'));
    } finally {
      setGuardando(false);
    }
  };

  const siguiente = guardado ? siguientePendiente(cuadro?.estudiantes, { id_estudiante: actual.id_estudiante, ejercicio: actual.ejercicio }) : null;

  if (cargando && !cuadro) return <p role="status" className="gl-card gl-muted">Cargando…</p>;
  if (errorCarga) {
    return (
      <div role="alert" className="gl-alert flex flex-wrap items-center justify-between gap-3">
        <span>{errorCarga}</span>
        <span className="flex gap-2">
          <button type="button" className="gl-btn ghost" onClick={cargar}>Reintentar</button>
          <button type="button" className="gl-btn ghost" onClick={onBackToGrid}>Volver al cuadro</button>
        </span>
      </div>
    );
  }
  if (!evaluacion || !estudiante || !celda) {
    return (
      <div className="gl-card">
        <p>No se encontró este Ejercicio en la Evaluación del Trimestre {trimestre}.</p>
        <button type="button" className="gl-btn ghost mt-3" onClick={onBackToGrid}>Volver al cuadro</button>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-[18px]">
      <nav className="gl-crumbs" aria-label="Ruta">
        <button type="button" onClick={onBackToCourses}>Mis cursos</button>
        <span>/</span>
        <button type="button" onClick={onBackToGrid}>{course.nombre}</button>
        <span>/</span>
        <span>{estudiante.nombre}, {nombreEjercicio}</span>
      </nav>

      <div className="gl-head">
        <div>
          <h1 className="gl-h1">{nombreEjercicio}</h1>
          <p>{estudiante.nombre} · Trimestre {trimestre} · {textoNivel(evaluacion.nivel)}</p>
        </div>
        {yaValorado && !guardado && <div>Valoración actual: <EvaluacionChip valor={valorActual} /></div>}
      </div>

      <p className="gl-note" role="note"><b>{AVISO_SIN_DIAGNOSTICO}.</b></p>

      <div className="gl-card">
        <h2 className="gl-h3">Qué observa este ejercicio</h2>
        <p className="mt-1">{ejercicioInfo?.descripcion || 'Este Ejercicio no tiene descripción registrada.'}</p>
      </div>

      <div className="gl-card">
        {guardado ? (
          <>
            <div className="gl-note"><b>Guardado.</b> {estudiante.nombre}, {nombreEjercicio}: <EvaluacionChip valor={seleccion} /></div>
            <div className="mt-[14px] flex flex-wrap gap-[10px]">
              {siguiente && (
                <button type="button" className="gl-btn" onClick={() => setActual({ id_estudiante: siguiente.estudiante.id_estudiante, ejercicio: siguiente.celda.ejercicio })}>
                  Siguiente: {siguiente.estudiante.nombre.split(' ')[0]}, {NOMBRE_EJERCICIO[siguiente.celda.ejercicio]}
                </button>
              )}
              <button type="button" className="gl-btn ghost" onClick={onBackToGrid}>Volver al cuadro</button>
            </div>
          </>
        ) : (
          <>
            <Pasos paso={paso} />

            {paso === 1 && (
              <div className="gl-drop">
                {vistaPrevia ? <img src={vistaPrevia} alt="Vista previa de la foto elegida" /> : <HojaConMarcas />}
                <p>Toma la foto con la hoja completa y las 4 marcas de las esquinas visibles.</p>
                <div className="gl-field items-center">
                  <label htmlFor="captura-foto">Foto del Ejercicio (JPG o PNG)</label>
                  <input id="captura-foto" type="file" accept="image/jpeg,image/png" capture="environment" onChange={elegirArchivo} />
                </div>
                <div className="flex flex-wrap justify-center gap-[10px]">
                  <button type="button" className="gl-btn" disabled={!archivo || subiendo} onClick={subirFoto}>
                    {subiendo ? 'Subiendo…' : 'Subir foto'}
                  </button>
                  {celda.estado !== 'sin_foto' && (
                    <button type="button" className="gl-btn ghost" onClick={() => setPaso(2)}>Mantener la foto actual</button>
                  )}
                </div>
              </div>
            )}

            {paso === 2 && (
              <>
                {vistaPrevia && <div className="gl-drop mb-4"><img src={vistaPrevia} alt="Foto subida" /></div>}
                {!celda.analisis_disponible || !analisis ? (
                  <div className="gl-note" role="status">
                    <b>Análisis no disponible por ahora.</b>
                    {mensajeAnalisis && mensajeAnalisis !== 'Análisis no disponible por ahora.' && <> {mensajeAnalisis}</>}
                    {' '}Puedes continuar a la valoración.
                  </div>
                ) : (
                  <div className="gl-cols">
                    <div>
                      <h3 className="gl-h3">Lo que midió el sistema</h3>
                      <p className="gl-muted">Cada indicador compara el trazo con la plantilla de este nivel.</p>
                      {analisis.indicadores.map((ind) => (
                        <div key={ind.clave} className="gl-ind">
                          <span>{ind.nombre}<small>{ind.detalle}</small></span>
                          <div className="bar" aria-hidden="true"><span style={{ width: `${(ind.valor ?? 0) * 100}%` }} /></div>
                          <em>{ind.valor === null ? 'Sin dato' : `${palabraIndicador(ind.valor)} (${ind.valor.toFixed(2)})`}</em>
                        </div>
                      ))}
                    </div>
                    <div>
                      {analisis.sugerencia && (
                        <>
                          <h3 className="gl-h3">Sugerencia del sistema</h3>
                          <p className="my-2"><EvaluacionChip valor={analisis.sugerencia} /> <span className="gl-muted">{VALORACION_LARGA[analisis.sugerencia]}</span></p>
                          <p className="gl-muted">Es solo una ayuda. La valoración final la decides tú.</p>
                        </>
                      )}
                      {analisis.aviso && <p className="gl-note mt-3">{analisis.aviso}</p>}
                    </div>
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-[10px]">
                  <button type="button" className="gl-btn" onClick={() => setPaso(3)}>Continuar a la valoración</button>
                  {!yaValorado && <button type="button" className="gl-btn ghost" onClick={() => setPaso(1)}>Cambiar la foto</button>}
                </div>
              </>
            )}

            {paso === 3 && (
              <>
                <h3 className="gl-h3">¿Cómo valoras este ejercicio?</h3>
                {analisis?.sugerencia && <p className="mt-1">Sugerencia del sistema: <EvaluacionChip valor={analisis.sugerencia} /></p>}
                <div className="gl-opts my-3" role="group" aria-label="Valoración">
                  {['S', 'ED', 'NA'].map((v) => (
                    <button key={v} type="button" className="gl-opt" aria-pressed={seleccion === v} onClick={() => setSeleccion(v)}>
                      <EvaluacionChip valor={v} />
                      <span><b>{VALORACION_LARGA[v]}</b><span className="gl-muted">{RUBRICA[actual.ejercicio]?.[v]}</span></span>
                    </button>
                  ))}
                </div>
                <p className="gl-muted mb-3">{TEXTO_ED}.</p>
                <div className="gl-field">
                  <label htmlFor="obs">Observación (opcional)</label>
                  <textarea id="obs" value={observacion} maxLength={5000} onChange={(e) => setObservacion(e.target.value)} placeholder="Ej.: agarra el lápiz con toda la mano" />
                </div>
                <div className="mt-[14px] flex flex-wrap gap-[10px]">
                  <button type="button" className="gl-btn" disabled={!seleccion || guardando} onClick={guardarValoracion}>
                    {guardando ? 'Guardando…' : 'Guardar valoración'}
                  </button>
                  <button type="button" className="gl-btn ghost" onClick={() => setPaso(2)}>Volver al análisis</button>
                </div>
              </>
            )}

            {error && <p role="alert" className="gl-alert mt-3">{error}</p>}
          </>
        )}
      </div>
    </section>
  );
}
