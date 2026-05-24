"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Calendar, ArrowLeft, CheckCircle2, User, Mail, Clock, MessageSquare, CalendarDays } from "lucide-react";
import Link from "next/link";

function TutorBookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attempt_id");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  // Date & hour selector states
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedHour, setSelectedHour] = useState("");
  
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Generate next 4 available days starting tomorrow
  const availableDates = Array.from({ length: 4 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  });

  const availableHours = [
    "09:30 AM",
    "11:00 AM",
    "02:00 PM",
    "04:30 PM",
    "06:00 PM",
    "07:30 PM"
  ];

  useEffect(() => {
    // Load from localStorage user info if available
    const storedUser = localStorage.getItem("scorepath_user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setName(user.name || "");
      setEmail(user.email || "");
    }
    // Default select first date
    setSelectedDate(availableDates[0]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedHour) {
      alert("Please select a date and time slot.");
      return;
    }
    setSubmitting(true);

    try {
      const res = await fetch("/api/tutor/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attempt_id: attemptId || null,
          student_name: name,
          student_email: email,
          preferred_time: `${selectedDate} at ${selectedHour}`,
          notes
        })
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        alert("Failed to submit request.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
          <div className="w-16 h-16 bg-[var(--color-success)]/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-[var(--color-success)]" />
          </div>
          <h2 className="text-3xl font-bold">Session Requested!</h2>
          <p className="text-gray-500 leading-relaxed text-sm">
            Your booking request for <span className="font-bold text-gray-700">{selectedDate}</span> at <span className="font-bold text-gray-700">{selectedHour}</span> has been registered. Your GMAT coach will review your AI Diagnostic Report and reach out via email shortly to confirm.
          </p>
          <button 
            onClick={() => router.push("/dashboard")}
            className="w-full py-3.5 rounded-xl bg-[var(--color-primary)] text-white font-bold hover:shadow-lg transition-shadow"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-24">
      {/* Header */}
      <header className="w-full bg-white border-b border-gray-100 h-16 flex items-center px-6 justify-between">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <span className="text-sm font-bold text-gray-400">ScorePath Tutoring</span>
      </header>

      <main className="max-w-2xl mx-auto px-6 mt-12 space-y-8">
        <div className="space-y-2">
          <span className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">Coaching & Strategy Session</span>
          <h1 className="text-4xl font-extrabold tracking-tight">Book a Strategy Review</h1>
          <p className="text-gray-500">Get a 30-minute 1-on-1 walkthrough of your diagnostic score blockers with a GMAT expert.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
          
          {/* User Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
                <User className="w-4 h-4 text-gray-400" />
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Devansh Main"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-gray-400" />
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="devansh@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>
          </div>

          {/* Date Picker Grid */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-gray-400" />
              1. Select Date
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {availableDates.map(date => (
                <button
                  type="button"
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`py-3.5 px-2 text-center rounded-xl border-2 font-bold text-xs transition-all
                    ${selectedDate === date 
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]" 
                      : "border-gray-100 hover:border-gray-200"
                    }`}
                >
                  {date}
                </button>
              ))}
            </div>
          </div>

          {/* Hour Picker Grid */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              2. Select Time Slot (IST)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableHours.map(hour => (
                <button
                  type="button"
                  key={hour}
                  onClick={() => setSelectedHour(hour)}
                  className={`py-3.5 px-2 text-center rounded-xl border-2 font-bold text-xs transition-all
                    ${selectedHour === hour 
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]" 
                      : "border-gray-100 hover:border-gray-200"
                    }`}
                >
                  {hour}
                </button>
              ))}
            </div>
          </div>

          {/* Goals Input */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              3. Specific Goals / Concerns (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. I struggle with timing on Quantitative word problems and inequalities."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !selectedDate || !selectedHour}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
              ${submitting || !selectedDate || !selectedHour
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[var(--foreground)] text-[var(--background)] hover:bg-opacity-90 shadow-md"
              }`}
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Confirm Strategy Review Session
                <Calendar className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}

export default function TutorBooking() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    }>
      <TutorBookingForm />
    </Suspense>
  );
}
