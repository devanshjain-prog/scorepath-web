"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Target, Calendar, BarChart3, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    targetScore: "",
    timeline: "",
    currentLevel: "",
    concernSection: ""
  });

  const handleSelect = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(prev => prev + 1);
    } else {
      localStorage.setItem("scorepath_onboarding", JSON.stringify(formData));
      router.push("/diagnostic");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const progress = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between items-center p-6 relative overflow-hidden">
      
      {/* Glow backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="w-full max-w-md flex items-center justify-between z-10 shrink-0">
        <button 
          onClick={handleBack}
          disabled={step === 1}
          className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors
            ${step === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-gray-900"}`}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="font-bold text-purple-600 hover:text-purple-900 transition-colors text-sm">
            Bypass
          </Link>
          <Link href="/" className="font-bold text-gray-400 hover:text-gray-900 transition-colors text-sm">
            Quit
          </Link>
        </div>
      </header>

      {/* Main card */}
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-3xl p-8 shadow-md z-10 my-auto">
        
        {/* Progress bar */}
        <div className="w-full mb-6">
          <div className="flex justify-between items-center text-xs font-extrabold uppercase text-gray-400 tracking-wider mb-2">
            <span>Setup Workspace</span>
            <span>Step {step} of 4</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <motion.div 
              className="bg-[var(--color-primary)] h-full rounded-full"
              initial={{ width: "25%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[var(--color-primary)] border border-blue-100 flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">What is your target score?</h2>
                <p className="text-gray-500 text-xs leading-relaxed">We will calibrate question difficulties and practice targets to this range.</p>
              </div>
              <div className="space-y-2.5">
                {[
                  { value: "735+", desc: "Top 1% Percentile (Elite Admission)" },
                  { value: "705", desc: "Top 5% Percentile (Highly Competitive)" },
                  { value: "675", desc: "Top 15% Percentile (Strong Standard)" },
                  { value: "645", desc: "Solid baseline score" },
                  { value: "Not sure yet", desc: "Determine ability in diagnostic" }
                ].map((item) => {
                  const isSelected = formData.targetScore === item.value;
                  return (
                    <button
                      type="button"
                      key={item.value}
                      onClick={() => handleSelect("targetScore", item.value)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-4
                        ${isSelected 
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)] shadow-sm" 
                          : "border-gray-50 bg-gray-50/20 hover:border-gray-200"
                        }`}
                    >
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-sm block text-gray-800">{item.value}</span>
                        <span className="text-[10px] text-gray-400 font-semibold leading-normal">{item.desc}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[var(--color-accent-teal)] border border-teal-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">When is your exam timeline?</h2>
                <p className="text-gray-500 text-xs leading-relaxed">Helps us customize your weekly revision checklist and pacing deadlines.</p>
              </div>
              <div className="space-y-2.5">
                {[
                  { value: "Within 1 month", desc: "Urgent surgical preparation drills" },
                  { value: "1 to 3 months", desc: "Standard structured masterclass path" },
                  { value: "3 to 6 months", desc: "Steady foundation building timeline" },
                  { value: "Not decided", desc: "Flexible timeline tracking" }
                ].map((item) => {
                  const isSelected = formData.timeline === item.value;
                  return (
                    <button
                      type="button"
                      key={item.value}
                      onClick={() => handleSelect("timeline", item.value)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-4
                        ${isSelected 
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)] shadow-sm" 
                          : "border-gray-50 bg-gray-50/20 hover:border-gray-200"
                        }`}
                    >
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-sm block text-gray-800">{item.value}</span>
                        <span className="text-[10px] text-gray-400 font-semibold leading-normal">{item.desc}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[var(--color-accent-violet)] border border-purple-100 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">What is your current level?</h2>
                <p className="text-gray-500 text-xs leading-relaxed">Sets the initial GMAT score level served for the first diagnostic questions.</p>
              </div>
              <div className="space-y-2.5">
                {[
                  { value: "Beginner", desc: "Starting GMAT study from scratch" },
                  { value: "Intermediate", desc: "Know the core math rules, need logic practice" },
                  { value: "Advanced", desc: "Aiming to audit advanced trap strategies" },
                  { value: "Not sure", desc: "Calibrate from dynamic question responses" }
                ].map((item) => {
                  const isSelected = formData.currentLevel === item.value;
                  return (
                    <button
                      type="button"
                      key={item.value}
                      onClick={() => handleSelect("currentLevel", item.value)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-4
                        ${isSelected 
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)] shadow-sm" 
                          : "border-gray-50 bg-gray-50/20 hover:border-gray-200"
                        }`}
                    >
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-sm block text-gray-800">{item.value}</span>
                        <span className="text-[10px] text-gray-400 font-semibold leading-normal">{item.desc}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[var(--color-warning)] border border-amber-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">Which section worries you most?</h2>
                <p className="text-gray-500 text-xs leading-relaxed">Prioritizes analysis and weaknesses diagnostics in this specific category.</p>
              </div>
              <div className="space-y-2.5">
                {[
                  { value: "Quantitative Reasoning", desc: "Algebra, arithmetic, rates, and values" },
                  { value: "Verbal Reasoning", desc: "Critical reasoning and reading comprehension" },
                  { value: "Data Insights", desc: "Multi-source synthesis and Data Sufficiency" },
                  { value: "All of them", desc: "Equally concerned about all sections" },
                  { value: "Not sure", desc: "Identify gaps using diagnostic results" }
                ].map((item) => {
                  const isSelected = formData.concernSection === item.value;
                  return (
                    <button
                      type="button"
                      key={item.value}
                      onClick={() => handleSelect("concernSection", item.value)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-4
                        ${isSelected 
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)] shadow-sm" 
                          : "border-gray-50 bg-gray-50/20 hover:border-gray-200"
                        }`}
                    >
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-sm block text-gray-800">{item.value}</span>
                        <span className="text-[10px] text-gray-400 font-semibold leading-normal">{item.desc}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8">
          <button
            type="button"
            onClick={handleNext}
            disabled={
              (step === 1 && !formData.targetScore) ||
              (step === 2 && !formData.timeline) ||
              (step === 3 && !formData.currentLevel) ||
              (step === 4 && !formData.concernSection)
            }
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm
              ${(step === 1 && !formData.targetScore) ||
                (step === 2 && !formData.timeline) ||
                (step === 3 && !formData.currentLevel) ||
                (step === 4 && !formData.concernSection)
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200/50"
                : "bg-[var(--foreground)] text-[var(--background)] hover:bg-opacity-90 shadow-md"
              }`}
          >
            {step === 4 ? "Start Free Diagnostic" : "Continue"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <footer className="text-[10px] text-gray-400 z-10 shrink-0">
        © {new Date().getFullYear()} ScorePath. All rights reserved.
      </footer>
    </div>
  );
}
