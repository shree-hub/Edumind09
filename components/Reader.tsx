
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Book, ToolType, AnnotationPath, QuizQuestion, StudyNote } from '../types';
import { AnnotationLayer } from './AnnotationLayer';
import { generateStudyNotes, generateMockTest } from '../services/geminiService';

declare const pdfjsLib: any;

interface ReaderProps {
  book: Book;
  onBack: () => void;
}

export const Reader: React.FC<ReaderProps> = ({ book, onBack }) => {
  const [pdf, setPdf] = useState<any>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [tool, setTool] = useState<ToolType>('pencil');
  const [color, setColor] = useState('#3b82f6');
  const [annotations, setAnnotations] = useState<AnnotationPath[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'notes' | 'quiz'>('notes');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<StudyNote | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [quizScore, setQuizScore] = useState<{current: number, total: number} | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const loadingTask = pdfjsLib.getDocument(book.dataUrl);
    loadingTask.promise.then((pdfInstance: any) => {
      setPdf(pdfInstance);
      setNumPages(pdfInstance.numPages);
    });

    const saved = localStorage.getItem(`annotations_${book.id}`);
    if (saved) setAnnotations(JSON.parse(saved));
  }, [book.id, book.dataUrl]);

  const renderPage = useCallback(async () => {
    if (!pdf || !canvasRef.current) return;

    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    await page.render(renderContext).promise;
  }, [pdf, pageNumber, scale]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  const handleSaveAnnotation = (newPath: AnnotationPath) => {
    const updated = [...annotations, newPath];
    setAnnotations(updated);
    localStorage.setItem(`annotations_${book.id}`, JSON.stringify(updated));
  };

  const clearAnnotations = () => {
    if (window.confirm('Clear all annotations on this page?')) {
      const filtered = annotations.filter(a => a.pageIndex !== pageNumber - 1);
      setAnnotations(filtered);
      localStorage.setItem(`annotations_${book.id}`, JSON.stringify(filtered));
    }
  };

  const extractPageText = async () => {
    if (!pdf) return "";
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    return content.items.map((item: any) => item.str).join(" ");
  };

  const handleGenerateNotes = async () => {
    setLoading(true);
    setSidebarOpen(true);
    setSidebarTab('notes');
    try {
      const text = await extractPageText();
      const generatedNotes = await generateStudyNotes(text);
      setNotes(generatedNotes);
    } catch (error) {
      console.error(error);
      alert('Failed to generate notes. Check API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setLoading(true);
    setSidebarOpen(true);
    setSidebarTab('quiz');
    setQuizScore(null);
    try {
      const text = await extractPageText();
      const questions = await generateMockTest(text, 5, 'Medium');
      setQuiz(questions);
    } catch (error) {
      console.error(error);
      alert('Failed to generate quiz.');
    } finally {
      setLoading(false);
    }
  };

  const downloadNotes = () => {
    if (!notes) return;
    const element = document.createElement("a");
    const contentStr = Array.isArray(notes.content) ? notes.content.join('\n') : notes.content;
    const file = new Blob([`${notes.title}\n\n${contentStr}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${notes.title}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-black text-indigo-900 dark:text-indigo-200 mt-6 mb-3">{line.replace('# ', '')}</h1>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold text-indigo-800 dark:text-indigo-300 mt-5 mb-2 border-b dark:border-slate-800 pb-1">{line.replace('## ', '')}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-md font-bold text-indigo-700 dark:text-indigo-400 mt-4 mb-2">{line.replace('### ', '')}</h3>;
      if (line.startsWith('* ') || line.startsWith('- ')) return <li key={i} className="ml-4 list-disc text-sm text-slate-700 dark:text-slate-300 mb-1">{line.replace(/^[*-]\s/, '')}</li>;
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="text-sm text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 transition-colors">
      <header className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 px-4 py-2 flex items-center justify-between shadow-sm z-30">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="font-bold text-slate-800 dark:text-white truncate max-w-[200px] md:max-w-md">{book.name}</h1>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded shadow-sm transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 12H4" strokeWidth="2" strokeLinecap="round"/></svg></button>
            <span className="px-2 text-xs font-bold self-center dark:text-slate-300">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => Math.min(3, s + 0.2))} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded shadow-sm transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round"/></svg></button>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber <= 1} className="p-1 disabled:opacity-30 dark:text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2"/></svg>
            </button>
            <span className="px-3 text-xs font-bold self-center dark:text-slate-300">{pageNumber} / {numPages}</span>
            <button onClick={() => setPageNumber(p => Math.min(numPages, p + 1))} disabled={pageNumber >= numPages} className="p-1 disabled:opacity-30 dark:text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2"/></svg>
            </button>
          </div>
        </div>

        <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`p-2 rounded-lg transition-colors ${sidebarOpen ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-slate-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2"/></svg>
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border dark:border-slate-800 p-2 flex flex-col gap-3 z-20">
          <button onClick={() => setTool('pencil')} className={`p-3 rounded-xl transition-all ${tool === 'pencil' ? 'bg-blue-500 text-white scale-110' : 'dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <button onClick={() => setTool('highlighter')} className={`p-3 rounded-xl transition-all ${tool === 'highlighter' ? 'bg-amber-400 text-white scale-110' : 'dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </button>
          <button onClick={() => setTool('eraser')} className={`p-3 rounded-xl transition-all ${tool === 'eraser' ? 'bg-pink-500 text-white scale-110' : 'dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
          <div className="h-px bg-slate-200 dark:bg-slate-800 mx-2" />
          {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#000000'].map(c => (
            <button key={c} onClick={() => setColor(c)} className={`w-5 h-5 rounded-full mx-auto border-2 ${color === c ? 'scale-125 border-slate-400' : 'border-transparent'}`} style={{ backgroundColor: c }} />
          ))}
        </div>

        <div className="flex-1 bg-slate-100 dark:bg-slate-950 overflow-auto p-8 flex justify-center no-scrollbar">
          <div className="relative shadow-2xl bg-white h-fit">
            <canvas ref={canvasRef} />
            <AnnotationLayer pageIndex={pageNumber - 1} width={canvasRef.current?.width || 0} height={canvasRef.current?.height || 0} tool={tool} color={color} onSave={handleSaveAnnotation} existingAnnotations={annotations} />
          </div>
        </div>

        <aside className={`bg-white dark:bg-slate-900 border-l dark:border-slate-800 transition-all duration-300 overflow-y-auto shadow-2xl ${sidebarOpen ? 'w-[400px] p-8' : 'w-0'}`}>
          <div className="flex flex-col h-full min-w-[336px]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-800 dark:text-white">AI Assistant</h2>
              <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl dark:text-slate-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2"/></svg>
              </button>
            </div>

            <div className="flex gap-2 mb-8 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
              <button onClick={() => setSidebarTab('notes')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${sidebarTab === 'notes' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-300' : 'text-slate-400'}`}>Study Notes</button>
              <button onClick={() => setSidebarTab('quiz')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${sidebarTab === 'quiz' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-300' : 'text-slate-400'}`}>Mock Test</button>
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="font-bold text-slate-500">Crafting high-depth content...</p>
              </div>
            ) : (
              <div className="flex-1">
                {sidebarTab === 'notes' ? (
                  <div className="space-y-6">
                    {!notes ? (
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-[2rem] text-center border border-indigo-100 dark:border-indigo-900/30">
                        <p className="text-indigo-900 dark:text-indigo-200 font-bold mb-6">Analyze this page with UPSC-standard AI logic.</p>
                        <button onClick={handleGenerateNotes} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">GENERATE NOTES</button>
                      </div>
                    ) : (
                      <div className="animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-black text-slate-800 dark:text-white">{notes.title}</h3>
                          <button onClick={downloadNotes} className="text-xs font-black text-indigo-600 uppercase tracking-widest">Download</button>
                        </div>
                        <div className="markdown-content">
                          {renderMarkdown(Array.isArray(notes.content) ? notes.content.join('\n') : notes.content)}
                        </div>
                        <button onClick={handleGenerateNotes} className="mt-10 w-full py-4 border-2 border-slate-100 dark:border-slate-800 text-xs font-black uppercase tracking-widest text-slate-400 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800">Regenerate Analysis</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {!quiz ? (
                      <div className="bg-amber-50 dark:bg-amber-900/20 p-8 rounded-[2rem] text-center border border-amber-100 dark:border-amber-900/30">
                        <p className="text-amber-900 dark:text-amber-200 font-bold mb-6">Test yourself with 5 high-quality MCQs.</p>
                        <button onClick={handleGenerateQuiz} className="w-full bg-amber-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-amber-700 active:scale-95 transition-all">START TEST</button>
                      </div>
                    ) : (
                      <div className="animate-in fade-in">
                        {quizScore ? (
                          <div className="text-center p-10 bg-green-50 dark:bg-green-900/20 rounded-[2.5rem] border border-green-100 dark:border-green-900/30">
                            <h3 className="text-2xl font-black text-green-800 dark:text-green-300 mb-2">Sync Complete!</h3>
                            <p className="text-lg font-black text-green-700 dark:text-green-400">Score: {quizScore.current} / {quizScore.total}</p>
                            <button onClick={() => setQuiz(null)} className="mt-8 bg-indigo-600 text-white px-10 py-3 rounded-2xl font-black shadow-lg">Retake Test</button>
                          </div>
                        ) : (
                          <QuizViewer questions={quiz} onComplete={(score) => setQuizScore({current: score, total: quiz.length})} />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

const QuizViewer: React.FC<{questions: QuizQuestion[], onComplete: (score: number) => void}> = ({ questions, onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const q = questions[currentIdx];

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
      setSelected(null);
      setShowAnswer(false);
    } else {
      onComplete(score);
    }
  };

  const handleSelect = (idx: number) => {
    if (showAnswer) return;
    setSelected(idx);
    setShowAnswer(true);
    if (idx === q.correctAnswerIndex) setScore(s => s + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
        <span>Question {currentIdx + 1} of {questions.length}</span>
        <span>Score: {score}</span>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-3xl border dark:border-slate-700 p-6 shadow-sm">
        <p className="font-bold text-slate-800 dark:text-white mb-8 leading-relaxed">{q.question}</p>
        <div className="space-y-3">
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => handleSelect(i)} className={`w-full text-left p-5 rounded-2xl border-4 transition-all flex items-center gap-4 font-bold text-sm ${showAnswer ? i === q.correctAnswerIndex ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' : i === selected ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300' : 'border-slate-100 dark:border-slate-800 opacity-50' : 'border-slate-50 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'}`}>
              <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-black shrink-0 ${showAnswer && i === q.correctAnswerIndex ? 'bg-green-500 border-green-500 text-white' : 'border-slate-200 text-slate-400'}`}>{String.fromCharCode(65 + i)}</span>
              {opt}
            </button>
          ))}
        </div>
      </div>

      {showAnswer && (
        <div className="animate-in fade-in slide-in-from-bottom-2">
          <div className={`p-6 rounded-2xl mb-6 text-sm ${selected === q.correctAnswerIndex ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'}`}>
            <p className="font-black mb-2 uppercase tracking-widest text-xs">{selected === q.correctAnswerIndex ? 'Analysis Validated' : 'Analysis Required'}</p>
            <p className="opacity-90 leading-relaxed italic">{q.explanation}</p>
          </div>
          <button onClick={handleNext} className="w-full bg-slate-900 dark:bg-slate-700 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-black uppercase tracking-widest text-xs">
            {currentIdx + 1 < questions.length ? 'Next Dimension' : 'Finalize Analysis'}
          </button>
        </div>
      )}
    </div>
  );
};
