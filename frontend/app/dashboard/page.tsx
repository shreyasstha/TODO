"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import TaskInput from "@/components/TaskInput";
import TaskList from "@/components/TaskList";
import {
  createTask,
  deleteTask,
  fetchTasks,
  getErrorMessage,
  reorderTasks,
  updateTask,
} from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import type { Task } from "@/types/task";

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    setAuthChecked(true);
  }, [router]);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      const message = getErrorMessage(err);
      if (message.toLowerCase().includes("invalid") || message.toLowerCase().includes("authorization")) {
        router.replace("/login");
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (authChecked) {
      void loadTasks();
    }
  }, [authChecked, loadTasks]);

  async function handleAdd(title: string) {
    if (!title.trim()) {
      toast.error("Task title cannot be empty.");
      return;
    }

    setActionBusy(true);
    try {
      const task = await createTask(title);
      setTasks((prev) => [task, ...prev]);
      toast.success("Task created.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionBusy(false);
    }
  }

  async function handleToggle(id: string, completed: boolean) {
    setActionBusy(true);
    try {
      const updated = await updateTask(id, { completed });
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      toast.success(completed ? "Task completed." : "Task marked active.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionBusy(false);
    }
  }

  async function handleUpdate(id: string, title: string) {
    if (!title.trim()) {
      toast.error("Task title cannot be empty.");
      return;
    }

    setActionBusy(true);
    try {
      const updated = await updateTask(id, { title });
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      toast.success("Task updated.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionBusy(false);
    }
  }

  async function handleDelete(id: string) {
    setActionBusy(true);
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success("Task deleted.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionBusy(false);
    }
  }

  async function handleReorder(taskIds: string[]) {
    const previous = tasks;
    const idToTask = new Map(tasks.map((t) => [t.id, t]));
    const optimistic = taskIds
      .map((id) => idToTask.get(id))
      .filter((t): t is Task => t !== undefined);

    setTasks(optimistic);

    try {
      const updated = await reorderTasks(taskIds);
      setTasks(updated);
    } catch (err) {
      setTasks(previous);
      toast.error(getErrorMessage(err));
    }
  }

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-100 via-slate-50 to-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      <Navbar showLogout />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60">
          <TaskInput onAdd={handleAdd} disabled={loading || actionBusy} />
          <div className="mt-6 border-t border-slate-200 pt-6">
            <TaskList
              tasks={tasks}
              loading={loading}
              error={error}
              onToggle={handleToggle}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onReorder={handleReorder}
              disabled={actionBusy}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
