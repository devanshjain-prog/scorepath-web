"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Loader2, AlertCircle, Award, Calendar, 
  BookOpen, UserCheck, Download, TrendingUp, Sparkles, Check 
} from "lucide-react";
import Link from "next/link";

type Weakness = {
  category: string;
  subtopic: string;
  issue: string;
  recommendation: string;
};

type Strength = {
  category: string;
  subtopic: string;
  reason: string;
};

type StudyStep = {
  step: number;
  action: string;
  duration: string;
};

type ReportContent = {
  student_name?: string;
  overall_summary: string;
  strengths: Strength[];
  weaknesses: Weakness[];
  study_plan: StudyStep[];
};

function ReportDashboard() {
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attempt_id");
  const [report, setReport] = useState<ReportContent | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState(0);
  const [studentName, setStudentName] = useState("Devansh Jain");

  const stages = [
    "Compiling diagnostic responses...",
    "Isolating exact error categories...",
    "Querying formula database (Agentic RAG)...",
    "Synthesizing weakness patterns...",
    "Generating personalized improvement path..."
  ];

  useEffect(() => {
    // Check if name is stored in localStorage, fallback to Devansh Jain
    const userStr = localStorage.getItem("scorepath_user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.name) setStudentName(u.name);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (!attemptId) {
      setError("No attempt ID provided. Please complete the diagnostic first.");
      setLoading(false);
      return;
    }

    const stageInterval = setInterval(() => {
      setLoadingStage(prev => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 2000);

    async function generateReport() {
      try {
        const res = await fetch("/api/report/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attempt_id: attemptId })
        });
        
        if (!res.ok) {
          throw new Error("Failed to generate your report. Please check server logs.");
        }

        const data = await res.json();
        setReport(data.report_content);
        if (data.score) {
          setScore(data.score);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        clearInterval(stageInterval);
        setLoading(false);
      }
    }

    generateReport();
    return () => clearInterval(stageInterval);
  }, [attemptId]);

  const handlePrint = () => {
    window.print();
  };

  const getPercentile = (s: number | null) => {
    if (!s) return "72nd";
    if (s >= 760) return "99th";
    if (s >= 700) return "98th";
    if (s >= 650) return "90th";
    if (s >= 600) return "75th";
    if (s >= 550) return "55th";
    return "45th";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full">
          <Loader2 className="w-12 h-12 animate-spin text-[var(--color-primary)] mx-auto mb-6" />
          <h2 className="text-2xl font-bold font-display text-gray-900 mb-2">Analyzing Performance</h2>
          <p className="text-gray-500 font-medium h-6 text-sm">{stages[loadingStage]}</p>
          
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-6 overflow-hidden border border-slate-200">
            <motion.div 
              className="bg-[var(--color-primary)] h-full"
              initial={{ width: "0%" }}
              animate={{ width: `${((loadingStage + 1) / stages.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white border border-slate-100 p-8 rounded-3xl shadow-xl">
          <AlertCircle className="w-12 h-12 text-[var(--color-error)] mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-display mb-2">Something Went Wrong</h2>
          <p className="text-gray-500 mb-6 text-sm leading-relaxed">{error}</p>
          <Link href="/diagnostic" className="px-6 py-3.5 bg-[var(--color-primary)] hover:bg-opacity-95 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all inline-block">
            Restart Diagnostic
          </Link>
        </div>
      </div>
    );
  }

  const { overall_summary, strengths = [], weaknesses = [], study_plan = [] } = report || {};

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-24 font-sans">
      {/* Print styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
            font-family: var(--font-inter), sans-serif !important;
          }
          header, button, .no-print, .human-coach-card {
            display: none !important;
          }
          main {
            display: block !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-side-by-side {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 20px !important;
          }
          .print-card {
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            page-break-inside: avoid;
            margin-bottom: 20px !important;
            border-radius: 16px !important;
            padding: 24px !important;
          }
          .page-break {
            page-break-before: always;
          }
        }
      `}} />

      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-10 no-print">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold tracking-tight text-xl text-[var(--color-primary)] font-display flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center font-extrabold text-sm">S</div>
            ScorePath
          </Link>
          <div className="flex items-center gap-4">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-gray-700 rounded-xl hover:bg-slate-100 font-bold text-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download PDF Report
            </button>
            <Link href="/dashboard" className="text-sm font-bold text-[var(--color-primary)] hover:underline">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Printable Report Header card */}
      <div className="max-w-6xl mx-auto px-6 mt-8">
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6 print-card relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-teal-400 to-indigo-600" />
          
          <div className="space-y-1">
            <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent-teal)] bg-[var(--color-accent-teal)]/10 border border-teal-200/30 rounded-full">
              ScorePath Official Diagnostic Report Card
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 font-display tracking-tight pt-1">GMAT Diagnostic Analysis</h1>
            <p className="text-gray-500 text-sm font-medium">
              Prepared for: <span className="text-gray-800 font-bold">{studentName}</span>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
            {score !== null && (
              <div className="bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 rounded-2xl p-4 text-center min-w-[170px] w-full sm:w-auto relative overflow-hidden">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Predicted GMAT Score</div>
                <div className="text-3xl font-black text-[var(--color-primary)] font-display tracking-tight">{score} <span className="text-lg font-bold text-gray-400 font-sans">/ 800</span></div>
                <div className="text-[10px] text-emerald-600 font-bold mt-1">~{getPercentile(score)} Percentile Rank</div>
              </div>
            )}
            <div className="text-left md:text-right text-sm text-gray-500 space-y-1 font-medium">
              <div>Date: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div>Test Duration: 30 Minutes</div>
              <div>Questions Analyzed: 15 Prompts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <main className="max-w-6xl mx-auto px-6 mt-8 grid lg:grid-cols-3 gap-8">
        
        {/* Left Column - Summary, Strengths & Weaknesses Grid */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Executive Summary Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl relative overflow-hidden print-card"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent-teal)]/5 rounded-bl-full pointer-events-none no-print" />
            <h2 className="text-xl font-bold text-gray-900 font-display mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-[var(--color-accent-teal)]" />
              AI Socratic Summary
            </h2>
            <p className="text-slate-700 leading-relaxed text-base md:text-lg z-10 relative">
              {overall_summary}
            </p>
          </motion.div>

          {/* GMAT Adaptive Scoring Mechanics Callout */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.02 }}
            className="bg-slate-50 border border-slate-100 rounded-3xl p-6 shadow-sm print-card space-y-3"
          >
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
              Adaptive Diagnostic Engine Mechanics
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              This score is calculated using ScorePath's real-time Computer Adaptive Test (CAT) engine mimicking the official GMAT. The engine initializes student ability at a baseline of <strong>500</strong> and adjusts difficulty (Easy, Medium, Hard) after each submission. Easy questions penalize incorrect answers heavily (-50), while Hard questions reward correct answers strongly (+50). A strict time-limit penalty of <strong>-40 points</strong> is automatically applied to each unanswered question upon timer expiration.
            </p>
          </motion.div>

          {/* Strengths & Weaknesses Side-By-Side Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print-side-by-side">
            
            {/* Strengths Breakdown */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 font-display">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Conceptual Strengths
              </h3>
              
              <div className="space-y-4">
                {strengths.map((s, idx) => (
                  <div key={idx} className="bg-emerald-50/30 border border-emerald-100/60 rounded-2xl p-5 hover:shadow-md transition-all duration-200">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="inline-block px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 rounded-md">
                        {s.category}
                      </span>
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    </div>
                    <h4 className="text-base font-bold text-slate-800 font-display mb-1">{s.subtopic}</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">{s.reason}</p>
                  </div>
                ))}
                {strengths.length === 0 && (
                  <p className="text-xs text-slate-450 italic">No specific conceptual strengths generated yet.</p>
                )}
              </div>
            </div>

            {/* Weaknesses Breakdown */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 font-display">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                Areas for Improvement
              </h3>
              
              <div className="space-y-4">
                {weaknesses.map((w, idx) => (
                  <div key={idx} className="bg-rose-50/30 border border-rose-100/60 rounded-2xl p-5 hover:shadow-md transition-all duration-200">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="inline-block px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-rose-700 bg-rose-100 rounded-md">
                        {w.category}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-800 font-display mb-1.5">{w.subtopic}</h4>
                    <div className="space-y-2 mt-2">
                      <div>
                        <span className="text-[9px] font-black text-slate-450 uppercase tracking-wider">Identified Issue</span>
                        <p className="text-slate-700 text-xs leading-relaxed mt-0.5">{w.issue}</p>
                      </div>
                      <div className="border-t border-rose-100/50 pt-2">
                        <span className="text-[9px] font-black text-slate-450 uppercase tracking-wider">Recommendation</span>
                        <p className="text-slate-600 text-xs leading-relaxed mt-0.5">{w.recommendation}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {weaknesses.length === 0 && (
                  <p className="text-xs text-slate-450 italic">No weakness items generated.</p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column - Study Plan & Coach Connection */}
        <div className="space-y-8">
          {/* Study Plan Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl print-card"
          >
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 font-display">
              <Calendar className="w-5 h-5 text-[var(--color-primary)]" />
              Surgical Action Plan
            </h3>
            
            <div className="space-y-6">
              {study_plan.map((step, idx) => (
                <div key={idx} className="flex gap-4 relative">
                  {idx !== study_plan.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-slate-100 -translate-x-1/2" />
                  )}
                  <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-bold text-sm shrink-0">
                    {step.step}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm font-display">{step.action}</h4>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-1 font-medium">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      Duration: {step.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Human Coach Connection Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent-teal)] text-white rounded-3xl p-8 shadow-xl relative overflow-hidden human-coach-card"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none" />
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 font-display">
              <UserCheck className="w-5 h-5" />
              Connect with a Coach
            </h3>
            <p className="text-white/80 leading-relaxed text-sm mb-6">
              Want a human expert to review this AI report and build custom strategies for you? Book a 30-minute diagnostic review session.
            </p>
            <Link 
              href="/tutor-booking"
              className="block w-full py-3.5 rounded-xl bg-white text-[var(--color-primary)] hover:bg-slate-50 text-center font-bold hover:shadow-lg transition-all text-sm cursor-pointer"
            >
              Book Free Session
            </Link>
          </motion.div>
        </div>
        
      </main>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    }>
      <ReportDashboard />
    </Suspense>
  );
}
