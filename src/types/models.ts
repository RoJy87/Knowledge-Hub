export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  slug: string;
  color: string;
  isActive: boolean;
  creatorId: string;
  creator?: User;
  members?: ProjectMember[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: 'MEMBER' | 'EDITOR' | 'ADMIN';
  createdAt: string;
  user?: User;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  viewCount: number;
  authorId: string;
  author?: User;
  projectId?: string;
  project?: Project;
  tags: Tag[];
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface ArticleList {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  viewCount: number;
  author: User;
  tags: Tag[];
  commentsCount: number;
  createdAt: string;
  publishedAt?: string;
}

export interface Comment {
  id: string;
  content: string;
  isEdited: boolean;
  isDeleted: boolean;
  authorId: string;
  author?: User;
  articleId: string;
  parentId?: string;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  articleExcerpt?: string;
  articleCoverImage?: string;
  authorName: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  metadata?: Record<string, any>;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  articleId?: string;
  articleTitle?: string;
  createdAt: string;
}

export type ActivityType =
  | 'ARTICLE_CREATED'
  | 'ARTICLE_UPDATED'
  | 'ARTICLE_PUBLISHED'
  | 'ARTICLE_DELETED'
  | 'COMMENT_CREATED'
  | 'COMMENT_DELETED'
  | 'PROJECT_CREATED'
  | 'PROJECT_UPDATED'
  | 'USER_JOINED'
  | 'USER_LEFT'
  | 'FAVORITE_ADDED'
  | 'FAVORITE_REMOVED';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}
