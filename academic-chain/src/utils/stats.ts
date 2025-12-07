/**
 * Statistics calculation utilities
 * Centralizes stats aggregation logic for data analysis across components
 */

import { Seminar, Project, ResearchPaper } from '../hooks/useData';

/**
 * Calculate seminar statistics
 */
export function calculateSeminarStats(seminars: Seminar[]) {
  return {
    totalSeminars: seminars.length,
    uniqueUniversities: new Set(seminars.map(s => s.university)).size,
    uniqueFields: new Set(seminars.map(s => s.field)).size,
    totalMembers: seminars.reduce((sum, s) => sum + s.members, 0),
    averageMembers: Math.round(seminars.reduce((sum, s) => sum + s.members, 0) / (seminars.length || 1)),
    collaborationOpen: seminars.filter(s => s.openForCollaboration).length,
  };
}

/**
 * Calculate project statistics
 */
export function calculateProjectStats(projects: Project[]) {
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const plannedProjects = projects.filter(p => p.status === 'planning').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalMembers = projects.reduce((sum, p) => sum + p.members, 0);
  const totalTasks = projects.reduce((sum, p) => sum + p.tasks.total, 0);
  const completedTasks = projects.reduce((sum, p) => sum + p.tasks.completed, 0);
  const averageProgress = Math.round(
    projects.reduce((sum, p) => sum + p.progress, 0) / (projects.length || 1)
  );

  return {
    total: projects.length,
    active: activeProjects,
    planned: plannedProjects,
    completed: completedProjects,
    totalMembers,
    totalTasks,
    completedTasks,
    taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    averageProgress,
  };
}

/**
 * Calculate paper statistics
 */
export function calculatePaperStats(papers: ResearchPaper[]) {
  return {
    total: papers.length,
    verified: papers.filter(p => p.verified).length,
    verificationRate: papers.length > 0 ? Math.round((papers.filter(p => p.verified).length / papers.length) * 100) : 0,
    totalDownloads: papers.reduce((sum, p) => sum + p.downloads, 0),
    totalLikes: papers.reduce((sum, p) => sum + p.likes, 0),
    totalComments: papers.reduce((sum, p) => sum + p.comments, 0),
    totalCitations: papers.reduce((sum, p) => sum + p.citations, 0),
    averageDownloads: Math.round(papers.reduce((sum, p) => sum + p.downloads, 0) / (papers.length || 1)),
    uniqueCategories: new Set(papers.map(p => p.category)).size,
    uniqueAuthors: new Set(papers.map(p => p.author)).size,
  };
}

/**
 * Get distribution of items by category
 */
export function getDistribution<T extends Record<K, any>, K extends string | number | symbol>(
  items: T[],
  property: K
): Record<string, number> {
  const distribution: Record<string, number> = {};

  items.forEach(item => {
    const key = String(item[property]);
    distribution[key] = (distribution[key] || 0) + 1;
  });

  return distribution;
}
