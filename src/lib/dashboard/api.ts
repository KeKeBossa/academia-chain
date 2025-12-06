import { DaoMembership } from '@prisma/client';

export interface SeminarData {
  id: string;
  name: string;
  university: string;
  department?: string;
  professor: string;
  members: number;
  field: string;
  description: string;
  tags: string[];
  activeProjects: number;
  publications: number;
  openForCollaboration: boolean;
  website?: string;
  email?: string;
  didAddress?: string;
}

export interface FetchSeminarsResponse {
  seminars: SeminarData[];
}

export interface FetchDashboardStatsResponse {
  stats: Array<{
    label: string;
    value: string;
    change: string;
    color: 'blue' | 'purple' | 'green' | 'orange';
  }>;
}

export interface RecentPaper {
  id: string;
  title: string;
  author: string;
  university: string;
  date: string;
  tags: string[];
  likes: number;
  comments: number;
  verified: boolean;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  participants: number;
}

export interface FetchDashboardContentResponse {
  recentPapers: RecentPaper[];
  upcomingEvents: UpcomingEvent[];
}

export interface NotificationData {
  id: string;
  type: 'proposal' | 'project' | 'paper' | 'seminar' | 'comment' | 'achievement' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: {
    proposalId?: string;
    projectName?: string;
    paperTitle?: string;
    userName?: string;
  };
}

export interface FetchNotificationsResponse {
  notifications: NotificationData[];
}

/**
 * Seminars データを取得
 */
export async function fetchSeminars(): Promise<FetchSeminarsResponse> {
  const response = await fetch('/api/seminars');
  if (!response.ok) {
    throw new Error('Failed to fetch seminars');
  }
  return response.json();
}

/**
 * ダッシュボード統計情報を取得
 */
export async function fetchDashboardStats(): Promise<FetchDashboardStatsResponse> {
  const response = await fetch('/api/dashboard/stats');
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }
  return response.json();
}

/**
 * ダッシュボードコンテンツ（最近の論文、イベント）を取得
 */
export async function fetchDashboardContent(): Promise<FetchDashboardContentResponse> {
  const response = await fetch('/api/dashboard/content');
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard content');
  }
  return response.json();
}

/**
 * 通知データを取得
 */
export async function fetchNotifications(): Promise<FetchNotificationsResponse> {
  const response = await fetch('/api/notifications');
  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }
  return response.json();
}
