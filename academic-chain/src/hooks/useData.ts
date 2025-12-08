/**
 * Data fetching hooks for academic-chain
 * Fetches data from backend API endpoints backed by Prisma database
 * Optimized with debouncing, memoization, and caching
 * Uses localStorage as fallback for development
 */

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { apiFetch } from '../utils/api';
import { API_ENDPOINTS } from '../config/api';

// ============================================
// Local Storage Keys
// ============================================
const STORAGE_KEYS = {
  papers: 'academic-chain:papers',
  notifications: 'academic-chain:notifications',
  seminars: 'academic-chain:seminars',
  projects: 'academic-chain:projects',
  userLikes: 'academic-chain:userLikes',
  comments: 'academic-chain:comments',
};

// ============================================
// Local Storage Utilities
// ============================================
function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Failed to parse localStorage key "${key}":`, error);
    return defaultValue;
  }
}

function setToLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to set localStorage key "${key}":`, error);
  }
}

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
  pdfUrl?: string; // PDF ファイルの URL または Base64
  isDeleted?: boolean; // UI上で削除したかどうか
  userLikes?: string[]; // ユーザーがいいねした論文のID配列
}

export interface Comment {
  id: string;
  paperId: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
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
  // API が存在しないため、一時的に空配列を返す
  // TODO: バックエンドの /api/assets エンドポイント実装後に復活させる
  return [];
}

export async function fetchNotifications(userId: string, unreadOnly = false): Promise<Notification[]> {
  // API が存在しないため、一時的に空配列を返す
  // TODO: バックエンドの /api/notifications エンドポイント実装後に復活させる
  return [];
}

export async function fetchUpcomingEvents(): Promise<Event[]> {
  // API が存在しないため、一時的に空配列を返す
  // TODO: バックエンドの /api/events エンドポイント実装後に復活させる
  return [];
}

export async function fetchProjects(daoId?: string): Promise<Project[]> {
  // API が存在しないため、一時的に空配列を返す
  // TODO: バックエンドの /api/collaboration エンドポイント実装後に復活させる
  return [];
}

export async function fetchSeminars(): Promise<Seminar[]> {
  // API が存在しないため、一時的に空配列を返す
  // TODO: バックエンドの /api/seminars エンドポイント実装後に復活させる
  return [];
}

// ============================================
// React Hooks (Optimized with Debounce)
// ============================================

export function usePapers(
  query?: string,
  filters?: { category?: string; university?: string; dateRange?: string },
  refreshTrigger: number = 0
) {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Debounce search query (300ms delay)
  const debouncedQuery = useDebounce(query, 300);
  const debouncedFilters = useDebounce(filters, 300);

  useEffect(() => {
    setLoading(true);
    
    // Load from localStorage first (development fallback)
    const storedPapers = getFromLocalStorage<ResearchPaper[]>(STORAGE_KEYS.papers, []);
    
    // Filter out deleted papers
    let filtered = storedPapers.filter(paper => !paper.isDeleted);
    
    if (debouncedQuery?.trim()) {
      const query = debouncedQuery.toLowerCase();
      filtered = filtered.filter(paper => 
        paper.title.toLowerCase().includes(query) ||
        paper.abstract.toLowerCase().includes(query) ||
        paper.author.toLowerCase().includes(query) ||
        paper.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    if (debouncedFilters?.category) {
      filtered = filtered.filter(p => p.category === debouncedFilters.category);
    }
    
    if (debouncedFilters?.university) {
      filtered = filtered.filter(p => p.university === debouncedFilters.university);
    }
    
    setPapers(filtered);
    setLoading(false);
  }, [debouncedQuery, debouncedFilters, refreshTrigger]);

  return { papers, loading, error };
}

// ============================================
// Paper Management (for publishing)
// ============================================

// 論文をローカルストレージに保存
export function savePaperToStorage(
  newPaper: Omit<ResearchPaper, 'id' | 'citations' | 'downloads' | 'likes' | 'comments' | 'verified'>,
  pdfFile?: File
): ResearchPaper {
  // PDF ファイルを Base64 にエンコード
  let pdfUrl: string | undefined;
  
  const paper: ResearchPaper = {
    ...newPaper,
    id: 'paper_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    citations: 0,
    downloads: 0,
    likes: 0,
    comments: 0,
    verified: false,
    pdfUrl,
  };
  
  // 既存の論文を取得
  const storedPapers = getFromLocalStorage<ResearchPaper[]>(STORAGE_KEYS.papers, []);
  
  // PDF ファイルを読み込んで Base64 に変換
  if (pdfFile) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      paper.pdfUrl = base64String;
      
      // 新しい論文を追加（最新が最初）
      const updatedPapers = [paper, ...storedPapers];
      
      // ストレージに保存
      setToLocalStorage(STORAGE_KEYS.papers, updatedPapers);
    };
    reader.readAsDataURL(pdfFile);
  } else {
    // 新しい論文を追加（最新が最初）
    const updatedPapers = [paper, ...storedPapers];
    
    // ストレージに保存
    setToLocalStorage(STORAGE_KEYS.papers, updatedPapers);
  }
  
  return paper;
}

