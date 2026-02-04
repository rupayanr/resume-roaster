import axios from 'axios';
import type {
  RoastResponse,
  TokenResponse,
  User,
  LoginRequest,
  SignupRequest,
  ResumeListResponse,
  Resume,
  RoastHistoryResponse,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

// Token management
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem('token');
}

// Initialize token from storage
const storedToken = getStoredToken();
if (storedToken) {
  setAuthToken(storedToken);
}

// Auth API
export async function signup(data: SignupRequest): Promise<User> {
  const response = await api.post<User>('/api/v1/auth/signup', data);
  return response.data;
}

export async function login(data: LoginRequest): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>('/api/v1/auth/login', data);
  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await api.get<User>('/api/v1/auth/me');
  return response.data;
}

// Resume API
export async function uploadResume(file: File): Promise<RoastResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<RoastResponse>('/api/v1/roast', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

export async function getRoast(shareId: string): Promise<RoastResponse> {
  const response = await api.get<RoastResponse>(`/api/v1/roast/${shareId}`);
  return response.data;
}

export async function getMyRoasts(): Promise<RoastHistoryResponse> {
  const response = await api.get<RoastHistoryResponse>('/api/v1/my-roasts');
  return response.data;
}

// Resumes API
export async function listResumes(): Promise<ResumeListResponse> {
  const response = await api.get<ResumeListResponse>('/api/v1/resumes');
  return response.data;
}

export async function getResume(id: string): Promise<Resume> {
  const response = await api.get<Resume>(`/api/v1/resumes/${id}`);
  return response.data;
}

export async function downloadResume(id: string): Promise<Blob> {
  const response = await api.get(`/api/v1/resumes/${id}/download`, {
    responseType: 'blob',
  });
  return response.data;
}

export async function deleteResume(id: string): Promise<void> {
  await api.delete(`/api/v1/resumes/${id}`);
}
