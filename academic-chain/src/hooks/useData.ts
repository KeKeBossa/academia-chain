/**
 * Data fetching hooks for academic-chain
 * Fetches data from backend API endpoints backed by Prisma database
 */

import { useEffect, useState, useMemo } from 'react';
import { apiFetch } from '../utils/api';
import { API_ENDPOINTS } from '../config/api';

// ============================================
// Types (aligned with Prisma schema)
// ============================================

export interface ResearchPaper {
  id: string;
  title: string;
  author: string;
  university: string;
  department?: string;
  date: string;
  abstract: string;
  tags: string[];
  category: string;
  ipfsHash: string;
  txHash: string;
  citations: number;
  downloads: number;
  likes: number;
  comments: number;
  verified: boolean;
  accessType?: 'open' | 'restricted';
}

export interface Notification {
  id: string;
  type: 'proposal' | 'paper' | 'project' | 'comment' | 'seminar' | 'reputation' | 'achievement' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

export interface Event {
  title: string;
  date: string;
  time: string;
  type: 'セミナー' | 'ワークショップ' | 'ネットワーキング' | 'conference';
  participants: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'planning' | 'completed';
  progress: number;
  startDate: string;
  endDate: string;
  universities: string[];
  members: number;
  tasks: { total: number; completed: number };
  papers: number;
  meetings: number;
  tags: string[];
  leader: string;
  funding: string;
}

export interface Seminar {
  id: string;
  name: string;
  university: string;
  professor: string;
  members: number;
  field: string;
  description: string;
  tags: string[];
  website?: string;
  email?: string;
  openForCollaboration: boolean;
}

// ============================================
// Fetch Functions (Simplified)
// ============================================

export async function fetchResearchPapers(
  query?: string,
  filters?: { category?: string; university?: string; dateRange?: string }
): Promise<ResearchPaper[]> {
  const data = await apiFetch<{ assets: ResearchPaper[] }>(API_ENDPOINTS.PAPERS, {
    params: {
      ...(query && { q: query }),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.university && { university: filters.university }),
      ...(filters?.dateRange && { dateRange: filters.dateRange }),
    },
  });
  return data?.assets || [];
}

export async function fetchNotifications(userId: string, unreadOnly = false): Promise<Notification[]> {
  const data = await apiFetch<{ notifications: Notification[] }>(API_ENDPOINTS.NOTIFICATIONS, {
    params: { userId, ...(unreadOnly && { unreadOnly: 'true' }) },
  });
  return data?.notifications || [];
}

export async function fetchUpcomingEvents(): Promise<Event[]> {
  const data = await apiFetch<{ events: Event[] }>(API_ENDPOINTS.EVENTS);
  return data?.events || [];
}

export async function fetchProjects(daoId?: string): Promise<Project[]> {
  const data = await apiFetch<{ collaborations: Project[] }>(API_ENDPOINTS.PROJECTS, {
    params: { ...(daoId && { daoId }) },
  });
  return data?.collaborations || [];
}

export async function fetchSeminars(): Promise<Seminar[]> {
  const data = await apiFetch<{ seminars: Seminar[] }>(API_ENDPOINTS.SEMINARS);
  return data?.seminars || [];
}

// ============================================
// React Hooks
// ============================================

export function usePapers(
  query?: string,
  filters?: { category?: string; university?: string; dateRange?: string }
) {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchResearchPapers(query, filters)
      .then(setPapers)
      .catch((err) => setError((err as Error)?.message || 'Unknown error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return { papers, loading, error };
}

export function useNotifications(userId: string, unreadOnly = false) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchNotifications(userId, unreadOnly)
      .then(setNotifications)
      .catch((err) => setError((err as Error)?.message || 'Unknown error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return { notifications, loading, error };
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchUpcomingEvents()
      .then(setEvents)
      .catch((err) => setError((err as Error)?.message || 'Unknown error'))
      .finally(() => setLoading(false));
  }, []);

  return { events, loading, error };
}

export function useProjects(daoId?: string) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchProjects(daoId)
      .then(setProjects)
      .catch((err) => setError((err as Error)?.message || 'Unknown error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daoId]);

  return { projects, loading, error };
}

export function useSeminars() {
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchSeminars()
      .then(setSeminars)
      .catch((err) => setError((err as Error)?.message || 'Unknown error'))
      .finally(() => setLoading(false));
  }, []);

  return { seminars, loading, error };
}
