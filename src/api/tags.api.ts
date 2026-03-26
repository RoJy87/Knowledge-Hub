import { api } from './axios';
import type { Tag, PaginatedResponse } from '@/types/models';

export interface CreateTagDto {
  name: string;
  color?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export const tagsApi = {
  async getTags(page?: number, limit?: number): Promise<PaginatedResponse<Tag>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Tag>>>('/tags', { params: { page, limit } });
    return response.data.data;
  },

  async getPopularTags(limit?: number): Promise<Tag[]> {
    const response = await api.get<ApiResponse<Tag[]>>('/tags/popular', { params: { limit } });
    return response.data.data;
  },

  async getTag(id: string): Promise<Tag> {
    const response = await api.get<ApiResponse<Tag>>(`/tags/${id}`);
    return response.data.data;
  },

  async getTagBySlug(slug: string): Promise<Tag> {
    const response = await api.get<ApiResponse<Tag>>(`/tags/slug/${slug}`);
    return response.data.data;
  },

  async createTag(data: CreateTagDto): Promise<Tag> {
    const response = await api.post<ApiResponse<Tag>>('/tags', data);
    return response.data.data;
  },

  async deleteTag(id: string): Promise<void> {
    await api.delete(`/tags/${id}`);
  },
};
