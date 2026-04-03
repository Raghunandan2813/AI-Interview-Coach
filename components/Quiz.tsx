"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateQuizQuestions, QuizQuestion } from '@/lib/action/quiz.action';
import { saveQuizScore } from '@/lib/action/score.action';
import { Dices, Brain, Trophy, ChevronRight, Hash, Frown, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

type GameState = 'setup' | 'loading' | 'playing' | 'results';

export default function QuizGame() {
  const [gameState, setGameState] = useState<GameState>('setup');
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  const startGame = async (isSurprise: boolean) => {
    setGameState('loading');
    const targetTopic = isSurprise ? '' : topic;
    const result = await generateQuizQuestions(targetTopic);
    
    if (result.success) {
      setQuestions(result.questions);
      setCurrentQIndex(0);
      setScore(0);
      setSelectedAnswer(null);
      setIsRevealed(false);
      setGameState('playing');
    } else {
      toast.error(result.error);
      setGameState('setup');
    }
  };

  const handleSelectOption = (index: number) => {
    if (isRevealed) return;
    
    setSelectedAnswer(index);
    setIsRevealed(true);
    
    if (index === questions[currentQIndex].correctAnswerIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const nextQuestion = async () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsRevealed(false);
    } else {
      setGameState('results');
      // Save score to database
      try {
        await saveQuizScore(score + (isRevealed && selectedAnswer === questions[currentQIndex].correctAnswerIndex ? 0 : 0));
        // Note: score state is already updated in handleSelectOption immediately, 
        // but due to react batching it might be old in this closure if it wasn't a functional update.
        // Actually, since handleSelectOption updates it, `score` in this render closure is accurate!
        await saveQuizScore(score);
      } catch (e) {
        console.error("Failed to save score");
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto min-h-[60vh] flex flex-col items-center justify-center relative relative z-10 transition-all duration-500">
      <AnimatePresence mode="wait">
        
        {/* SETUP STATE */}
        {gameState === 'setup' && (
          <motion.div 
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center p-8 md:p-12 background-glass rounded-3xl border border-white/10 w-full text-center shadow-[var(--shadow-soft)] overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Brain size={250} />
            </div>
            
            <div className="inline-flex items-center justify-center p-4 bg-primary-200/20 rounded-full mb-6 z-10">
              <Dices size={48} className="text-primary-200" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4 z-10 drop-shadow-sm">Tech Knowledge Quiz</h1>
            <p className="text-light-400 max-w-md mx-auto mb-10 z-10">Challenge yourself with dynamic 5-question AI-generated quizzes. Questions escalate in difficulty from Easy to Hard.</p>
            
            <div className="flex flex-col gap-5 w-full max-w-md z-10 relative">
              <div className="relative group">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-light-600 transition-colors pointer-events-none" size={18} />
                <Input 
                  placeholder="Enter a tech topic (e.g. React Patterns)"
                  className="pl-11 h-14 bg-dark-300/60 border-white/10 rounded-xl focus:ring-2 focus:ring-primary-200/30 text-base shadow-inner hidden-placeholder sm:placeholder:visible"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              
              <Button onClick={() => startGame(false)} disabled={!topic.trim()} className="w-full h-14 bg-primary-200 text-dark-100 hover:bg-white font-bold text-lg rounded-xl shadow-[var(--shadow-glow)] transition-all max-sm:h-12">
                Generate Specific Quiz
              </Button>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-light-600 text-xs font-medium uppercase tracking-wider">OR</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>
              
              <Button onClick={() => startGame(true)} variant="outline" className="w-full h-14 bg-dark-300/40 border-white/10 hover:bg-white/5 text-light-100 font-bold text-lg rounded-xl transition-all max-sm:h-12">
                Surprise Me!
              </Button>
            </div>
          </motion.div>
        )}

        {/* LOADING STATE */}
        {gameState === 'loading' && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center p-16 w-full text-center h-[50vh]"
          >
            <div className="w-16 h-16 border-4 border-dark-100 border-t-primary-200 rounded-full animate-spin mb-8 shadow-[var(--shadow-glow)]"></div>
            <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">Synthesizing Questions...</h2>
            <p className="text-light-400">Our AI model is currently generating custom escalting challenges.</p>
          </motion.div>
        )}

        {/* PLAYING STATE */}
        {gameState === 'playing' && (
          <motion.div 
            key="playing"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <span className="text-light-400 font-medium">Question {currentQIndex + 1} of 5</span>
              <span className="bg-primary-200/20 text-primary-200 px-3 py-1 rounded-full text-sm font-bold shadow-[0_0_10px_rgba(167,139,250,0.2)]">Level: {currentQIndex === 0 ? "Easy" : currentQIndex === 4 ? "Extreme" : ["Easy", "Medium", "Hard", "Hard", "Extreme"][currentQIndex]}</span>
            </div>
            
            <div className="bg-dark-200/80 backdrop-blur-md rounded-3xl border border-white/10 p-6 md:p-10 mb-6 shadow-[var(--shadow-soft)]">
               <h2 className="text-xl md:text-2xl font-bold text-light-100 leading-relaxed min-h-[80px]">
                 {questions[currentQIndex].question}
               </h2>
            </div>
            
            <div className="flex flex-col gap-4 mb-8">
              {questions[currentQIndex].options.map((opt, i) => {
                const isSelected = selectedAnswer === i;
                const isCorrect = isRevealed && i === questions[currentQIndex].correctAnswerIndex;
                const isWrongSelection = isRevealed && isSelected && !isCorrect;
                
                return (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(i)}
                    disabled={isRevealed}
                    className={`text-left w-full p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
                      !isRevealed 
                        ? "bg-dark-300/40 border-white/10 hover:border-primary-200/50 hover:bg-dark-300/80 text-light-100" 
                        : isCorrect
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                          : isWrongSelection
                            ? "bg-rose-500/20 border-rose-500 text-rose-100"
                            : "bg-dark-300/30 border-white/5 text-light-600 opacity-50"
                    }`}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
                         !isRevealed ? "border-white/10 text-light-400 group-hover:border-primary-200/50" 
                         : isCorrect ? "border-emerald-500 bg-emerald-500 text-dark-100"
                         : isWrongSelection ? "border-rose-500 bg-rose-500 text-dark-100"
                         : "border-white/5"
                      }`}>
                         {['A', 'B', 'C', 'D'][i]}
                      </div>
                      <span className="font-medium text-[15px] sm:text-base leading-snug pr-8">{opt}</span>
                    </div>

                    {isCorrect && <CheckCircle2 className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-500" />}
                    {isWrongSelection && <XCircle className="absolute right-5 top-1/2 -translate-y-1/2 text-rose-500" />}
                  </button>
                )
              })}
            </div>
            
            <AnimatePresence>
              {isRevealed && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  className="bg-dark-200/50 rounded-2xl border border-white/10 p-5 mb-6"
                >
                  <p className="text-light-400 text-sm leading-relaxed"><strong className="text-light-100 mr-2">Explanation:</strong> {questions[currentQIndex].explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex justify-end min-h-[50px]">
              {isRevealed && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={nextQuestion}
                  className="flex items-center gap-2 bg-white text-dark-100 px-6 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  {currentQIndex < 4 ? "Next Question" : "View Results"} <ChevronRight size={18} />
                </motion.button>
              )}
            </div>
            
          </motion.div>
        )}

        {/* RESULTS STATE */}
        {gameState === 'results' && (
          <motion.div 
            key="results"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-8 md:p-14 background-glass rounded-3xl border border-white/10 w-full max-w-md text-center shadow-[var(--shadow-soft)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-primary-200/10 to-transparent pointer-events-none" />
            
            {score >= 3 ? (
               <div className="relative mb-6">
                 <div className="absolute inset-0 bg-primary-200 blur-[40px] opacity-40 rounded-full"></div>
                 <Trophy size={80} className="text-primary-200 drop-shadow-2xl relative z-10" />
               </div>
            ) : (
               <div className="relative mb-6">
                 <Frown size={80} className="text-rose-400 drop-shadow-2xl relative z-10" />
               </div>
            )}
            
            <h2 className="text-4xl font-bold text-white mb-2 z-10">Quiz Complete</h2>
            <div className="text-6xl font-black text-primary-200 my-6 tracking-tighter drop-shadow-[0_0_15px_rgba(167,139,250,0.5)] z-10">
              {score}<span className="text-3xl text-light-600">/5</span>
            </div>
            
            <p className="text-light-400 mb-10 z-10 text-lg">
              {score === 5 ? "Perfect flawless run! Truly exceptional." : 
               score >= 3 ? "Great job, solid knowledge representation." : 
               "Good effort! The extreme questions are tough."}
            </p>
            
            <Button onClick={() => setGameState('setup')} className="w-full h-14 bg-primary-200 text-dark-100 hover:bg-white font-bold text-lg rounded-xl shadow-[var(--shadow-glow)] transition-all z-10">
              Play Again
            </Button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
