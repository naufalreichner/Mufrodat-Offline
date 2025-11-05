
import React, { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Vocabulary } from './types';
import Header from './components/Header';
import { VocabularyList } from './components/VocabularyList';
import { AddVocabularyForm } from './components/AddVocabularyForm';
import { QuizView } from './components/QuizView';
import { WordUnscrambleQuiz } from './components/WordUnscrambleQuiz';
import { FlashcardView } from './components/FlashcardView';
import { FloatingNav } from './components/FloatingNav';
import { SettingsModal } from './components/SettingsModal';

type View = 'list' | 'quiz' | 'unscramble' | 'flashcard';
type Theme = 'light' | 'dark';

const arabicFonts = [
  { name: 'Noto Naskh', family: "'Noto Naskh Arabic', serif" },
  { name: 'Amiri', family: "'Amiri', serif" },
  { name: 'Cairo', family: "'Cairo', sans-serif" },
  { name: 'Lateef', family: "'Lateef', serif" },
  { name: 'Lemonada', family: "'Lemonada', cursive" },
  { name: 'Markazi Text', family: "'Markazi Text', serif" },
  { name: 'Noto Kufi', family: "'Noto Kufi Arabic', sans-serif" },
  { name: 'Reem Kufi', family: "'Reem Kufi', sans-serif" },
  { name: 'Scheherazade', family: "'Scheherazade New', serif" },
  { name: 'Tajawal', family: "'Tajawal', sans-serif" },
];

function App() {
  const [vocabulary, setVocabulary] = useLocalStorage<Vocabulary[]>('vocabulary', []);
  const [currentView, setCurrentView] = useState<View>('list');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingVocabulary, setEditingVocabulary] = useState<Vocabulary | null>(null);
  const [arabicFont, setArabicFont] = useLocalStorage<string>('arabicFont', arabicFonts[0].family);
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-arabic', arabicFont);
  }, [arabicFont]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);


  const handleAddVocabulary = (newItems: Omit<Vocabulary, 'id'>[]) => {
    const itemsWithIds = newItems.map(item => ({
      ...item,
      id: `vocab-${Date.now()}-${Math.random().toString(36).substring(2)}` 
    }));
    setVocabulary(prev => [...itemsWithIds, ...prev]);
    setIsFormVisible(false);
  };

  const handleUpdateVocabulary = (updatedItem: Vocabulary) => {
    setVocabulary(prev => prev.map(item => (item.id === updatedItem.id ? updatedItem : item)));
    setIsFormVisible(false);
    setEditingVocabulary(null);
  };

  const handleDeleteVocabulary = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus mufrodat ini?')) {
      setVocabulary(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleEditClick = (item: Vocabulary) => {
    setEditingVocabulary(item);
    setIsFormVisible(true);
  };

  const handleOpenAddForm = () => {
    setEditingVocabulary(null);
    setIsFormVisible(true);
  };

  const handleCancelForm = () => {
    setIsFormVisible(false);
    setEditingVocabulary(null);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const getFilteredVocabulary = () => {
    if (!searchQuery.trim()) return vocabulary;

    const query = searchQuery.toLowerCase();

    return vocabulary.filter(item => {
      const arabicMatch = item.singular.includes(searchQuery) || item.dual.includes(searchQuery) || item.plural.includes(searchQuery);
      const indoMatch = item.meaning.toLowerCase().includes(query) || item.notes.toLowerCase().includes(query);
      return arabicMatch || indoMatch;
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen font-sans">
      <Header
        onSearch={handleSearch}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 pb-24">
        {currentView === 'list' && (
          <VocabularyList
            vocabulary={getFilteredVocabulary()}
            onEdit={handleEditClick}
            onDelete={handleDeleteVocabulary}
          />
        )}
        {currentView === 'quiz' && <QuizView vocabularyList={vocabulary} />}
        {currentView === 'unscramble' && <WordUnscrambleQuiz vocabularyList={vocabulary} />}
        {currentView === 'flashcard' && <FlashcardView vocabularyList={vocabulary} />}
      </main>

      {isFormVisible && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-75 dark:bg-opacity-80 z-40 flex justify-center items-start pt-8 sm:pt-16"
          onClick={handleCancelForm}
        >
          <div 
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg modal-scroll"
            onClick={(e) => e.stopPropagation()}
          >
             <AddVocabularyForm
                onAdd={handleAddVocabulary}
                onUpdate={handleUpdateVocabulary}
                onCancel={handleCancelForm}
                existingVocabulary={editingVocabulary}
             />
          </div>
        </div>
      )}

      <FloatingNav
        currentView={currentView}
        onViewChange={setCurrentView}
        onAddClick={handleOpenAddForm}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        fonts={arabicFonts}
        selectedFont={arabicFont}
        onFontChange={setArabicFont}
        theme={theme}
        onThemeChange={setTheme}
      />
    </div>
  );
}

export default App;
