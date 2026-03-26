import { api } from './axios';
import type { Comment } from '@/types/models';

export interface CreateCommentDto {
  content: string;
  articleId: string;
  parentId?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export const commentsApi = {
  async getCommentsByArticle(articleId: string): Promise<Comment[]> {
    const response = await api.get<ApiResponse<Comment[]>>(`/comments/article/${articleId}`);
    return response.data.data;
  },

  async getComment(id: string): Promise<Comment> {
    const response = await api.get<ApiResponse<Comment>>(`/comments/${id}`);
    return response.data.data;
  },

  async createComment(data: CreateCommentDto): Promise<Comment> {
    const response = await api.post<ApiResponse<Comment>>('/comments', data);
    return response.data.data;
  },

  async updateComment(id: string, content: string): Promise<Comment> {
    const response = await api.patch<ApiResponse<Comment>>(`/comments/${id}`, { content });
    return response.data.data;
  },

  async deleteComment(id: string): Promise<void> {
    await api.delete(`/comments/${id}`);
  },
};
