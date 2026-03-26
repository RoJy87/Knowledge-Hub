import { api } from './axios';
import type { Favorite, PaginatedResponse } from '@/types/models';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export const favoritesApi = {
  async getFavorites(page?: number, limit?: number): Promise<PaginatedResponse<Favorite>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Favorite>>>('/favorites', { params: { page, limit } });
    return response.data.data;
  },

  async addToFavorites(articleId: string): Promise<Favorite> {
    const response = await api.post<ApiResponse<Favorite>>(`/favorites/${articleId}`);
    return response.data.data;
  },

  async removeFromFavorites(articleId: string): Promise<void> {
    await api.delete(`/favorites/${articleId}`);
  },

  async toggleFavorite(articleId: string): Promise<{ isFavorite: boolean; favorite?: Favorite }> {
    const response = await api.post<ApiResponse<{ isFavorite: boolean; favorite?: Favorite }>>(`/favorites/toggle/${articleId}`);
    return response.data.data;
  },

  async isFavorite(articleId: string): Promise<{ isFavorite: boolean }> {
    const response = await api.get<ApiResponse<{ isFavorite: boolean }>>(`/favorites/check/${articleId}`);
    return response.data.data;
  },
};
