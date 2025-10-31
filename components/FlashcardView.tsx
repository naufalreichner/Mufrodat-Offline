import React, { useState, useEffect } from 'react';
import type { Vocabulary } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { RefreshIcon } from './icons/RefreshIcon';

export const FlashcardView: React.FC<{ vocabularyList: Vocabulary[] }> = ({ vocabularyList }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [shuffledVocab, setShuffledVocab] = useState<Vocabulary[]>([]);

    useEffect(() => {
        const newShuffledList = [...vocabularyList].sort(() => Math.random() - 0.5);
        setShuffledVocab(newShuffledList);
        setCurrentIndex(0);
        setIsFlipped(false);
    }, [vocabularyList]);

    const handleShuffle = () => {
        const newShuffledList = [...vocabularyList].sort(() => Math.random() - 0.5);
        setShuffledVocab(newShuffledList);
        setCurrentIndex(0);
        setIsFlipped(false);
    }
    
    const currentCard = shuffledVocab[currentIndex];

    const handleNext = () => {
        if (shuffledVocab.length === 0) return;
        setIsFlipped(false);
        setTimeout(() => {
             setCurrentIndex((prevIndex) => (prevIndex + 1) % shuffledVocab.length);
        }, 150);
    };

    const handlePrev = () => {
        if (shuffledVocab.length === 0) return;
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex - 1 + shuffledVocab.length) % shuffledVocab.length);
        }, 150);
    };

    if (shuffledVocab.length === 0) {
        return (
            <div className="text-center py-16 px-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">Mode Flashcard</h2>
                <p className="text-gray-500 dark:text-gray-400">Tambahkan beberapa mufrodat terlebih dahulu untuk memulai belajar dengan flashcard.</p>
            </div>
        );
    }
    
    return (
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
            <div 
                className="w-full aspect-[3/2] cursor-pointer group [perspective:1000px]" 
                onClick={() => setIsFlipped(!isFlipped)}
                aria-roledescription="flashcard"
                aria-label={`Kartu ${isFlipped ? 'belakang' : 'depan'}. Klik untuk membalik.`}
            >
                <div className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                    {/* Front */}
                    <div className="absolute w-full h-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center p-6 [backface-visibility:hidden] border dark:border-slate-700">
                        <p className="font-arabic text-5xl md:text-6xl text-center text-gray-800 dark:text-gray-200 select-none">{currentCard.singular}</p>
                    </div>
                    {/* Back */}
                    <div className="absolute w-full h-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex flex-col justify-center p-6 [backface-visibility:hidden] [transform:rotateY(180deg)] border dark:border-slate-700">
                        <div className="text-center">
                            <p className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-500 mb-4 select-none">{currentCard.meaning}</p>
                            {currentCard.notes !== 'Islahul Lughoh' && (
                                <div className="grid grid-cols-2 gap-4 text-center mt-6 border-t dark:border-slate-700 pt-4">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase select-none">Mutsanna</h3>
                                        <p className="font-arabic text-xl text-gray-800 dark:text-gray-200 select-none">{currentCard.dual || '-'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase select-none">Jamak'</h3>
                                        <p className="font-arabic text-xl text-gray-800 dark:text-gray-200 select-none">{currentCard.plural || '-'}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 font-medium">
                Kartu {currentIndex + 1} / {shuffledVocab.length}
            </p>

            <div className="flex items-center justify-center space-x-4 w-full">
                <button onClick={handlePrev} className="p-3 rounded-full bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 shadow-md transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-slate-900" aria-label="Kartu Sebelumnya">
                    <ArrowLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                </button>
                <button onClick={handleShuffle} className="p-3 rounded-full bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 shadow-md transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-slate-900" aria-label="Acak Ulang Kartu">
                    <RefreshIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                </button>
                <button onClick={handleNext} className="p-3 rounded-full bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 shadow-md transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-slate-900" aria-label="Kartu Berikutnya">
                    <ArrowRightIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                </button>
            </div>
        </div>
    );
};