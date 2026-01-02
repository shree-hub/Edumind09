
import React, { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { Reader } from './components/Reader';
import { Affairs } from './components/Affairs';
import { Notes } from './components/Notes';
import { Quiz } from './components/Quiz';
import { Book, View } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<View>('HOME');
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const navigateToReader = (book: Book) => {
    setActiveBook(book);
    setView('READER');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Dynamic Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('HOME')}>
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" strokeWidth="2"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" strokeWidth="2"/><path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" strokeWidth="2"/></svg>
            </div>
            <span className="font-extrabold text-xl tracking-tighter text-slate-900 dark:text-white">EduMind</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-all"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" strokeWidth="2"/></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" strokeWidth="2"/></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {view === 'HOME' && <Home onSelectBook={navigateToReader} onNavigate={setView} />}
        {view === 'AFFAIRS' && <Affairs onBack={() => setView('HOME')} />}
        {view === 'NOTES' && <Notes onBack={() => setView('HOME')} />}
        {view === 'TEST' && <Quiz onBack={() => setView('HOME')} />}
        {view === 'READER' && activeBook && <Reader book={activeBook} onBack={() => setView('HOME')} />}
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} EduMind. AI Powered Learning Companion.</p>
      </footer>
    </div>
  );
};

export default App;
