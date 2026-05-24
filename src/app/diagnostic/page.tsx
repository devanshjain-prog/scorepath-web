"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Target, AlertCircle, Loader2, Sparkles, Clock, HelpCircle } from "lucide-react";
import Link from "next/link";

type Option = {
  id: string;
  text: string;
};

type Question = {
  id: string;
  category: string;
  difficulty: string;
  prompt: string;
  options: Option[];
};

export default function DiagnosticTest() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfidenceModal, setShowConfidenceModal] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  // 30-minute timer (1800 seconds)
  const [timeLeft, setTimeLeft] = useState(1800);
  const totalSteps = 15;

  // Timer countdown hook
  useEffect(() => {
    if (loading || submitting || showIntro || !currentQuestion) return;
    
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, loading, submitting, showIntro, currentQuestion]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const startTest = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/diagnostic/start', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to initialize diagnostic session');
      const data = await res.json();
      if (data.attempt_id) {
        setAttemptId(data.attempt_id);
        setCurrentQuestion(data.question);
        setCurrentIndex(0);
        setShowIntro(false);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to start test attempt. Please check your local server/database.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSubmit = async () => {
    if (!attemptId) {
      router.push("/");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/diagnostic/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attempt_id: attemptId,
          auto_submit: true
        })
      });
      const data = await res.json();
      router.push(`/signup-wall?attempt_id=${attemptId}`);
    } catch (e) {
      console.error(e);
      router.push("/");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextClick = () => {
    if (selectedAnswer) {
      setShowConfidenceModal(true);
    }
  };

  const selectConfidence = async (confidence: string) => {
    if (!selectedAnswer || !currentQuestion || !attemptId) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/diagnostic/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attempt_id: attemptId,
          question_id: currentQuestion.id,
          selected_answer: selectedAnswer,
          confidence,
          time_spent_seconds: 45 // standard question duration tracker
        })
      });
      const data = await res.json();
      setShowConfidenceModal(false);
      setSelectedAnswer(null);

      if (data.finished) {
        router.push(`/signup-wall?attempt_id=${attemptId}`);
      } else {
        setCurrentQuestion(data.question);
        setCurrentIndex(data.step - 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || submitting) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        {submitting && <p className="text-sm font-medium text-gray-500">Calculating your metrics and GMAT diagnostic score...</p>}
        {loading && <p className="text-sm font-medium text-gray-500">Generating GMAT Computer Adaptive environment...</p>}
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mx-auto">
            <Target className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight">GMAT Diagnostic Test</h2>
            <p className="text-gray-500 text-sm">
              This test consists of <strong className="text-gray-700">15 questions</strong> and has a <strong className="text-gray-700">30-minute time limit</strong>.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200/50 rounded-2xl p-4 text-left text-xs text-amber-800 space-y-1.5 leading-relaxed">
            <p className="font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Important Instructions:
            </p>
            <p>1. **Computer Adaptive**: Difficulty adapts to your accuracy in real-time.</p>
            <p>2. The timer starts immediately upon clicking below.</p>
            <p>3. If the time expires, remaining questions get an unanswered GMAT penalty.</p>
            <p>4. Each question tracks confidence to isolate guessing traps.</p>
          </div>

          <button
            onClick={startTest}
            className="w-full py-4 rounded-xl bg-[var(--foreground)] text-[var(--background)] font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
          >
            Start 30-Min Test
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center text-center p-6">
        <div>
          <AlertCircle className="w-12 h-12 text-[var(--color-error)] mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Adaptive Model Loading Failed</h2>
          <p className="text-gray-500 mb-6">The database has not been seeded or is currently unavailable.</p>
          <Link href="/" className="text-[var(--color-primary)] hover:underline font-medium">Return Home</Link>
        </div>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      {/* Confidence Modal overlay */}
      <AnimatePresence>
        {showConfidenceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-sm w-full border border-white/50 space-y-6 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-amber-400 to-indigo-500" />
              
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-gray-900">Confidence Check</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  How certain are you about this choice? We use this to isolate guessing traps in your GMAT score.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => selectConfidence("Sure")}
                  className="w-full py-3.5 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  🟢 Sure (Highly Confident)
                </button>
                <button
                  onClick={() => selectConfidence("Unsure")}
                  className="w-full py-3.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  🟡 Unsure (50/50 Guess)
                </button>
                <button
                  onClick={() => selectConfidence("Guessed")}
                  className="w-full py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  🔵 Guessed (Blind Guess)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header & Progress */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold tracking-tight text-gray-400 hover:text-gray-900 transition-colors">Quit</Link>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-[var(--color-error)] text-xs font-bold rounded-lg border border-red-100">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(timeLeft)}</span>
            </div>
            <div className="text-sm font-semibold text-gray-500">
              Question {currentIndex + 1} of {totalSteps}
            </div>
          </div>
          
          <div className="text-xs font-bold px-3 py-1.5 bg-gray-100 rounded-lg text-gray-600">
            {currentQuestion.category}
          </div>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-100">
          <motion.div 
            className="h-full bg-[var(--color-primary)]"
            initial={{ width: `${((currentIndex) / totalSteps) * 100}%` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            <div className="mb-10">
              <span className="inline-block px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent-teal)] bg-[var(--color-accent-teal)]/10 rounded-md mb-4">
                Difficulty: {currentQuestion.difficulty}
              </span>
              <h1 className="text-2xl md:text-3xl font-medium leading-relaxed text-gray-900 font-display">
                {currentQuestion.prompt}
              </h1>
            </div>

            <div className="space-y-4 mt-auto mb-12">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedAnswer === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedAnswer(option.id)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center gap-4 group cursor-pointer relative overflow-hidden
                      ${isSelected 
                        ? "border-blue-200 border-l-8 border-l-[var(--color-primary)] bg-blue-50/30 shadow-md translate-x-1" 
                        : "border-gray-200 hover:border-gray-300 hover:translate-x-0.5 bg-white shadow-xs hover:shadow-md"
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200
                      ${isSelected 
                        ? "bg-[var(--color-primary)] text-white ring-4 ring-blue-100" 
                        : "bg-gray-50 border border-gray-200 text-gray-600 group-hover:bg-gray-100 group-hover:text-gray-900"
                      }`}
                    >
                      {option.id}
                    </div>
                    <span className={`text-base md:text-lg font-medium transition-colors duration-200
                      ${isSelected ? "text-gray-900 font-semibold" : "text-gray-700 group-hover:text-gray-900"}`}
                    >
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-auto flex justify-end">
              <button
                onClick={handleNextClick}
                disabled={!selectedAnswer}
                className={`px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all duration-250 cursor-pointer
                  ${selectedAnswer 
                    ? "bg-[var(--color-primary)] text-white hover:-translate-y-0.5 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 active:translate-y-0" 
                    : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                  }`}
              >
                {currentIndex === totalSteps - 1 ? "Submit Diagnostic" : "Next Question"}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
