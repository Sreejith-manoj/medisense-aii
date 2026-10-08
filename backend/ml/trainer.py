"""
MediSense AI - Scikit-Learn Model Trainer & Evaluator
Trains Logistic Regression & Random Forest classifiers, computes empirical metrics and confusion matrices.
"""

import os
import sys
import json
import pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix

MODEL_DIR = os.path.dirname(__file__)
sys.path.insert(0, MODEL_DIR)

from dataset_generator import generate_dataset, FEATURE_COLUMNS, TARGET_CLASSES

def train_and_evaluate():
    dataset_path = os.path.join(MODEL_DIR, "symptom_dataset.csv")
    if not os.path.exists(dataset_path):
        df = generate_dataset(160)
        df.to_csv(dataset_path, index=False)
    else:
        df = pd.read_csv(dataset_path)

    X = df[FEATURE_COLUMNS]
    y = df["urgency_level"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)

    # 1. Logistic Regression
    lr_model = LogisticRegression(max_iter=500, random_state=42)
    lr_model.fit(X_train, y_train)
    y_pred_lr = lr_model.predict(X_test)

    acc_lr = float(accuracy_score(y_test, y_pred_lr))
    prec_lr, rec_lr, f1_lr, _ = precision_recall_fscore_support(y_test, y_pred_lr, average='weighted', zero_division=0)
    cm_lr = confusion_matrix(y_test, y_pred_lr, labels=TARGET_CLASSES).tolist()

    # 2. Random Forest Classifier
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_model.fit(X_train, y_train)
    y_pred_rf = rf_model.predict(X_test)

    acc_rf = float(accuracy_score(y_test, y_pred_rf))
    prec_rf, rec_rf, f1_rf, _ = precision_recall_fscore_support(y_test, y_pred_rf, average='weighted', zero_division=0)
    cm_rf = confusion_matrix(y_test, y_pred_rf, labels=TARGET_CLASSES).tolist()

    importances = rf_model.feature_importances_.tolist()
    feature_importance_dict = {feat: float(round(imp, 4)) for feat, imp in zip(FEATURE_COLUMNS, importances)}

    weights_path = os.path.join(MODEL_DIR, "model_weights.pkl")
    with open(weights_path, "wb") as f:
        pickle.dump(rf_model, f)

    evaluation_report = {
        "dataset_info": {
            "total_samples": len(df),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "features_count": len(FEATURE_COLUMNS),
            "classes": TARGET_CLASSES
        },
        "models": {
            "logistic_regression": {
                "name": "Logistic Regression",
                "accuracy": round(acc_lr, 4),
                "precision": round(float(prec_lr), 4),
                "recall": round(float(rec_lr), 4),
                "f1_score": round(float(f1_lr), 4),
                "confusion_matrix": cm_lr
            },
            "random_forest": {
                "name": "Random Forest Classifier (Selected)",
                "accuracy": round(acc_rf, 4),
                "precision": round(float(prec_rf), 4),
                "recall": round(float(rec_rf), 4),
                "f1_score": round(float(f1_rf), 4),
                "confusion_matrix": cm_rf,
                "feature_importances": feature_importance_dict
            }
        },
        "selected_model": "Random Forest Classifier",
        "limitation_disclaimer": "This model is trained on an educational clinical dataset for demonstration of AI/ML concepts and is NOT clinically validated for medical triage."
    }

    metrics_path = os.path.join(MODEL_DIR, "model_metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(evaluation_report, f, indent=2)

    return evaluation_report

if __name__ == "__main__":
    train_and_evaluate()
