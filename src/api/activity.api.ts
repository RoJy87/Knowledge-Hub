import { api } from './axios';
import type { Activity, PaginatedResponse } from '@/types/models';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export const activityApi = {
  async getActivity(page?: number, limit?: number): Promise<PaginatedResponse<Activity>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Activity>>>('/activity', { params: { page, limit } });
    return response.data.data;
  },

  async getGlobalActivity(page?: number, limit?: number): Promise<PaginatedResponse<Activity>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Activity>>>('/activity/global', { params: { page, limit } });
    return response.data.data;
  },
};
