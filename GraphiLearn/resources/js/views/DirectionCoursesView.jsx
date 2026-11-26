import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { GraduationCap, Users, CheckCircle2, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { primerMensaje } from '../utils/evaluacion';

/** "Cursos" de Dirección (GET /api/v1/direccion/cursos). Supervisión y Solo lectura. */
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

  // Cálculos de métricas globales institucionales
  const totalCursos = cursos.length;
  const totalEstudiantes = cursos.reduce((acc, c) => acc + (c.total_estudiantes || 0), 0);
  const totalCompletos = cursos.reduce((acc, c) => acc + (c.estudiantes_completos || 0), 0);
  const totalS = cursos.reduce((acc, c) => acc + (c.valoraciones?.S || 0), 0);
  const totalED = cursos.reduce((acc, c) => acc + (c.valoraciones?.ED || 0), 0);
  const totalNA = cursos.reduce((acc, c) => acc + (c.valoraciones?.NA || 0), 0);
  const totalValoraciones = totalS + totalED + totalNA || 1;

  return (
    <section className="flex flex-col gap-[18px]">
      <div className="gl-head">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Supervisión Institucional
            </span>
            <span className="text-xs text-slate-500 font-medium">Modo Solo Lectura</span>
          </div>
          <h1 className="gl-h1">Panel de Dirección y Cursos</h1>
          <p>Supervisión del avance de evaluación grafomotora de todas las aulas de la institución.</p>
        </div>
      </div>

      {/* Tarjetas de Métricas Institucionales */}
      {!loading && !error && cursos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="gl-card flex flex-col justify-between p-4">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold">Aulas / Cursos</span>
              <GraduationCap className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-2xl font-black text-slate-800">{totalCursos}</span>
            <span className="text-[11px] text-slate-500 mt-1">Cursos activos</span>
          </div>

          <div className="gl-card flex flex-col justify-between p-4">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold">Total Alumnos</span>
              <Users className="w-4 h-4 text-sky-600" />
            </div>
            <span className="text-2xl font-black text-slate-800">{totalEstudiantes}</span>
            <span className="text-[11px] text-slate-500 mt-1">Matriculados en inicial</span>
          </div>

          <div className="gl-card flex flex-col justify-between p-4">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold">Evaluados 100%</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-2xl font-black text-emerald-700">{totalCompletos}</span>
            <span className="text-[11px] text-slate-500 mt-1">Con los 4 ejercicios</span>
          </div>

          <div className="gl-card flex flex-col justify-between p-4">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold">Distribución S / ED / NA</span>
              <span className="text-[10px] font-mono text-slate-400">Institucional</span>
            </div>
            <div className="gl-stack my-1" aria-hidden="true">
              <span className="gl-sg-S" style={{ width: `${(totalS / totalValoraciones) * 100}%` }} title={`Superado: ${totalS}`} />
              <span className="gl-sg-ED" style={{ width: `${(totalED / totalValoraciones) * 100}%` }} title={`En Desarrollo: ${totalED}`} />
              <span className="gl-sg-NA" style={{ width: `${(totalNA / totalValoraciones) * 100}%` }} title={`Necesita Apoyo: ${totalNA}`} />
            </div>
            <span className="text-[11px] text-slate-600 font-semibold">
              S: {totalS} · ED: {totalED} · NA: {totalNA}
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <p role="status" className="gl-card gl-muted">Cargando cursos institucionales…</p>
      ) : error ? (
        <div role="alert" className="gl-alert flex flex-wrap items-center justify-between gap-3">
          <span>{error}</span>
          <button type="button" className="gl-btn ghost" onClick={load}>Reintentar</button>
        </div>
      ) : cursos.length === 0 ? (
        <p className="gl-card gl-muted">No hay cursos registrados en la institución.</p>
      ) : (
        <div className="gl-card">
          <div className="gl-scroll">
            <table className="gl-table">
              <thead>
                <tr>
                  <th scope="col">Curso / Nivel</th>
                  <th scope="col">Docente Asignado</th>
                  <th scope="col">Evaluación Completa</th>
                  <th scope="col">Progreso (S / ED / NA)</th>
                  <th scope="col" className="text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {cursos.map((c) => {
                  const v = c.valoraciones || { S: 0, ED: 0, NA: 0 };
                  const tot = v.S + v.ED + v.NA || 1;
                  return (
                    <tr key={c.id}>
                      <td>
                        <b className="text-slate-800">{c.curso}</b>
                        {c.trimestre ? (
                          <span className="gl-muted block text-[12px]">Trimestre {c.trimestre}</span>
                        ) : (
                          <span className="gl-muted block text-[12px]">Gestión 2026</span>
                        )}
                      </td>
                      <td>
                        <span className="font-medium text-slate-700">{c.docente || <span className="gl-muted italic">Sin docente</span>}</span>
                      </td>
                      <td>
                        {c.trimestre ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                            {c.estudiantes_completos ?? 0} de {c.total_estudiantes ?? 0} estudiantes
                          </span>
                        ) : (
                          <span className="gl-muted text-xs">Sin Evaluación</span>
                        )}
                      </td>
                      <td style={{ minWidth: 170 }}>
                        <div className="gl-stack" aria-hidden="true">
                          <span className="gl-sg-S" style={{ width: `${(v.S / tot) * 100}%` }} />
                          <span className="gl-sg-ED" style={{ width: `${(v.ED / tot) * 100}%` }} />
                          <span className="gl-sg-NA" style={{ width: `${(v.NA / tot) * 100}%` }} />
                        </div>
                        <span className="gl-muted text-xs font-mono mt-0.5 block">
                          S: {v.S} · ED: {v.ED} · NA: {v.NA}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="gl-btn ghost inline-flex items-center gap-1.5 text-xs py-1.5 px-3"
                          onClick={() => onOpenCourse({ id: c.id, nombre: c.curso, docente: c.docente, trimestre_actual: c.trimestre })}
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Ver cuadro</span>
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
