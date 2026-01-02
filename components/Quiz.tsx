
import React, { useState } from 'react';
import { generateAdvancedQuiz } from '../services/geminiService';
import { QuizQuestion } from '../types';

export const Quiz: React.FC<{onBack: () => void}> = ({ onBack }) => {
  const [topic, setTopic] = useState('');
  const [exam, setExam] = useState('UPSC CSE');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [phase, setPhase] = useState<'config' | 'active' | 'result'>('config');

  const start = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const res = await generateAdvancedQuiz({ topic, exam, difficulty: 'Medium', count: 5 });
      setQuestions(res);
      setAnswers(new Array(res.length).fill(-1));
      setPhase('active');
    } catch (e) { alert("Test engine failed."); }
    finally { setLoading(false); }
  };

  const score = questions ? questions.reduce((acc, q, i) => acc + (answers[i] === q.correctAnswerIndex ? 1 : 0), 0) : 0;

  if (phase === 'config') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 animate-in fade-in duration-500">
        <button onClick={onBack} className="mb-8 flex items-center text-slate-500 dark:text-slate-400 font-bold">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2"/></svg> Back
        </button>
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-xl border dark:border-slate-800">
          <h1 className="text-3xl font-black mb-8 dark:text-white">Exam Simulator</h1>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Target Exam</label>
              <select value={exam} onChange={e => setExam(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border dark:border-slate-700 outline-none font-bold">
                <option>UPSC CSE</option>
                <option>JEE Mains</option>
                <option>NEET</option>
                <option>General Academic</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Topic</label>
              <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Indian National Movement" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border dark:border-slate-700 outline-none font-bold" />
            </div>
            <button onClick={start} disabled={loading} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black shadow-xl hover:bg-emerald-700 transition-all">
              {loading ? 'Crafting Questions...' : 'Start Mock Test'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'active' && questions) {
    const q = questions[currentIndex];
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-10">
          <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">{exam}</span>
          <span className="font-black text-slate-400 uppercase tracking-widest text-xs">Question {currentIndex + 1} of {questions.length}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl border dark:border-slate-800">
          <h3 className="text-xl font-black mb-8 dark:text-white leading-relaxed">{q.question}</h3>
          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <button 
                key={i} 
                onClick={() => { const na = [...answers]; na[currentIndex] = i; setAnswers(na); }}
                className={`w-full text-left p-6 rounded-2xl border-4 transition-all flex items-center gap-4 font-bold ${answers[currentIndex] === i ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-800'}`}
              >
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${answers[currentIndex] === i ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300 text-slate-400'}`}>
                  {String.fromCharCode(65 + i)}
                </div>
                {opt}
              </button>
            ))}
          </div>
          <div className="mt-12 flex justify-between">
            <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} className="px-8 py-3 font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600">Prev</button>
            <button 
              onClick={() => currentIndex === questions.length - 1 ? setPhase('result') : setCurrentIndex(currentIndex + 1)}
              className="bg-indigo-600 text-white px-12 py-3 rounded-xl font-black shadow-lg"
            >
              {currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
       <div className="text-center mb-12">
          <h2 className="text-4xl font-black mb-4 dark:text-white">Analysis Complete</h2>
          <p className="text-2xl font-black text-indigo-600">Final Score: {score} / {questions?.length}</p>
       </div>
       <div className="space-y-6">
          {questions?.map((q, i) => (
            <div key={i} className={`p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-l-8 ${answers[i] === q.correctAnswerIndex ? 'border-l-green-500' : 'border-l-red-500'} shadow-xl`}>
               <h4 className="font-black text-lg mb-4 dark:text-white">{i + 1}. {q.question}</h4>
               <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl italic text-sm text-slate-600 dark:text-slate-300">
                 {q.explanation}
               </div>
            </div>
          ))}
       </div>
       <button onClick={() => setPhase('config')} className="mt-12 w-full py-5 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-widest shadow-xl">Start New Test</button>
    </div>
  );
};
