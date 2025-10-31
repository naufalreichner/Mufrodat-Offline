import React from 'react';

interface FloatingNavProps {
  currentView: 'list' | 'quiz' | 'flashcard';
  onViewChange: (view: 'list' | 'quiz' | 'flashcard') => void;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({ currentView, onViewChange }) => {
  const getButtonClass = (view: 'list' | 'quiz' | 'flashcard') => {
    return currentView === view
      ? 'bg-emerald-600 text-white'
      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600';
  };

  return (
    <div className="fixed bottom-24 left-6 z-30">
      <div className="bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm p-1 rounded-lg flex space-x-1 shadow-lg border border-gray-200 dark:border-gray-600">
        <button
          onClick={() => onViewChange('list')}
          className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${getButtonClass('list')}`}
          aria-label="Tampilkan Daftar Kata"
        >
          Daftar Kata
        </button>
        <button
          onClick={() => onViewChange('flashcard')}
          className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${getButtonClass('flashcard')}`}
          aria-label="Mode Belajar Flashcard"
        >
          Flashcard
        </button>
        <button
          onClick={() => onViewChange('quiz')}
          className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${getButtonClass('quiz')}`}
          aria-label="Mulai Kuis"
        >
          Kuis
        </button>
      </div>
    </div>
  );
};
