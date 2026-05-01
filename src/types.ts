// ============================================================
// Types & Interfaces for Kế Hoạch Tuần App
// ============================================================

export interface Task {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string YYYY-MM-DD
  session: 'Sáng' | 'Chiều' | 'Tối' | 'Phát sinh';
  category: string;
  color: string;
  progress: number; // 0-100
  progressNote: string;
  reminder: string; // ISO datetime string or empty
  completed: boolean;
  createdAt: string;
  order: number;
}

export interface IdeaNote {
  id: string;
  image: string; // base64 data URL (kept for backward compatibility)
  images?: string[]; // Array of base64 data URLs
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
  reminder: string; // ISO datetime string or empty
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Reminder {
  id: string;
  type: 'task' | 'idea';
  refId: string;
  title: string;
  datetime: string;
  dismissed: boolean;
}

export type TabType = 'calendar' | 'summary' | 'ideas' | 'reminders';

export type Session = 'Sáng' | 'Chiều' | 'Tối' | 'Phát sinh';

export const SESSIONS: Session[] = ['Sáng', 'Chiều', 'Tối'];

export const SESSION_ICONS: Record<Session, string> = {
  'Sáng': '🌅',
  'Chiều': '☀️',
  'Tối': '🌙',
  'Phát sinh': '⚡',
};

export const TASK_COLORS = [
  { value: '#ef4444', label: 'Gấp', emoji: '🔴' },
  { value: '#f59e0b', label: 'Theo dõi', emoji: '🟡' },
  { value: '#22c55e', label: 'Đã ổn', emoji: '🟢' },
  { value: '#8b5cf6', label: 'Ý tưởng', emoji: '🟣' },
  { value: '#3b82f6', label: 'Thường', emoji: '🔵' },
  { value: '#ec4899', label: 'Cá nhân', emoji: '🩷' },
  { value: '#64748b', label: 'Khác', emoji: '⚪' },
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'daily', name: 'Việc hàng ngày', color: '#3b82f6' },
  { id: 'idea', name: 'Ý tưởng', color: '#8b5cf6' },
  { id: 'business', name: 'Việc kinh doanh', color: '#22c55e' },
  { id: 'personal', name: 'Việc cá nhân', color: '#ec4899' },
  { id: 'important', name: 'Việc quan trọng', color: '#ef4444' },
];
