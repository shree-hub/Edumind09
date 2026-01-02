
import React, { useState } from 'react';
import { generateAdvancedNotes } from '../services/geminiService';

export const Notes: React.FC<{onBack: () => void}> = ({ onBack }) => {
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState<'standard' | 'upsc'>('standard');
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const res = await generateAdvancedNotes(topic, depth);
      setContent(res);
    } catch (e) { alert("Generation failed."); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      <button onClick={onBack} className="mb-8 flex items-center text-slate-500 dark:text-slate-400 font-bold">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2"/></svg> Back
      </button>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 mb-12">
        <h1 className="text-3xl font-black mb-8 dark:text-white">AI Note Taker</h1>
        <div className="flex flex-col gap-6">
          <input 
            type="text" 
            value={topic} 
            onChange={e => setTopic(e.target.value)}
            placeholder="What do you want to learn? (e.g. Quantum Physics, Gupta Empire)" 
            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
          />
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
            <span className="font-black text-slate-700 dark:text-slate-300">Advanced Analysis (UPSC Depth)</span>
            <button 
              onClick={() => setDepth(depth === 'upsc' ? 'standard' : 'upsc')}
              className={`w-14 h-8 rounded-full transition-all relative ${depth === 'upsc' ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${depth === 'upsc' ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
          <button 
            onClick={generate} 
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Synthesizing...' : 'Generate Notes'}
          </button>
        </div>
      </div>

      {content && (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 markdown-content whitespace-pre-wrap leading-relaxed">
           {content}
        </div>
      )}
    </div>
  );
};
