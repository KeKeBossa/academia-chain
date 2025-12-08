/**
 * Dashboard API
 * ダッシュボード関連のデータ取得API
 */

export async function fetchNotifications(params?: { userId?: string; unreadOnly?: boolean }) {
  const searchParams = new URLSearchParams();
  if (params?.userId) searchParams.set('userId', params.userId);
  if (params?.unreadOnly) searchParams.set('unreadOnly', 'true');

  const response = await fetch(`/api/notifications?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to load notifications');
  }
  return response.json();
}

export async function markNotificationsRead(notificationIds: string[]) {
  const response = await fetch('/api/notifications/read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notificationIds })
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? 'Failed to update notifications');
  }
  return payload;
}

export async function fetchDashboardStats() {
  const response = await fetch('/api/dashboard/stats');
  if (!response.ok) {
    throw new Error('Failed to load dashboard stats');
  }
  return response.json();
}

export async function fetchDashboardContent() {
  const response = await fetch('/api/dashboard/content');
  if (!response.ok) {
    throw new Error('Failed to load dashboard content');
  }
  return response.json();
}

export async function fetchSeminars(params?: { search?: string; limit?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.limit) searchParams.set('limit', String(params.limit));

  const response = await fetch(`/api/seminars?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to load seminars');
  }
  return response.json();
}