// 論文をローカルストレージから取得
export function getPapersFromStorage(): ResearchPaper[] {
  return getFromLocalStorage<ResearchPaper[]>(STORAGE_KEYS.papers, []);
}

export function usePaperManagement() {
  const [papers, setPapers] = useState<ResearchPaper[]>(() => 
    getFromLocalStorage<ResearchPaper[]>(STORAGE_KEYS.papers, [])
  );

  const addPaper = useCallback((newPaper: Omit<ResearchPaper, 'id' | 'citations' | 'downloads' | 'likes' | 'comments' | 'verified'>) => {
    const paper = savePaperToStorage(newPaper);
    setPapers(prev => [paper, ...prev]);
    return paper;
  }, []);

  return { papers, addPaper };
}

export function useNotifications(userId: string, unreadOnly = false) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchNotifications(userId, unreadOnly)
      .then(setNotifications)
      .catch((err) => {
        console.warn('Error in useNotifications:', err);
        setNotifications([]);
        setError((err as Error)?.message || 'Unknown error');
      })
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

// ============================================
// Paper Deletion (UI only)
// ============================================

export function deletePaperFromStorage(paperId: string): void {
  const storedPapers = getFromLocalStorage<ResearchPaper[]>(STORAGE_KEYS.papers, []);
  const updatedPapers = storedPapers.map(paper =>
    paper.id === paperId ? { ...paper, isDeleted: true } : paper
  );
  setToLocalStorage(STORAGE_KEYS.papers, updatedPapers);
}

// ============================================
// Like Management
// ============================================

export function togglePaperLike(paperId: string): ResearchPaper | null {
  const storedPapers = getFromLocalStorage<ResearchPaper[]>(STORAGE_KEYS.papers, []);
  const userLikes = getFromLocalStorage<string[]>(STORAGE_KEYS.userLikes, []);
  
  const updatedPapers = storedPapers.map(paper => {
    if (paper.id === paperId) {
      const isLiked = userLikes.includes(paperId);
      const newLikes = isLiked ? paper.likes - 1 : paper.likes + 1;
      const newUserLikes = isLiked 
        ? userLikes.filter(id => id !== paperId)
        : [...userLikes, paperId];
      
      setToLocalStorage(STORAGE_KEYS.userLikes, newUserLikes);
      
      return { ...paper, likes: newLikes };
    }
    return paper;
  });
  
  setToLocalStorage(STORAGE_KEYS.papers, updatedPapers);
  
  return updatedPapers.find(p => p.id === paperId) || null;
}

// ============================================
// Comment Management
// ============================================

export function getCommentsForPaper(paperId: string): Comment[] {
  const allComments = getFromLocalStorage<Comment[]>(STORAGE_KEYS.comments, []);
  return allComments.filter(c => c.paperId === paperId);
}

export function addCommentToPaper(paperId: string, author: string, content: string): Comment {
  const allComments = getFromLocalStorage<Comment[]>(STORAGE_KEYS.comments, []);
  const storedPapers = getFromLocalStorage<ResearchPaper[]>(STORAGE_KEYS.papers, []);
  
  const newComment: Comment = {
    id: 'comment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    paperId,
    author,
    content,
    timestamp: new Date().toISOString(),
    likes: 0,
  };
  
  // コメント配列に追加
  const updatedComments = [newComment, ...allComments];
  setToLocalStorage(STORAGE_KEYS.comments, updatedComments);
  
  // 論文のコメント数をインクリメント
  const updatedPapers = storedPapers.map(paper =>
    paper.id === paperId ? { ...paper, comments: paper.comments + 1 } : paper
  );
  setToLocalStorage(STORAGE_KEYS.papers, updatedPapers);
  
  return newComment;
}

