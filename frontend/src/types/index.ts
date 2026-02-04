export interface RoastSection {
  title: string;
  icon: string;
  points: string[];
}

export interface Suggestion {
  original: string;
  improved: string;
  why: string;
}

export interface ScoreBreakdown {
  clarity: number;
  impact: number;
  relevance: number;
  ats: number;
}

export interface RoastResponse {
  id: string;
  share_id: string;
  score: number;
  score_breakdown: ScoreBreakdown;
  headline: string;
  sections: RoastSection[];
  suggestions: Suggestion[];
  ats_tips: string[];
  created_at: string;
  resume_id?: string;
  // Legacy field for backwards compatibility
  share_url?: string;
  roast?: {
    headline: string;
    sections: RoastSection[];
  };
}

export interface UploadState {
  file: File | null;
  isUploading: boolean;
  error: string | null;
}

// Auth types
export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Resume types
export interface Resume {
  id: string;
  filename: string;
  version: number;
  is_latest: boolean;
  created_at: string;
}

export interface ResumeListResponse {
  resumes: Resume[];
  total: number;
}

// Roast history types
export interface RoastHistoryItem {
  id: string;
  share_id: string;
  score: number;
  headline: string;
  created_at: string;
  resume_filename?: string;
  resume_version?: number;
}

export interface RoastHistoryResponse {
  roasts: RoastHistoryItem[];
  total: number;
}
