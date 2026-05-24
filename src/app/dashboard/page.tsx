"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, Compass, Award, Calendar, AlertTriangle, 
  ArrowRight, User, BookOpen, Clock, Activity, MessageSquare, 
  Lock, Sparkles, ChevronLeft, ChevronRight, X, Loader2, Flame
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AiMarkdown from "@/components/AiMarkdown";

const supabase = createClient();

type UserProfile = {
  name: string;
  email: string;
  targetScore: string;
  timeline: string;
  currentLevel: string;
  concernSection: string;
};

type Flashcard = {
  id: string;
  front_content: string;
  back_content: string;
  questions?: {
    category: string;
  };
};

const mapCategory = (rawCat: string): string => {
  const c = (rawCat || "").toLowerCase();
  if (c.includes("algebra") || c.includes("exponent") || c.includes("inequality") || c.includes("equation")) return "Algebra";
  if (c.includes("arithmetic") || c.includes("number") || c.includes("integer") || c.includes("fraction") || c.includes("divisibility")) return "Arithmetic";
  if (c.includes("geometry") || c.includes("coordinate")) return "Geometry";
  if (c.includes("word") || c.includes("ratio") || c.includes("percent") || c.includes("probability") || c.includes("combinatorics") || c.includes("rate") || c.includes("mixture")) return "Word Problems";
  if (c.includes("critical") || c.includes("cr")) return "Critical Reasoning";
  if (c.includes("reading") || c.includes("rc") || c.includes("comprehension")) return "Reading Comprehension";
  if (c.includes("sufficiency") || c.includes("ds")) return "Data Sufficiency";
  if (c.includes("table") || c.includes("graph") || c.includes("multi-source") || c.includes("data insights")) return "Data Insights";
  return "Arithmetic"; 
};

