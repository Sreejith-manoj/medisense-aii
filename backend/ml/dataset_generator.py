"""
MediSense AI - Synthetic Clinical Evaluation Dataset Generator
Generates 150 structured symptom training instances for scikit-learn model evaluation.
"""

import pandas as pd
import numpy as np
import random
import os

FEATURE_COLUMNS = [
    "symptom_code",         # 0:headache, 1:chest_pain, 2:dyspnea, 3:cough, 4:abdo_pain, 5:uti, 6:back_pain, 7:numbness, 8:fever, 9:other
    "duration_days",        # 1 to 30
    "severity_score",       # 1 to 10
    "sudden_onset",         # 0 or 1
    "fever_present",        # 0 or 1
    "breathing_difficulty", # 0 or 1
    "chest_pain_present",   # 0 or 1
    "confusion_present",    # 0 or 1
    "weakness_one_side",    # 0 or 1
    "bleeding_present",     # 0 or 1
    "loss_of_consciousness",# 0 or 1
    "radiating_pain"        # 0 or 1
]

TARGET_CLASSES = ["LOW", "MODERATE", "HIGH", "EMERGENCY"]

def generate_dataset(num_samples: int = 160) -> pd.DataFrame:
    np.random.seed(42)
    random.seed(42)

    data = []

    for i in range(num_samples):
        symptom_code = random.randint(0, 9)
        duration_days = random.randint(1, 14)
        severity_score = random.randint(1, 10)
        sudden_onset = random.choice([0, 1])
        fever_present = random.choice([0, 1])
        breathing_difficulty = random.choice([0, 1])
        chest_pain_present = 1 if symptom_code == 1 else random.choice([0, 0, 0, 1])
        confusion_present = random.choice([0, 0, 0, 1])
        weakness_one_side = 1 if symptom_code == 7 and random.random() > 0.5 else 0
        bleeding_present = random.choice([0, 0, 0, 1])
        loss_of_consciousness = random.choice([0, 0, 0, 1])
        radiating_pain = 1 if (chest_pain_present and random.random() > 0.4) else 0

        # Heuristic Rule Allocation for Ground Truth Urgency Target
        score = 0
        if chest_pain_present and (radiating_pain or breathing_difficulty or sudden_onset):
            urgency = "EMERGENCY"
        elif weakness_one_side or confusion_present or loss_of_consciousness:
            urgency = "EMERGENCY"
        elif sudden_onset and symptom_code == 0 and severity_score >= 8:
            urgency = "EMERGENCY"
        elif breathing_difficulty or severity_score >= 8 or (fever_present and duration_days > 5):
            urgency = "HIGH"
        elif severity_score >= 5 or fever_present or duration_days >= 3:
            urgency = "MODERATE"
        else:
            urgency = "LOW"

        row = {
            "symptom_code": symptom_code,
            "duration_days": duration_days,
            "severity_score": severity_score,
            "sudden_onset": sudden_onset,
            "fever_present": fever_present,
            "breathing_difficulty": breathing_difficulty,
            "chest_pain_present": chest_pain_present,
            "confusion_present": confusion_present,
            "weakness_one_side": weakness_one_side,
            "bleeding_present": bleeding_present,
            "loss_of_consciousness": loss_of_consciousness,
            "radiating_pain": radiating_pain,
            "urgency_level": urgency
        }
        data.append(row)

    df = pd.DataFrame(data)
    return df

if __name__ == "__main__":
    df = generate_dataset()
    save_path = os.path.join(os.path.dirname(__file__), "symptom_dataset.csv")
    df.to_csv(save_path, index=False)
    print(f"Generated synthetic dataset with {len(df)} samples saved to {save_path}")
    print("Class distribution:\n", df["urgency_level"].value_counts())
