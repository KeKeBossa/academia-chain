/**
 * Data fetching hooks for academic-chain
 * Fetches data from backend API endpoints backed by Prisma database
 * Optimized with debouncing, memoization, and caching
 */

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { apiFetch } from '../utils/api';
import { API_ENDPOINTS } from '../config/api';

// ============================================
// Cache Management
// ============================================
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

const queryCache = new Map<string, CacheEntry<any>>();

function getCacheKey(endpoint: string, params?: Record<string, any>): string {
  return `${endpoint}:${JSON.stringify(params || {})}`;
}

function getFromCache<T>(key: string): T | null {
  const entry = queryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) {
    queryCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache<T>(key: string, data: T, ttl = 5 * 60 * 1000): void {
  queryCache.set(key, { data, timestamp: Date.now(), ttl });
}

// ============================================
// Debounce Utility
// ============================================
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

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
// Fetch Functions (Optimized with Cache)
// ============================================

export async function fetchResearchPapers(
  query?: string,
  filters?: { category?: string; university?: string; dateRange?: string }
): Promise<ResearchPaper[]> {
  const cacheKey = getCacheKey(API_ENDPOINTS.PAPERS, { query, ...filters });
  
  // Check cache first
  const cached = getFromCache<ResearchPaper[]>(cacheKey);
  if (cached) return cached;
  
  const data = await apiFetch<{ assets: ResearchPaper[] }>(API_ENDPOINTS.PAPERS, {
    params: {
      ...(query && { q: query }),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.university && { university: filters.university }),
      ...(filters?.dateRange && { dateRange: filters.dateRange }),
    },
  });
  
  const result = data?.assets || [];
  setCache(cacheKey, result);
  return result;
}

export async function fetchNotifications(userId: string, unreadOnly = false): Promise<Notification[]> {
  const cacheKey = getCacheKey(API_ENDPOINTS.NOTIFICATIONS, { userId, unreadOnly });
  
  const cached = getFromCache<Notification[]>(cacheKey);
  if (cached) return cached;
  
  const data = await apiFetch<{ notifications: Notification[] }>(API_ENDPOINTS.NOTIFICATIONS, {
    params: { userId, ...(unreadOnly && { unreadOnly: 'true' }) },
  });
  
  const result = data?.notifications || [];
  setCache(cacheKey, result);
  return result;
}

export async function fetchUpcomingEvents(): Promise<Event[]> {
  const cacheKey = getCacheKey(API_ENDPOINTS.EVENTS);
  
  const cached = getFromCache<Event[]>(cacheKey);
  if (cached) return cached;
  
  const data = await apiFetch<{ events: Event[] }>(API_ENDPOINTS.EVENTS);
  
  const result = data?.events || [];
  setCache(cacheKey, result);
  return result;
}

export async function fetchProjects(daoId?: string): Promise<Project[]> {
  const cacheKey = getCacheKey(API_ENDPOINTS.PROJECTS, { daoId });
  
  const cached = getFromCache<Project[]>(cacheKey);
  if (cached) return cached;
  
  const data = await apiFetch<{ collaborations: Project[] }>(API_ENDPOINTS.PROJECTS, {
    params: { ...(daoId && { daoId }) },
  });
  
  const result = data?.collaborations || [];
  setCache(cacheKey, result);
  return result;
}

export async function fetchSeminars(): Promise<Seminar[]> {
  const cacheKey = getCacheKey(API_ENDPOINTS.SEMINARS);
  
  const cached = getFromCache<Seminar[]>(cacheKey);
  if (cached) return cached;
  
  const data = await apiFetch<{ seminars: Seminar[] }>(API_ENDPOINTS.SEMINARS);
  
  const result = data?.seminars || [];
  setCache(cacheKey, result);
  return result;
}

// ============================================
// React Hooks (Optimized with Debounce)
// ============================================

export function usePapers(
  query?: string,
  filters?: { category?: string; university?: string; dateRange?: string }
) {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Debounce search query (300ms delay)
  const debouncedQuery = useDebounce(query, 300);
  const debouncedFilters = useDebounce(filters, 300);

  useEffect(() => {
    setLoading(true);
    fetchResearchPapers(debouncedQuery, debouncedFilters)
      .then(setPapers)
      .catch((err) => setError((err as Error)?.message || 'Unknown error'))
      .finally(() => setLoading(false));
  }, [debouncedQuery, debouncedFilters]);

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
  }, [userId, unreadOnly]);

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
