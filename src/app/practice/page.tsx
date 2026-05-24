"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { 
  Loader2, ArrowRight, BookOpen, Target, RotateCcw, 
  Compass, ArrowLeft, ChevronRight, Info, EyeOff, 
  X, Sparkles, Lock, HelpCircle 
} from "lucide-react";
import Link from "next/link";
import AiMarkdown from "@/components/AiMarkdown";

const supabase = createClient();

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

// GMAT Formulas by Topic
const formulaSheet: Record<string, { title: string; formulas: string[] }[]> = {
  "Quantitative Reasoning": [
    {
      title: "Algebra & Inequalities",
      formulas: [
        "Inequality Sign Flip: Multiplying or dividing both sides by a negative number flips the inequality sign (e.g. -2x < 4 => x > -2).",
        "Quadratic Identity: (a + b)² = a² + 2ab + b²",
        "Difference of Squares: a² - b² = (a - b)(a + b)"
      ]
    },
    {
      title: "Ratios & Rates",
      formulas: [
        "Work Rate Formula: 1/T_total = 1/T_1 + 1/T_2",
        "Average Speed: Total Distance / Total Time (NOT the average of the two speeds!)",
        "Ratios: If A:B is 3:4, A = 3x and B = 4x."
      ]
    }
  ],
  "Data Insights": [
    {
      title: "Data Sufficiency",
      formulas: [
        "Value vs. Yes/No: A statement is sufficient if it yields exactly ONE unique value, or a definitive 'Yes' or 'No'.",
        "Step 1: Analyze statement (1) alone.",
        "Step 2: Analyze statement (2) alone."
      ]
    }
  ]
};

const eliminationReasons = [
  "Out of scope",
  "Too extreme",
  "Opposite logic",
  "Calculation mismatch",
  "Half-correct / Irrelevant detail",
  "Trap wording"
];

function PracticeDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicFilter = searchParams.get("topic");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Game mode status state
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, { selected_answer: string, confidence: string }>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [submittingAnswers, setSubmittingAnswers] = useState(false);

  // Stats
  const [mistakeCount, setMistakeCount] = useState(0);

  // Gating & Tier checking
  const [subTier, setSubTier] = useState<string>("core");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Interactive modes
  const [eliminationMode, setEliminationMode] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<string, { reason: string }>>({});
  const [showFormulaSheet, setShowFormulaSheet] = useState(false);
  const [selectedReasonOption, setSelectedReasonOption] = useState<string | null>(null);
  
  // Confidence state
  const [showConfidenceModal, setShowConfidenceModal] = useState(false);

  // AI explainer states
  const [showAiCoach, setShowAiCoach] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [activeExplainType, setActiveExplainType] = useState<string | null>(null);

  const fetchStats = async () => {
    const { data: mistakes } = await supabase
      .from('student_answers')
      .select('id')
      .eq('is_correct', false);
    if (mistakes) {
      setMistakeCount(mistakes.length);
    }
  };

  useEffect(() => {
    // Check subscription tier
    const sub = localStorage.getItem("scorepath_subscription");
    if (sub) {
      setSubTier(JSON.parse(sub).tier);
    }
    
    fetchStats();
  }, []);

  const startSession = async (mode: 'weakness' | 'comeback' | 'mixed') => {
    setLoading(true);
    let query = supabase.from('questions').select('*');

    if (mode === 'weakness') {
      const targetTopic = topicFilter || 'Quantitative Reasoning';
      query = query.eq('category', targetTopic).limit(5);
    } else if (mode === 'comeback') {
      const { data: wrongAnswers } = await supabase
        .from('student_answers')
        .select('question_id')
        .eq('is_correct', false);

      const wrongIds = wrongAnswers?.map(w => w.question_id) || [];
      if (wrongIds.length === 0) {
        alert("No mistakes logged in your Error Log yet! Complete a diagnostic first.");
        setLoading(false);
        return;
      }
      query = query.in('id', wrongIds).limit(5);
    } else {
      query = query.limit(5);
    }

    const { data, error } = await query;
    if (data && data.length > 0) {
      setQuestions(data);
      setActiveSession(true);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setAnswers({});
      setIsCompleted(false);
      setEliminatedOptions({});
      setShowAiCoach(false);
      setAiExplanation(null);
    } else {
      alert("Failed to find practice questions for this mode.");
    }
    setLoading(false);
  };

  const handleNextClick = () => {
    if (selectedAnswer) {
      setShowConfidenceModal(true);
    }
  };

  const submitPracticeAnswers = async (finalAnswers: Record<string, { selected_answer: string, confidence: string }>) => {
    setSubmittingAnswers(true);
    try {
      const res = await fetch("/api/practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers })
      });
      if (res.ok) {
        await fetchStats();
      }
    } catch (e) {
      console.error("Failed to submit practice answers:", e);
    } finally {
      setSubmittingAnswers(false);
      setIsCompleted(true);
    }
  };

  const selectConfidence = (confidence: string) => {
    if (!selectedAnswer) return;

    const currentQId = questions[currentIndex].id;
    const updatedAnswers = {
      ...answers,
      [currentQId]: { selected_answer: selectedAnswer, confidence }
    };
    setAnswers(updatedAnswers);
    setShowConfidenceModal(false);

    // Reset AI coach sidebar when transitioning
    setShowAiCoach(false);
    setAiExplanation(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setEliminatedOptions({});
    } else {
      submitPracticeAnswers(updatedAnswers);
    }
  };

  const handleOptionClick = (optionId: string) => {
    if (eliminationMode) {
      if (eliminatedOptions[optionId]) {
        const copy = { ...eliminatedOptions };
        delete copy[optionId];
        setEliminatedOptions(copy);
      } else {
        setSelectedReasonOption(optionId);
      }
    } else {
      setSelectedAnswer(optionId);
    }
  };

  const selectEliminationReason = (reason: string) => {
    if (selectedReasonOption) {
      setEliminatedOptions(prev => ({
        ...prev,
        [selectedReasonOption]: { reason }
      }));
      setSelectedReasonOption(null);
    }
  };

  const handleToggleElimination = () => {
    if (subTier !== "pro") {
      setShowUpgradeModal(true);
    } else {
      setEliminationMode(!eliminationMode);
    }
  };

  const handleToggleFormula = () => {
    if (subTier !== "pro") {
      setShowUpgradeModal(true);
    } else {
      // Close AI coach if formula sheet opens
      setShowAiCoach(false);
      setShowFormulaSheet(!showFormulaSheet);
    }
  };

  const triggerAiExplain = async (type: 'eli5' | 'shortcut') => {
    // Close formula sheet if AI coach opens
    setShowFormulaSheet(false);
    setShowAiCoach(true);
    setLoadingExplanation(true);
    setAiExplanation(null);
    setActiveExplainType(type);

    try {
      const res = await fetch("/api/practice/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: questions[currentIndex].id,
          selected_answer: selectedAnswer,
          explain_type: type
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiExplanation(data.explanation);
      } else {
        setAiExplanation("Failed to load explanation from the AI coach.");
      }
    } catch (e) {
      console.error(e);
      setAiExplanation("Error communicating with AI coach.");
    } finally {
      setLoadingExplanation(false);
    }
  };

  if (loading || submittingAnswers) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        {submittingAnswers && <p className="text-sm font-semibold text-gray-500">Saving practice stats and updating Error Log...</p>}
        {loading && <p className="text-sm font-semibold text-gray-500">Generating dynamic GMAT Focus drills...</p>}
      </div>
    );
  }

  if (activeSession) {
    if (isCompleted) {
      return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold font-display text-gray-900">Session Complete!</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              You successfully finished this GMAT practice set. Any incorrect answers have been added to your Error Log to generate personalized concept hacks.
            </p>
            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => {
                  setActiveSession(false);
                  fetchStats();
                }}
                className="flex-1 py-3.5 rounded-xl bg-[var(--color-primary)] hover:bg-opacity-95 text-white font-bold transition-all shadow-md cursor-pointer"
              >
                Back to Practice
              </button>
              <Link 
                href="/error-log"
                className="flex-1 py-3.5 rounded-xl border-2 border-slate-200 hover:border-slate-300 text-gray-700 font-bold block text-center transition-colors"
              >
                View Error Log
              </Link>
            </div>
          </div>
        </div>
      );
    }

    const currentQ = questions[currentIndex];
    const formulas = formulaSheet[currentQ.category] || [];

    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex font-sans">
        
        {/* Pro Plan Feature lock modal */}
        <AnimatePresence>
          {showUpgradeModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4">
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full border border-slate-100 space-y-6 text-center"
              >
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent-violet)]/10 text-[var(--color-accent-violet)] flex items-center justify-center mx-auto mb-2">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-gray-900 font-display">Unlock Pro Features</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Elimination Trainer and Formula Assist sidebars are locked under the Pro GMAT Plan. Upgrading unlocks these interactive features.
                  </p>
                </div>
                
                <div className="space-y-2.5 pt-2">
                  <Link 
                    href="/checkout"
                    className="block w-full py-3.5 rounded-xl bg-[var(--color-accent-violet)] hover:bg-opacity-95 text-white font-bold text-sm text-center shadow-md"
                  >
                    Upgrade to Pro Plan
                  </Link>
                  <button 
                    onClick={() => setShowUpgradeModal(false)}
                    className="w-full py-3.5 rounded-xl border border-gray-200 text-gray-500 font-bold text-sm text-center cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Confidence Check Popover Overlay */}
        <AnimatePresence>
          {showConfidenceModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4">
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full border border-slate-100 space-y-6 text-center"
              >
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mx-auto mb-2">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-gray-900 font-display">Confidence Check</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    How confident are you about this choice? We analyze guessing trends to correct priority weaknesses.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => selectConfidence("Sure")}
                    className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    🟢 Sure (Highly Confident)
                  </button>
                  <button
                    onClick={() => selectConfidence("Unsure")}
                    className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    🟡 Unsure (50/50 Guess)
                  </button>
                  <button
                    onClick={() => selectConfidence("Guessed")}
                    className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    🔵 Guessed (Blind Guess)
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Left main workspace */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="w-full bg-white border-b border-slate-100 h-16 flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
            <button onClick={() => setActiveSession(false)} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 font-bold text-sm cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              Quit Practice
            </button>
            
            {/* Features bar */}
            <div className="flex items-center gap-3">
              {/* Formula Assist Toggle */}
              {formulas.length > 0 && (
                <button
                  onClick={handleToggleFormula}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer
                    ${showFormulaSheet 
                      ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm" 
                      : "bg-white hover:bg-slate-50 border-slate-200 text-gray-600"
                    }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Formula Assist
                </button>
              )}
              
              {/* Elimination Trainer Toggle */}
              <button
                onClick={handleToggleElimination}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer
                  ${eliminationMode 
                    ? "bg-[var(--color-accent-teal)] text-white border-[var(--color-accent-teal)] shadow-sm" 
                    : "bg-white hover:bg-slate-50 border-slate-200 text-gray-600"
                  }`}
              >
                <EyeOff className="w-3.5 h-3.5" />
                Elimination Mode
              </button>
            </div>

            <span className="text-sm font-semibold text-slate-500">Question {currentIndex + 1} of {questions.length}</span>
          </header>

          <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12 flex flex-col justify-center relative">
            
            {/* Elimination Reason Popover */}
            <AnimatePresence>
              {selectedReasonOption && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full border border-slate-100 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-gray-800 font-display">Why eliminate Option {selectedReasonOption}?</h3>
                      <button onClick={() => setSelectedReasonOption(null)} className="cursor-pointer">
                        <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {eliminationReasons.map((reason) => (
                        <button
                          key={reason}
                          onClick={() => selectEliminationReason(reason)}
                          className="text-left px-4 py-2.5 rounded-xl border border-slate-100 hover:border-slate-300 text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          {reason}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            <div className="mb-8">
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wide">
                {currentQ.category}
              </span>
              <h1 className="text-2xl md:text-3xl font-medium mt-4 leading-relaxed text-gray-900 font-display">
                {currentQ.prompt}
              </h1>
            </div>

            <div className="space-y-4 mb-8">
              {currentQ.options.map(opt => {
                const isEliminated = !!eliminatedOptions[opt.id];
                const isSelected = selectedAnswer === opt.id;

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionClick(opt.id)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all flex justify-between items-center gap-4 relative overflow-hidden group cursor-pointer
                      ${isEliminated 
                        ? "border-slate-100 bg-slate-50/40 opacity-35" 
                        : isSelected 
                          ? "border-blue-200 border-l-8 border-l-[var(--color-primary)] bg-blue-50/20 shadow-md translate-x-1" 
                          : "border-slate-200 hover:border-slate-350 hover:translate-x-0.5 bg-white shadow-xs hover:shadow-md"
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200
                        ${isEliminated 
                          ? "bg-slate-200 text-slate-400" 
                          : isSelected 
                            ? "bg-[var(--color-primary)] text-white ring-4 ring-blue-100" 
                            : "bg-slate-50 border border-slate-200 text-slate-500 group-hover:bg-slate-100"
                        }`}
                      >
                        {opt.id}
                      </div>
                      <span className={`text-base font-medium transition-colors duration-200
                        ${isEliminated 
                          ? "line-through text-slate-400 font-normal" 
                          : isSelected 
                            ? "text-gray-900 font-semibold" 
                            : "text-gray-700 group-hover:text-gray-900"
                        }`}
                      >
                        {opt.text}
                      </span>
                    </div>

                    {isEliminated && (
                      <span className="text-xs font-bold text-red-500 bg-red-50/80 px-2.5 py-0.5 border border-red-100 rounded-md italic">
                        {eliminatedOptions[opt.id]?.reason}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* AI explainer prompt triggers once an answer is chosen */}
            {selectedAnswer && (
              <div className="flex flex-col sm:flex-row gap-4 p-5 bg-purple-50/30 rounded-2xl border border-purple-100/50 mb-8 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-purple-700">
                  <Sparkles className="w-4 h-4 text-[var(--color-accent-violet)] animate-pulse" />
                  <span>Stuck on GMAT reasoning? Ask AI Coach</span>
                </div>
                <div className="flex gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={() => triggerAiExplain('eli5')}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-white border border-purple-150 hover:border-purple-300 rounded-xl text-xs font-bold text-purple-800 hover:bg-purple-50 transition-all shadow-xs cursor-pointer"
                  >
                    Analogy (ELI5)
                  </button>
                  <button
                    onClick={() => triggerAiExplain('shortcut')}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-white border border-purple-150 hover:border-purple-300 rounded-xl text-xs font-bold text-purple-800 hover:bg-purple-50 transition-all shadow-xs cursor-pointer"
                  >
                    Speed Shortcut
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                {eliminationMode ? "Click options to cross out and tag reason." : "Click options to select final answer."}
              </span>
              <button
                onClick={handleNextClick}
                disabled={!selectedAnswer}
                className={`px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all duration-250 cursor-pointer
                  ${selectedAnswer 
                    ? "bg-[var(--color-primary)] text-white hover:-translate-y-0.5 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 active:translate-y-0" 
                    : "bg-slate-100 text-slate-450 cursor-not-allowed border border-slate-200"
                  }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </main>
        </div>

        {/* Right side Formula panel */}
        <AnimatePresence>
          {showFormulaSheet && formulas.length > 0 && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
              className="bg-white border-l border-slate-100 shrink-0 overflow-y-auto p-6 space-y-6 shadow-xl sticky top-0 h-screen z-20"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <h3 className="font-bold text-lg flex items-center gap-2 text-slate-900 font-display">
                  <BookOpen className="w-5 h-5 text-[var(--color-primary)]" />
                  Formula Assist
                </h3>
                <button onClick={() => setShowFormulaSheet(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formulas.map((sec, idx) => (
                <div key={idx} className="space-y-3">
                  <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">{sec.title}</h4>
                  <div className="space-y-2">
                    {sec.formulas.map((form, fIdx) => (
                      <div key={fIdx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600 leading-relaxed font-medium">
                        {form}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right side AI Coach panel */}
        <AnimatePresence>
          {showAiCoach && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
              className="bg-white border-l border-slate-100 shrink-0 overflow-y-auto p-6 space-y-6 shadow-xl sticky top-0 h-screen z-20"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <h3 className="font-bold text-lg flex items-center gap-2 text-slate-900 font-display">
                  <Sparkles className="w-5 h-5 text-[var(--color-accent-violet)]" />
                  GMAT AI Coach
                </h3>
                <button onClick={() => setShowAiCoach(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-100 uppercase tracking-wider">
                  {activeExplainType === 'eli5' ? 'ELI5 Concept Analogy' : 'Speed-Solving Hack'}
                </span>
                
                {loadingExplanation ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 text-sm text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent-violet)]" />
                    <span>Asking Coach for dynamic insights...</span>
                  </div>
                ) : (
                  <div className="p-4 bg-purple-50/20 rounded-2xl border border-purple-100/30">
                    <AiMarkdown content={aiExplanation || ""} />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-24 font-sans">
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold tracking-tight text-xl text-[var(--color-primary)] font-display flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center font-extrabold text-sm">S</div>
            ScorePath
          </Link>
          <div className="flex gap-4">
            <Link href="/dashboard" className="text-sm font-bold hover:underline text-gray-500 hover:text-gray-900 transition-colors">Dashboard</Link>
            <Link href="/error-log" className="text-sm font-bold hover:underline text-gray-500 hover:text-gray-900 transition-colors">Error Log</Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <main className="max-w-4xl mx-auto px-6 mt-12 space-y-12 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight font-display text-gray-900">Practice Engine</h1>
          <p className="text-slate-500 text-lg">Select a GMAT-optimized practice mode to target your weak spots.</p>
        </div>

        {/* Practice Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl flex flex-col justify-between hover:shadow-2xl transition-all hover:-translate-y-1 duration-300">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-display text-gray-900">Weakness Attack</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Generates a dynamic target list prioritizing Quantitative or Verbal categories derived directly from your AI Report.
              </p>
            </div>
            <button 
              onClick={() => startSession('weakness')}
              className="mt-8 py-3.5 rounded-xl bg-slate-50 hover:bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold flex items-center justify-center gap-2 group transition-all cursor-pointer"
            >
              Start Mode
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl flex flex-col justify-between hover:shadow-2xl transition-all hover:-translate-y-1 duration-300">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent-teal)]/10 text-[var(--color-accent-teal)] flex items-center justify-center">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-display text-gray-900">Comeback Round</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Pulls active wrong answers from your personal Error Log to ensure you build secondary memory of concept traps.
              </p>
              {mistakeCount > 0 && (
                <span className="inline-block px-2.5 py-0.5 text-xs font-bold text-red-500 bg-red-50 rounded-full border border-red-100">
                  {mistakeCount} mistakes to clear
                </span>
              )}
            </div>
            <button 
              onClick={() => startSession('comeback')}
              className="mt-8 py-3.5 rounded-xl bg-slate-50 hover:bg-[var(--color-accent-teal)]/10 text-[var(--color-accent-teal)] font-bold flex items-center justify-center gap-2 group transition-all cursor-pointer"
            >
              Start Mode
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl flex flex-col justify-between hover:shadow-2xl transition-all hover:-translate-y-1 duration-300">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent-violet)]/10 text-[var(--color-accent-violet)] flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-display text-gray-900">Mixed Fix Round</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Builds exam simulation stamina with a mixed bundle of arithmetic, verbal comprehension, and logic questions.
              </p>
            </div>
            <button 
              onClick={() => startSession('mixed')}
              className="mt-8 py-3.5 rounded-xl bg-slate-50 hover:bg-[var(--color-accent-violet)]/10 text-[var(--color-accent-violet)] font-bold flex items-center justify-center gap-2 group transition-all cursor-pointer"
            >
              Start Mode
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    }>
      <PracticeDashboard />
    </Suspense>
  );
}
