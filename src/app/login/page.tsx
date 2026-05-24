"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [supabase, setSupabase] = useState<any>(null);

  useEffect(() => {
    setSupabase(createClient());
  }, []);

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    if (!supabase) return;
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`
        }
      });
      if (error) throw error;
    } catch (e: any) {
      console.error(`${provider} login failed:`, e);
      alert(`${provider} login failed. Continuing with email fallback.`);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      // Mock login session
      localStorage.setItem(
        "scorepath_user",
        JSON.stringify({ name: "Devansh Main", email })
      );
      router.push("/dashboard");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-center items-center p-6">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Sign In</h1>
          <p className="text-gray-500 text-sm">Enter your details to access your ScorePath Command Center.</p>
        </div>

        {/* Social Sign-In buttons */}
        <div className="space-y-3">
          {/* Google Sign In */}
          <button
            onClick={() => handleOAuthLogin('google')}
            className="w-full py-3 px-4 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-sm hover:border-gray-300 cursor-pointer"
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
            className="w-full py-3 px-4 bg-black text-white hover:bg-slate-900 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-md cursor-pointer"
          >
            {/* Apple logo SVG */}
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" width="24" height="24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.64.73-1.2 1.87-1.05 2.97 1.12.09 2.27-.56 3-1.41z" />
            </svg>
            Continue with Apple
          </button>
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-100"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-xs font-bold uppercase">Or use email</span>
          <div className="flex-grow border-t border-gray-100"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="devansh@example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--color-primary)] transition-colors text-sm bg-gray-50/30"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--color-primary)] transition-colors text-sm bg-gray-50/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-[var(--foreground)] text-[var(--background)] font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 text-sm mt-6 shadow-sm"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 text-sm text-gray-400">
          Don't have an account?{" "}
          <Link href="/onboarding" className="text-[var(--color-primary)] hover:underline font-semibold">
            Start Free Diagnostic
          </Link>
        </div>
      </div>
    </div>
  );
}
