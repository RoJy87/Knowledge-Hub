import type { Article, Project, User } from '@/types/models';

export function isWorkspaceAdmin(user?: User | null) {
  return user?.role === 'ADMIN';
}

export function isProjectAdmin(project?: Project | null, user?: User | null) {
  if (!project || !user) return false;
  if (isWorkspaceAdmin(user)) return true;
  if (project.creatorId === user.id) return true;
  return project.members?.some((member) => member.userId === user.id && member.role === 'ADMIN') ?? false;
}

export function canContributeToProject(project?: Project | null, user?: User | null) {
  if (!project || !user) return false;
  if (isWorkspaceAdmin(user)) return true;
  if (project.creatorId === user.id) return true;
  return project.members?.some((member) => member.userId === user.id) ?? false;
}

export function canEditArticle(article?: Article | null, user?: User | null) {
  if (!article || !user) return false;
  return article.authorId === user.id || article.author?.id === user.id;
}