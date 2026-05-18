"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useRef, useState } from "react";
import type { Task } from "@/types/task";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onUpdate: (id: string, title: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  disabled?: boolean;
}

export default function TaskItem({
  task,
  onToggle,
  onUpdate,
  onDelete,
  disabled = false,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: disabled || isEditing,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) setEditTitle(task.title);
  }, [task.title, isEditing]);

  async function handleToggle() {
    if (disabled || busy || isEditing) return;
    setBusy(true);
    try {
      await onToggle(task.id, !task.completed);
    } finally {
      setBusy(false);
    }
  }

  async function handleSave() {
    const trimmed = editTitle.trim();
    if (!trimmed) return;
    if (trimmed === task.title) {
      setIsEditing(false);
      return;
    }

    setBusy(true);
    try {
      await onUpdate(task.id, trimmed);
      setIsEditing(false);
    } finally {
      setBusy(false);
    }
  }

  function handleEditKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleSave();
    }
    if (e.key === "Escape") {
      setEditTitle(task.title);
      setIsEditing(false);
    }
  }

  async function handleDelete() {
    if (disabled || busy) return;
    setBusy(true);
    try {
      await onDelete(task.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 transition hover:border-slate-300 hover:bg-white sm:gap-3 sm:px-4 ${
        task.completed ? "bg-slate-50/80" : ""
      } ${busy ? "pointer-events-none opacity-60" : ""} ${
        isDragging ? "z-10 border-indigo-300 bg-white shadow-lg ring-2 ring-indigo-500/20" : ""
      }`}
    >
      <button
        type="button"
        className={`touch-none shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 ${
          disabled || isEditing ? "cursor-not-allowed opacity-40" : "cursor-grab active:cursor-grabbing"
        }`}
        aria-label="Drag to reorder"
        disabled={disabled || isEditing}
        {...attributes}
        {...listeners}
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M7 4a1 1 0 110 2 1 1 0 010-2zm6 0a1 1 0 110 2 1 1 0 010-2zM7 9a1 1 0 110 2 1 1 0 010-2zm6 0a1 1 0 110 2 1 1 0 010-2zM7 14a1 1 0 110 2 1 1 0 010-2zm6 0a1 1 0 110 2 1 1 0 010-2z" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => void handleToggle()}
        disabled={disabled || busy}
        aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
          task.completed
            ? "border-green-500 bg-green-500 text-white"
            : "border-slate-400 bg-white hover:border-indigo-500"
        }`}
      >
        {task.completed && (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={() => void handleSave()}
          onKeyDown={handleEditKeyDown}
          disabled={disabled || busy}
          className="flex-1 rounded-lg border border-indigo-400 bg-white px-2 py-1 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/25"
        />
      ) : (
        <span
          onDoubleClick={() => !disabled && !task.completed && setIsEditing(true)}
          className={`flex-1 cursor-default select-none text-sm sm:text-base ${
            task.completed ? "text-slate-400 line-through" : "text-slate-800"
          }`}
          title="Double-click to edit"
        >
          {task.title}
        </span>
      )}

      <div className="flex shrink-0 gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
        {!isEditing && !task.completed && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            disabled={disabled || busy}
            aria-label="Edit task"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
        )}
        <button
          type="button"
          onClick={() => void handleDelete()}
          disabled={disabled || busy}
          aria-label="Delete task"
          className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </li>
  );
}
