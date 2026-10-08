/**
 * API client service for communicating with FastAPI backend endpoints.
 */

const API_BASE = '/api';

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    console.warn('Backend health check warning:', err.message);
    return null;
  }
}

export async function analyzeSymptoms(text, userContext = null) {
  const res = await fetch(`${API_BASE}/analyze-symptoms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, user_context: userContext })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: 'Analysis failed' }));
    throw new Error(errData.detail || 'Failed to analyze symptoms');
  }

  return await res.json();
}

export async function synthesizeRAG(initialText, context) {
  const res = await fetch(`${API_BASE}/synthesize-rag`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initial_text: initialText, context })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: 'RAG Synthesis failed' }));
    throw new Error(errData.detail || 'Failed to generate RAG response');
  }

  return await res.json();
}

export async function fetchKnowledgeBase() {
  const res = await fetch(`${API_BASE}/knowledge-base`);
  if (!res.ok) throw new Error('Failed to load knowledge base');
  return await res.json();
}

export async function fetchModelPerformance() {
  const res = await fetch(`${API_BASE}/model-performance`);
  if (!res.ok) throw new Error('Failed to load ML model performance metrics');
  return await res.json();
}

export async function fetchSimulationTests() {
  const res = await fetch(`${API_BASE}/simulation-tests`);
  if (!res.ok) throw new Error('Failed to run evaluator simulation suite');
  return await res.json();
}

export async function generateDoctorReport(payload) {
  const res = await fetch(`${API_BASE}/generate-doctor-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error('Failed to generate doctor report');
  return await res.json();
}
