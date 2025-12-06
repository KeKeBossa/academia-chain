/**
 * Data fetching hooks for academic-chain
 * Fetches data from backend API endpoints backed by Prisma database
 */

import { useEffect, useState, useMemo } from 'react';

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
// API Base URL
// ============================================

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// ============================================
// Fetch Functions
// ============================================

export async function fetchResearchPapers(
  query?: string,
  filters?: { category?: string; university?: string; dateRange?: string }
): Promise<ResearchPaper[]> {
  try {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.university) params.append('university', filters.university);
    if (filters?.dateRange) params.append('dateRange', filters.dateRange);

    const response = await fetch(`${API_BASE}/api/assets?${params}`);
    if (!response.ok) throw new Error('Failed to fetch papers');

    const data = await response.json();
    return data.assets || [];
  } catch (error) {
    console.error('Error fetching papers:', error);
    return [];
  }
}

export async function fetchNotifications(userId: string, unreadOnly = false): Promise<Notification[]> {
  try {
    const params = new URLSearchParams({ userId });
    if (unreadOnly) params.append('unreadOnly', 'true');

    const response = await fetch(`${API_BASE}/api/notifications?${params}`);
    if (!response.ok) throw new Error('Failed to fetch notifications');

    const data = await response.json();
    return data.notifications || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export async function fetchUpcomingEvents(): Promise<Event[]> {
  try {
    const response = await fetch(`${API_BASE}/api/events`);
    if (!response.ok) throw new Error('Failed to fetch events');

    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

export async function fetchProjects(daoId?: string): Promise<Project[]> {
  try {
    const params = new URLSearchParams();
    if (daoId) params.append('daoId', daoId);

    const response = await fetch(`${API_BASE}/api/collaboration?${params}`);
    if (!response.ok) throw new Error('Failed to fetch projects');

    const data = await response.json();
    return data.collaborations || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export async function fetchSeminars(): Promise<Seminar[]> {
  try {
    const response = await fetch(`${API_BASE}/api/seminars`);
    if (!response.ok) throw new Error('Failed to fetch seminars');

    const data = await response.json();
    return data.seminars || [];
  } catch (error) {
    console.error('Error fetching seminars:', error);
    return [];
  }
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
