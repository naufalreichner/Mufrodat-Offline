import React, { useState, useEffect } from 'react';
import type { Vocabulary } from '../types';

type QuizState = 'gameSelect' | 'active' | 'finished';
type QuizSource = 'first10' | 'last10' | 'all';

interface UnscrambleQuestion {
  correctAnswer: string;
  scrambled: string;
}

const shuffleString = (str: string): string => {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
};

const generateUnscrambleQuiz = (sourceVocabulary: Vocabulary[]): UnscrambleQuestion[] => {
  const questions: UnscrambleQuestion[] = [];

  for (const vocabItem of sourceVocabulary) {
    if (!vocabItem.singular) continue;

    const scrambled = shuffleString(vocabItem.singular);

    if (scrambled === vocabItem.singular) {
      const secondScramble = shuffleString(vocabItem.singular);
      if (secondScramble === vocabItem.singular) continue;
      questions.push({
        correctAnswer: vocabItem.singular,
        scrambled: secondScramble,
      });
    } else {
      questions.push({
        correctAnswer: vocabItem.singular,
        scrambled,
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
  const [userAnswer, setUserAnswer] = useState('');
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
      setUserAnswer('');
      setIsAnswered(false);
      setQuizState('active');
    } else {
      setError('Tidak dapat membuat kuis susun kata dengan kosakata yang ada.');
      setQuizState('gameSelect');
    }
  };

  const handleAnswerSubmit = () => {
    if (!userAnswer.trim()) return;

    setIsAnswered(true);
    if (userAnswer.trim() === questions[currentQuestionIndex].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setUserAnswer('');
      setIsAnswered(false);
    } else {
      setQuizState('finished');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isAnswered) {
      handleAnswerSubmit();
    }
  };

  const restartQuiz = () => {
    setQuizState('gameSelect');
    setQuestions([]);
    setUserAnswer('');
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
        const isCorrect = userAnswer === currentQuestion.correctAnswer;

        return (
          <div>
            <div className="mb-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Soal {currentQuestionIndex + 1} dari {questions.length}</p>
              <h2 className="text-xl md:text-2xl font-semibold mt-1 text-gray-800 dark:text-gray-100">Susun Kata Berikut</h2>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-6 text-center mb-6">
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">Acak Huruf:</p>
              <p className="font-arabic text-4xl text-blue-600 dark:text-blue-400 font-bold break-words">{currentQuestion.scrambled}</p>
            </div>

            <div className="mb-6">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik jawaban di sini..."
                disabled={isAnswered}
                className="w-full font-arabic text-2xl p-4 border-2 rounded-lg bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 dark:disabled:bg-slate-600 disabled:opacity-50"
              />
            </div>

            {!isAnswered && (
              <div className="text-center">
                <button
                  onClick={handleAnswerSubmit}
                  disabled={!userAnswer.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed"
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
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-8 rounded-lg transition-colors"
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
              Susun huruf yang acak menjadi kata yang benar!
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
