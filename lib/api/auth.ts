import { api } from "@/lib/api/axios";

export type UserRole = "USER" | "ADMIN" | "RECEPTIONIST";

export interface AuthUserResponse {
  jwtToken: string;
  email: string;
  role: UserRole;
}

export interface CheckEmailResponse {
  emailExists: boolean;
  lastVisitDate: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
  mobile: string;
  password: string;
}

export async function checkEmail(email: string): Promise<CheckEmailResponse> {
  const response = await api.post<CheckEmailResponse>("/auth/check-email", { email });
  return response.data;
}

export async function login(data: LoginRequest): Promise<AuthUserResponse> {
  const response = await api.post<AuthUserResponse>("/auth/login", data);
  return response.data;
}

export async function register(data: RegisterRequest): Promise<AuthUserResponse> {
  const response = await api.post<AuthUserResponse>("/auth/register", data);
  return response.data;
}