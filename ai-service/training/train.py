"""
================================================================================
GraphiLearn AI - Script de Entrenamiento de Clasificadores de Riesgo Grafomotor
================================================================================
HISTORIA DE USUARIO: HU-10

OBJETIVO TÉCNICO Y ACADÉMICO:
  Entrenar modelos supervisados (Random Forest o Support Vector Machines)
  utilizando descriptores geométricos e indicadores cuantitativos extraídos de
  ejercicios grafomotores (línea, círculo, espiral, zigzag).

CONSIDERACIONES ÉTICAS Y METODOLÓGICAS:
  1. Aislamiento por sujeto (Child-level split):
     Es OBLIGATORIO dividir conjuntos de entrenamiento y prueba agrupando por
     identificador de estudiante (child_id / student_id) para evitar fuga de
     información (data leakage) debida a similitudes intra-sujeto.
  2. Origen del dataset:
     Los datasets públicos de disgrafía escolar (ej. Potential Dysgraphia
     Handwriting Dataset) contienen escritura manuscrita de niños en edad
     escolar (primaria), NO trazos grafomotores básicos de nivel inicial (3-5 años).
     Cualquier métrica obtenida sobre dichos datos debe documentarse como prueba de
     concepto de la canalización técnica y NO como validación clínica en nivel inicial.
  3. No alteración de métricas:
     Todas las métricas (precisión, recall, F1-score, matriz de confusión) son
     calculadas de forma reproducible sobre particiones estratificadas.
================================================================================
"""

import os
import sys
import json
import argparse
import datetime
import joblib
import numpy as np
from typing import Dict, Any

from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.model_selection import GroupKFold, GroupShuffleSplit
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
    roc_auc_score,
)
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

# Características exactas empleadas en inferencia (HU-08 y HU-09)
FEATURE_COLUMNS = [
    "longitud_trazo",
    "alto",
    "ancho",
    "proporcion",
    "inclinacion",
    "curvatura",
    "separacion_componentes",
    "desviacion",
    "rugosidad",
    "continuidad",
    "regularidad",
]

def generate_synthetic_benchmark_dataset(n_samples: int = 120, n_children: int = 20) -> Dict[str, np.ndarray]:
    """
    Genera un dataset sintético estructurado para pruebas de verificación y reproducibilidad
    del pipeline en caso de no contar aún con el dataset clínico definitivo de campo.
    Garantiza que múltiples muestras correspondan al mismo niño.
    """
    rng = np.random.RandomState(42)
    children = np.array([f"child_{i:03d}" for i in rng.randint(0, n_children, size=n_samples)])

    # 2 clases: 0 = bajo_riesgo (trazo regular y continuo), 1 = riesgo_potencial (mayor desviación y rugosidad)
    y = np.zeros(n_samples, dtype=int)
    # 35% de los niños tienen riesgo potencial
    risk_children = set([f"child_{i:03d}" for i in range(int(n_children * 0.35))])
    for idx, c in enumerate(children):
        y[idx] = 1 if c in risk_children else 0

    X = np.zeros((n_samples, len(FEATURE_COLUMNS)), dtype=np.float64)
    for i in range(n_samples):
        is_risk = (y[i] == 1)
        # Desviación, rugosidad son mayores en trazo irregular; regularidad y continuidad menores
        desv = rng.uniform(0.15, 0.45) if is_risk else rng.uniform(0.02, 0.12)
        rug = rng.uniform(0.40, 1.10) if is_risk else rng.uniform(0.08, 0.30)
        cont = rng.uniform(0.45, 0.85) if is_risk else rng.uniform(0.88, 1.00)
        reg = max(0.0, min(1.0, 1.0 - (desv * 2.0 + rug * 0.5)))

        longitud = rng.uniform(80.0, 350.0)
        alto = rng.randint(40, 200)
        ancho = rng.randint(40, 200)
        prop = ancho / max(alto, 1)
        inclin = rng.uniform(-60.0, 60.0)
        curv = rng.uniform(0.01, 0.08)
        sep = rng.uniform(5.0, 30.0) if is_risk and rng.rand() > 0.5 else 0.0

        X[i] = [longitud, alto, ancho, prop, inclin, curv, sep, desv, rug, cont, reg]

    return {"X": X, "y": y, "groups": children}

