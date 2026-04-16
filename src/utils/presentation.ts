import type { Activity, ActivityType, Favorite } from '@/types/models';

const activityTitles: Record<ActivityType, string> = {
  ARTICLE_CREATED: 'created a document',
  ARTICLE_UPDATED: 'updated a document',
  ARTICLE_PUBLISHED: 'published a document',
  ARTICLE_DELETED: 'removed a document',
  COMMENT_CREATED: 'commented on a document',
  COMMENT_DELETED: 'deleted a comment',
  PROJECT_CREATED: 'created a project',
  PROJECT_UPDATED: 'updated a project',
  USER_JOINED: 'joined the workspace',
  USER_LEFT: 'left the workspace',
  FAVORITE_ADDED: 'favorited a document',
  FAVORITE_REMOVED: 'removed a favorite',
};

export function formatShortDate(value?: string) {
  if (!value) return 'No recent updates';
  return new Date(value).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatRelativeTime(value?: string) {
  if (!value) return 'Recently';

  const target = new Date(value).getTime();
  const now = Date.now();
  const diffMs = target - now;
  const absMinutes = Math.round(Math.abs(diffMs) / 60000);

  if (absMinutes < 1) return 'just now';
  if (absMinutes < 60) return `${absMinutes} min ago`;

  const absHours = Math.round(absMinutes / 60);
  if (absHours < 24) return `${absHours}h ago`;

  const absDays = Math.round(absHours / 24);
  if (absDays < 7) return `${absDays}d ago`;

  return formatShortDate(value);
}

export function statusClass(status: string) {
  if (status === 'PUBLISHED' || status === 'Published') return 'status-chip--published';
  if (status === 'ARCHIVED' || status === 'Archived') return 'status-chip--archived';
  return 'status-chip--draft';
}

export function describeActivity(activity: Activity) {
  const actor = `${activity.user.firstName} ${activity.user.lastName}`.trim();
  const action = activityTitles[activity.type] ?? 'updated the workspace';
  const target = activity.articleTitle ? `“${activity.articleTitle}”` : '';

  return {
    title: `${actor} ${action}`.trim(),
    description: target || 'Changes were recorded in the workspace activity feed.',
    time: formatRelativeTime(activity.createdAt),
  };
}

export function favoriteSummary(favorite: Favorite) {
  return {
    title: favorite.articleTitle,
    description:
      favorite.articleExcerpt || 'Saved document from your workspace knowledge base.',
    author: favorite.authorName,
    savedAt: formatShortDate(favorite.createdAt),
  };
}
