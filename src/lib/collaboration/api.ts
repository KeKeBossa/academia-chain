import type { CollaborationStatus } from '@prisma/client';

export type CollaborationPostInput = {
  daoId: string;
  authorId: string;
  title: string;
  body: string;
  requiredSkills?: string[];
  status?: CollaborationStatus | string;
};

export async function fetchCollaborationPosts(
  params: { daoId?: string; status?: string; q?: string; authorId?: string; skill?: string } = {}
) {
  const searchParams = new URLSearchParams();
  if (params.daoId) searchParams.set('daoId', params.daoId);
  if (params.status) searchParams.set('status', params.status);
  if (params.q) searchParams.set('q', params.q);
  if (params.authorId) searchParams.set('authorId', params.authorId);
  if (params.skill) searchParams.set('skill', params.skill);

  const response = await fetch(
    `/api/collaboration/posts${searchParams.toString() ? `?${searchParams}` : ''}`
  );
  if (!response.ok) {
    throw new Error('Failed to load collaboration posts');
  }
  return response.json() as Promise<{
    posts: Array<{
      id: string;
      title: string;
      body: string;
      requiredSkills: string[];
      status: CollaborationStatus;
      dao: { id: string; name: string };
      author: { id: string; displayName: string | null; walletAddress: string };
      createdAt: string;
      updatedAt: string;
    }>;
  }>;
}

export async function createCollaborationPost(input: CollaborationPostInput) {
  const response = await fetch('/api/collaboration/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? 'Failed to create collaboration post');
  }
  return response.json();
}

export async function updateCollaborationPostStatus(postId: string, status: CollaborationStatus) {
  const response = await fetch(`/api/collaboration/posts/${postId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? 'Failed to update collaboration post');
  }
  return response.json();
}

export async function fetchActivityFeed(params: { daoId?: string; limit?: number } = {}) {
  const searchParams = new URLSearchParams();
  if (params.daoId) searchParams.set('daoId', params.daoId);
  if (params.limit) searchParams.set('limit', params.limit.toString());

  const response = await fetch(`/api/activity${searchParams.toString() ? `?${searchParams}` : ''}`);
  if (!response.ok) {
    throw new Error('Failed to load activity feed');
  }
  return response.json();
}

export async function fetchNotifications(params: { userId: string; unreadOnly?: boolean }) {
  const searchParams = new URLSearchParams({ userId: params.userId });
  if (params.unreadOnly) searchParams.set('unreadOnly', 'true');

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
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? 'Failed to update notifications');
  }
  return response.json();
}