export function deleteComment(commentId: string, paperId: string): void {
  const allComments = getFromLocalStorage<Comment[]>(STORAGE_KEYS.comments, []);
  const storedPapers = getFromLocalStorage<ResearchPaper[]>(STORAGE_KEYS.papers, []);
  
  // コメント削除
  const updatedComments = allComments.filter(c => c.id !== commentId);
  setToLocalStorage(STORAGE_KEYS.comments, updatedComments);
  
  // 論文のコメント数をデクリメント
  const updatedPapers = storedPapers.map(paper =>
    paper.id === paperId ? { ...paper, comments: Math.max(0, paper.comments - 1) } : paper
  );
  setToLocalStorage(STORAGE_KEYS.papers, updatedPapers);
}

// ============================================
// Reputation Calculation
// ============================================

/**
 * レピュテーション獲得方法（数値設定）
 * - 論文公開: 1件 = 100点
 * - いいね獲得: 1件 = 5点
 * - コメント獲得: 1件 = 10点
 * - セミナー開催: 1件 = 50点
 * - プロジェクト参加: 1件 = 30点
 */
const REPUTATION_CONFIG = {
  paperPublished: 100,      // 論文1件公開ごと
  likeReceived: 5,          // 論文にいいね1件ごと
  commentReceived: 10,      // 論文へコメント1件ごと
  seminarHosted: 50,        // セミナー1件開催ごと
  projectParticipation: 30, // プロジェクト参加1件ごと
};

export function calculateReputation(): number {
  const papers = getFromLocalStorage<ResearchPaper[]>(STORAGE_KEYS.papers, []);
  const seminars = getFromLocalStorage<any[]>(STORAGE_KEYS.seminars, []);
  const projects = getFromLocalStorage<any[]>(STORAGE_KEYS.projects, []);
  
  // 削除されていない論文のみを対象
  const activePapers = papers.filter(p => !p.isDeleted);
  
  // 論文公開スコア
  const paperScore = activePapers.length * REPUTATION_CONFIG.paperPublished;
  
  // いいけスコア（全ての論文の総いいね数）
  const likeScore = activePapers.reduce((sum, p) => sum + (p.likes || 0), 0) * REPUTATION_CONFIG.likeReceived;
  
  // コメントスコア（全ての論文の総コメント数）
  const commentScore = activePapers.reduce((sum, p) => sum + (p.comments || 0), 0) * REPUTATION_CONFIG.commentReceived;
  
  // セミナー開催スコア
  const seminarScore = (seminars.length || 0) * REPUTATION_CONFIG.seminarHosted;
  
  // プロジェクト参加スコア
  const projectScore = (projects.length || 0) * REPUTATION_CONFIG.projectParticipation;
  
  const totalReputation = paperScore + likeScore + commentScore + seminarScore + projectScore;
  
  // 最大値は10,000点
  return Math.min(totalReputation, 10000);
}

export function getReputationBreakdown(): {
  paperScore: number;
  likeScore: number;
  commentScore: number;
  seminarScore: number;
  projectScore: number;
  total: number;
} {
  const papers = getFromLocalStorage<ResearchPaper[]>(STORAGE_KEYS.papers, []);
  const seminars = getFromLocalStorage<any[]>(STORAGE_KEYS.seminars, []);
  const projects = getFromLocalStorage<any[]>(STORAGE_KEYS.projects, []);
  
  const activePapers = papers.filter(p => !p.isDeleted);
  
  const paperScore = activePapers.length * REPUTATION_CONFIG.paperPublished;
  const likeScore = activePapers.reduce((sum, p) => sum + (p.likes || 0), 0) * REPUTATION_CONFIG.likeReceived;
  const commentScore = activePapers.reduce((sum, p) => sum + (p.comments || 0), 0) * REPUTATION_CONFIG.commentReceived;
  const seminarScore = (seminars.length || 0) * REPUTATION_CONFIG.seminarHosted;
  const projectScore = (projects.length || 0) * REPUTATION_CONFIG.projectParticipation;
  
  const total = Math.min(paperScore + likeScore + commentScore + seminarScore + projectScore, 10000);
  
  return {
    paperScore,
    likeScore,
    commentScore,
    seminarScore,
    projectScore,
    total,
  };
}

