import React, { useState } from 'react';
import type { Vocabulary, QuizQuestion } from '../types';

type QuizState = 'idle' | 'active' | 'finished';
type QuizSource = 'first5' | 'last5' | 'all';

const generateLocalQuiz = (sourceVocabulary: Vocabulary[], allVocabulary: Vocabulary[]): QuizQuestion[] => {
  const questions: QuizQuestion[] = [];

  for (const vocabItem of sourceVocabulary) {
    const wrongAnswersPool = allVocabulary.filter(v => v.id !== vocabItem.id);
    if (wrongAnswersPool.length < 3) continue;

    const questionTypes: string[] = [];
    if (vocabItem.meaning && vocabItem.singular) {
        questionTypes.push('singular_to_meaning');
        questionTypes.push('meaning_to_singular');
    }
    if (vocabItem.plural) questionTypes.push('singular_to_plural');
    if (vocabItem.dual) questionTypes.push('singular_to_dual');

    if (questionTypes.length === 0) continue;

    const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

    let question = '';
    let correctAnswer = '';
    let options: string[] = [];
    let wrongOptionsPool: string[] = [];
    
    switch (randomType) {
        case 'singular_to_meaning':
            question = `Apa arti dari kata "${vocabItem.singular}"?`;
            correctAnswer = vocabItem.meaning;
            wrongOptionsPool = wrongAnswersPool.map(v => v.meaning).filter(m => m && m !== correctAnswer);
            break;
        case 'meaning_to_singular':
            question = `Kata manakah yang memiliki arti "${vocabItem.meaning}"?`;
            correctAnswer = vocabItem.singular;
            wrongOptionsPool = wrongAnswersPool.map(v => v.singular).filter(s => s && s !== correctAnswer);
            break;
        case 'singular_to_plural':
            question = `Apa bentuk jamak' dari kata "${vocabItem.singular}"?`;
            correctAnswer = vocabItem.plural!;
            wrongOptionsPool = wrongAnswersPool.map(v => v.plural).filter(p => p && p !== correctAnswer);
            break;
        case 'singular_to_dual':
            question = `Apa bentuk mutsanna dari kata "${vocabItem.singular}"?`;
            correctAnswer = vocabItem.dual!;
            wrongOptionsPool = wrongAnswersPool.map(v => v.dual).filter(d => d && d !== correctAnswer);
            break;
    }
    
    const uniqueWrongOptions = [...new Set(wrongOptionsPool)];
    const shuffledWrongOptions = uniqueWrongOptions.sort(() => 0.5 - Math.random());
    options = [correctAnswer, ...shuffledWrongOptions.slice(0, 3)];

    // Ensure we have at least two options to make it a choice
    if (options.length < 2) continue;
    
    questions.push({
      question,
      options: options.sort(() => 0.5 - Math.random()),
      correctAnswer,
    });
  }
  return questions;
};


export const QuizView: React.FC<{ vocabularyList: Vocabulary[] }> = ({ vocabularyList }) => {
  const [quizState, setQuizState] = useState<QuizState>('idle');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizSource, setQuizSource] = useState<QuizSource>('all');

  const startQuiz = () => {
    let selectedVocabulary: Vocabulary[];

    switch (quizSource) {
      case 'first5':
        // New items are prepended, so the first 5 are the newest
        selectedVocabulary = vocabularyList.slice(0, 5);
        break;
      case 'last5':
        // The last 5 items are the oldest
        selectedVocabulary = vocabularyList.slice(-5);
        break;
      case 'all':
      default:
        selectedVocabulary = vocabularyList;
        break;
    }
    
    setError(null);
    const newQuestions = generateLocalQuiz(selectedVocabulary, vocabularyList);

    if (newQuestions && newQuestions.length > 0) {
      setQuestions(newQuestions);
      setCurrentQuestionIndex(0);
      setScore(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setQuizState('active');
    } else {
      setError("Tidak dapat membuat kuis dengan kosakata yang ada. Coba tambahkan lebih banyak mufrodat yang unik.");
      setQuizState('idle');
    }
  };
  
  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
    setIsAnswered(true);
    if (answer === questions[currentQuestionIndex].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setQuizState('finished');
    }
  };

  const restartQuiz = () => {
    setQuizState('idle');
    setQuestions([]);
  };

  const getButtonClass = (option: string) => {
    if (!isAnswered) {
      return "bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border-gray-300 dark:border-slate-500 text-gray-800 dark:text-gray-200";
    }
    const isCorrect = option === questions[currentQuestionIndex].correctAnswer;
    const isSelected = option === selectedAnswer;

    if (isCorrect) return "bg-green-100 dark:bg-green-900/50 border-green-500 text-green-800 dark:text-green-300";
    if (isSelected && !isCorrect) return "bg-red-100 dark:bg-red-900/50 border-red-500 text-red-800 dark:text-red-300";
    return "bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 opacity-70 dark:opacity-60";
  };

  const getSourceButtonClass = (source: QuizSource) => {
    return quizSource === source
      ? 'bg-emerald-600 text-white border-emerald-600 dark:border-emerald-500'
      : 'bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-slate-500';
  };
  
  const renderContent = () => {
    switch(quizState) {
        case 'active':
            const currentQuestion = questions[currentQuestionIndex];
            return (
                <div>
                    <div className="mb-6 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pertanyaan {currentQuestionIndex + 1} dari {questions.length}</p>
                        <h2 className="text-xl md:text-2xl font-semibold mt-1 text-gray-800 dark:text-gray-100">{currentQuestion.question}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(option)}
                                disabled={isAnswered}
                                className={`w-full p-4 rounded-lg border-2 text-center transition-all duration-300 font-arabic text-2xl ${getButtonClass(option)}`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                    {isAnswered && (
                        <div className="mt-6 text-center">
                             {selectedAnswer === currentQuestion.correctAnswer ? (
                                <p className="text-lg font-semibold text-green-600 dark:text-green-400">Jawaban Benar!</p>
                            ) : (
                                <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                                    Jawaban Salah. Yang benar adalah: <span className="font-arabic font-bold">{currentQuestion.correctAnswer}</span>
                                </p>
                            )}
                            <button
                                onClick={handleNextQuestion}
                                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-8 rounded-lg transition-colors"
                            >
                                {currentQuestionIndex < questions.length - 1 ? 'Lanjut' : 'Selesai'}
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
        case 'idle':
        default:
            const canStartQuiz = vocabularyList.length >= 5;
            return (
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">Uji Pengetahuanmu!</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        Kuis acak akan dibuat berdasarkan mufrodat yang telah kamu simpan.
                    </p>
                     {error && <p className="text-red-500 dark:text-red-300 bg-red-100 dark:bg-red-900/40 p-3 rounded-md mb-4">{error}</p>}
                    
                    {canStartQuiz && (
                      <div className="my-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Pilih sumber soal:</label>
                        <div className="inline-flex rounded-md shadow-sm" role="group">
                          <button type="button" onClick={() => setQuizSource('first5')} className={`px-4 py-2 text-sm font-medium rounded-l-lg border transition-colors ${getSourceButtonClass('first5')}`}>
                              5 Kata Awal (Terbaru)
                          </button>
                          <button type="button" onClick={() => setQuizSource('last5')} className={`px-4 py-2 text-sm font-medium border-t border-b -ml-px transition-colors ${getSourceButtonClass('last5')}`}>
                              5 Kata Terakhir (Terlama)
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
                        Mulai Kuis
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
