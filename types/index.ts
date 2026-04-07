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

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description?: string;
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
  intensity: RoastIntensity;
  industry?: string;
  persona?: RoastPersona;
  badges: Badge[];
  is_headline_public: boolean;
  reactions: Record<string, number>;
}

export type RoastIntensity = 'mild' | 'medium' | 'brutal';
export type Industry = 'tech' | 'finance' | 'creative' | 'healthcare' | 'general';
export type ReactionType = 'fire' | 'crying_laughing' | 'ouch' | 'facts' | 'survived';
export type RoastPersona =
  | 'default'
  | 'gordon_ramsay'
  | 'supportive_mom'
  | 'silicon_valley_vc'
  | 'gen_z_intern'
  | 'shakespeare';

export interface UploadState {
  file: File | null;
  isUploading: boolean;
  error: string | null;
}

export interface RoastOptions {
  intensity: RoastIntensity;
  industry: Industry;
  persona: RoastPersona;
}

// Hot takes
export interface HotTake {
  headline: string;
  score: number;
}

export interface HotTakesResponse {
  hot_takes: HotTake[];
}

// Reactions
export interface ReactionResponse {
  reactions: Record<string, number>;
}

// API Response types
export interface ApiError {
  detail: string;
}

// Roast History (localStorage)
export interface RoastHistoryEntry {
  date: string;
  score: number;
  shareId: string;
  headline: string;
  persona?: RoastPersona;
}
