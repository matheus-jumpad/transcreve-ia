export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface TranscriptionResult {
  transcription: string;
  highlights: string[];
  summary?: string;
}

export interface ProcessingState {
  status: AppStatus;
  progress: number; // 0 to 100
  message: string;
  error?: string;
  result?: TranscriptionResult;
}

export interface FileData {
  file: File | null;
  previewUrl: string | null;
  mimeType: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  filename: string;
  result: TranscriptionResult;
}
