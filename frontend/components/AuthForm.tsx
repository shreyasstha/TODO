"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ApiValidationError } from "@/lib/api";
import {
  type AuthFieldErrors,
  getPasswordHints,
  validateAuthForm,
  validateConfirmPassword,
  validateLoginPassword,
  validateRegisterPassword,
  validateUsername,
} from "@/lib/validation/auth";

interface AuthFormProps {
  mode: "login" | "register";
  onSubmit: (username: string, password: string) => Promise<void>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-sm text-red-600">{message}</p>;
}

function inputClassName(hasError: boolean) {
  return `w-full rounded-xl border bg-white px-4 py-3 text-slate-800 placeholder-slate-400 outline-none transition focus:ring-2 disabled:bg-slate-50 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
      : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20"
  }`;
}

export default function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isLogin = mode === "login";
  const passwordHints = getPasswordHints(mode);

  function validateField(field: "username" | "password" | "confirmPassword") {
    const nextErrors: AuthFieldErrors = { ...fieldErrors };

    if (field === "username") {
      const err = validateUsername(username);
      if (err) nextErrors.username = err;
      else delete nextErrors.username;
    }

    if (field === "password") {
      const err = isLogin
        ? validateLoginPassword(password)
        : validateRegisterPassword(password);
      if (err) nextErrors.password = err;
      else delete nextErrors.password;

      if (!isLogin && touched.confirmPassword) {
        const confirmErr = validateConfirmPassword(password, confirmPassword);
        if (confirmErr) nextErrors.confirmPassword = confirmErr;
        else delete nextErrors.confirmPassword;
      }
    }

    if (field === "confirmPassword" && !isLogin) {
      const err = validateConfirmPassword(password, confirmPassword);
      if (err) nextErrors.confirmPassword = err;
      else delete nextErrors.confirmPassword;
    }

    setFieldErrors(nextErrors);
  }

  function handleBlur(field: "username" | "password" | "confirmPassword") {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setTouched({ username: true, password: true, confirmPassword: true });

    const result = validateAuthForm(mode, username, password, confirmPassword);
    setFieldErrors(result.errors);

    if (!result.valid) return;

    setSubmitting(true);
    try {
      await onSubmit(username.trim(), password);
    } catch (err) {
      if (err instanceof ApiValidationError) {
        if (Object.keys(err.errors).length > 0) {
          setFieldErrors(err.errors);
        }
        setFormError(err.message);
      } else {
        setFormError(err instanceof Error ? err.message : "Something went wrong.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-xl font-bold text-white shadow-md shadow-indigo-500/25">
          ✓
        </span>
        <h1 className="text-2xl font-semibold text-slate-800">
          {isLogin ? "Welcome back" : "Create an account"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {isLogin
            ? "Sign in to manage your personal todos"
            : "Register to start organizing your tasks"}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60"
      >
        {formError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </div>
        )}

        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Username</span>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (touched.username) validateField("username");
            }}
            onBlur={() => handleBlur("username")}
            placeholder="e.g. john_doe"
            autoComplete="username"
            disabled={submitting}
            aria-invalid={!!fieldErrors.username}
            className={inputClassName(!!fieldErrors.username && touched.username)}
          />
          {touched.username && <FieldError message={fieldErrors.username} />}
        </label>

        <label className="mb-2 block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (touched.password) validateField("password");
            }}
            onBlur={() => handleBlur("password")}
            placeholder="Enter password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            disabled={submitting}
            aria-invalid={!!fieldErrors.password}
            className={inputClassName(!!fieldErrors.password && touched.password)}
          />
          {touched.password && <FieldError message={fieldErrors.password} />}
        </label>

        <ul
          className={`space-y-1 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500 ${
            isLogin ? "mb-6" : "mb-4"
          }`}
        >
          {passwordHints.map((hint) => (
            <li key={hint} className="flex items-center gap-2">
              <span className="text-indigo-400">•</span>
              {hint}
            </li>
          ))}
        </ul>

        {!isLogin && (
          <label className="mb-6 block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Confirm password
            </span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (touched.confirmPassword) validateField("confirmPassword");
              }}
              onBlur={() => handleBlur("confirmPassword")}
              placeholder="Re-enter password"
              autoComplete="new-password"
              disabled={submitting}
              aria-invalid={!!fieldErrors.confirmPassword}
              className={inputClassName(
                !!fieldErrors.confirmPassword && touched.confirmPassword
              )}
            />
            {touched.confirmPassword && (
              <FieldError message={fieldErrors.confirmPassword} />
            )}
          </label>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-indigo-500 py-3 font-medium text-white transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Please wait…" : isLogin ? "Login" : "Register"}
        </button>

        <p className="mt-4 text-center text-sm text-slate-500">
          {isLogin ? (
            <>
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-indigo-600 transition hover:text-indigo-700"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-indigo-600 transition hover:text-indigo-700"
              >
                Login
              </Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
