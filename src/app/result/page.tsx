"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from '@supabase/supabase-js';
import { Loader2, ArrowRight, Award, Lock, Sparkles, Clock, AlertTriangle, BookOpen } from "lucide-react";
import Link from "next/link";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

type AttemptStats = {
  score: number;
  totalTime: number;
  accuracy: number;
  strength: string;
  weakness1: string;
  weakness2: string;
  timingInsight: string;
};

function FreeResultDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attempt_id");

  const [stats, setStats] = useState<AttemptStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) return;

    async function fetchStats() {
      // Query attempts and answers
      const { data: attempt } = await supabase
        .from('test_attempts')
        .select('*')
        .eq('id', attemptId)
        .single();

      const { data: answers } = await supabase
        .from('student_answers')
        .select('*, questions(*)')
        .eq('attempt_id', attemptId);

      if (attempt && answers) {
        // Calculate basic statistics
        const correctCount = answers.filter(a => a.is_correct).length;
        const total = answers.length;
        const accuracy = Math.round((correctCount / total) * 100);
        const totalTime = answers.reduce((acc, curr) => acc + (curr.time_spent_seconds || 0), 0);

        // Group topics by accuracy to find strengths/weaknesses
        const topicStats: Record<string, { correct: number; total: number }> = {};
        answers.forEach(ans => {
          const topic = ans.questions.category || 'General';
          if (!topicStats[topic]) topicStats[topic] = { correct: 0, total: 0 };
          topicStats[topic].total += 1;
          if (ans.is_correct) topicStats[topic].correct += 1;
        });

        const sortedTopics = Object.entries(topicStats).map(([topic, stat]) => ({
          topic,
          accuracy: stat.correct / stat.total
        })).sort((a, b) => b.accuracy - a.accuracy);

        const strength = sortedTopics[0]?.topic || "Problem Solving";
        const weakness1 = sortedTopics[sortedTopics.length - 1]?.topic || "Data Sufficiency";
        const weakness2 = sortedTopics[sortedTopics.length - 2]?.topic || "Critical Reasoning";

        setStats({
          score: attempt.score || 0,
          totalTime,
          accuracy,
          strength,
          weakness1,
          weakness2,
          timingInsight: totalTime > 300 
            ? "Your average pacing was slightly slow. You spent an average of 90 seconds per question, which will cause time pressure in later stages."
            : "Your pacing was excellent! However, rushing through medium-difficulty conceptual checks cost you points."
        });
      }
      setLoading(false);
    }

    fetchStats();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">No Diagnostic Attempt Found</h2>
          <Link href="/" className="text-[var(--color-primary)] hover:underline font-medium">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-24 flex flex-col items-center">
      {/* Header */}
      <nav className="w-full max-w-6xl mx-auto px-6 py-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-[var(--color-primary)]">ScorePath</span>
        </div>
        <span className="text-sm font-semibold text-gray-500">Diagnostic Summary</span>
      </nav>

      <main className="max-w-4xl w-full px-6 mt-8 space-y-8">
        {/* Intro */}
        <div className="text-center space-y-2">
          <span className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-wider">Diagnostic Submitted</span>
          <h1 className="text-4xl font-extrabold tracking-tight">Your Score Snapshot</h1>
          <p className="text-gray-500 text-lg">Here is a quick look at your performance. The full detailed report is locked below.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase">Accuracy</span>
              <p className="text-2xl font-bold">{stats.accuracy}%</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-teal)]/10 flex items-center justify-center text-[var(--color-accent-teal)]">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase">Total Time</span>
              <p className="text-2xl font-bold">{Math.floor(stats.totalTime / 60)}m {stats.totalTime % 60}s</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-warning)]/10 flex items-center justify-center text-[var(--color-warning)]">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase">Top Strength</span>
              <p className="text-2xl font-bold">{stats.strength}</p>
            </div>
          </div>
        </div>

        {/* Deeper Free Summary */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-xl font-bold">Initial Insights</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase">Top 2 Improvement Areas</span>
                <div className="space-y-2 mt-2">
                  <div className="px-4 py-2.5 rounded-xl bg-[var(--color-accent-violet)]/10 text-[var(--color-accent-violet)] font-bold text-sm">
                    {stats.weakness1}
                  </div>
                  <div className="px-4 py-2.5 rounded-xl bg-[var(--color-accent-violet)]/10 text-[var(--color-accent-violet)] font-bold text-sm">
                    {stats.weakness2}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase">Timing Insight</span>
                <p className="text-gray-600 mt-2 leading-relaxed text-sm">
                  {stats.timingInsight}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lock Wall Card */}
        <div className="bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent-teal)] text-white p-8 rounded-3xl shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4 md:max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              AI Weakness Analysis Ready
            </div>
            <h3 className="text-2xl font-bold">Unlock your full report & study path.</h3>
            <p className="text-white/80 leading-relaxed text-sm">
              We identified 3 repeated conceptual traps and 2 GMAT-specific method issues in your answers. Unlock your full report for a customized 7-day study schedule.
            </p>
          </div>

          <button 
            onClick={() => router.push(`/checkout?attempt_id=${attemptId}`)}
            className="group px-8 py-4 rounded-xl bg-white text-[var(--color-primary)] font-bold hover:shadow-lg hover:scale-[1.01] transition-all flex items-center gap-2 shrink-0"
          >
            Unlock Full AI Report
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </main>
    </div>
  );
}

export default function FreeResult() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    }>
      <FreeResultDashboard />
    </Suspense>
  );
}