// ============================================
// DAO Voting Power Calculation
// ============================================

/**
 * DAO投票権獲得方法（数値設定）
 * - 論文公開: 1件 = 10トークン
 * - いいね獲得: 累計 = 0.1トークン/いいね
 * - コメント獲得: 累計 = 0.2トークン/コメント
 * - セミナー開催: 1件 = 25トークン
 * - プロジェクト参加: 1件 = 15トークン
 */
const VOTING_POWER_CONFIG = {
  paperPublished: 10,       // 論文1件 = 10トークン
  likeReceived: 0.1,        // いいね1件 = 0.1トークン
  commentReceived: 0.2,     // コメント1件 = 0.2トークン
  seminarHosted: 25,        // セミナー1件 = 25トークン
  projectParticipation: 15, // プロジェクト参加1件 = 15トークン
};

export function calculateVotingPower(): number {
  const papers = getFromLocalStorage<ResearchPaper[]>(STORAGE_KEYS.papers, []);
  const seminars = getFromLocalStorage<any[]>(STORAGE_KEYS.seminars, []);
  const projects = getFromLocalStorage<any[]>(STORAGE_KEYS.projects, []);
  
  // 削除されていない論文のみを対象
  const activePapers = papers.filter(p => !p.isDeleted);
  
  // 論文スコア
  const paperTokens = activePapers.length * VOTING_POWER_CONFIG.paperPublished;
  
  // いいけスコア（全ての論文の総いいね数）
  const likeTokens = activePapers.reduce((sum, p) => sum + (p.likes || 0), 0) * VOTING_POWER_CONFIG.likeReceived;
  
  // コメントスコア（全ての論文の総コメント数）
  const commentTokens = activePapers.reduce((sum, p) => sum + (p.comments || 0), 0) * VOTING_POWER_CONFIG.commentReceived;
  
  // セミナースコア
  const seminarTokens = (seminars.length || 0) * VOTING_POWER_CONFIG.seminarHosted;
  
  // プロジェクトスコア
  const projectTokens = (projects.length || 0) * VOTING_POWER_CONFIG.projectParticipation;
  
  const totalVotingPower = paperTokens + likeTokens + commentTokens + seminarTokens + projectTokens;
  
  // 最大値は5,000トークン（小数点第一位まで）
  const rounded = Math.round(Math.min(totalVotingPower, 5000) * 10) / 10;
  return rounded;
}

export function getVotingPowerBreakdown(): {
  paperTokens: number;
  likeTokens: number;
  commentTokens: number;
  seminarTokens: number;
  projectTokens: number;
  total: number;
} {
  const papers = getFromLocalStorage<ResearchPaper[]>(STORAGE_KEYS.papers, []);
  const seminars = getFromLocalStorage<any[]>(STORAGE_KEYS.seminars, []);
  const projects = getFromLocalStorage<any[]>(STORAGE_KEYS.projects, []);
  
  const activePapers = papers.filter(p => !p.isDeleted);
  
  const paperTokens = activePapers.length * VOTING_POWER_CONFIG.paperPublished;
  const likeTokens = activePapers.reduce((sum, p) => sum + (p.likes || 0), 0) * VOTING_POWER_CONFIG.likeReceived;
  const commentTokens = activePapers.reduce((sum, p) => sum + (p.comments || 0), 0) * VOTING_POWER_CONFIG.commentReceived;
  const seminarTokens = (seminars.length || 0) * VOTING_POWER_CONFIG.seminarHosted;
  const projectTokens = (projects.length || 0) * VOTING_POWER_CONFIG.projectParticipation;
  
  // 小数点第一位までに丸める
  const total = Math.round(Math.min(paperTokens + likeTokens + commentTokens + seminarTokens + projectTokens, 5000) * 10) / 10;
  
  return {
    paperTokens: Math.round(paperTokens * 10) / 10,
    likeTokens: Math.round(likeTokens * 10) / 10,
    commentTokens: Math.round(commentTokens * 10) / 10,
    seminarTokens: Math.round(seminarTokens * 10) / 10,
    projectTokens: Math.round(projectTokens * 10) / 10,
    total,
  };
}
