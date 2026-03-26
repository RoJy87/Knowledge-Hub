import { api } from './axios';
import type { Article, ArticleList, PaginatedResponse } from '@/types/models';

export interface CreateArticleDto {
  title: string;
  content: string;
  excerpt?: string;
  projectId?: string;
  status?: 'DRAFT' | 'PUBLISHED';
  tagIds?: string[];
}

export interface UpdateArticleDto {
  title?: string;
  content?: string;
  excerpt?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  coverImage?: string;
  tagIds?: string[];
}

export interface ArticleFilters {
  projectId?: string;
  authorId?: string;
  status?: string;
  tagId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export const articlesApi = {
  async getArticles(filters?: ArticleFilters): Promise<PaginatedResponse<ArticleList>> {
    const response = await api.get<ApiResponse<PaginatedResponse<ArticleList>>>('/articles', { params: filters });
    return response.data.data;
  },

  async getArticle(id: string): Promise<Article> {
    const response = await api.get<ApiResponse<Article>>(`/articles/${id}`);
    return response.data.data;
  },

  async getArticleBySlug(slug: string): Promise<Article> {
    const response = await api.get<ApiResponse<Article>>(`/articles/slug/${slug}`);
    return response.data.data;
  },

  async getMyArticles(page?: number, limit?: number): Promise<PaginatedResponse<ArticleList>> {
    const response = await api.get<ApiResponse<PaginatedResponse<ArticleList>>>('/articles/my', { params: { page, limit } });
    return response.data.data;
  },

  async createArticle(data: CreateArticleDto): Promise<Article> {
    const response = await api.post<ApiResponse<Article>>('/articles', data);
    return response.data.data;
  },

  async updateArticle(id: string, data: UpdateArticleDto): Promise<Article> {
    const response = await api.patch<ApiResponse<Article>>(`/articles/${id}`, data);
    return response.data.data;
  },

  async deleteArticle(id: string): Promise<void> {
    await api.delete(`/articles/${id}`);
  },
};
