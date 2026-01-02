
import React, { useState, useEffect } from 'react';
import { Book, View } from '../types';

interface HomeProps {
  onSelectBook: (book: Book) => void;
  onNavigate: (view: View) => void;
}

export const Home: React.FC<HomeProps> = ({ onSelectBook, onNavigate }) => {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('library_books');
    if (saved) setBooks(JSON.parse(saved));
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newBook = { id: Math.random().toString(36).substr(2, 9), name: file.name, dataUrl, uploadDate: Date.now() };
      const updated = [newBook, ...books];
      setBooks(updated);
      localStorage.setItem('library_books', JSON.stringify(updated));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
          Your Smart Study Companion
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Leverage Gemini AI to transform your learning experience through smart analysis and automation.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {/* News Card */}
        <button onClick={() => onNavigate('AFFAIRS')} className="group flex flex-col items-start p-8 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-800 transition-all text-left">
          <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" strokeWidth="2"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Daily Affairs</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
            Stay updated with tailored news for exams. Multi-language support and AI audio included.
          </p>
          <span className="mt-auto font-bold text-amber-600">Sync News &rarr;</span>
        </button>

        {/* Notes Card */}
        <button onClick={() => onNavigate('NOTES')} className="group flex flex-col items-start p-8 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-800 transition-all text-left">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeWidth="2"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Study Notes</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
            Generate high-depth UPSC level notes on any topic instantly with AI analysis.
          </p>
          <span className="mt-auto font-bold text-blue-600">Take Notes &rarr;</span>
        </button>

        {/* Mock Test Card */}
        <button onClick={() => onNavigate('TEST')} className="group flex flex-col items-start p-8 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-800 transition-all text-left">
          <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" strokeWidth="2"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Mock Test</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
            Assess yourself with exam-pattern quizzes. Full analysis and result review.
          </p>
          <span className="mt-auto font-bold text-emerald-600">Start Test &rarr;</span>
        </button>
      </div>

      {/* Library Section */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-slate-800 dark:text-white">Smart Library</h2>
        <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transition-all cursor-pointer">
          + Upload PDF
          <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900/50 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
          <p className="text-slate-400">Library is empty. Upload a textbook to start annotating.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {books.map(book => (
            <div key={book.id} onClick={() => onSelectBook(book)} className="group bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all cursor-pointer text-center">
              <div className="aspect-[3/4] bg-slate-50 dark:bg-slate-800 rounded-2xl mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth="2"/></svg>
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white truncate text-sm">{book.name}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
