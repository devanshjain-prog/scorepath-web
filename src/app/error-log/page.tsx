"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, AlertCircle, BookOpen, CheckCircle, 
  HelpCircle, ArrowRight, BrainCircuit, X, 
  Sparkles, Layers 
} from "lucide-react";
import Link from "next/link";
import AiMarkdown from "@/components/AiMarkdown";

type Mistake = {
  id: string;
  selected_answer: string;
  is_correct: boolean;
  time_spent_seconds: number;
  questions: {
    id: string;
    category: string;
    difficulty: string;
    prompt: string;
    correct_answer: string;
    explanation: string;
    tags: string[];
  };
};

type Flashcard = {
  id: string;
  question_id: string;
  front_content: string;
  back_content: string;
};

export default function ErrorLogPage() {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [selectedMistake, setSelectedMistake] = useState<Mistake | null>(null);

  // Tab State: 'explanation' | 'method' | 'flashcard'
  const [activeTab, setActiveTab] = useState<'explanation' | 'method' | 'flashcard'>('explanation');

  // AI Method Coach States
  const [studentMethod, setStudentMethod] = useState("");
  const [coachFeedback, setCoachFeedback] = useState<string | null>(null);
  const [analyzingMethod, setAnalyzingMethod] = useState(false);

  // AI Flashcard Generator States
  const [generatingFlashcard, setGeneratingFlashcard] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const fetchMistakesAndCards = async () => {
    try {
      const [mistakesRes, flashcardsRes] = await Promise.all([
        fetch("/api/error-log"),
        fetch("/api/error-log/flashcards")
      ]);
      if (mistakesRes.ok) {
        const data = await mistakesRes.json();
        setMistakes(data);
      }
      if (flashcardsRes.ok) {
        const cardsData = await flashcardsRes.json();
        setFlashcards(cardsData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMistakesAndCards();
  }, []);

  const handleSelectMistake = (m: Mistake) => {
    setSelectedMistake(m);
    setActiveTab('explanation');
    setStudentMethod("");
    setCoachFeedback(null);
    setIsFlipped(false);
  };

  const handleAnalyzeMethod = async () => {
    if (!selectedMistake || !studentMethod.trim()) return;
    setAnalyzingMethod(true);
    setCoachFeedback(null);

    try {
      const res = await fetch("/api/report/method-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: selectedMistake.questions.id,
          student_method: studentMethod,
          selected_answer: selectedMistake.selected_answer,
          correct_answer: selectedMistake.questions.correct_answer
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCoachFeedback(data.feedback);
      } else {
        alert("Failed to analyze method.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzingMethod(false);
    }
  };

  const handleGenerateFlashcard = async () => {
    if (!selectedMistake) return;
    setGeneratingFlashcard(true);

    try {
      const res = await fetch("/api/error-log/flashcard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: selectedMistake.questions.id,
          selected_answer: selectedMistake.selected_answer
        })
      });

      if (res.ok) {
        // Refresh flashcards list
        const cardsRes = await fetch("/api/error-log/flashcards");
        if (cardsRes.ok) {
          const cardsData = await cardsRes.json();
          setFlashcards(cardsData);
        }
      } else {
        alert("Failed to generate flashcard.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingFlashcard(false);
    }
  };

  const filteredMistakes = mistakes.filter((m) => {
    if (filter === "All") return true;
    return m.questions.category === filter;
  });

  const categories = ["All", "Quantitative Reasoning", "Verbal Reasoning", "Data Insights"];

  const activeCard = selectedMistake 
    ? flashcards.find(c => c.question_id === selectedMistake.questions.id)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-24">
      {/* Header */}
      <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold tracking-tight text-xl text-[var(--color-primary)]">
            ScorePath
          </Link>
          <div className="flex gap-4">
            <Link href="/dashboard" className="text-sm font-medium hover:underline text-gray-500">Dashboard</Link>
            <Link href="/practice" className="text-sm font-medium hover:underline text-[var(--color-primary)]">Practice Modes</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-12 grid lg:grid-cols-3 gap-8">
        {/* Left column - filters & mistake list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-extrabold tracking-tight">Error Log</h1>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-bold text-gray-600">
              {mistakes.length} mistakes found
            </span>
          </div>

          {/* Category Filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all
                  ${filter === cat 
                    ? "bg-[var(--color-primary)] text-white" 
                    : "bg-white hover:bg-gray-50 border border-gray-100 text-gray-500"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Mistake list */}
          <div className="space-y-4">
            {filteredMistakes.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                <CheckCircle className="w-12 h-12 text-[var(--color-success)] mx-auto mb-4" />
                <h3 className="text-xl font-bold">No mistakes found!</h3>
                <p className="text-gray-500 mt-2">Take a diagnostic or practice session to build your log.</p>
              </div>
            ) : (
              filteredMistakes.map((m) => (
                <div 
                  key={m.id}
                  onClick={() => handleSelectMistake(m)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer text-left bg-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4
                    ${selectedMistake?.id === m.id 
                      ? "border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]" 
                      : "border-gray-100 hover:border-gray-200"
                    }`}
                >
                  <div className="space-y-2 max-w-xl">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-xs font-semibold text-gray-600">
                        {m.questions.category}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[var(--color-accent-teal)]/10 text-xs font-semibold text-[var(--color-accent-teal)]">
                        {m.questions.difficulty}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-2">
                      {m.questions.prompt}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-sm font-semibold text-[var(--color-error)]">
                      Chose {m.selected_answer} (Correct: {m.questions.correct_answer})
                    </span>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column - mistake details & walkthrough */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedMistake ? (
              <motion.div
                key={selectedMistake.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 sticky top-24"
              >
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase">Selected Question Detail</span>
                  <h3 className="text-xl font-bold mt-2 text-gray-800 leading-snug">{selectedMistake.questions.prompt}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-red-50 rounded-xl">
                    <span className="text-xs font-bold text-red-500 uppercase">Your Choice</span>
                    <p className="text-lg font-extrabold text-red-600">{selectedMistake.selected_answer}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl">
                    <span className="text-xs font-bold text-green-500 uppercase">Correct</span>
                    <p className="text-lg font-extrabold text-green-600">{selectedMistake.questions.correct_answer}</p>
                  </div>
                </div>

                {/* Tabs Panel */}
                <div className="space-y-4">
                  <div className="flex border-b border-gray-100 pb-2">
                    <button
                      onClick={() => setActiveTab('explanation')}
                      className={`flex-1 text-center pb-2 text-[10px] font-extrabold uppercase tracking-wider transition-colors
                        ${activeTab === 'explanation' ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]" : "text-gray-400"}`}
                    >
                      Explanation
                    </button>
                    <button
                      onClick={() => setActiveTab('method')}
                      className={`flex-1 text-center pb-2 text-[10px] font-extrabold uppercase tracking-wider transition-colors flex items-center justify-center gap-1
                        ${activeTab === 'method' ? "text-[var(--color-accent-teal)] border-b-2 border-[var(--color-accent-teal)]" : "text-gray-400"}`}
                    >
                      <BrainCircuit className="w-3.5 h-3.5" />
                      Method Coach
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('flashcard');
                        setIsFlipped(false);
                      }}
                      className={`flex-1 text-center pb-2 text-[10px] font-extrabold uppercase tracking-wider transition-colors flex items-center justify-center gap-1
                        ${activeTab === 'flashcard' ? "text-[var(--color-accent-violet)] border-b-2 border-[var(--color-accent-violet)]" : "text-gray-400"}`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      AI Flashcard
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {activeTab === 'explanation' && (
                      <motion.div
                        key="explanation"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-2"
                      >
                        <p className="text-sm text-gray-600 leading-relaxed font-medium">
                          {selectedMistake.questions.explanation || "No explanation provided for this question."}
                        </p>
                      </motion.div>
                    )}

                    {activeTab === 'method' && (
                      <motion.div
                        key="method-coach"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        {!coachFeedback ? (
                          <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 uppercase">Explain your solving steps:</label>
                            <textarea
                              rows={4}
                              value={studentMethod}
                              onChange={(e) => setStudentMethod(e.target.value)}
                              placeholder="e.g. I multiplied both sides by (x - 2), then solved the quadratic..."
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--color-accent-teal)] transition-colors bg-gray-50/20"
                            />
                            <button
                              onClick={handleAnalyzeMethod}
                              disabled={analyzingMethod || !studentMethod.trim()}
                              className="w-full py-2.5 bg-[var(--color-accent-teal)] hover:bg-opacity-95 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                              {analyzingMethod ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  Analyze Method
                                  <BrainCircuit className="w-4 h-4" />
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-[var(--color-accent-teal)] uppercase">Coach Audit Feedback</span>
                              <button onClick={() => setCoachFeedback(null)} className="text-xs font-bold text-gray-400 hover:underline">
                                Retry Method
                              </button>
                            </div>
                            <div className="p-4 bg-[var(--color-accent-teal)]/5 rounded-2xl border border-[var(--color-accent-teal)]/10">
                              <AiMarkdown content={coachFeedback} />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === 'flashcard' && (
                      <motion.div
                        key="flashcard"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        {activeCard ? (
                          <div className="space-y-3 text-center">
                            <div 
                              className="w-full h-56 [perspective:1000px] cursor-pointer"
                              onClick={() => setIsFlipped(!isFlipped)}
                            >
                              <div className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                                
                                {/* Front side */}
                                <div className="absolute inset-0 w-full h-full bg-purple-50/50 border border-purple-100 rounded-2xl p-5 flex flex-col justify-between [backface-visibility:hidden] shadow-sm">
                                  <span className="px-2 py-0.5 self-start text-[9px] font-bold text-[var(--color-accent-violet)] bg-purple-100/50 rounded uppercase tracking-wide">
                                    Concept Question
                                  </span>
                                  <p className="text-xs font-semibold text-gray-800 leading-relaxed text-center my-auto">
                                    {activeCard.front_content}
                                  </p>
                                  <span className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">
                                    Click card to flip
                                  </span>
                                </div>

                                {/* Back side */}
                                <div className="absolute inset-0 w-full h-full bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 flex flex-col justify-between [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-sm">
                                  <span className="px-2 py-0.5 self-start text-[9px] font-bold text-[var(--color-accent-teal)] bg-slate-800 rounded uppercase tracking-wide">
                                    Coach Lesson Hack
                                  </span>
                                  <p className="text-[11px] leading-relaxed text-slate-200 text-left my-auto">
                                    {activeCard.back_content}
                                  </p>
                                  <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
                                    Click to flip back
                                  </span>
                                </div>

                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4 text-center py-6 bg-purple-50/30 rounded-2xl border border-dashed border-purple-200/50 p-6">
                            <Sparkles className="w-8 h-8 text-[var(--color-accent-violet)] mx-auto" />
                            <div className="space-y-1">
                              <h4 className="font-bold text-sm text-gray-800">Generate Concept Flashcard</h4>
                              <p className="text-xs text-gray-400 leading-relaxed">Let the AI coach distill this question's conceptual trap into an interactive study card.</p>
                            </div>
                            <button
                              onClick={handleGenerateFlashcard}
                              disabled={generatingFlashcard}
                              className="w-full py-2.5 bg-[var(--color-accent-violet)] hover:bg-opacity-95 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                              {generatingFlashcard ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Distilling Rules...
                                </>
                              ) : (
                                <>
                                  Generate AI Flashcard
                                  <Layers className="w-4 h-4" />
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <Link 
                    href={`/practice?topic=${selectedMistake.questions.category}`}
                    className="block w-full py-3 rounded-xl bg-[var(--color-primary)] text-white text-center font-bold hover:shadow-md transition-shadow text-sm"
                  >
                    Practice Similar Questions
                  </Link>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm text-center py-20 text-gray-400 sticky top-24">
                <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium">Select a mistake from the list to view detailed feedback & explanation.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
