import axios from "axios";
import { getAuthorizationHeader } from "@/lib/auth";
import type { AuthFieldErrors } from "@/lib/validation/auth";
import type { Task } from "@/types/task";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const isPublicRoute =
    config.url === "/register" ||
    config.url === "/login" ||
    config.url?.endsWith("/register") ||
    config.url?.endsWith("/login");

  if (!isPublicRoute) {
    const authHeader = getAuthorizationHeader();
    if (authHeader) {
      config.headers.Authorization = authHeader;
    }
  }
  return config;
});

export interface AuthUser {
  id: string;
  username: string;
}

export interface ApiErrorPayload {
  message?: string;
  errors?: AuthFieldErrors;
}

export class ApiValidationError extends Error {
  errors: AuthFieldErrors;

  constructor(message: string, errors: AuthFieldErrors = {}) {
    super(message);
    this.name = "ApiValidationError";
    this.errors = errors;
  }
}

export async function register(
  username: string,
  password: string
): Promise<{ message: string; user: AuthUser }> {
  const { data } = await api.post<{ message: string; user: AuthUser }>("/register", {
    username,
    password,
  });
  return data;
}

export async function login(
  username: string,
  password: string
): Promise<{ message: string; user: AuthUser }> {
  const { data } = await api.post<{ message: string; user: AuthUser }>("/login", {
    username,
    password,
  });
  return data;
}

export async function fetchTasks(): Promise<Task[]> {
  const { data } = await api.get<Task[]>("/tasks");
  return data;
}

export async function createTask(title: string): Promise<Task> {
  const { data } = await api.post<Task>("/tasks", { title });
  return data;
}

export async function updateTask(
  id: string,
  updates: Partial<Pick<Task, "title" | "completed">>
): Promise<Task> {
  const { data } = await api.put<Task>(`/tasks/${id}`, updates);
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`);
}

export async function reorderTasks(taskIds: string[]): Promise<Task[]> {
  const { data } = await api.put<Task[]>("/tasks/reorder", { taskIds });
  return data;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiValidationError) {
    return error.message;
  }
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as ApiErrorPayload)?.message ||
      error.message ||
      "Something went wrong."
    );
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}

export function getFieldErrors(error: unknown): AuthFieldErrors {
  if (error instanceof ApiValidationError) {
    return error.errors;
  }
  if (axios.isAxiosError(error)) {
    return (error.response?.data as ApiErrorPayload)?.errors ?? {};
  }
  return {};
}

export function parseApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as ApiErrorPayload | undefined;
    throw new ApiValidationError(
      payload?.message || error.message || "Something went wrong.",
      payload?.errors ?? {}
    );
  }
  if (error instanceof Error) throw error;
  throw new Error("Something went wrong.");
}
