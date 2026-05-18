"use client";

import { FormEvent, KeyboardEvent, useState } from "react";

interface TaskInputProps {
  onAdd: (title: string) => Promise<void>;
  disabled?: boolean;
}

export default function TaskInput({ onAdd, disabled = false }: TaskInputProps) {
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || submitting || disabled) return;

    setSubmitting(true);
    try {
      await onAdd(trimmed);
      setTitle("");
    } finally {
      setSubmitting(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleSubmit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What needs to be done?"
        disabled={disabled || submitting}
        className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50 disabled:opacity-50"
        aria-label="New task title"
      />
      <button
        type="submit"
        disabled={disabled || submitting || !title.trim()}
        className="rounded-xl bg-indigo-500 px-5 py-3 font-medium text-white transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Adding…" : "Add"}
      </button>
    </form>
  );
}
