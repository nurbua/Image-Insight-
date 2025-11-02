export type Theme = 'light' | 'dark';

export const TONES = ['Créatif', 'Professionnel', 'Poétique', 'Humoristique', 'Neutre'] as const;
export type Tone = typeof TONES[number];

export const CONTENT_TYPES = ['titles', 'captions', 'excerpts'] as const;
export type ContentType = typeof CONTENT_TYPES[number];

export interface LiteraryExcerpt {
  extrait: string;
  traduction: string | null;
  auteur: string;
  oeuvre: string;
}

export interface ExifData {
  make?: string;
  model?: string;
  focalLength?: string;
  fNumber?: string;
  iso?: string;
  exposureTime?: string;
  gps?: {
    latitude: number;
    longitude: number;
  };
}

export interface LocationData {
  city?: string;
  state?: string;
  country?: string;
  fullAddress: string;
}

export interface AnalysisData {
  titles: string[];
  captions: string[];
  excerpts: LiteraryExcerpt[];
}

// Fix: Add missing AnalysisResult type to resolve import errors.
export interface AnalysisResult extends AnalysisData {
  id: string;
  imageUrl: string;
  fileName: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}