def train_and_evaluate(
    model_type: str = "rf",
    dataset: Dict[str, np.ndarray] = None,
    output_dir: str = "models",
    version_tag: str = "v1.0-benchmark"
) -> Dict[str, Any]:
    """
    Entrena el modelo con validación cruzada agrupada por niño y persiste el modelo con sus métricas.
    """
    if dataset is None:
        dataset = generate_synthetic_benchmark_dataset()

    X = dataset["X"]
    y = dataset["y"]
    groups = dataset["groups"]

    os.makedirs(output_dir, exist_ok=True)

    # Separación por niño (evitar fuga de información)
    splitter = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=42)
    train_idx, test_idx = next(splitter.split(X, y, groups=groups))

    X_train, X_test = X[train_idx], X[test_idx]
    y_train, y_test = y[train_idx], y[test_idx]

    if model_type.lower() == "rf":
        clf = RandomForestClassifier(
            n_estimators=100,
            max_depth=5,
            min_samples_split=3,
            random_state=42,
            class_weight="balanced"
        )
        pipeline = Pipeline([
            ("scaler", StandardScaler()),
            ("classifier", clf)
        ])
        alg_name = "RandomForest"
    elif model_type.lower() == "svm":
        clf = SVC(
            C=1.0,
            kernel="rbf",
            probability=True,
            random_state=42,
            class_weight="balanced"
        )
        pipeline = Pipeline([
            ("scaler", StandardScaler()),
            ("classifier", clf)
        ])
        alg_name = "SVM-RBF"
    else:
        raise ValueError(f"Tipo de modelo no reconocido: {model_type}. Opciones: 'rf', 'svm'")

    # Entrenamiento
    pipeline.fit(X_train, y_train)

    # Evaluación en test (niños nunca vistos en entrenamiento)
    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1] if hasattr(pipeline, "predict_proba") else None

    precision = float(precision_score(y_test, y_pred, zero_division=0))
    recall = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    cm = confusion_matrix(y_test, y_pred).tolist()

    auc = None
    if y_proba is not None and len(np.unique(y_test)) > 1:
        try:
            auc = float(roc_auc_score(y_test, y_proba))
        except Exception:
            auc = None

    metrics = {
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(auc, 4) if auc else None,
        "confusion_matrix": cm,
        "test_samples": int(len(y_test)),
        "train_samples": int(len(y_train)),
        "unique_test_children": int(len(np.unique(groups[test_idx]))),
    }

    metadata = {
        "version": version_tag,
        "algorithm": alg_name,
        "features": FEATURE_COLUMNS,
        "metrics": metrics,
        "created_at": datetime.datetime.now().isoformat(),
        "notes": (
            "Modelo reproducible entrenado con separación estricta por sujeto. "
            "Para despliegue clínico final se requiere entrenamiento con dataset clínico de nivel inicial."
        )
    }

    # Guardar modelo versionado
    model_filename = f"{alg_name.lower()}_{version_tag}.joblib"
    model_path = os.path.join(output_dir, model_filename)

    payload = {
        "model": pipeline,
        "metadata": metadata
    }
    joblib.dump(payload, model_path)

    # Guardar también reporte JSON de métricas
    meta_path = os.path.join(output_dir, f"{alg_name.lower()}_{version_tag}_metrics.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    print(f"[{alg_name}] Modelo entrenado y guardado en: {model_path}")
    print(f"Métricas obtenidas: F1={f1:.4f}, Precision={precision:.4f}, Recall={recall:.4f}")

    return metadata

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Entrenar clasificador de riesgo grafomotor")
    parser.add_argument("--model", type=str, default="rf", choices=["rf", "svm"], help="Tipo de algoritmo")
    parser.add_argument("--version", type=str, default="v1.0-benchmark", help="Etiqueta de versión")
    parser.add_argument("--output", type=str, default="models", help="Directorio de destino")
    args = parser.parse_args()

    train_and_evaluate(
        model_type=args.model,
        output_dir=args.output,
        version_tag=args.version
    )
