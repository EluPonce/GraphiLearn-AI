import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { primerMensaje } from '../utils/evaluacion';

/** "Cursos" de Dirección (GET /api/v1/direccion/cursos). Solo lectura. */
export default function DirectionCoursesView({ onOpenCourse }) {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/v1/direccion/cursos');
      setCursos(response.data?.data || []);
    } catch (requestError) {
      setError(primerMensaje(requestError, 'No fue posible cargar los cursos.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <section className="flex flex-col gap-[18px]">
      <div className="gl-head">
        <div>
          <h1 className="gl-h1">Cursos</h1>
          <p>Resumen por curso. Entra a un curso para ver a sus estudiantes. Solo lectura.</p>
        </div>
      </div>

      {loading ? <p role="status" className="gl-card gl-muted">Cargando cursos…</p>
        : error ? (
          <div role="alert" className="gl-alert flex flex-wrap items-center justify-between gap-3">
            <span>{error}</span>
            <button type="button" className="gl-btn ghost" onClick={load}>Reintentar</button>
          </div>
        ) : cursos.length === 0 ? <p className="gl-card gl-muted">No hay cursos en la institución.</p>
        : (
          <div className="gl-card">
            <div className="gl-scroll">
              <table className="gl-table">
                <thead>
                  <tr>
                    <th scope="col">Curso</th>
                    <th scope="col">Docente</th>
                    <th scope="col">Evaluación completa</th>
                    <th scope="col">S / ED / NA</th>
                    <th scope="col"><span className="sr-only">Acciones</span></th>
                  </tr>
                </thead>
                <tbody>
                  {cursos.map((c) => {
                    const v = c.valoraciones || { S: 0, ED: 0, NA: 0 };
                    const tot = v.S + v.ED + v.NA || 1;
                    return (
                      <tr key={c.id}>
                        <td><b>{c.curso}</b>{c.trimestre && <span className="gl-muted block text-[13px]">Trimestre {c.trimestre}</span>}</td>
                        <td>{c.docente || <span className="gl-muted">Sin docente</span>}</td>
                        <td>{c.trimestre ? `${c.estudiantes_completos ?? 0} de ${c.total_estudiantes ?? 0}` : <span className="gl-muted">Sin Evaluación</span>}</td>
                        <td style={{ minWidth: 180 }}>
                          <div className="gl-stack" aria-hidden="true">
                            <span className="gl-sg-S" style={{ width: `${(v.S / tot) * 100}%` }} />
                            <span className="gl-sg-ED" style={{ width: `${(v.ED / tot) * 100}%` }} />
                            <span className="gl-sg-NA" style={{ width: `${(v.NA / tot) * 100}%` }} />
                          </div>
                          <span className="gl-muted">{v.S} / {v.ED} / {v.NA}</span>
                        </td>
                        <td>
                          <button type="button" className="gl-btn ghost" onClick={() => onOpenCourse({ id: c.id, nombre: c.curso, docente: c.docente, trimestre_actual: c.trimestre })}>
                            Ver curso
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </section>
  );
}
