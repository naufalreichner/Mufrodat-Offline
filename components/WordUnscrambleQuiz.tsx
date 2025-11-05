import React, { useState } from 'react';
import type { Vocabulary } from '../types';

type QuizState = 'gameSelect' | 'active' | 'finished';
type QuizSource = 'first10' | 'last10' | 'all';

interface UnscrambleQuestion {
  correctAnswer: string;
  scrambledLetters: string[];
}

const shuffleArray = <T,>(arr: T[]): T[] => {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const generateUnscrambleQuiz = (sourceVocabulary: Vocabulary[]): UnscrambleQuestion[] => {
  const questions: UnscrambleQuestion[] = [];

  for (const vocabItem of sourceVocabulary) {
    if (!vocabItem.singular) continue;

    const letters = vocabItem.singular.split('');
    const scrambledLetters = shuffleArray(letters);

    if (scrambledLetters.join('') === vocabItem.singular) {
      const secondScramble = shuffleArray(letters);
      if (secondScramble.join('') === vocabItem.singular) continue;
      questions.push({
        correctAnswer: vocabItem.singular,
        scrambledLetters: secondScramble,
      });
    } else {
      questions.push({
        correctAnswer: vocabItem.singular,
        scrambledLetters,
      });
    }
  }

  return questions.sort(() => 0.5 - Math.random());
};

export const WordUnscrambleQuiz: React.FC<{ vocabularyList: Vocabulary[] }> = ({ vocabularyList }) => {
  const [quizState, setQuizState] = useState<QuizState>('gameSelect');
  const [questions, setQuestions] = useState<UnscrambleQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizSource, setQuizSource] = useState<QuizSource>('first10');

  const startQuiz = () => {
    let selectedVocabulary: Vocabulary[];

    switch (quizSource) {
      case 'first10':
        selectedVocabulary = vocabularyList.slice(0, 10);
        break;
      case 'last10':
        selectedVocabulary = vocabularyList.slice(-10);
        break;
      case 'all':
      default:
        selectedVocabulary = vocabularyList;
        break;
    }

    setError(null);
    const newQuestions = generateUnscrambleQuiz(selectedVocabulary);

    if (newQuestions && newQuestions.length > 0) {
      setQuestions(newQuestions);
      setCurrentQuestionIndex(0);
      setScore(0);
      setUserAnswer([]);
      setAvailableLetters([...newQuestions[0].scrambledLetters]);
      setIsAnswered(false);
      setQuizState('active');
    } else {
      setError('Tidak dapat membuat kuis susun kata dengan kosakata yang ada.');
      setQuizState('gameSelect');
    }
  };

  const handleLetterClick = (letter: string, index: number) => {
    if (isAnswered) return;
    setUserAnswer([...userAnswer, letter]);
    setAvailableLetters(availableLetters.filter((_, i) => i !== index));
  };

  const handleRemoveLetter = (index: number) => {
    const removedLetter = userAnswer[index];
    setUserAnswer(userAnswer.filter((_, i) => i !== index));
    setAvailableLetters([...availableLetters, removedLetter]);
  };

  const handleAnswerSubmit = () => {
    const answer = userAnswer.join('');
    setIsAnswered(true);
    if (answer === questions[currentQuestionIndex].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setUserAnswer([]);
      setAvailableLetters([...questions[nextIndex].scrambledLetters]);
      setIsAnswered(false);
    } else {
      setQuizState('finished');
    }
  };

  const handleClear = () => {
    setAvailableLetters([...questions[currentQuestionIndex].scrambledLetters]);
    setUserAnswer([]);
  };

  const restartQuiz = () => {
    setQuizState('gameSelect');
    setQuestions([]);
    setUserAnswer([]);
    setAvailableLetters([]);
  };

  const getSourceButtonClass = (source: QuizSource) => {
    return quizSource === source
      ? 'bg-emerald-600 text-white border-emerald-600 dark:border-emerald-500'
      : 'bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-slate-500';
  };

  const renderContent = () => {
    switch (quizState) {
      case 'active':
        const currentQuestion = questions[currentQuestionIndex];
        const userAnswerStr = userAnswer.join('');
        const isCorrect = userAnswerStr === currentQuestion.correctAnswer;

        return (
          <div>
            <div className="mb-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Soal {currentQuestionIndex + 1} dari {questions.length}</p>
              <h2 className="text-xl md:text-2xl font-semibold mt-1 text-gray-800 dark:text-gray-100">Susun Huruf Arab</h2>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-6 mb-6">
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Jawaban Anda:</p>
              <div className="min-h-16 bg-white dark:bg-slate-700 rounded-lg p-4 border-2 border-gray-200 dark:border-slate-600 flex flex-wrap items-center gap-2">
                {userAnswer.length === 0 ? (
                  <p className="text-gray-400 dark:text-gray-500 text-sm">Klik huruf di bawah untuk menyusun...</p>
                ) : (
                  userAnswer.map((letter, index) => (
                    <button
                      key={index}
                      onClick={() => handleRemoveLetter(index)}
                      className="font-arabic text-2xl bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-lg transition-colors border-2 border-emerald-300 dark:border-emerald-700 cursor-pointer"
                    >
                      {letter}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-lg p-6 mb-6">
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Klik huruf untuk memilih:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {availableLetters.map((letter, index) => (
                  <button
                    key={index}
                    onClick={() => handleLetterClick(letter, index)}
                    disabled={isAnswered}
                    className="font-arabic text-2xl bg-white dark:bg-slate-700 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-gray-800 dark:text-gray-200 hover:text-amber-700 dark:hover:text-amber-400 px-4 py-2 rounded-lg transition-colors border-2 border-gray-300 dark:border-slate-600 hover:border-amber-400 dark:hover:border-amber-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>

            {!isAnswered && (
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleClear}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  Hapus Semua
                </button>
                <button
                  onClick={handleAnswerSubmit}
                  disabled={userAnswer.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                  Periksa Jawaban
                </button>
              </div>
            )}

            {isAnswered && (
              <div className="mt-6 text-center">
                {isCorrect ? (
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400 mb-4">Jawaban Benar!</p>
                ) : (
                  <div>
                    <p className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Jawaban Salah</p>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Jawaban yang benar: <span className="font-arabic text-2xl font-bold">{currentQuestion.correctAnswer}</span>
                    </p>
                  </div>
                )}
                <button
                  onClick={handleNextQuestion}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-8 rounded-lg transition-colors mt-4"
                >
                  {currentQuestionIndex < questions.length - 1 ? 'Soal Berikutnya' : 'Selesai'}
                </button>
              </div>
            )}
          </div>
        );

      case 'finished':
        const percentage = Math.round((score / questions.length) * 100);
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Kuis Selesai!</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">Skor Akhir Anda:</p>
            <p className="text-6xl font-bold text-emerald-600 dark:text-emerald-500 mb-6">{percentage}%</p>
            <p className="text-gray-700 dark:text-gray-300">{score} dari {questions.length} jawaban benar.</p>
            <button
              onClick={restartQuiz}
              className="mt-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        );

      case 'gameSelect':
      default:
        const canStartQuiz = vocabularyList.length >= 5;
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">Kuis Susun Kata</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Klik huruf-huruf acak untuk menyusun menjadi kata Arab yang benar!
            </p>
            {error && <p className="text-red-500 dark:text-red-300 bg-red-100 dark:bg-red-900/40 p-3 rounded-md mb-4">{error}</p>}

            {canStartQuiz && (
              <div className="my-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Pilih sumber soal:</label>
                <div className="inline-flex rounded-md shadow-sm" role="group">
                  <button type="button" onClick={() => setQuizSource('first10')} className={`px-4 py-2 text-sm font-medium rounded-l-lg border transition-colors ${getSourceButtonClass('first10')}`}>
                    10 Kata Awal
                  </button>
                  <button type="button" onClick={() => setQuizSource('last10')} className={`px-4 py-2 text-sm font-medium border-t border-b -ml-px transition-colors ${getSourceButtonClass('last10')}`}>
                    10 Kata Terakhir
                  </button>
                  <button type="button" onClick={() => setQuizSource('all')} className={`px-4 py-2 text-sm font-medium rounded-r-md border -ml-px transition-colors ${getSourceButtonClass('all')}`}>
                    Seluruh Kata
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={startQuiz}
              disabled={!canStartQuiz}
              className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              Mulai Kuis Susun Kata
            </button>
            {!canStartQuiz && (
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-4">
                (Perlu minimal 5 mufrodat untuk membuat kuis)
              </p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 p-6 md:p-8 rounded-lg shadow-lg">
      {renderContent()}
    </div>
  );
};
