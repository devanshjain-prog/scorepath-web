"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, Loader2, ArrowRight, ShieldCheck, CreditCard } from "lucide-react";

type Plan = {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  color: string;
};

const plans: Plan[] = [
  {
    id: "report",
    name: "AI Diagnostic Report",
    price: "₹499",
    period: "one-time",
    features: [
      "Unlock 1 Full AI Weakness Report",
      "Mistake pattern analysis",
      "7-Day surgical study plan preview"
    ],
    color: "var(--color-accent-teal)"
  },
  {
    id: "core",
    name: "Core Plan",
    price: "₹1,999",
    period: "month",
    features: [
      "Unlimited AI Weakness Reports",
      "Richer AI question explanations",
      "Weakness Attack & Comeback practice modes",
      "GMAT study center dashboard"
    ],
    color: "var(--color-primary)"
  },
  {
    id: "pro",
    name: "Pro Plan",
    price: "₹3,999",
    period: "month",
    features: [
      "Everything in Core",
      "Formula Assist mode",
      "Elimination Trainer mode",
      "AI Method Coach logic audits",
      "Priority practice question generation"
    ],
    color: "var(--color-accent-violet)"
  }
];

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attempt_id");

  const [selectedPlan, setSelectedPlan] = useState("core");
  const [checkingOut, setCheckingOut] = useState(false);

  const handleCheckout = () => {
    setCheckingOut(true);
    setTimeout(() => {
      // Save subscription info locally
      localStorage.setItem("scorepath_subscription", JSON.stringify({
        tier: selectedPlan,
        active: true,
        updated_at: new Date().toISOString()
      }));
      
      setCheckingOut(false);
      if (attemptId) {
        router.push(`/report?attempt_id=${attemptId}`);
      } else {
        router.push("/dashboard");
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-24">
      {/* Header */}
      <header className="w-full bg-white border-b border-gray-100 h-16 flex items-center px-6 justify-between">
        <button onClick={() => router.back()} className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
          Back
        </button>
        <span className="text-sm font-bold text-gray-400">Secure Checkout</span>
      </header>

      <main className="max-w-5xl mx-auto px-6 mt-12 space-y-12">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Select your plan</h1>
          <p className="text-gray-500">Upgrade to unlock detailed analytics and personalized training systems.</p>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`bg-white p-8 rounded-3xl border-2 cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden
                  ${isSelected 
                    ? "border-[var(--color-primary)] ring-1 ring-[var(--color-primary)] shadow-md" 
                    : "border-gray-100 hover:border-gray-200"
                  }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 bg-[var(--color-primary)] text-white px-3 py-1 rounded-bl-xl text-xs font-bold uppercase">
                    Selected
                  </div>
                )}
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <span 
                      className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase"
                      style={{ backgroundColor: `${plan.color}15`, color: plan.color }}
                    >
                      {plan.name}
                    </span>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-4xl font-black">{plan.price}</span>
                      <span className="text-gray-400 text-sm font-medium">/ {plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mock Checkout button card */}
        <div className="max-w-md mx-auto bg-white border border-gray-100 p-8 rounded-3xl shadow-sm text-center space-y-6">
          <div className="flex items-center gap-3 justify-center text-sm font-semibold text-gray-600">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <span>256-bit Secure Mock Sandbox Checkout</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={checkingOut}
            className="w-full py-4 rounded-xl bg-[var(--foreground)] text-[var(--background)] font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-md"
          >
            {checkingOut ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Activate Mock Subscription
                <CreditCard className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  );
}
