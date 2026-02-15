import axios from 'axios';
import type {
  RoastResponse,
  RoastIntensity,
  Industry,
  HotTakesResponse,
  ReactionResponse,
  ReactionType,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

// Resume API
export async function uploadResume(
  file: File,
  intensity: RoastIntensity = 'medium',
  industry: Industry = 'general'
): Promise<RoastResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('intensity', intensity);
  formData.append('industry', industry);

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

// Hot takes API
export async function getHotTakes(limit: number = 10): Promise<HotTakesResponse> {
  const response = await api.get<HotTakesResponse>('/api/v1/hot-takes', {
    params: { limit },
  });
  return response.data;
}

// Toggle public headline
export async function togglePublicHeadline(shareId: string, isPublic: boolean): Promise<void> {
  await api.patch(`/api/v1/roast/${shareId}/public`, null, {
    params: { is_public: isPublic },
  });
}

// Reactions API
export async function addReaction(shareId: string, reaction: ReactionType): Promise<ReactionResponse> {
  const response = await api.post<ReactionResponse>(`/api/v1/roast/${shareId}/react`, {
    reaction,
  });
  return response.data;
}

// Get OG image URL
export function getOgImageUrl(shareId: string): string {
  return `${API_URL}/api/v1/roast/${shareId}/og-image`;
}
