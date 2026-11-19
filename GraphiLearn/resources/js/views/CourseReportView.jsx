import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LeyendaEvaluacion } from '../components/EvaluacionChip';
import { AVISO_SIN_DIAGNOSTICO, NOMBRE_EJERCICIO, primerMensaje, textoNivel } from '../utils/evaluacion';

const ORDEN_EJERCICIOS = ['linea', 'circulos', 'zigzag', 'espiral'];

function Barra({ conteo, total }) {
  const base = Math.max(1, total);
  return (
    <div className="gl-stack" aria-hidden="true">
      {['S', 'ED', 'NA'].map((k) => conteo[k] ? <span key={k} className={`gl-sg-${k}`} style={{ width: `${(conteo[k] / base) * 100}%` }} /> : null)}
    </div>
  );
}

/**
 * Resumen del curso para un trimestre (GET /api/v1/informes/curso/{id}?trimestre=t):
 * completitud, S/ED/NA por Ejercicio y estudiantes que requieren observación.
 * Lo usan la docente (Informes) y Dirección (curso en solo lectura).
 */
export function ResumenInforme({ courseId, trimestre, onOpenStudent, mostrarVacio = true }) {
  const [state, setState] = useState({ loading: true, error: '', informe: null, evaluacion: null });

  useEffect(() => {
    let cancelado = false;
    setState((s) => ({ ...s, loading: true, error: '' }));
    Promise.all([
      axios.get(`/api/v1/informes/curso/${courseId}`, { params: { trimestre } }),
      axios.get(`/api/v1/cursos/${courseId}/evaluaciones/${trimestre}`),
    ]).then(([informe, cuadro]) => {
      if (!cancelado) setState({ loading: false, error: '', informe: informe.data?.data || null, evaluacion: cuadro.data?.data?.evaluacion || null });
    }).catch((requestError) => {
      if (!cancelado) setState({ loading: false, error: primerMensaje(requestError, 'No fue posible cargar el informe.'), informe: null, evaluacion: null });
    });
    return () => { cancelado = true; };
  }, [courseId, trimestre]);

  const { loading, error, informe, evaluacion } = state;
  if (loading) return <p role="status" className="gl-card gl-muted">Cargando informe…</p>;
  if (error) return <p role="alert" className="gl-alert">{error}</p>;

  const total = informe?.completitud?.total_estudiantes ?? 0;
  const completos = informe?.completitud?.estudiantes_completos ?? 0;

  return (
    <>
      <p className="gl-note" role="note"><b>{AVISO_SIN_DIAGNOSTICO}.</b></p>
      {!evaluacion ? (
        mostrarVacio && <div className="gl-card"><p className="gl-muted">Todavía no hay Evaluación del Trimestre {trimestre}.</p></div>
      ) : (
        <>
          <div className="gl-card">
            <h2 className="gl-h2">Trimestre {trimestre} · {textoNivel(evaluacion.nivel)}</h2>
            <p className="gl-muted mt-1">{completos} de {total} estudiantes con los 4 ejercicios valorados</p>
            <div className="mt-3">
              {ORDEN_EJERCICIOS.map((token) => {
                const conteo = informe?.conteos?.[token] || { S: 0, ED: 0, NA: 0 };
                const falta = Math.max(0, total - conteo.S - conteo.ED - conteo.NA);
                return (
                  <div key={token} className="gl-rowx">
                    <b>{NOMBRE_EJERCICIO[token]}</b>
                    <div>
                      <Barra conteo={conteo} total={total} />
                      <p className="gl-muted mt-1">S {conteo.S} · ED {conteo.ED} · NA {conteo.NA} · falta valorar {falta}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <LeyendaEvaluacion incluirPendientes={false} />
          </div>

          <div className="gl-card">
            <h2 className="gl-h2">Requieren observación</h2>
            <p className="gl-muted mt-1">Estudiantes con NA en 2 o más ejercicios.</p>
            {informe?.requieren_observacion?.length ? (
              <ul className="gl-plain">
                {informe.requieren_observacion.map((e) => (
                  <li key={e.id}>
                    {onOpenStudent
                      ? <button type="button" className="gl-link" onClick={() => onOpenStudent({ id_estudiante: e.id, nombre: e.nombre })}>{e.nombre}</button>
                      : <b>{e.nombre}</b>}
                    : NA en {e.cantidad_NA} ejercicios
                  </li>
                ))}
              </ul>
            ) : <p className="gl-muted mt-2">Ningún estudiante por ahora.</p>}
          </div>
        </>
      )}
    </>
  );
}

/** Pantalla "Informes" de la docente: elige curso y trimestre. */
export default function CourseReportView({ onOpenStudent }) {
  const [cursos, setCursos] = useState([]);
  const [cursoId, setCursoId] = useState('');
  const [trimestre, setTrimestre] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/v1/cursos').then((response) => {
      const lista = response.data?.data || [];
      setCursos(lista);
      if (lista[0]) { setCursoId(String(lista[0].id)); setTrimestre(Number(lista[0].trimestre_actual) || 1); }
    }).catch((requestError) => setError(primerMensaje(requestError, 'No fue posible cargar tus cursos.')))
      .finally(() => setLoading(false));
  }, []);

  const curso = cursos.find((c) => String(c.id) === cursoId);

  return (
    <section className="flex flex-col gap-[18px]">
      <div className="gl-head">
        <div>
          <h1 className="gl-h1">Informes</h1>
          <p>Resumen del curso por trimestre. Útil para decidir dónde reforzar.</p>
        </div>
      </div>

      {loading ? <p role="status" className="gl-card gl-muted">Cargando cursos…</p>
        : error ? <p role="alert" className="gl-alert">{error}</p>
        : cursos.length === 0 ? <p className="gl-card gl-muted">No tienes cursos asignados.</p>
        : (
          <>
            <div className="flex flex-wrap items-end gap-4">
              <div className="gl-field" style={{ maxWidth: 320, flex: '1 1 220px' }}>
                <label htmlFor="informe-curso">Curso</label>
                <select id="informe-curso" value={cursoId} onChange={(e) => setCursoId(e.target.value)}>
                  {cursos.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="gl-tabs" role="group" aria-label="Trimestre">
                {[1, 2, 3].map((t) => (
                  <button key={t} type="button" aria-pressed={trimestre === t} onClick={() => setTrimestre(t)}>Trimestre {t}</button>
                ))}
              </div>
            </div>
            {curso && (
              <ResumenInforme
                key={`${curso.id}-${trimestre}`}
                courseId={curso.id}
                trimestre={trimestre}
                onOpenStudent={onOpenStudent ? (e) => onOpenStudent(e, curso) : undefined}
              />
            )}
          </>
        )}
    </section>
  );
}
