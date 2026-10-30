import numpy as np

def zhang_suen_thinning(binary_image: np.ndarray, max_iters: int = 100) -> np.ndarray:
    """
    Algoritmo de esqueletización de Zhang-Suen (1984).
    Reduce componentes conexos a trazos de exactamente 1 píxel de grosor,
    preservando la conectividad topológica original.

    Entrada:
      binary_image: Array 2D (uint8 o bool) donde 255 (o >0) es el trazo y 0 es el fondo.
      max_iters: Límite de iteraciones para evitar bucles en casos anómalos.

    Salida:
      Array 2D uint8 con 255 en el esqueleto de 1px y 0 en el fondo.
    """
    # Normalizar a 0 y 1 con tipo uint8
    im = (binary_image > 0).astype(np.uint8)

    # Si la imagen está vacía, retornar imagen vacía
    if not np.any(im):
        return np.zeros_like(binary_image, dtype=np.uint8)

    # Agregar padding de 1 pixel para evitar problemas de bordes
    padded = np.pad(im, pad_width=1, mode='constant', constant_values=0)

    for _ in range(max_iters):
        # 8 vecinos en orden de las agujas del reloj:
        # P9 P2 P3
        # P8 P1 P4
        # P7 P6 P5
        P2 = padded[:-2, 1:-1]
        P3 = padded[:-2, 2:]
        P4 = padded[1:-1, 2:]
        P5 = padded[2:, 2:]
        P6 = padded[2:, 1:-1]
        P7 = padded[2:, :-2]
        P8 = padded[1:-1, :-2]
        P9 = padded[:-2, :-2]
        P1 = padded[1:-1, 1:-1]

        # Condición B(P1): número de vecinos no cero entre 2 y 6
        B = P2 + P3 + P4 + P5 + P6 + P7 + P8 + P9
        cond_b = (B >= 2) & (B <= 6)

        # Condición A(P1): número de transiciones 0 -> 1 en la secuencia cíclica P2..P9, P2
        A = (
            ((P2 == 0) & (P3 == 1)).astype(np.uint8) +
            ((P3 == 0) & (P4 == 1)).astype(np.uint8) +
            ((P4 == 0) & (P5 == 1)).astype(np.uint8) +
            ((P5 == 0) & (P6 == 1)).astype(np.uint8) +
            ((P6 == 0) & (P7 == 1)).astype(np.uint8) +
            ((P7 == 0) & (P8 == 1)).astype(np.uint8) +
            ((P8 == 0) & (P9 == 1)).astype(np.uint8) +
            ((P9 == 0) & (P2 == 1)).astype(np.uint8)
        )
        cond_a = (A == 1)

        # Sub-iteración 1
        c1 = (P2 * P4 * P6) == 0
        d1 = (P4 * P6 * P8) == 0
        del1 = (P1 == 1) & cond_b & cond_a & c1 & d1

        padded[1:-1, 1:-1][del1] = 0

        # Actualizar vecinos para la Sub-iteración 2
        P2 = padded[:-2, 1:-1]
        P3 = padded[:-2, 2:]
        P4 = padded[1:-1, 2:]
        P5 = padded[2:, 2:]
        P6 = padded[2:, 1:-1]
        P7 = padded[2:, :-2]
        P8 = padded[1:-1, :-2]
        P9 = padded[:-2, :-2]
        P1 = padded[1:-1, 1:-1]

        B = P2 + P3 + P4 + P5 + P6 + P7 + P8 + P9
        cond_b = (B >= 2) & (B <= 6)

        A = (
            ((P2 == 0) & (P3 == 1)).astype(np.uint8) +
            ((P3 == 0) & (P4 == 1)).astype(np.uint8) +
            ((P4 == 0) & (P5 == 1)).astype(np.uint8) +
            ((P5 == 0) & (P6 == 1)).astype(np.uint8) +
            ((P6 == 0) & (P7 == 1)).astype(np.uint8) +
            ((P7 == 0) & (P8 == 1)).astype(np.uint8) +
            ((P8 == 0) & (P9 == 1)).astype(np.uint8) +
            ((P9 == 0) & (P2 == 1)).astype(np.uint8)
        )
        cond_a = (A == 1)

        # Sub-iteración 2
        c2 = (P2 * P4 * P8) == 0
        d2 = (P2 * P6 * P8) == 0
        del2 = (P1 == 1) & cond_b & cond_a & c2 & d2

        padded[1:-1, 1:-1][del2] = 0

        if not np.any(del1) and not np.any(del2):
            break

    # Remover padding y retornar escala 0-255
    skeleton = padded[1:-1, 1:-1] * 255
    return skeleton.astype(np.uint8)
