
import React, { useState, useRef } from 'react';
import { fetchCurrentAffairs, generateSpeech } from '../services/geminiService';

export const Affairs: React.FC<{onBack: () => void}> = ({ onBack }) => {
  const [lang, setLang] = useState('English');
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const loadNews = async (l: string) => {
    setLang(l);
    setLoading(true);
    setContent(null);
    try {
      const res = await fetchCurrentAffairs(l);
      setContent(res.text);
    } catch (e) { alert("Failed to fetch news."); }
    finally { setLoading(false); }
  };

  const playAudio = async () => {
    if (isPlaying) {
      sourceRef.current?.stop();
      setIsPlaying(false);
      return;
    }
    if (!content) return;
    setIsPlaying(true);
    try {
      const base64 = await generateSpeech(content);
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const dataInt16 = new Int16Array(bytes.buffer);
      const buffer = audioCtxRef.current.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
      const source = audioCtxRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtxRef.current.destination);
      source.onended = () => setIsPlaying(false);
      source.start(0);
      sourceRef.current = source;
    } catch (e) { setIsPlaying(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      <button onClick={onBack} className="mb-8 flex items-center text-slate-500 dark:text-slate-400 font-bold">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2"/></svg> Back
      </button>

      {!content && !loading ? (
        <div className="text-center">
          <h1 className="text-4xl font-black mb-12 dark:text-white">Choose Language</h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {['Kannada', 'English', 'Hindi', 'Spanish', 'French'].map(l => (
              <button key={l} onClick={() => loadNews(l)} className="p-12 rounded-[2.5rem] bg-white dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-800 hover:border-indigo-500 transition-all font-black text-2xl dark:text-white">
                {l}
              </button>
            ))}
          </div>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center py-32 animate-pulse">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-2xl font-black dark:text-white">Syncing Global Affairs...</h2>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
          <div className="p-8 bg-indigo-50 dark:bg-indigo-900/20 border-b flex justify-between items-center">
             <div>
               <h3 className="font-black text-xl text-indigo-900 dark:text-indigo-200">{lang} Edition</h3>
               <p className="text-xs font-bold text-indigo-400">DAILY CURRENT AFFAIRS</p>
             </div>
             <button onClick={playAudio} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:scale-105 transition-all">
                {isPlaying ? '⏹ STOP' : '🔊 LISTEN'}
             </button>
          </div>
          <div className="p-12 markdown-content whitespace-pre-wrap leading-relaxed">
            {content}
          </div>
          <div className="p-8 bg-slate-50 dark:bg-slate-800/50 flex justify-center">
             <button onClick={() => setContent(null)} className="font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest text-xs">Switch Language</button>
          </div>
        </div>
      )}
    </div>
  );
};
