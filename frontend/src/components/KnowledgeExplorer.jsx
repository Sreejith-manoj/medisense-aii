import React, { useState, useEffect } from 'react';
import { Search, Database, BookOpen, ExternalLink } from 'lucide-react';
import { fetchKnowledgeBase } from '../services/api';

export default function KnowledgeExplorer() {
  const [kbData, setKbData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    loadKB();
  }, []);

  const loadKB = async () => {
    try {
      const res = await fetchKnowledgeBase();
      setKbData(res.documents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['ALL', ...new Set(kbData.map(d => d.category))];

  const filteredDocs = kbData.filter(doc => {
    const matchesCat = selectedCategory === 'ALL' || doc.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.symptoms.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
              Validated Health Dataset Repository
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">Curated Medical Reference Explorer</h2>
            <p className="text-slate-600 text-sm mt-1">
              Browse the curated dataset of medical guidelines (Mayo Clinic, CDC, WHO, MedlinePlus) indexed by our vector search engine.
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-sky-700">
            {kbData.length} Validated Passages
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medical terms, symptoms, or guidelines..."
              className="w-full bg-slate-50 border border-slate-300 focus:border-sky-600 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl px-4 py-3 outline-none"
          >
            {categories.map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Passages Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Loading knowledge base...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-sky-50 text-sky-700 border border-sky-200">
                    {doc.category}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                    doc.urgency_tier === 'EMERGENCY' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    Urgency: {doc.urgency_tier}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{doc.title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-3">{doc.content}</p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {doc.symptoms.map((sym, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                      #{sym}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Source: {doc.source}</span>
                <a href={doc.url} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline flex items-center gap-1 font-semibold">
                  Reference Link <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
