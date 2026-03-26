import { api } from './axios';
import type { Project, ProjectMember, PaginatedResponse } from '@/types/models';

export interface CreateProjectDto {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

export interface AddMemberDto {
  userId: string;
  role: 'MEMBER' | 'EDITOR' | 'ADMIN';
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export const projectsApi = {
  async getProjects(page?: number, limit?: number): Promise<PaginatedResponse<Project>> {
    const params: Record<string, any> = {};
    if (page !== undefined) params.page = page;
    if (limit !== undefined) params.limit = limit;
    
    const response = await api.get<ApiResponse<PaginatedResponse<Project>>>('/projects', { params });
    return response.data.data;
  },

  async getProject(id: string): Promise<Project> {
    const response = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data.data;
  },

  async createProject(data: CreateProjectDto): Promise<Project> {
    const response = await api.post<ApiResponse<Project>>('/projects', data);
    return response.data.data;
  },

  async updateProject(id: string, data: UpdateProjectDto): Promise<Project> {
    const response = await api.patch<ApiResponse<Project>>(`/projects/${id}`, data);
    return response.data.data;
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },

  async getMembers(projectId: string): Promise<ProjectMember[]> {
    const response = await api.get<ApiResponse<ProjectMember[]>>(`/projects/${projectId}/members`);
    return response.data.data;
  },

  async addMember(projectId: string, data: AddMemberDto): Promise<ProjectMember> {
    const response = await api.post<ApiResponse<ProjectMember>>(`/projects/${projectId}/members`, data);
    return response.data.data;
  },

  async removeMember(projectId: string, memberId: string): Promise<void> {
    await api.delete(`/projects/${projectId}/members/${memberId}`);
  },
};
