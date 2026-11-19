// Textos y etiquetas compartidos del flujo de Evaluación (vocabulario: Evaluación, Ejercicio, Foto).
// Los textos siguen docs/graphilearn_prototipo.html.

export const FIGURAS_POR_NIVEL = {
  1: 'figuras grandes',
  2: 'figuras medianas',
  3: 'figuras pequeñas',
};

/** "Nivel 2: figuras medianas". Devuelve null si el nivel no es 1, 2 o 3. */
export function textoNivel(nivel) {
  const figuras = FIGURAS_POR_NIVEL[Number(nivel)];
  return figuras ? `Nivel ${nivel}: ${figuras}` : null;
}

/** Nombre corto de cada Ejercicio según el identificador que usa la API. */
export const NOMBRE_EJERCICIO = {
  linea: 'Línea recta',
  circulos: 'Círculos',
  zigzag: 'Zigzag',
  espiral: 'Espiral',
};

export const VALORACION_LARGA = {
  S: 'Satisfactorio',
  ED: 'En desarrollo',
  NA: 'Necesita apoyo',
};

/**
 * Estado visible de una celda del cuadro:
 *  S / ED / NA  → valorado
 *  'A'          → foto analizada, falta la valoración
 *  'P'          → foto subida sin análisis, falta la valoración
 *  0            → sin foto
 */
export function estadoCelda(celda) {
  if (!celda) return 0;
  if (['S', 'ED', 'NA'].includes(celda.valoracion)) return celda.valoracion;
  if (celda.estado === 'foto_lista') return celda.analisis_disponible ? 'A' : 'P';
  return 0;
}

/** Siguiente celda sin valorar del cuadro (orden: estudiante, luego Ejercicio). */
export function siguientePendiente(estudiantes, excluir = null) {
  for (const estudiante of estudiantes || []) {
    for (const celda of estudiante.ejercicios || []) {
      if (excluir && estudiante.id_estudiante === excluir.id_estudiante && celda.ejercicio === excluir.ejercicio) continue;
      if (!['S', 'ED', 'NA'].includes(celda.valoracion)) return { estudiante, celda };
    }
  }
  return null;
}

const recortar = (v) => Math.max(0, Math.min(1, v));
const numero = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : Number.isFinite(Number(v)) && v !== null && v !== '' ? Number(v) : null);

/**
 * Los 4 indicadores en escala 0–1 (más alto = mejor), a partir de los indicadores crudos de FastAPI:
 *  precisión   = 1 − desviación
 *  firmeza     = 1 − rugosidad / 1.5
 *  fluidez     = continuidad
 *  regularidad = regularidad
 * Un indicador ausente queda en null.
 */
export function indicadoresVisibles(crudos) {
  const c = crudos || {};
  const desviacion = numero(c.desviacion);
  const rugosidad = numero(c.rugosidad);
  const continuidad = numero(c.continuidad);
  const regularidad = numero(c.regularidad);
  return [
    { clave: 'precision', nombre: 'Precisión', detalle: 'Ajuste a la plantilla', valor: desviacion === null ? null : recortar(1 - desviacion) },
    { clave: 'firmeza', nombre: 'Firmeza', detalle: 'Suavidad del trazo', valor: rugosidad === null ? null : recortar(1 - rugosidad / 1.5) },
    { clave: 'fluidez', nombre: 'Fluidez', detalle: 'Continuidad del trazo', valor: continuidad === null ? null : recortar(continuidad) },
    { clave: 'regularidad', nombre: 'Regularidad', detalle: 'Uniformidad de la figura', valor: regularidad === null ? null : recortar(regularidad) },
  ];
}

/** Palabra del prototipo para un valor 0–1. */
export const palabraIndicador = (v) => (v >= 0.8 ? 'Alto' : v >= 0.6 ? 'Medio' : 'Bajo');

/**
 * Normaliza el análisis que llega del cuadro ({indicadores, sugerencia, aviso_pedagogico})
 * o de la subida de foto (modelo Analisis con detalles_computacionales).
 */
export function resumenAnalisis(analisis) {
  if (!analisis) return null;
  const sugerencia = ['S', 'ED', 'NA'].includes(analisis.sugerencia) ? analisis.sugerencia : null;
  const aviso = analisis.aviso_pedagogico ?? analisis.detalles_computacionales?.aviso_pedagogico ?? null;
  return { indicadores: indicadoresVisibles(analisis.indicadores), sugerencia, aviso };
}

/** Rúbrica por Ejercicio, tomada del prototipo. */
export const RUBRICA = {
  linea: { S: 'Sigue la línea de principio a fin con pocas salidas.', ED: 'Sigue la línea, pero se sale con frecuencia.', NA: 'Se aparta de la línea o no llega al final.' },
  circulos: { S: 'Repasa los círculos y los cierra.', ED: 'Repasa con irregularidades; algunos no cierran.', NA: 'No logra repasar o cerrar los círculos.' },
  zigzag: { S: 'Marca los ángulos y mantiene la dirección.', ED: 'Marca los ángulos con imprecisión.', NA: 'No sigue los cambios de dirección.' },
  espiral: { S: 'Mantiene el giro hacia el centro sin cortes.', ED: 'Gira con cortes o se aparta en algunas vueltas.', NA: 'No logra seguir el giro.' },
};

export const TEXTO_ED = 'ED: en proceso de lograrlo, es lo esperable a esta edad';
export const AVISO_SIN_DIAGNOSTICO = 'Esta herramienta apoya la observación; no emite diagnóstico';

/** Primer mensaje de error legible de una respuesta de la API. */
export function primerMensaje(error, porDefecto) {
  const data = error?.response?.data;
  const errores = data?.errors ? Object.values(data.errors).flat() : [];
  return errores[0] || data?.message || porDefecto;
}

export const NOTA_FIGURAS_TRIMESTRE = 'Las figuras son más chicas en cada trimestre. Mantener la valoración con figuras más pequeñas ya es avance.';
