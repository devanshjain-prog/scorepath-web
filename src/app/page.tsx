"use client";

import { motion } from "framer-motion";
import { ArrowRight, Target, BrainCircuit, Activity, BarChart3, CheckCircle2, Sparkles, Clock, EyeOff, Layers } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--color-primary)] selection:text-white flex flex-col items-center overflow-x-hidden">
      
      {/* Dynamic Header Glow */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-gradient-to-tr from-[var(--color-primary)]/5 to-[var(--color-accent-teal)]/5 blur-[80px] rounded-full -z-10 pointer-events-none" />

      {/* Navigation */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent-teal)] flex items-center justify-center text-white font-bold text-base shadow-sm">
            S
          </div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            ScorePath
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors">
            Bypass to Dashboard
          </Link>
          <Link href="/login" className="text-sm font-bold text-gray-500 hover:text-[var(--color-primary)] transition-colors">
            Log In
          </Link>
          <Link 
            href="/onboarding" 
            className="px-5 py-2.5 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-sm font-bold hover:shadow-lg hover:scale-[1.01] transition-all"
          >
            Start Free Diagnostic
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 flex flex-col justify-center items-center text-center mt-16 mb-24 relative">
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-[var(--color-success)] animate-pulse"></span>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Now with Socratic GMAT AI Coaching</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-black tracking-tight leading-[1.08] max-w-4xl text-balance text-gray-900"
        >
          Take one diagnostic. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent-teal)] to-[var(--color-accent-violet)]">
            Know exactly what to fix.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="mt-6 text-lg md:text-xl text-gray-500 max-w-2xl text-balance leading-relaxed"
        >
          ScorePath is the personal GMAT Focus improvement platform that isolates your exact conceptual gaps, calculates timing traps, and builds a custom study roadmap.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-4 z-10"
        >
          <Link 
            href="/onboarding" 
            className="group px-8 py-4 rounded-xl bg-[var(--color-primary)] text-white text-base font-bold hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            Start Free Diagnostic
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="/dashboard" 
            className="px-8 py-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-base font-bold border border-purple-200 hover:-translate-y-0.5 transition-all flex items-center justify-center w-full sm:w-auto"
          >
            Bypass to Dashboard
          </Link>
          <p className="text-xs text-gray-400 sm:ml-4 flex items-center gap-1.5 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />
            Takes 15–30 minutes • No card required
          </p>
        </motion.div>

        {/* Visual Mockup Showcase (Interactive Preview) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
          className="w-full max-w-4xl mt-16 border border-gray-200 rounded-3xl bg-white p-4 md:p-6 shadow-xl relative overflow-hidden"
        >
          {/* Glassmorphic Glow behind preview */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-[var(--color-accent-teal)]/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/50 flex flex-col md:flex-row min-h-[380px] text-left">
            {/* Left Mock Panel: Questions */}
            <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                  <span className="bg-blue-50 text-[var(--color-primary)] px-2 py-0.5 rounded border border-blue-100 uppercase tracking-wide">
                    Question 7 of 15
                  </span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-red-400" /> 18:42</span>
                </div>
                <h3 className="font-bold text-gray-800 text-base leading-relaxed">
                  If x and y are positive integers such that 3x + 7y = 81, what is the number of possible values for the pair (x, y)?
                </h3>
              </div>
              
              <div className="space-y-2 mt-6">
                <div className="p-3.5 rounded-xl border border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-xs font-semibold text-gray-800 flex items-center justify-between">
                  <span>Choice B: 3</span>
                  <span className="text-[10px] text-[var(--color-primary)] bg-blue-100 px-2 py-0.5 rounded uppercase font-extrabold border border-blue-200">Selected</span>
                </div>
                <div className="p-3.5 rounded-xl border border-gray-100 bg-white text-xs font-semibold text-gray-400 line-through flex items-center justify-between">
                  <span>Choice C: 4</span>
                  <span className="text-[9px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded font-extrabold">Out of Scope</span>
                </div>
              </div>
            </div>

            {/* Right Mock Panel: AI Coach */}
            <div className="w-full md:w-[320px] bg-white p-6 flex flex-col justify-between border-t md:border-t-0 border-gray-100">
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 uppercase tracking-wider">
                  <BrainCircuit className="w-4 h-4 text-[var(--color-accent-violet)]" />
                  <span>Socratic AI Coach</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed bg-purple-50/20 p-3.5 rounded-xl border border-purple-100/30">
                  Great choice. You avoided the arithmetic trap. Remember, since x and y must be positive integers, we evaluate bounds by solving y values for multiples of 3. Let's try the next step...
                </p>
              </div>

              <div className="border-t border-gray-100 pt-4 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Estimated GMAT Score</span>
                  <div className="text-xl font-black text-gray-800">680 <span className="text-xs text-gray-400">/ 800</span></div>
                </div>
                <span className="text-[9px] font-extrabold uppercase tracking-wide bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-100">
                  Adaptive CAT Mode
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Feature Section */}
      <section className="w-full bg-white border-t border-gray-100 py-24 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 space-y-3">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">A Radically Better Way to Prep</h2>
            <p className="text-gray-500 text-base md:text-lg max-w-xl mx-auto">We replaced generic, boring multiple-choice practice sets with surgical AI tutoring analysis.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Activity className="w-6 h-6 text-[var(--color-primary)]" />}
              title="Pinpoint Adaptive Diagnostic"
              description="Our adaptive 15-question diagnostic test identifies the exact formulas, timing slip-ups, and trap configurations that cost you points in real-time."
            />
            <FeatureCard 
              icon={<BrainCircuit className="w-6 h-6 text-[var(--color-accent-teal)]" />}
              title="Socratic AI Tutor"
              description="A tutor that guides instead of giving away answers. Explains concepts step-by-step using custom ELI5 analogies and speed hacks, completely hallucination-free."
            />
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6 text-[var(--color-accent-violet)]" />}
              title="Bento mastery Heatmap"
              description="Visual category mastery maps highlight your gaps dynamically. Error Log metrics schedule review questions automatically to reinforce memory retention."
            />
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="w-full py-12 border-t border-gray-100 mt-auto text-center text-xs text-gray-400 bg-white">
        <p>© {new Date().getFullYear()} ScorePath. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-gray-50/50 border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all flex flex-col justify-between">
      <div className="space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
