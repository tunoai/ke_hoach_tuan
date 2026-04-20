// ============================================================
// Utility functions
// ============================================================
import type { Task, Category, IdeaNote, Reminder } from './types';
import { DEFAULT_CATEGORIES } from './types';

// ---- LocalStorage Keys ----
const STORAGE_KEYS = {
  tasks: 'kht-tasks',
  categories: 'kht-categories',
  ideas: 'kht-ideas',
  reminders: 'kht-reminders',
  cellHeights: 'kht-cell-heights',
};

// ---- Generic load/save ----
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return fallback;
}

function saveToStorage<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ---- Tasks ----
export function loadTasks(): Task[] {
  return loadFromStorage<Task[]>(STORAGE_KEYS.tasks, []);
}
export function saveTasks(tasks: Task[]) {
  saveToStorage(STORAGE_KEYS.tasks, tasks);
}

// ---- Categories ----
export function loadCategories(): Category[] {
  return loadFromStorage<Category[]>(STORAGE_KEYS.categories, DEFAULT_CATEGORIES);
}
export function saveCategories(cats: Category[]) {
  saveToStorage(STORAGE_KEYS.categories, cats);
}

// ---- Ideas ----
export function loadIdeas(): IdeaNote[] {
  return loadFromStorage<IdeaNote[]>(STORAGE_KEYS.ideas, []);
}
export function saveIdeas(ideas: IdeaNote[]) {
  saveToStorage(STORAGE_KEYS.ideas, ideas);
}

// ---- Reminders ----
export function loadReminders(): Reminder[] {
  return loadFromStorage<Reminder[]>(STORAGE_KEYS.reminders, []);
}
export function saveReminders(reminders: Reminder[]) {
  saveToStorage(STORAGE_KEYS.reminders, reminders);
}

// ---- Cell Heights ----
export function loadCellHeights(): Record<string, number> {
  return loadFromStorage<Record<string, number>>(STORAGE_KEYS.cellHeights, {});
}
export function saveCellHeights(heights: Record<string, number>) {
  saveToStorage(STORAGE_KEYS.cellHeights, heights);
}

// ---- Date helpers ----
export function getWeekDates(baseDate: Date): Date[] {
  const d = new Date(baseDate);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }
  return dates;
}

export function getMonthDates(year: number, month: number): Date[] {
  const dates: Date[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    dates.push(new Date(year, month, i));
  }
  return dates;
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatDateVN(date: Date): string {
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const dayOfWeek = dayNames[date.getDay()];
  return `${dayOfWeek} ${date.getDate()}/${date.getMonth() + 1}`;
}

export function formatDateFull(date: Date): string {
  const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const dayOfWeek = dayNames[date.getDay()];
  return `${dayOfWeek}, ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

export function isToday(date: Date): boolean {
  const now = new Date();
  return date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

// ---- Image helpers ----
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function resizeImage(base64: string, maxWidth = 800): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width;
      let h = img.height;
      if (w > maxWidth) {
        h = (h * maxWidth) / w;
        w = maxWidth;
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = base64;
  });
}
