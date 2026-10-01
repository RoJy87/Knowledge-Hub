import type { Locale } from '@/locales/messages';

export function getProjectMemberCopy(_locale: Locale) {
  return {
    title: 'Project member management',
    description: 'Add teammates by user ID, change roles, and remove access when it is no longer needed.',
    empty: 'There are no members in this project yet.',
    add: 'Add member',
    adding: 'Adding...',
    remove: 'Remove',
    removing: 'Removing...',
    owner: 'OWNER',
    userId: 'User ID',
    userIdPlaceholder: 'For example: 123e4567-e89b-12d3-a456-426614174000',
    role: 'Role',
    hint: 'This is a lightweight admin flow without a user picker for now. We can add a user directory and invitations later.',
    changeRole: 'Save role',
    savingRole: 'Saving...',
    addSuccess: 'Member added to project',
    addFailed: 'Failed to add member',
    updateSuccess: 'Member role updated',
    updateFailed: 'Failed to update member role',
    removeSuccess: 'Member removed from project',
    removeFailed: 'Failed to remove member',
    userIdRequired: 'Enter a member user ID',
  };
}

export function getProfileAccessCopy(_locale: Locale) {
  return {
    eyebrow: 'Project access',
    title: 'Your spaces and roles',
    description: 'A quick overview of the projects you can access and the role you have inside each one.',
    loading: 'Loading project access...',
    empty: 'You do not have any accessible projects yet.',
    fallback: 'Team workspace and project context.',
  };
}

export function getSearchCopy(_locale: Locale) {
  return {
    eyebrow: 'Search',
    title: 'Search workspace knowledge',
    description: 'Find documents by query, narrow results by project and status, and jump back into the right context without losing your filters.',
    clearFilters: 'Clear filters',
    clear: 'Clear',
    browseDocuments: 'Browse all documents',
    recentSearchesTitle: 'Recent searches',
    recentSearchesDescription: 'Quickly re-open the last discovery paths you explored.',
    recentSearchesEmpty: 'Recent searches will appear here after you use the topbar search.',
    projectShortcutsTitle: 'Project shortcuts',
    projectShortcutsDescription: 'Jump into a project-scoped knowledge slice in one click.',
    projectShortcutsEmpty: 'Project shortcuts will appear here once project data is available.',
    allKnowledgeDescription: 'Use the search field to narrow down documents by meaning, author context, and workspace structure.',
    filteredDescription: 'Filters stay in the URL so you can share this result set or come back to it later.',
    emptyTitle: 'No search results yet',
    emptyDescription: 'Adjust the query or filters to explore a different slice of workspace knowledge.',
  };
}