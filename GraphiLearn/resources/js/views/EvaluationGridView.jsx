import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { EvaluacionChip, LeyendaEvaluacion } from '../components/EvaluacionChip';
import { NOMBRE_EJERCICIO, estadoCelda, siguientePendiente as buscarPendiente, textoNivel } from '../utils/evaluacion';

const TRIMESTRES = [1, 2, 3];

function primerMensaje(error, porDefecto) {
  const data = error.response?.data;
  const errores = data?.errors ? Object.values(data.errors).flat() : [];
  return errores[0] || data?.message || porDefecto;
}

function CrearEvaluacionForm({ courseId, trimestre, onCreated }) {
  const [nivel, setNivel] = useState(String(trimestre));
  const [tamano, setTamano] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { setNivel(String(trimestre)); setError(''); }, [trimestre]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await axios.post('/api/v1/evaluaciones', {
        id_curso: courseId,
        trimestre,
        nivel: Number(nivel),
        tamano_figura_mm: Number(tamano),
      });
      await onCreated();
    } catch (requestError) {
      setError(primerMensaje(requestError, 'No fue posible crear la Evaluación.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <div className="gl-field">
        <label htmlFor="eval-nivel">Nivel</label>
        <select id="eval-nivel" value={nivel} onChange={(e) => setNivel(e.target.value)}>
          {[1, 2, 3].map((n) => <option key={n} value={n}>{textoNivel(n)}</option>)}
        </select>
      </div>
      <div className="gl-field">
        <label htmlFor="eval-tamano">Tamaño de figura (mm)</label>
        <input
          id="eval-tamano"
          type="number"
          inputMode="decimal"
          min="1"
          max="500"
          step="0.5"
          required
          value={tamano}
          onChange={(e) => setTamano(e.target.value)}
          placeholder="Ej.: 80"
        />
      </div>
      <button type="submit" className="gl-btn" disabled={saving}>
        {saving ? 'Creando…' : 'Crear evaluación'}
      </button>
      {error && <p role="alert" className="gl-alert sm:col-span-3">{error}</p>}
    </form>
  );
}

/**
 * Cuadro de la Evaluación: estudiantes × 4 Ejercicios de un curso, por trimestre.
 * readOnly oculta la creación y las acciones (vista de Dirección).
 */
export default function EvaluationGridView({ course, onBack, backLabel = 'Mis cursos', readOnly = false, onOpenCell, onOpenStudent, trimestreInicial, onTrimestreChange, renderResumen }) {
  const [trimestre, setTrimestreState] = useState(() => Number(trimestreInicial) || Number(course?.trimestre_actual) || 1);
  const setTrimestre = (t) => { setTrimestreState(t); onTrimestreChange?.(t); };
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (cancelled = { current: false }) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/api/v1/cursos/${course.id}/evaluaciones/${trimestre}`);
      if (!cancelled.current) setData(response.data?.data || null);
    } catch (requestError) {
      if (!cancelled.current) {
        setData(null);
        setError(primerMensaje(requestError, 'No fue posible cargar la Evaluación.'));
      }
    } finally {
      if (!cancelled.current) setLoading(false);
    }
  }, [course?.id, trimestre]);

  useEffect(() => {
    const cancelled = { current: false };
    load(cancelled);
    return () => { cancelled.current = true; };
  }, [load]);

  const evaluacion = data?.evaluacion || null;
  const ejercicios = data?.ejercicios || [];
  const estudiantes = data?.estudiantes || [];

  const siguientePendiente = buscarPendiente(estudiantes);

  return (
    <section className="flex flex-col gap-[18px]">
      <nav className="gl-crumbs" aria-label="Ruta">
        <button type="button" onClick={onBack}>{backLabel}</button>
        <span>/</span>
        <span>{course.nombre}</span>
      </nav>

      <div className="gl-head">
        <div>
          <h1 className="gl-h1">{readOnly ? course.nombre : `${course.nombre}: evaluación`}</h1>
          {readOnly && <p>{course.docente ? `${course.docente} · ` : ''}solo lectura</p>}
          {evaluacion
            ? <p>{textoNivel(evaluacion.nivel)}. Los 4 ejercicios se hacen juntos en la misma hoja. Tamaño de figura: {Number(evaluacion.tamano_figura_mm)} mm.</p>
            : <p>Trimestre {trimestre} sin Evaluación.</p>}
        </div>
        {!readOnly && onOpenCell && evaluacion && siguientePendiente && (
          <button type="button" className="gl-btn" onClick={() => onOpenCell({ evaluacion, trimestre, estudiante: siguientePendiente.estudiante, celda: siguientePendiente.celda })}>
            Continuar: {siguientePendiente.estudiante.nombre.split(' ')[0]}, {NOMBRE_EJERCICIO[siguientePendiente.celda.ejercicio]}
          </button>
        )}
      </div>

      <div className="gl-tabs" role="group" aria-label="Trimestre">
        {TRIMESTRES.map((t) => (
          <button key={t} type="button" aria-pressed={trimestre === t} onClick={() => setTrimestre(t)}>
            Trimestre {t}
          </button>
        ))}
      </div>

      {renderResumen?.(trimestre)}

      {loading ? (
        <p role="status" className="gl-card gl-muted">Cargando Evaluación…</p>
      ) : error ? (
        <div role="alert" className="gl-alert flex flex-wrap items-center justify-between gap-3">
          <span>{error}</span>
          <button type="button" className="gl-btn ghost" onClick={() => load()}>Reintentar</button>
        </div>
      ) : !evaluacion ? (
        <div className="gl-card">
          <h2 className="gl-h2">Todavía no hay Evaluación del Trimestre {trimestre}</h2>
          {readOnly
            ? <p className="gl-muted mt-1">La docente aún no creó esta Evaluación.</p>
            : <>
                <p className="gl-muted mt-1">Elige el nivel de las figuras y su tamaño. Se preparará una fila por estudiante con los 4 Ejercicios.</p>
                <CrearEvaluacionForm courseId={course.id} trimestre={trimestre} onCreated={() => load()} />
              </>}
        </div>
      ) : (
        <div className="gl-card">
          {readOnly && <h2 className="gl-h2 mb-3">Estudiantes</h2>}
          {estudiantes.length === 0 ? (
            <p className="gl-muted">Este curso no tiene estudiantes inscritos.</p>
          ) : (
            <div className="gl-scroll">
              <table className="gl-table">
                <thead>
                  <tr>
                    <th scope="col">Estudiante</th>
                    {ejercicios.map((ej) => <th key={ej.ejercicio} scope="col">{NOMBRE_EJERCICIO[ej.ejercicio] || ej.nombre}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {estudiantes.map((estudiante) => (
                    <tr key={estudiante.id_estudiante}>
                      <td>
                        {onOpenStudent
                          ? <button type="button" className="gl-link" onClick={() => onOpenStudent(estudiante)}>{estudiante.nombre}</button>
                          : <span className="font-semibold">{estudiante.nombre}</span>}
                      </td>
                      {estudiante.ejercicios.map((celda) => {
                        const valor = estadoCelda(celda);
                        const nombreEjercicio = NOMBRE_EJERCICIO[celda.ejercicio] || celda.nombre;
                        return (
                          <td key={celda.ejercicio}>
                            {!readOnly && onOpenCell
                              ? <button type="button" className="gl-cell" aria-label={`${estudiante.nombre}, ${nombreEjercicio}`} onClick={() => onOpenCell({ evaluacion, trimestre, estudiante, celda })}>
                                  <EvaluacionChip valor={valor} />
                                </button>
                              : <EvaluacionChip valor={valor} />}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <LeyendaEvaluacion soloLectura={readOnly} />
        </div>
      )}
    </section>
  );
}
