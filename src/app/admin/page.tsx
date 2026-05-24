"use client";

import { useEffect, useState } from "react";
import { 
  Loader2, Shield, Calendar, ClipboardList, CheckCircle, 
  AlertTriangle, UploadCloud, Edit3, X, Sparkles, Tag, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";

type QuestionOption = {
  id: string;
  text: string;
};

type Question = {
  id: string;
  category: string;
  difficulty: string;
  prompt: string;
  options: QuestionOption[];
  correct_answer: string;
  explanation?: string;
  tags?: string[];
  review_status: string;
  source_type: string;
};

type Stats = {
  attempts: number;
  tutor_requests: number;
  questions: {
    total: number;
    approved: number;
    needs_review: number;
    draft: number;
    retired: number;
  };
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // CSV Import States
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);

  // Edit Question Modal States
  const [editId, setEditId] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDifficulty, setEditDifficulty] = useState("");
  const [editCorrectAnswer, setEditCorrectAnswer] = useState("");
  const [editExplanation, setEditExplanation] = useState("");
  const [editOptionA, setEditOptionA] = useState("");
  const [editOptionB, setEditOptionB] = useState("");
  const [editOptionC, setEditOptionC] = useState("");
  const [editOptionD, setEditOptionD] = useState("");
  const [editOptionE, setEditOptionE] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    try {
      const [statsRes, questionsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/questions")
      ]);

      if (statsRes.ok && questionsRes.ok) {
        const statsData = await statsRes.json();
        const questionsData = await questionsRes.json();
        setStats(statsData);
        setQuestions(questionsData);
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to fetch fresh dashboard data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, review_status: newStatus })
      });

      if (res.ok) {
        showToast(`Question review status set to '${newStatus}'`);
        await fetchData();
      } else {
        showToast("Failed to update status.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error updating review status.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // CSV drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      showToast("Please upload a valid CSV file.", "error");
      return;
    }
    parseCSV(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    parseCSV(file);
  };

  const parseCSV = (file: File) => {
    setImportFile(file);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setParsedQuestions(results.data);
      },
      error: (error) => {
        showToast(`Error parsing CSV: ${error.message}`, "error");
      }
    });
  };

  const handleCommitImport = async () => {
    if (parsedQuestions.length === 0) return;
    setImporting(true);
    try {
      const res = await fetch("/api/admin/questions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: parsedQuestions })
      });

      if (res.ok) {
        const data = await res.json();
        showToast(`Successfully imported ${data.count} questions!`, "success");
        setIsImportOpen(false);
        setImportFile(null);
        setParsedQuestions([]);
        await fetchData();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to import questions.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error uploading questions to the server.", "error");
    } finally {
      setImporting(false);
    }
  };

  const startEdit = (q: Question) => {
    setEditId(q.id);
    setEditPrompt(q.prompt);
    setEditCategory(q.category);
    setEditDifficulty(q.difficulty);
    setEditCorrectAnswer(q.correct_answer);
    setEditExplanation(q.explanation || "");

    const optA = q.options?.find(o => o.id === 'A')?.text || "";
    const optB = q.options?.find(o => o.id === 'B')?.text || "";
    const optC = q.options?.find(o => o.id === 'C')?.text || "";
    const optD = q.options?.find(o => o.id === 'D')?.text || "";
    const optE = q.options?.find(o => o.id === 'E')?.text || "";

    setEditOptionA(optA);
    setEditOptionB(optB);
    setEditOptionC(optC);
    setEditOptionD(optD);
    setEditOptionE(optE);
    setEditTags(q.tags || []);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;

    if (!editPrompt.trim() || !editCategory.trim() || !editDifficulty.trim() || !editCorrectAnswer.trim()) {
      showToast("Please fill in all mandatory fields.", "error");
      return;
    }

    const updatedOptions = [
      { id: 'A', text: editOptionA },
      { id: 'B', text: editOptionB },
      { id: 'C', text: editOptionC },
      { id: 'D', text: editOptionD },
      { id: 'E', text: editOptionE }
    ].filter(o => o.text.trim() !== "");

    if (updatedOptions.length < 2) {
      showToast("A question must have at least 2 non-empty options.", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editId,
          prompt: editPrompt,
          category: editCategory,
          difficulty: editDifficulty,
          correct_answer: editCorrectAnswer,
          explanation: editExplanation,
          options: updatedOptions,
          tags: editTags
        })
      });

      if (res.ok) {
        showToast("Question updated successfully!", "success");
        setEditId(null);
        await fetchData();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to save question edits.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error saving edits.", "error");
    } finally {
      setSaving(false);
    }
  };

  const removeTag = (indexToRemove: number) => {
    setEditTags(editTags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !editTags.includes(trimmed)) {
      setEditTags([...editTags, trimmed]);
      setNewTag("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-24">
      {/* Header */}
      <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-[var(--color-primary)]" />
            <span className="text-xl font-bold tracking-tight">ScorePath Admin</span>
          </div>
          <Link href="/dashboard" className="text-sm font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-12 space-y-12">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase">Attempts</span>
              <p className="text-2xl font-bold">{stats?.attempts}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-teal)]/10 text-[var(--color-accent-teal)] flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase">Tutor Bookings</span>
              <p className="text-2xl font-bold">{stats?.tutor_requests}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-success)]/10 text-[var(--color-success)] flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase">Approved Qs</span>
              <p className="text-2xl font-bold">{stats?.questions.approved} / {stats?.questions.total}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-warning)]/10 text-[var(--color-warning)] flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase">Needs Review</span>
              <p className="text-2xl font-bold">{stats?.questions.needs_review}</p>
            </div>
          </div>
        </div>

        {/* Questions Manager Panel */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-50 pb-6">
            <div>
              <h2 className="text-2xl font-bold">Diagnostic Question Bank</h2>
              <p className="text-sm text-gray-400 mt-1">Review, edit, and bulk import GMAT questions.</p>
            </div>
            <button
              onClick={() => setIsImportOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-violet)] text-white font-semibold rounded-2xl hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <UploadCloud className="w-4 h-4" />
              Import CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs font-bold uppercase">
                  <th className="py-4 px-4">Prompt</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Difficulty</th>
                  <th className="py-4 px-4">Source</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 font-medium text-gray-800 max-w-sm truncate">
                      {q.prompt}
                    </td>
                    <td className="py-4 px-4 text-gray-500 font-semibold">{q.category}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold 
                        ${q.difficulty.toLowerCase() === 'easy' ? 'bg-green-50 text-green-700' : ''}
                        ${q.difficulty.toLowerCase() === 'medium' ? 'bg-amber-50 text-amber-700' : ''}
                        ${q.difficulty.toLowerCase() === 'hard' ? 'bg-red-50 text-red-700' : ''}
                      `}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-400 text-xs font-medium">
                      {q.source_type === "ai_drafted" ? (
                        <span className="flex items-center gap-1 text-[var(--color-accent-violet)] font-semibold">
                          <Sparkles className="w-3.5 h-3.5" />
                          AI
                        </span>
                      ) : (
                        "Original"
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold
                        ${q.review_status === "approved" ? "bg-green-50 text-green-600" : ""}
                        ${q.review_status === "needs_review" ? "bg-amber-50 text-amber-600" : ""}
                        ${q.review_status === "retired" ? "bg-red-50 text-red-600" : ""}
                      `}>
                        {q.review_status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                      {updatingId === q.id ? (
                        <Loader2 className="w-4 h-4 animate-spin inline-block text-gray-400" />
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(q)}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors inline-flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            Edit
                          </button>
                          {q.review_status !== "approved" && (
                            <button
                              onClick={() => handleUpdateStatus(q.id, "approved")}
                              className="px-3 py-1 rounded-lg text-xs font-bold bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                            >
                              Approve
                            </button>
                          )}
                          {q.review_status !== "retired" && (
                            <button
                              onClick={() => handleUpdateStatus(q.id, "retired")}
                              className="px-3 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                            >
                              Retire
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* CSV Import Dialog Overlay */}
      <AnimatePresence>
        {isImportOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!importing) setIsImportOpen(false);
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative border border-gray-100 overflow-hidden"
            >
              <button
                disabled={importing}
                onClick={() => setIsImportOpen(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Bulk Import CSV</h3>
                  <p className="text-sm text-gray-400 mt-1">Upload a CSV file containing GMAT questions.</p>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer relative
                    ${isDragging 
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 scale-[0.98]' 
                      : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300'}`}
                >
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={importing}
                  />
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-[var(--color-primary)] flex items-center justify-center shadow-sm">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700">
                      {importFile ? importFile.name : "Choose CSV or drag it here"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {importFile ? `${(importFile.size / 1024).toFixed(1)} KB` : "Supports standard question schemas"}
                    </p>
                  </div>
                </div>

                {/* Parsed Preview */}
                {parsedQuestions.length > 0 && (
                  <div className="border border-gray-100 rounded-2xl bg-gray-50/50 p-4 space-y-3 max-h-60 overflow-y-auto">
                    <div className="flex justify-between items-center text-xs text-gray-500 font-bold uppercase tracking-wider">
                      <span>Preview (First 3 rows)</span>
                      <span className="text-[var(--color-primary)]">{parsedQuestions.length} Questions parsed</span>
                    </div>
                    <div className="space-y-2">
                      {parsedQuestions.slice(0, 3).map((pq, idx) => {
                        const promptText = pq.question_text || pq.prompt || "(No prompt text)";
                        const topicText = pq.topic || pq.section || pq.category || "General";
                        const diffText = pq.difficulty || "Medium";
                        return (
                          <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100 text-xs shadow-sm">
                            <div className="flex gap-2 mb-1.5 justify-between">
                              <span className="font-semibold text-gray-700 truncate max-w-[220px]">{topicText}</span>
                              <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-bold uppercase tracking-wider scale-90">{diffText}</span>
                            </div>
                            <p className="text-gray-500 line-clamp-2 leading-relaxed">{promptText}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    disabled={importing}
                    onClick={() => setIsImportOpen(false)}
                    className="flex-1 px-4 py-3 bg-gray-50 hover:bg-gray-100 font-semibold rounded-2xl text-gray-700 text-sm transition-colors border border-gray-100 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={importing || parsedQuestions.length === 0}
                    onClick={handleCommitImport}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-violet)] font-semibold rounded-2xl text-white text-sm transition-all hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      "Import Questions"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Question Dialog Overlay */}
      <AnimatePresence>
        {editId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!saving) setEditId(null);
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto"
            >
              <button
                disabled={saving}
                onClick={() => setEditId(null)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <form onSubmit={handleSaveEdit} className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Edit Question Details</h3>
                  <p className="text-sm text-gray-400 mt-1">Make direct updates to question text, options, and metadata.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Category *</label>
                    <input
                      type="text"
                      required
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] bg-gray-50/50"
                      placeholder="e.g. Problem Solving"
                    />
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Difficulty *</label>
                    <select
                      value={editDifficulty}
                      onChange={(e) => setEditDifficulty(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] bg-gray-50/50"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                {/* Prompt */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Question Prompt *</label>
                  <textarea
                    required
                    rows={4}
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] bg-gray-50/50"
                    placeholder="Enter the full question prompt text..."
                  />
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Options (A-E) *</label>
                  
                  <div className="grid gap-3">
                    <div className="flex gap-2 items-center">
                      <span className="w-8 h-8 rounded-full bg-blue-50 text-[var(--color-primary)] font-bold text-xs flex items-center justify-center shrink-0">A</span>
                      <input
                        type="text"
                        value={editOptionA}
                        onChange={(e) => setEditOptionA(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] bg-gray-50/50"
                        placeholder="Option A text"
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="w-8 h-8 rounded-full bg-blue-50 text-[var(--color-primary)] font-bold text-xs flex items-center justify-center shrink-0">B</span>
                      <input
                        type="text"
                        value={editOptionB}
                        onChange={(e) => setEditOptionB(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] bg-gray-50/50"
                        placeholder="Option B text"
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="w-8 h-8 rounded-full bg-blue-50 text-[var(--color-primary)] font-bold text-xs flex items-center justify-center shrink-0">C</span>
                      <input
                        type="text"
                        value={editOptionC}
                        onChange={(e) => setEditOptionC(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] bg-gray-50/50"
                        placeholder="Option C text"
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="w-8 h-8 rounded-full bg-blue-50 text-[var(--color-primary)] font-bold text-xs flex items-center justify-center shrink-0">D</span>
                      <input
                        type="text"
                        value={editOptionD}
                        onChange={(e) => setEditOptionD(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] bg-gray-50/50"
                        placeholder="Option D text"
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="w-8 h-8 rounded-full bg-blue-50 text-[var(--color-primary)] font-bold text-xs flex items-center justify-center shrink-0">E</span>
                      <input
                        type="text"
                        value={editOptionE}
                        onChange={(e) => setEditOptionE(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] bg-gray-50/50"
                        placeholder="Option E text (optional)"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Correct Answer */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Correct Answer *</label>
                    <select
                      value={editCorrectAnswer}
                      onChange={(e) => setEditCorrectAnswer(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] bg-gray-50/50"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="E">E</option>
                    </select>
                  </div>

                  {/* Tags / Skills tested */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Tags & Formulas (Enter to add)
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] bg-gray-50/50"
                        placeholder="e.g. Percents, Speed"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    {/* Tags List */}
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {editTags.map((tag, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(idx)}
                            className="hover:text-blue-900 font-bold focus:outline-none text-[10px] scale-90"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Explanation</label>
                  <textarea
                    rows={4}
                    value={editExplanation}
                    onChange={(e) => setEditExplanation(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] bg-gray-50/50"
                    placeholder="Enter detailed explanations..."
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 border-t border-gray-100 pt-6">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setEditId(null)}
                    className="flex-1 px-4 py-3 bg-gray-50 hover:bg-gray-100 font-semibold rounded-2xl text-gray-700 text-sm transition-colors border border-gray-100 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-violet)] font-semibold rounded-2xl text-white text-sm transition-all hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Updates"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Success / Error Notification Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold text-white border
              ${toast.type === "success" 
                ? "bg-slate-900 border-green-500/20 text-white" 
                : "bg-slate-900 border-red-500/20 text-white"}`}
          >
            <div className={`w-2 h-2 rounded-full ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`} />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
