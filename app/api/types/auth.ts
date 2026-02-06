// types/auth.ts

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
  name?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  learner: {
    id: number;
    email: string;
    name?: string | null;
  };
}
