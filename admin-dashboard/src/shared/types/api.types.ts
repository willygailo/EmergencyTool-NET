export interface Broadcast {
  id: string;
  message: string;
  targetBarangays: string[];
  sentBy: string;
  sentAt: string;
  type: 'broadcast' | 'evacuation' | 'alert';
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}