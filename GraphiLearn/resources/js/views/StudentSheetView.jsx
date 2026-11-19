import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { EvaluacionChip } from '../components/EvaluacionChip';
import { FIGURAS_POR_NIVEL, NOMBRE_EJERCICIO, NOTA_FIGURAS_TRIMESTRE, primerMensaje } from '../utils/evaluacion';

const TRIMESTRES = [1, 2, 3];

/** Valor del chip para una celda de la ficha, o null si ese trimestre aún no se evaluó. */
function valorFicha(celda) {
  if (!celda || !celda.estado) return null;
  if (['S', 'ED', 'NA'].includes(celda.valoracion)) return celda.valoracion;
  if (celda.estado === 'foto_lista') return 'P';
  return 0;
}

/**
 * Ficha del estudiante: Ejercicio × T1, T2, T3 con la valoración y la observación de cada celda.
 * Solo lectura para docente y Dirección (las observaciones se registran al valorar).
 */
export default function StudentSheetView({ studentId, rootLabel, onBackRoot, courseName, onBackCourse }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/api/v1/estudiantes/${studentId}/ficha`);
      setData(response.data?.data || null);
    } catch (requestError) {
      setError(primerMensaje(requestError, 'No fue posible cargar la ficha.'));
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  const estudiante = data?.estudiante;
  const nombreCurso = estudiante?.curso?.nombre || courseName;
  const encabezado = (t) => {
    const nivel = data?.trimestres?.[`T${t}`]?.nivel ?? t;
    const figuras = FIGURAS_POR_NIVEL[nivel]?.replace('figuras ', '');
    return figuras ? `T${t} · ${figuras}` : `T${t}`;
  };

  return (
    <section className="flex flex-col gap-[18px]">
      <nav className="gl-crumbs" aria-label="Ruta">
        <button type="button" onClick={onBackRoot}>{rootLabel}</button>
        {nombreCurso && <><span>/</span>{onBackCourse ? <button type="button" onClick={onBackCourse}>{nombreCurso}</button> : <span>{nombreCurso}</span>}</>}
        <span>/</span>
        <span>{estudiante?.nombre || 'Ficha'}</span>
      </nav>

      {loading && !data ? (
        <p role="status" className="gl-card gl-muted">Cargando ficha…</p>
      ) : error ? (
        <div role="alert" className="gl-alert flex flex-wrap items-center justify-between gap-3">
          <span>{error}</span>
          <button type="button" className="gl-btn ghost" onClick={load}>Reintentar</button>
        </div>
      ) : data && (
        <>
          <div className="gl-head">
            <div>
              <h1 className="gl-h1">{estudiante.nombre}</h1>
              {nombreCurso && <p>{nombreCurso}</p>}
            </div>
          </div>

          <div className="gl-card">
            <h2 className="gl-h2">Valoración por trimestre</h2>
            <div className="gl-scroll mt-3">
              <table className="gl-table">
                <thead>
                  <tr>
                    <th scope="col">Ejercicio</th>
                    {TRIMESTRES.map((t) => <th key={t} scope="col">{encabezado(t)}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {data.ejercicios.map((fila) => (
                    <tr key={fila.ejercicio}>
                      <td className="font-semibold">{NOMBRE_EJERCICIO[fila.ejercicio] || fila.nombre}</td>
                      {TRIMESTRES.map((t) => {
                        const celda = fila[`T${t}`];
                        const valor = valorFicha(celda);
                        return (
                          <td key={t}>
                            {valor === null ? <span className="gl-muted">Aún no evaluado</span> : <EvaluacionChip valor={valor} />}
                            {celda?.observacion && <span className="gl-obs-cell">{celda.observacion}</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="gl-note mt-[14px]">{NOTA_FIGURAS_TRIMESTRE}</p>
          </div>

          <div className="gl-card">
            <h2 className="gl-h2">Observaciones</h2>
            {data.observaciones.length === 0 ? (
              <p className="gl-muted mt-2">Todavía no hay observaciones.</p>
            ) : data.observaciones.map((obs) => (
              <p key={obs.id} className="mt-[10px]">
                {obs.trimestre && <span className="gl-chip gl-chip-P">T{obs.trimestre}</span>}{' '}
                {obs.ejercicio && <b>{NOMBRE_EJERCICIO[obs.ejercicio]}: </b>}
                {obs.texto}
                {obs.autor && <span className="gl-muted"> · {obs.autor.nombre}</span>}
              </p>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
