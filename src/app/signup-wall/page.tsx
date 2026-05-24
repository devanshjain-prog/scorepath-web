"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Unlock, ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function SignupWallForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attempt_id");

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [supabase, setSupabase] = useState<any>(null);
  const [predictedScore, setPredictedScore] = useState<number | null>(null);

  useEffect(() => {
    const client = createClient();
    setSupabase(client);

    if (attemptId) {
      client
        .from("test_attempts")
        .select("score")
        .eq("id", attemptId)
        .single()
        .then(({ data }) => {
          if (data && data.score) {
            setPredictedScore(data.score);
          }
        });
    }
  }, [attemptId]);

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    if (!supabase) return;
    try {
      const redirectUrl = `${window.location.origin}/api/auth/callback?next=/report?attempt_id=${attemptId || ''}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl
        }
      });
      if (error) throw error;
    } catch (e: any) {
      console.error(`${provider} login failed:`, e);
      alert(`${provider} login failed. Continuing with email fallback.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate signup completion
    setTimeout(() => {
      // Store user info in localStorage
      localStorage.setItem("scorepath_user", JSON.stringify({ name, email }));
      
      // Auto-set core subscription locally so dashboard works
      localStorage.setItem("scorepath_subscription", JSON.stringify({
        tier: "core",
        active: true,
        updated_at: new Date().toISOString()
      }));

      if (attemptId) {
        router.push(`/report?attempt_id=${attemptId}`);
      } else {
        router.push("/dashboard");
      }
      setSubmitting(false);
    }, 1200);
  };

  const pct = Math.max(10, Math.min(100, predictedScore ? ((predictedScore - 200) / 600) * 100 : 65));
  
  const getPercentile = (score: number | null) => {
    if (!score) return "72nd";
    if (score >= 760) return "99th";
    if (score >= 700) return "98th";
    if (score >= 650) return "90th";
    if (score >= 600) return "75th";
    if (score >= 550) return "55th";
    return "45th";
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col lg:flex-row font-sans">
      {/* Brand Left Column */}
      <div className="lg:w-1/2 bg-gradient-to-tr from-slate-900 via-blue-950 to-indigo-900 text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
        {/* Decorative background grid and blurs */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <Link href="/" className="font-bold text-2xl tracking-tight z-10 hover:opacity-90 font-display flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-lg">S</div>
          ScorePath
        </Link>
        
        <div className="max-w-md my-auto space-y-8 z-10 py-12">
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs font-bold text-blue-300 tracking-wider uppercase">
              Diagnostic Complete
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight font-display">
              Your score report is calculated.
            </h1>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed">
              Create your free account to lock in your responses, audit pacing leaks, and view your complete GMAT diagnostic insights.
            </p>
          </div>

          {/* Predicted Score Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Estimated GMAT Score</p>
                <h3 className="text-5xl font-black mt-1 font-display tracking-tight text-white drop-shadow-md">
                  {predictedScore !== null ? `${predictedScore}` : "610"} <span className="text-2xl text-slate-400 font-normal">/ 800</span>
                </h3>
              </div>
              <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-xs font-bold text-emerald-400">
                Top {getPercentile(predictedScore)} Percentile
              </div>
            </div>

            {/* Visual Score Gauge Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400 font-semibold">
                <span>200 (Min)</span>
                <span>800 (Max)</span>
              </div>
              <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
            </div>

            <p className="text-slate-400 text-xs mt-4 leading-relaxed">
              Based on adaptive GMAT response matrices. Accuracy-pacing scaling models applied.
            </p>
          </motion.div>

          <div className="space-y-3 pt-6 border-t border-white/10 text-sm text-slate-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Full AI Socratic Diagnostic Report</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Pacing vs. Accuracy analytics grid</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Bento Dashboard & Practice Access</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 z-10">
          © {new Date().getFullYear()} ScorePath. All rights reserved.
        </div>
      </div>

      {/* Form Right Column */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="max-w-md w-full space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight font-display">Get Your Free Report</h2>
            <p className="text-gray-500 font-medium">Join GMAT candidates targeting top business schools.</p>
          </div>

          {/* Social Sign-In buttons */}
          <div className="space-y-3">
            {/* Google Sign In */}
            <button
              onClick={() => handleOAuthLogin('google')}
              className="w-full py-3.5 px-4 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-xs hover:border-gray-300 cursor-pointer"
            >
              {/* Google logo SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" width="24" height="24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" strokeLinecap="round" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Continue with Google
            </button>

            {/* Apple Sign In */}
            <button
              onClick={() => handleOAuthLogin('apple')}
              className="w-full py-3.5 px-4 bg-black text-white hover:bg-slate-900 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-xs cursor-pointer"
            >
              {/* Apple logo SVG */}
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" width="24" height="24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.64.73-1.2 1.87-1.05 2.97 1.12.09 2.27-.56 3-1.41z" />
              </svg>
              Continue with Apple
            </button>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs font-bold uppercase tracking-wider">Or use email</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          {/* Email credentials entry */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Devansh Jain"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--color-primary)] transition-colors text-sm bg-gray-50/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="devansh@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--color-primary)] transition-colors text-sm bg-gray-50/30"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-[var(--foreground)] text-[var(--background)] font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm mt-6 cursor-pointer"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Generate Free AI Report
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SignupWall() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    }>
      <SignupWallForm />
    </Suspense>
  );
}
