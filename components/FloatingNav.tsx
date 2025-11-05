import React, { useState, useEffect, useRef } from 'react';

interface FloatingNavProps {
  currentView: 'list' | 'quiz' | 'unscramble' | 'flashcard';
  onViewChange: (view: 'list' | 'quiz' | 'unscramble' | 'flashcard') => void;
  onAddClick: () => void;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({ currentView, onViewChange, onAddClick }) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);
  const getButtonClass = (view: 'list' | 'quiz' | 'flashcard') => {
    return currentView === view
      ? 'bg-emerald-600 text-white'
      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600';
  };

  return (
    <div
      className="fixed bottom-6 left-6 z-30 transition-all duration-300 flex flex-col gap-3"
      style={{
        opacity: isScrolling ? 0 : 1,
        transform: isScrolling ? 'translateY(120px)' : 'translateY(0)',
        pointerEvents: isScrolling ? 'none' : 'auto'
      }}
    >
      <button
        onClick={onAddClick}
        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-3 shadow-lg transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-900"
        aria-label="Tambah Mufrodat Baru"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>

      <div className="bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm p-1 rounded-lg flex flex-col gap-1 shadow-lg border border-gray-200 dark:border-gray-600">
        <button
          onClick={() => onViewChange('list')}
          className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors duration-200 ${getButtonClass('list')}`}
          aria-label="Tampilkan Daftar Kata"
        >
          Daftar Kata
        </button>
        <button
          onClick={() => onViewChange('flashcard')}
          className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors duration-200 ${getButtonClass('flashcard')}`}
          aria-label="Mode Belajar Flashcard"
        >
          Flashcard
        </button>
        <button
          onClick={() => onViewChange('quiz')}
          className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors duration-200 ${getButtonClass('quiz')}`}
          aria-label="Mulai Kuis"
        >
          Kuis
        </button>
        <button
          onClick={() => onViewChange('unscramble')}
          className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors duration-200 ${getButtonClass('unscramble')}`}
          aria-label="Kuis Susun Kata"
        >
          Susun Kata
        </button>
      </div>
    </div>
  );
};
