# MediSense AI – Human-Centered Symptom Intelligence & Medical Information Assistant

MediSense AI is a student-level healthcare decision-support application that converts natural-language symptom inputs into structured clinical entities, asks targeted adaptive questions with clinical rationales, evaluates emergency red-flag safety rules, runs a Scikit-Learn ML classifier for urgency scoring, retrieves evidence-grounded medical knowledge via Vector RAG, and generates printable PDF consultation reports.

> **DISCLAIMER:** MediSense AI is an educational health-information demonstration system and NOT a medical diagnostic tool or replacement for a licensed healthcare provider.

---

## 🌟 Key Features

1. **Natural Language Symptom Entity Extraction**:
   - Parses natural language text into 8 clinical slots (symptoms, location, quality, duration, severity, onset speed, triggers, associated indicators).
2. **Disease-Targeted Adaptive Questionnaire**:
   - Asks condition-specific follow-up questions (e.g. photophobia & unilateral location for headache; radiation & dyspnea for chest pain) with explicit *"Why am I asking this?"* clinical rationale.
3. **Emergency Red-Flag Safety Screening**:
   - Immediate screening for cardiac, cerebrovascular (stroke), respiratory distress, cauda equina, and severe neurological emergencies.
4. **Scikit-Learn ML Classifier**:
   - Supervised Random Forest Classifier (100 estimators) vs. Logistic Regression comparison trained on 160 clinical vectors (96.9% accuracy).
5. **Vector RAG Knowledge Retrieval**:
   - TF-IDF Vector Space Model & Cosine Similarity search over 10 medical categories with grounded evidence citations.
6. **Printable PDF Consultation Report Export**:
   - Exports formatted clinical reports including patient demographics, chief complaint, NLP entities, ML feature attributions, and provider discussion points.
7. **Evaluator Benchmark Suite**:
   - 10 pre-packaged clinical scenario test cases with 100% automated pass rate.

---

## 📁 Repository Structure

```text
minor ai project/
├── backend/
│   ├── app.py                 # FastAPI backend router & API endpoints
│   ├── nlp/nlp_engine.py      # NLP entity parser & adaptive question selector
│   ├── ml/                    # ML dataset generator, trainer & predictor
│   ├── rag/rag_engine.py      # Vector RAG TF-IDF retriever
│   ├── risk/risk_engine.py    # Emergency red-flag safety triage rules
│   ├── tests/test_suite.py    # Evaluator simulation test suite
│   └── knowledge_base.json    # Curated medical knowledge base
├── frontend/                  # React JSX modular components & PDF exporter
├── web_app.html               # Single-page enterprise clinical web interface
├── run.py                     # Convenience launcher script
└── README.md                  # Project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.9+
- `fastapi`, `uvicorn`, `scikit-learn`, `pydantic`, `pandas`, `numpy`

### Installation & Execution

1. **Clone Repository**:
   ```bash
   git clone https://github.com/Sreejith-manoj/medisense-ai.git
   cd medisense-ai
   ```

2. **Install Dependencies**:
   ```bash
   pip install fastapi uvicorn scikit-learn pydantic pandas numpy
   ```

3. **Start FastAPI Backend Server**:
   ```bash
   python backend/app.py
   ```
   *Server will run live on `http://127.0.0.1:8000/`*

4. **Access Web Application**:
   Open **`http://127.0.0.1:8000/`** in your web browser.