export default function StudentDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [recentScore, setRecentScore] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  
  // Heatmap stats
  const [categoryStats, setCategoryStats] = useState<Record<string, { total: number; correct: number }>>({});

  // Dynamic AI coach state
  const [coachNote, setCoachNote] = useState<string>("Analyzing your GMAT profiles...");
  const [loadingCoach, setLoadingCoach] = useState(true);

  // Flashcards state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const fetchStatsAndData = async () => {
    // Get attempts
    const { data: attempts } = await supabase
      .from("test_attempts")
      .select("score")
      .order("completed_at", { ascending: false });

    if (attempts && attempts.length > 0) {
      setAttemptCount(attempts.length);
      setRecentScore(attempts[0].score);
    }

    // Get wrong answers
    const { data: mistakes } = await supabase
      .from("student_answers")
      .select("id")
      .eq("is_correct", false);

    if (mistakes) {
      setMistakeCount(mistakes.length);
    }

    // Fetch student answers for category stats
    const { data: answers } = await supabase
      .from("student_answers")
      .select("is_correct, questions(category)");

    const stats: Record<string, { total: number; correct: number }> = {};
    if (answers) {
      answers.forEach((ans: any) => {
        const rawCat = ans.questions?.category || "Arithmetic";
        const cat = mapCategory(rawCat);
        if (!stats[cat]) {
          stats[cat] = { total: 0, correct: 0 };
        }
        stats[cat].total += 1;
        if (ans.is_correct) {
          stats[cat].correct += 1;
        }
      });
    }
    setCategoryStats(stats);

    // Fetch dynamic coach update note
    try {
      const res = await fetch("/api/dashboard/coach-update");
      if (res.ok) {
        const data = await res.json();
        setCoachNote(data.feedback);
      }
    } catch (err) {
      console.error("Failed to load coach notes:", err);
    } finally {
      setLoadingCoach(false);
    }

    // Fetch generated flashcards
    try {
      const res = await fetch("/api/error-log/flashcards");
      if (res.ok) {
        const data = await res.json();
        setFlashcards(data);
      }
    } catch (err) {
      console.error("Failed to load flashcards:", err);
    }
  };

  const fetchStreak = async () => {
    try {
      const res = await fetch("/api/dashboard/streak", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.streak_count !== undefined) {
          setStreak(data.streak_count);
          localStorage.setItem("scorepath_streak", String(data.streak_count));
          return;
        }
      }
    } catch (e) {
      console.error("Failed to fetch/update streak in DB:", e);
    }
    
    // Local storage fallback for guests
    const localStreak = localStorage.getItem("scorepath_streak");
    setStreak(localStreak ? parseInt(localStreak) : 1);
  };

  useEffect(() => {
    // Load local storage setup details
    const storedUser = localStorage.getItem("scorepath_user");
    const storedOnboarding = localStorage.getItem("scorepath_onboarding");
    
    if (storedUser && storedOnboarding) {
      const user = JSON.parse(storedUser);
      const onboarding = JSON.parse(storedOnboarding);
      setProfile({
        name: user.name,
        email: user.email,
        ...onboarding
      });
    } else {
      // Default fallback if guest logs directly into dashboard
      setProfile({
        name: "Devansh Jain",
        email: "devansh@example.com",
        targetScore: "730+",
        timeline: "1 to 3 months",
        currentLevel: "Intermediate",
        concernSection: "Quantitative Reasoning"
      });
    }

    fetchStatsAndData();
    fetchStreak();
  }, []);

  const handleNextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIdx(prev => (prev < flashcards.length - 1 ? prev + 1 : 0));
    }, 150);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIdx(prev => (prev > 0 ? prev - 1 : flashcards.length - 1));
    }, 150);
  };

  // Setup weekday streaks dots
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const todayIndex = (new Date().getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  
  const isDayActive = (index: number) => {
    if (streak === 0) return false;
    const minActiveIndex = todayIndex - streak + 1;
    return index >= minActiveIndex && index <= todayIndex;
  };

  const heatmapCategories = [
    "Algebra", "Arithmetic", "Geometry", "Word Problems",
    "Critical Reasoning", "Reading Comprehension", "Data Sufficiency", "Data Insights"
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-24 flex flex-col items-center font-sans">
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-[var(--color-primary)] font-display flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center font-extrabold text-sm">S</div>
              ScorePath
            </span>
          </Link>
          
          <nav className="flex gap-6 items-center">
            <Link href="/practice" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
              Practice
            </Link>
            <Link href="/error-log" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5">
              Error Log
              {mistakeCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-[var(--color-error)] text-xs font-black">
                  {mistakeCount}
                </span>
              )}
            </Link>
            <Link href="/admin" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
              Admin
            </Link>
            <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center text-gray-600">
              <User className="w-4 h-4" />
            </div>
          </nav>
        </div>
      </header>

      {/* Main Bento Grid Layout */}
      <main className="max-w-6xl w-full px-6 mt-10 space-y-6">
        
        {/* Row 1: Welcome & Target (Col span 2) + Streak Card (Col span 1) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Welcome Card */}
          <div className="lg:col-span-2 bg-gradient-to-tr from-slate-900 via-slate-950 to-blue-950 text-white rounded-3xl p-8 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-1.5 z-10">
              <span className="px-2.5 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded-md text-xs font-bold text-blue-300 tracking-wide uppercase">
                GMAT Focus Workspace
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display mt-2">
                Welcome back, {profile?.name || "Devansh Jain"}!
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                Your custom path is locked. Focus on eliminating concern subtopics to push past your targets.
              </p>
            </div>
            
            <div className="flex gap-10 z-10 pt-6 border-t border-white/5 mt-auto">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Baseline Diagnostic</span>
                <p className="text-3xl font-black text-white mt-1 font-display tracking-tight">
                  {recentScore !== null ? `${recentScore}` : "610"}
                </p>
              </div>
              <div className="w-px bg-slate-800 h-10 my-auto" />
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target GMAT Score</span>
                <p className="text-3xl font-black text-emerald-400 mt-1 font-display tracking-tight">
                  {profile?.targetScore || "730+"}
                </p>
              </div>
              <div className="w-px bg-slate-800 h-10 my-auto" />
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Concern Section</span>
                <p className="text-lg font-bold text-amber-400 mt-2">
                  {profile?.concernSection ? profile.concernSection.split(" ")[0] : "Quant"}
                </p>
              </div>
            </div>
          </div>

          {/* Daily Streak Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl flex flex-col justify-between relative overflow-hidden min-h-[220px]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />
            
            <div className="flex items-center justify-between z-10">
              <h3 className="text-lg font-bold text-gray-900 font-display flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                Daily Streak
              </h3>
              <span className="text-xs font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                Consistency
              </span>
            </div>

            <div className="flex items-center gap-4 py-3 z-10">
              <motion.div
                animate={{ scale: [1, 1.06, 1], y: [0, -2, 0] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0"
              >
                <Flame className="w-7 h-7 fill-current text-amber-500 filter drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
              </motion.div>
              <div>
                <h4 className="text-3xl font-black text-slate-900 tracking-tight font-display">
                  {streak} {streak === 1 ? "Day" : "Days"}
                </h4>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Study streak active. Practice daily!</p>
              </div>
            </div>

            {/* Weekday indicator list */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 z-10 mt-auto">
              {weekdays.map((day, idx) => {
                const active = isDayActive(idx);
                const isToday = idx === todayIndex;
                return (
                  <div key={day} className="flex flex-col items-center gap-1.5">
                    <span className={`text-[10px] font-bold ${isToday ? "text-[var(--color-primary)] font-black" : "text-slate-400"}`}>
                      {day[0]}
                    </span>
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all duration-300
                      ${active 
                        ? "bg-amber-500 text-white ring-2 ring-amber-100 scale-110 shadow-xs" 
                        : isToday 
                          ? "border border-dashed border-[var(--color-primary)] bg-white animate-pulse" 
                          : "bg-slate-100 border border-slate-200"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Row 2: Category Mastery Heatmap (Col span 2) + AI Coach Notes (Col span 1) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Category Mastery Heatmap */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-xl space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-display flex items-center gap-2">
                  <Award className="w-5 h-5 text-[var(--color-accent-teal)]" />
                  Category Mastery Heatmap
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visual subtopic performance rating from correct & incorrect drills.
                </p>
              </div>

              {/* Legend Indicator */}
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                  <span>Mastered</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
                  <span>Review</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-xs bg-rose-500" />
                  <span>Weakness</span>
                </div>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {heatmapCategories.map((cat) => {
                const stat = categoryStats[cat];
                const total = stat?.total || 0;
                const correct = stat?.correct || 0;
                
                let cellColor = "bg-slate-50 border border-slate-150 text-slate-400";
                let statusLabel = "Not Attempted";

                if (total > 0) {
                  const accuracy = (correct / total) * 100;
                  if (accuracy >= 80) {
                    cellColor = "bg-emerald-50/50 border border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:shadow-xs";
                    statusLabel = `${Math.round(accuracy)}% Mastery (${correct}/${total})`;
                  } else if (accuracy >= 50) {
                    cellColor = "bg-amber-50/50 border border-amber-200 text-amber-700 hover:bg-amber-50 hover:shadow-xs";
                    statusLabel = `${Math.round(accuracy)}% Review (${correct}/${total})`;
                  } else {
                    cellColor = "bg-rose-50/50 border border-rose-200 text-rose-700 hover:bg-rose-50 hover:shadow-xs";
                    statusLabel = `${Math.round(accuracy)}% Weakness (${correct}/${total})`;
                  }
                }

                return (
                  <div 
                    key={cat}
                    className={`p-4 rounded-2xl transition-all duration-200 flex flex-col justify-between min-h-[90px] relative group cursor-default ${cellColor}`}
                  >
                    <span className="text-xs font-bold text-slate-800 tracking-tight font-display">{cat}</span>
                    <span className="text-[10px] font-semibold mt-2">{statusLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Coach Update */}
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--color-accent-violet)]/5 rounded-bl-full pointer-events-none" />
            
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 font-display flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[var(--color-accent-violet)]" />
                AI Coach Update
              </h3>
              
              {loadingCoach ? (
                <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--color-accent-violet)]" />
                  Analyzing accuracy logs...
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 relative">
                  <div className="absolute top-3 -left-2.5 w-3 h-3 bg-slate-50 border-l border-b border-slate-100 rotate-45 hidden md:block" />
                  <AiMarkdown content={coachNote} />
                </div>
              )}
            </div>

            <div className="pt-4 flex flex-col gap-2.5 mt-auto">
              <Link href="/error-log" className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1">
                Audit Pacing Fails in Error Log
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              
              {flashcards.length > 0 && (
                <button
                  onClick={() => {
                    setIsDeckOpen(true);
                    setCurrentCardIdx(0);
                    setIsFlipped(false);
                  }}
                  className="text-left inline-flex items-center gap-1 text-xs font-bold text-[var(--color-accent-violet)] hover:underline cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  Study {flashcards.length} AI Flashcards
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Row 3: Today's Mission (Col span 2) + Tutor (Col span 1) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Today's Mission */}
          <div className="lg:col-span-2 bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent-teal)] text-white rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-3 max-w-md z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5" />
                Active Focus Area
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display">
                GMAT Focus Section Drills
              </h2>
              <p className="text-white/85 text-sm leading-relaxed">
                Take an isolated practice session covering critical weak categories identified in your diagnostic test reports.
              </p>
            </div>

            <Link 
              href="/practice"
              className="inline-flex items-center gap-2 px-6 py-4 bg-white text-[var(--color-primary)] font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all z-10 shrink-0 cursor-pointer"
            >
              Start Focus Session
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Book Tutor Session */}
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl flex flex-col justify-between min-h-[180px]">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 font-display">GMAT 1-on-1 Coaching</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Review pacing indicators and error traps with our expert human instructors to design unique shortcut strategies.
              </p>
            </div>
            
            <Link 
              href="/tutor-booking" 
              className="block w-full py-3.5 rounded-xl border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 text-center font-bold transition-all text-sm mt-4 cursor-pointer"
            >
              Book 30-Min Free Strategy Session
            </Link>
          </div>

        </div>

      </main>

      {/* Dynamic Flashcards Study Deck Overlay */}
      <AnimatePresence>
        {isDeckOpen && flashcards.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeckOpen(false)}
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-slate-100 z-10"
            >
              <button
                onClick={() => setIsDeckOpen(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                <div className="flex justify-between items-center pr-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 font-display flex items-center gap-1.5">
                      <Sparkles className="w-5 h-5 text-[var(--color-accent-violet)]" />
                      Study Flashcards
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Click card below to flip.</p>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
                    {currentCardIdx + 1} of {flashcards.length}
                  </span>
                </div>

                {/* Flip Card container */}
                <div 
                  className="w-full h-64 [perspective:1000px] cursor-pointer"
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  <div className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                    
                    {/* Front side */}
                    <div className="absolute inset-0 w-full h-full bg-blue-50/30 border border-blue-100 rounded-2xl p-6 flex flex-col justify-between [backface-visibility:hidden] shadow-sm">
                      <span className="px-2.5 py-0.5 self-start text-[10px] font-bold text-[var(--color-primary)] bg-blue-100/50 rounded-md uppercase tracking-wide">
                        {flashcards[currentCardIdx].questions?.category || "GMAT Concept"}
                      </span>
                      <p className="text-sm font-semibold text-gray-800 leading-relaxed text-center my-auto px-2">
                        {flashcards[currentCardIdx].front_content}
                      </p>
                      <span className="text-[10px] text-slate-400 text-center uppercase tracking-wider font-semibold">
                        Click card to flip
                      </span>
                    </div>

                    {/* Back side */}
                    <div className="absolute inset-0 w-full h-full bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 flex flex-col justify-between [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-sm">
                      <span className="px-2.5 py-0.5 self-start text-[10px] font-bold text-[var(--color-accent-teal)] bg-slate-800 rounded-md uppercase tracking-wide">
                        GMAT Shortcut Hack
                      </span>
                      <p className="text-xs leading-relaxed text-slate-255 text-left my-auto px-2">
                        {flashcards[currentCardIdx].back_content}
                      </p>
                      <span className="text-[10px] text-slate-400 text-center uppercase tracking-wider font-semibold">
                        Click to flip back
                      </span>
                    </div>

                  </div>
                </div>

                {/* Navigation controls */}
                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevCard();
                    }}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-100 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextCard();
                    }}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-100 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
