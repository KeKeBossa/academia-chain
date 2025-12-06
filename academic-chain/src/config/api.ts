/**
 * API configuration
 * Centralized API endpoints and base URL configuration
 */

export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  TIMEOUT: 10000,
} as const;

export const API_ENDPOINTS = {
  PAPERS: '/api/assets',
  NOTIFICATIONS: '/api/notifications',
  EVENTS: '/api/events',
  PROJECTS: '/api/collaboration',
  SEMINARS: '/api/seminars',
} as const;
