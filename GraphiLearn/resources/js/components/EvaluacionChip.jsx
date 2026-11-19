import React from 'react';

const ETIQUETA = { 0: 'Sin foto', P: 'Foto lista', A: 'Analizada' };

/** Chip de estado de un Ejercicio: S, ED, NA, Analizada, Foto lista o Sin foto. */
export function EvaluacionChip({ valor }) {
  const clave = valor === undefined || valor === null ? 0 : valor;
  return <span className={`gl-chip gl-chip-${clave}`}>{ETIQUETA[clave] ?? clave}</span>;
}

/** Leyenda de los chips (texto del prototipo, con la nota pedagógica de ED). */
export function LeyendaEvaluacion({ incluirPendientes = true, soloLectura = false }) {
  const falta = soloLectura ? 'falta la valoración de la docente' : 'falta tu valoración';
  return (
    <div className="gl-legend">
      <span><EvaluacionChip valor="S" /> Satisfactorio</span>
      <span><EvaluacionChip valor="ED" /> En desarrollo — ED: en proceso de lograrlo, es lo esperable a esta edad</span>
      <span><EvaluacionChip valor="NA" /> Necesita apoyo</span>
      {incluirPendientes && <>
        <span><EvaluacionChip valor="A" /> Foto analizada, {falta}</span>
        <span><EvaluacionChip valor="P" /> Foto subida, {falta}</span>
        <span><EvaluacionChip valor={0} /> Sin foto</span>
      </>}
    </div>
  );
}
