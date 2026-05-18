"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";
import AuthForm from "@/components/AuthForm";
import { parseApiError, register } from "@/lib/api";
import { isAuthenticated, setCredentials } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleRegister(username: string, password: string) {
    try {
      await register(username, password);
      setCredentials(username, password);
      toast.success("Account created successfully.");
      router.replace("/dashboard");
    } catch (err) {
      parseApiError(err);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-100 via-slate-50 to-white px-4 py-12">
      <AuthForm mode="register" onSubmit={handleRegister} />
    </div>
  );
}
