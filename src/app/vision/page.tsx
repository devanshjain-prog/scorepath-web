"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Brain, Cpu, Database, Zap, Layers, Play, 
  CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, DollarSign, Clock, Check
} from "lucide-react";
import Link from "next/link";

export default function VisionPage() {
  const [activeTab, setActiveTab] = useState<"vision" | "comparison" | "tech" | "canvas" | "phasing">("vision");

  const tabs = [
    { id: "vision", name: "Core Vision", icon: Brain },
    { id: "comparison", name: "Competitor Matrix", icon: Layers },
    { id: "tech", name: "Tech Blueprint", icon: Cpu },
    { id: "canvas", name: "Interactive Canvas", icon: Sparkles },
    { id: "phasing", name: "Execution Roadmap", icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#101828] pb-24 font-sans selection:bg-teal-500/20 selection:text-teal-900">
      
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/10">
              S
            </div>
            <span className="font-bold tracking-tight text-xl bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              ScorePath
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full border border-gray-200">
              Co-Founder Sync Link
            </span>
            <Link 
              href="/dashboard" 
              className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1.5"
            >
              Back to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Pitch Deck Hero */}
      <div className="max-w-7xl mx-auto px-6 mt-12 text-center lg:text-left">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pb-8 border-b border-gray-200/60">
          <div className="space-y-4 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-100 rounded-full">
              <Sparkles className="w-3.5 h-3.5" /> Pitch & Architecture Blueprint
            </span>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-gray-900 leading-tight">
              ScorePath: Next-Gen <br />
              <span className="bg-gradient-to-r from-blue-600 via-teal-500 to-violet-600 bg-clip-text text-transparent">
                Adaptive AI Exam Preparation
              </span>
            </h1>
            <p className="text-gray-500 text-base md:text-lg leading-relaxed">
              Move beyond basic chatbot wrappers. Build a production-grade, Socratic intelligent tutor that tracks cognitive mastery levels and renders serverless visual explainer videos on demand.
            </p>
          </div>
          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm max-w-sm text-left shrink-0">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Share with Co-Founder</div>
            <p className="text-xs text-gray-500 mb-4">Copy your local address or deployment link and share it directly with your co-founder to present this vision.</p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-between gap-3">
              <code className="text-xs font-mono text-gray-700 select-all overflow-hidden text-ellipsis whitespace-nowrap">http://localhost:3000/vision</code>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex overflow-x-auto gap-2 bg-gray-200/50 p-1.5 rounded-2xl max-w-max border border-gray-300/40">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  isActive 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {/* 1. CORE VISION */}
            {activeTab === "vision" && (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                      <Brain className="w-6 h-6 text-blue-600" />
                      The "Three Brains" Architecture Paradigm
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      Instead of a simple API connection that streams answers blindly, ScorePath isolates the learning experience into three distinct, interconnected blocks. This ensures correctness, saves API cost, and optimizes learning outcomes.
                    </p>

                    <div className="grid md:grid-cols-3 gap-6 pt-4">
                      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold text-lg">1</div>
                        <h3 className="font-bold text-gray-800">Exam Engine</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">Runs the GMAT Focus adaptive scoring algorithms, diagnostics, mock tests, and time logs. 100% deterministic code-level execution.</p>
                      </div>
                      <div className="bg-teal-50/50 border border-teal-100 rounded-2xl p-5 space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600 font-bold text-lg">2</div>
                        <h3 className="font-bold text-gray-800">AI Tutor</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">Handles Socratic hint-giving, step-by-step math conceptual breakdowns, explanation builders, and generates dynamic visual media.</p>
                      </div>
                      <div className="bg-violet-50/50 border border-violet-100 rounded-2xl p-5 space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-600 font-bold text-lg">3</div>
                        <h3 className="font-bold text-gray-800">Knowledge DB</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">Contains syllabus, question banks, formulas, trap triggers, and the student's Bayesian skill mastery level.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
                    <h3 className="text-xl font-bold text-gray-900">Key Pillars of Learning Engagement</h3>
                    <div className="space-y-4">
                      <div className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                          <Check className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">Socratic Scaffolding</h4>
                          <p className="text-sm text-gray-500 leading-relaxed">The AI never dumps the answer immediately. It evaluates the user's specific wrong approach, delivers a subtle conceptual hint, and guides them step-by-step.</p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                          <Check className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">Visual Remediation</h4>
                          <p className="text-sm text-gray-500 leading-relaxed">When text explanations fail, the tutor generates programmatic 3D charts, interactive layout coordinates, or automated explainer clips.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-gradient-to-tr from-blue-600 to-teal-500 text-white rounded-3xl p-8 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none" />
                    <h3 className="text-xl font-bold mb-4">Diagnostic Value Hook</h3>
                    <p className="text-white/80 leading-relaxed text-sm mb-6">
                      Instead of marketing an "AI bot", we market a <strong>Zero-Cost diagnostic test</strong>. Taking one test estimates the student's score, reveals exact behavioral weaknesses (such as algebra time traps), and maps a 7-day study plan.
                    </p>
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                      <div className="text-xs text-white/60 font-semibold uppercase tracking-wider mb-1">diagnostic launch hook</div>
                      <div className="text-lg font-extrabold">Instant Predicted Score (200-800)</div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      Zero-Hallucination Guardrails
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      We strictly implement <strong>Grounded Generation</strong>. The LLM is prohibited from answering questions using its base memory. It must query the LlamaIndex content database first, citing specific document IDs. If the index returns a low match probability, we safely query web API search engines (Tavily/Brave) or confess our lack of resources.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. COMPETITOR COMPARISON */}
            {activeTab === "comparison" && (
              <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-8">
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                    <Layers className="w-6 h-6 text-blue-600" />
                    Competitor Defeat Matrix
                  </h2>
                  <p className="text-gray-500 text-sm">How ScorePath outpaces traditional platforms through AI-native features.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-400">
                        <th className="py-4 px-6">Competitor</th>
                        <th className="py-4 px-6">What they do well</th>
                        <th className="py-4 px-6">Where they fail</th>
                        <th className="py-4 px-6">ScorePath Superpower</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      <tr>
                        <td className="py-5 px-6 font-bold text-gray-900">Target Test Prep (TTP)</td>
                        <td className="py-5 px-6 text-gray-500">Exhaustive curriculum, massive manual database.</td>
                        <td className="py-5 px-6 text-gray-500">Static textbook style, lacks dialogue, expensive.</td>
                        <td className="py-5 px-6 font-semibold text-teal-600 bg-teal-500/5">Socratic Multi-Source Canvas + dynamic conversational drills.</td>
                      </tr>
                      <tr>
                        <td className="py-5 px-6 font-bold text-gray-900">e-GMAT</td>
                        <td className="py-5 px-6 text-gray-500">Pre-thinking process tracking, strong stats.</td>
                        <td className="py-5 px-6 text-gray-500">Answers are delayed; students rely on forum replies.</td>
                        <td className="py-5 px-6 font-semibold text-teal-600 bg-teal-500/5">Instant, personalized, cognitive error diagnosis.</td>
                      </tr>
                      <tr>
                        <td className="py-5 px-6 font-bold text-gray-900">Magoosh</td>
                        <td className="py-5 px-6 text-gray-500">Affordable, solid baseline video libraries.</td>
                        <td className="py-5 px-6 text-gray-500">One-size-fits-all videos, static progress reports.</td>
                        <td className="py-5 px-6 font-semibold text-teal-600 bg-teal-500/5">Remotion automated revision clips tailored to student interests.</td>
                      </tr>
                      <tr>
                        <td className="py-5 px-6 font-bold text-gray-900">GMAT Club</td>
                        <td className="py-5 px-6 text-gray-500">Massive community, forum question catalog.</td>
                        <td className="py-5 px-6 text-gray-500">Completely unstructured, noisy, zero guidance.</td>
                        <td className="py-5 px-6 font-semibold text-teal-600 bg-teal-500/5">Personalized error scheduler & Bayesian mastery tracking.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      Pedagogical Lesson (from Khanmigo)
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Khanmigo showed that giving away answers leads to zero learning gains. ScorePath's system prompts are designed with strict instructional rules: do not supply calculations, identify the exact conceptual step missed, and ask a clarifying question.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-blue-500" />
                      Visual Explanations (from Photomath)
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Math students require visual step-by-step progression. We prioritize structured markdown formulas, Mermaid flowchart proofs, and dynamic coordinate layouts inside the chat panel.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. TECH BLUEPRINT */}
            {activeTab === "tech" && (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                      <Cpu className="w-6 h-6 text-blue-600" />
                      Technical Stack Decision Matrix
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="flex border border-gray-100 rounded-2xl p-5 items-center justify-between gap-4 hover:border-blue-100 transition-colors">
                        <div>
                          <h4 className="font-bold text-gray-800">Orchestration: LangGraph + LlamaIndex</h4>
                          <p className="text-xs text-gray-500 leading-relaxed mt-1">LlamaIndex handles complex hierarchical chunking and retrieval, while LangGraph manages the stateful agent routing logic.</p>
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase shrink-0">MIT Core</span>
                      </div>
                      <div className="flex border border-gray-100 rounded-2xl p-5 items-center justify-between gap-4 hover:border-blue-100 transition-colors">
                        <div>
                          <h4 className="font-bold text-gray-800">Database: Supabase pgvector</h4>
                          <p className="text-xs text-gray-500 leading-relaxed mt-1">Saves cost by housing transactional user data and concept vector embeddings in the same Postgres instance, leveraging HNSW indexes.</p>
                        </div>
                        <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full uppercase shrink-0">pgvector</span>
                      </div>
                      <div className="flex border border-gray-100 rounded-2xl p-5 items-center justify-between gap-4 hover:border-blue-100 transition-colors">
                        <div>
                          <h4 className="font-bold text-gray-800">Gateway: LiteLLM Universal Gateway</h4>
                          <p className="text-xs text-gray-500 leading-relaxed mt-1">Provides OpenAI-compatible routing across Anthropic, Google, and DeepSeek with built-in cost budgets and failover overrides.</p>
                        </div>
                        <span className="text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-100 px-3 py-1 rounded-full uppercase shrink-0">Self-Hosted</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Database className="w-5 h-5 text-blue-600" /> PostgreSQL Database Schema Overview
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      ScorePath stores granular cognitive metadata. In addition to questions and choices, we store: <code>common_mistakes</code> arrays, <code>trap_type</code> tags, <code>confidence</code> ratings (Sure, Unsure, Guessed), <code>time_spent_seconds</code>, and a <code>student_mastery</code> matrix that calculates topic-by-topic readiness scores.
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-blue-600" /> Cost Routing Mechanics
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      We never route simple queries to high-cost reasoning models. Our routing rules are strictly budgeted:
                    </p>
                    <div className="space-y-3 font-mono text-xs">
                      <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                        <span className="text-gray-600">Classification</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">Llama 8B (Groq)</span>
                      </div>
                      <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                        <span className="text-gray-600">Concept Explanation</span>
                        <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-bold">Gemini Flash</span>
                      </div>
                      <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                        <span className="text-gray-600">GMAT Math Review</span>
                        <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">Claude Sonnet 4.6</span>
                      </div>
                      <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                        <span className="text-gray-600">Deep Reasoning Mocks</span>
                        <span className="text-violet-700 bg-violet-50 px-2 py-0.5 rounded font-bold">OpenAI o3 / R1</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-3">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" /> Observability Stack
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      We trace every LLM turn and cost metric using **Langfuse** (MIT licensed). Evaluators like **Ragas** automatically verify retrieved contexts to calculate Faithfulness and Context Precision.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. INTERACTIVE CANVAS */}
            {activeTab === "canvas" && (
              <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                    Socratic Multi-Source Canvas
                  </h2>
                  <p className="text-gray-500 text-sm">Interactive mock-up demonstrating the proposed split-screen experience.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-6 border border-gray-200 rounded-2xl overflow-hidden min-h-[500px]">
                  {/* Left Panel: Question Canvas */}
                  <div className="bg-gray-50 p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-200">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-violet-100 text-violet-700 rounded-md border border-violet-200">
                          Data Insights (GMAT 720)
                        </span>
                        <span className="text-xs text-gray-400 font-medium">Time Target: 2m 30s</span>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="font-black text-gray-800 text-lg">Permutations & Multi-Choice Selections</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          A selection committee of 4 members is to be formed from 5 doctors and 4 lawyers. What is the probability that the committee will contain exactly 2 doctors and 2 lawyers?
                        </p>
                      </div>

                      {/* Interactive Graph Simulation */}
                      <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-3 shadow-sm">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Interactive Combinations Table</div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
                          <div className="bg-gray-50 p-2 rounded border border-gray-100 text-gray-500">Doctors (5)</div>
                          <div className="bg-gray-50 p-2 rounded border border-gray-100 text-gray-500">Lawyers (4)</div>
                          <div className="bg-blue-50/50 text-blue-700 p-2 rounded border border-blue-100 font-bold">5C2 × 4C2</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-6">
                      <button className="py-2.5 px-4 text-xs font-bold bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-left flex items-center justify-between">
                        Answer A: 5/14 <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Correct</span>
                      </button>
                      <button className="py-2.5 px-4 text-xs font-bold bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-left">
                        Answer B: 10/21
                      </button>
                      <button className="py-2.5 px-4 text-xs font-bold bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-left">
                        Answer C: 15/28
                      </button>
                      <button className="py-2.5 px-4 text-xs font-bold bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-left">
                        Answer D: 20/49
                      </button>
                    </div>
                  </div>

                  {/* Right Panel: AI Tutor dialogue */}
                  <div className="bg-white p-6 flex flex-col justify-between">
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-xs font-extrabold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                          <Cpu className="w-4 h-4 text-teal-600" /> ScorePath AI Tutor
                        </span>
                      </div>

                      {/* Conversation Flow */}
                      <div className="space-y-4 text-xs leading-relaxed max-h-[300px] overflow-y-auto pr-1">
                        <div className="bg-gray-50 rounded-2xl p-4 text-gray-600 border border-gray-100">
                          Hi Devansh! You selected B. Let's look at why that might be a trap choice. How did you calculate the total possible outcomes for choosing 4 committee members from the 9 candidates?
                        </div>
                        <div className="bg-blue-600 text-white rounded-2xl p-4 ml-8 font-medium">
                          I calculated 9C4 = 126 total outcomes. And then for the doctors/lawyers combinations I did 5C2 + 4C2.
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4 text-gray-600 border border-gray-100">
                          Ah, a classic **Premise Addition slip**. You added 5C2 and 4C2 instead of multiplying them. Remember: when events must happen *concurrently* (doctor selections **AND** lawyer selections), we multiply the independent possibilities. Can you re-evaluate 5C2 × 4C2?
                        </div>
                      </div>
                    </div>

                    {/* AI Video Short Link */}
                    <div className="border border-gray-100 rounded-2xl p-4 bg-gradient-to-r from-teal-50 to-blue-50 border-teal-100/50 flex items-center justify-between gap-4 mt-6">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-gray-800">Dynamic Video Walkthrough</h4>
                        <p className="text-[10px] text-gray-400 leading-normal">Watch a 60s animated solution for B versus A.</p>
                      </div>
                      <button className="h-10 w-10 rounded-full bg-teal-500 hover:bg-teal-600 text-white flex items-center justify-center shadow-md transition-colors shrink-0">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. ROADMAP */}
            {activeTab === "phasing" && (
              <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-8">
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                    <Clock className="w-6 h-6 text-blue-600" />
                    Development Roadmap
                  </h2>
                  <p className="text-gray-500 text-sm">Phased rollout strategy designed to safeguard runway and validate market adoption.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Phase 1 */}
                  <div className="border border-gray-200/80 rounded-2xl p-6 space-y-4 hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />
                    <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 rounded-md border border-blue-100">
                      Phase 1: MVP Core
                    </span>
                    <h3 className="text-base font-bold text-gray-800">Diagnostic Hook</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">Build Next.js web skeleton, Supabase schemas, and GMAT 200-800 score metrics. Connect LiteLLM proxy and serve Socratic diagnostic questions.</p>
                    <ul className="space-y-1.5 text-xs text-gray-500 font-semibold pt-2">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Dynamic CAT Engine</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> OAuth & Free Report</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> PDF Downloadable Card</li>
                    </ul>
                  </div>

                  {/* Phase 2 */}
                  <div className="border border-gray-200/80 rounded-2xl p-6 space-y-4 hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-bl-full pointer-events-none" />
                    <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 rounded-md border border-teal-100">
                      Phase 2: Adaptive Mastery
                    </span>
                    <h3 className="text-base font-bold text-gray-800">Stateful Tutoring</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">Integrate LangGraph for stateful loops. Setup the Bayesian Student progress database, timed adaptive practice drills, and the Socratic Canvas.</p>
                    <ul className="space-y-1.5 text-xs text-gray-500 font-semibold pt-2">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" /> Bayesian Knowledge DB</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" /> LangGraph Dialog Agent</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" /> AI Method Coach</li>
                    </ul>
                  </div>

                  {/* Phase 3 */}
                  <div className="border border-gray-200/80 rounded-2xl p-6 space-y-4 hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-bl-full pointer-events-none" />
                    <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 rounded-md border border-violet-100">
                      Phase 3: Visual & Scale
                    </span>
                    <h3 className="text-base font-bold text-gray-800">Visual Media & Monetization</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">Launch AWS Lambda Remotion rendering workers. Set up Qdrant for multi-tenant index filters. Connect Stripe payment workflows.</p>
                    <ul className="space-y-1.5 text-xs text-gray-500 font-semibold pt-2">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-violet-500 shrink-0" /> 60s Remotion Renders</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-violet-500 shrink-0" /> Stripe Subscriptions</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-violet-500 shrink-0" /> Qdrant Filter search</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
