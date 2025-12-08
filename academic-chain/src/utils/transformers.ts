/**
 * Type transformation utilities for converting Prisma types to UI types
 * Centralizes data mapping logic used across components
 */

import { ResearchPaper, Seminar, Project } from '../hooks/useData';

/**
 * Transform ResearchPaper to searchable paper type
 */
export function transformPaper(paper: ResearchPaper) {
  return {
    id: paper.id,
    type: 'paper' as const,
    title: paper.title,
    author: paper.author,
    university: paper.university,
    department: paper.department || '',
    date: paper.date,
    abstract: paper.abstract,
    tags: paper.tags,
    category: paper.category,
    downloads: paper.downloads,
    likes: paper.likes,
    comments: paper.comments,
    verified: paper.verified
  };
}

/**
 * Transform Seminar to searchable seminar type
 */
export function transformSeminar(seminar: Seminar) {
  return {
    id: seminar.id,
    type: 'seminar' as const,
    name: seminar.name,
    university: seminar.university,
    professor: seminar.professor,
    members: seminar.members,
    field: seminar.field,
    description: seminar.description,
    tags: seminar.tags,
    activeProjects: 0,
    publications: 0,
    openForCollaboration: seminar.openForCollaboration
  };
}

/**
 * Transform Project to searchable project type
 */
export function transformProject(project: Project) {
  return {
    id: project.id,
    type: 'project' as const,
    title: project.title,
    description: project.description,
    status: project.status,
    progress: project.progress,
    universities: project.universities,
    members: project.members,
    leader: project.leader,
    tags: project.tags,
    funding: project.funding
  };
}

/**
 * Transform arrays
 */
export function transformPapers(papers: ResearchPaper[]) {
  return papers.map(transformPaper);
}

export function transformSeminars(seminars: Seminar[]) {
  return seminars.map(transformSeminar);
}

export function transformProjects(projects: Project[]) {
  return projects.map(transformProject);
}

/**
 * Batch transform for unified search
 */
export function transformForSearch(options: {
  papers?: ResearchPaper[];
  seminars?: Seminar[];
  projects?: Project[];
}) {
  return {
    papers: options.papers ? transformPapers(options.papers) : [],
    seminars: options.seminars ? transformSeminars(options.seminars) : [],
    projects: options.projects ? transformProjects(options.projects) : []
  };
}
