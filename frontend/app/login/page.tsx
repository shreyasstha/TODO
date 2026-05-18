"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";
import AuthForm from "@/components/AuthForm";
import { login, parseApiError } from "@/lib/api";
import { isAuthenticated, setCredentials } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleLogin(username: string, password: string) {
    try {
      await login(username, password);
      setCredentials(username, password);
      toast.success("Logged in successfully.");
      router.replace("/dashboard");
    } catch (err) {
      parseApiError(err);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-100 via-slate-50 to-white px-4 py-12">
      <AuthForm mode="login" onSubmit={handleLogin} />
    </div>
  );
}
