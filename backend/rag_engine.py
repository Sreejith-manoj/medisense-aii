"""
RAG Engine for Symptom-to-Information Assistant
Includes built-in Pure Python TF-IDF Vectorizer & Cosine Similarity for zero external dependency runtime reliability.
"""

import json
import os
import math
import re
from typing import List, Dict, Any

class PurePythonTFIDF:
    """Pure Python TF-IDF and Cosine Similarity implementation."""
    def __init__(self, corpus: List[str]):
        self.corpus = corpus
        self.vocabulary = {}
        self.doc_freqs = {}
        self.tfidf_vectors = []

        # Tokenize and build vocabulary
        tokens_per_doc = [self._tokenize(doc) for doc in corpus]
        
        vocab_set = set()
        for doc_tokens in tokens_per_doc:
            vocab_set.update(doc_tokens)
            unique_in_doc = set(doc_tokens)
            for t in unique_in_doc:
                self.doc_freqs[t] = self.doc_freqs.get(t, 0) + 1

        self.vocabulary = {term: idx for idx, term in enumerate(sorted(vocab_set))}
        N = len(corpus)

        # Calculate TF-IDF vectors
        for doc_tokens in tokens_per_doc:
            vec = [0.0] * len(self.vocabulary)
            term_counts = {}
            for t in doc_tokens:
                term_counts[t] = term_counts.get(t, 0) + 1
            
            total_terms = len(doc_tokens) or 1
            for t, count in term_counts.items():
                if t in self.vocabulary:
                    tf = count / total_terms
                    idf = math.log((N + 1) / (self.doc_freqs.get(t, 0) + 1)) + 1.0
                    vec[self.vocabulary[t]] = tf * idf
            
            self.tfidf_vectors.append(vec)

    def _tokenize(self, text: str) -> List[str]:
        words = re.findall(r'\b[a-zA-Z]{2,}\b', text.lower())
        stopwords = {"a", "an", "the", "and", "or", "in", "on", "at", "to", "for", "with", "is", "was", "are", "were", "of", "it", "my", "have", "has", "had"}
        return [w for w in words if w not in stopwords]

    def transform_query(self, query: str) -> List[float]:
        tokens = self._tokenize(query)
        vec = [0.0] * len(self.vocabulary)
        term_counts = {}
        for t in tokens:
            term_counts[t] = term_counts.get(t, 0) + 1
        
        total_terms = len(tokens) or 1
        N = len(self.corpus)
        for t, count in term_counts.items():
            if t in self.vocabulary:
                tf = count / total_terms
                idf = math.log((N + 1) / (self.doc_freqs.get(t, 0) + 1)) + 1.0
                vec[self.vocabulary[t]] = tf * idf
        return vec

    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        dot = sum(a * b for a, b in zip(vec1, vec2))
        norm1 = math.sqrt(sum(a * a for a in vec1))
        norm2 = math.sqrt(sum(b * b for b in vec2))
        if norm1 == 0 or norm2 == 0:
            return 0.0
        return dot / (norm1 * norm2)

class RAGEngine:
    def __init__(self, kb_path: str = None):
        if kb_path is None:
            kb_path = os.path.join(os.path.dirname(__file__), "knowledge_base.json")
        
        with open(kb_path, "r", encoding="utf-8") as f:
            self.knowledge_base: List[Dict[str, Any]] = json.load(f)

        # Build corpus strings for indexing
        self.corpus = []
        for item in self.knowledge_base:
            combined_text = f"{item['title']} | {item['category']} | {' '.join(item['symptoms'])} | {item['content']} | {' '.join(item['self_care'])}"
            self.corpus.append(combined_text.lower())

        self.engine = PurePythonTFIDF(self.corpus)

    def retrieve(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        query_clean = query.lower()
        query_vec = self.engine.transform_query(query_clean)

        scored_items = []
        for idx, doc_vec in enumerate(self.engine.tfidf_vectors):
            score = self.engine.cosine_similarity(query_vec, doc_vec)
            item = self.knowledge_base[idx].copy()

            # Keyword match boost
            for sym in item["symptoms"]:
                if sym in query_clean:
                    score += 0.2

            item["similarity_score"] = float(round(score, 4))
            scored_items.append(item)

        scored_items.sort(key=lambda x: x["similarity_score"], reverse=True)
        return scored_items[:top_k]

    def synthesize_response(self, query: str, retrieved_passages: List[Dict[str, Any]], risk_assessment: Dict[str, Any]) -> Dict[str, Any]:
        if not retrieved_passages or retrieved_passages[0]["similarity_score"] < 0.02:
            return {
                "summary": "We could not find an exact medical match in our curated health database for your specific description.",
                "possible_considerations": ["General symptom presentation"],
                "home_self_care": ["Stay hydrated", "Get adequate rest", "Consult a physician for customized medical evaluation"],
                "sources": [],
                "grounded_text": "No specific medical reference passages matched with sufficient confidence score."
            }

        primary_match = retrieved_passages[0]
        possible_conditions = [p["title"] for p in retrieved_passages if p["similarity_score"] > 0.05]
        
        aggregated_self_care = []
        sources = []
        passages_summary = []

        for idx, passage in enumerate(retrieved_passages, 1):
            if passage["similarity_score"] < 0.02:
                continue
            
            citation_tag = f"[Source {idx}: {passage['source']}]"
            sources.append({
                "id": passage["id"],
                "title": passage["title"],
                "source_name": passage["source"],
                "url": passage["url"],
                "relevance_score": f"{min(int(passage['similarity_score'] * 100), 99)}%",
                "citation_tag": citation_tag
            })

            passages_summary.append(f"{passage['content']} {citation_tag}")
            for sc in passage.get("self_care", []):
                if sc not in aggregated_self_care:
                    aggregated_self_care.append(sc)

        synthesis_paragraphs = [
            f"Based on your symptom description, the most relevant medical topics identified in our curated health knowledge base are **{', '.join(possible_conditions)}**.",
            f"**Primary Overview**: {primary_match['content']} [Source 1: {primary_match['source']}]"
        ]

        if len(retrieved_passages) > 1 and retrieved_passages[1]["similarity_score"] > 0.05:
            sec = retrieved_passages[1]
            synthesis_paragraphs.append(f"**Related Reference**: {sec['title']} shares overlapping clinical features. {sec['content']} [Source 2: {sec['source']}]")

        grounded_response_text = "\n\n".join(synthesis_paragraphs)

        return {
            "primary_condition": primary_match["title"],
            "possible_considerations": possible_conditions,
            "grounded_text": grounded_response_text,
            "home_self_care": aggregated_self_care[:5],
            "sources": sources,
            "top_similarity_score": primary_match["similarity_score"]
        }

if __name__ == "__main__":
    rag = RAGEngine()
    matches = rag.retrieve("I have a throbbing headache with light sensitivity")
    print(f"Retrieved {len(matches)} passages:")
    for m in matches:
        print(f"- {m['title']} (Score: {m['similarity_score']})")
