"use client";

import { useRouter } from "next/navigation";
import { clearCredentials, getUsername } from "@/lib/auth";

interface NavbarProps {
  showLogout?: boolean;
}

export default function Navbar({ showLogout = false }: NavbarProps) {
  const router = useRouter();
  const username = getUsername();

  function handleLogout() {
    clearCredentials();
    router.replace("/login");
  }

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-lg font-bold text-white shadow-md shadow-indigo-500/25">
            ✓
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-800 sm:text-2xl">
              Todo App
            </h1>
            <p className="text-sm text-slate-500">
              {showLogout && username
                ? `Welcome, ${username}`
                : "Stay organized, get things done"}
            </p>
          </div>
        </div>

        {showLogout && (
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
