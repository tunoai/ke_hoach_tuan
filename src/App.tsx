import { useState, useEffect, useCallback } from 'react';
import {
  Calendar, BarChart3, Lightbulb, Bell, ChevronLeft, ChevronRight,
  Plus, X, Settings, Filter
} from 'lucide-react';
import type { Task, IdeaNote, Category, Session, TabType } from './types';
import { SESSIONS, TASK_COLORS, DEFAULT_CATEGORIES } from './types';
import {
  loadTasks, saveTasks, loadCategories, saveCategories,
  loadIdeas, saveIdeas, getWeekDates, formatDate, formatDateFull, generateId
} from './utils';
import CalendarView from './CalendarView';
import TaskModal from './TaskModal';
import SummaryView from './SummaryView';
import IdeasView from './IdeasView';
import RemindersView from './RemindersView';
import './index.css';

export default function App() {
  const [tab, setTab] = useState<TabType>('calendar');
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [ideas, setIdeas] = useState<IdeaNote[]>(loadIdeas);
  const [categories, setCategories] = useState<Category[]>(loadCategories);

  // Calendar state
  const [baseDate, setBaseDate] = useState(new Date());
  const weekDates = getWeekDates(baseDate);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [modalDate, setModalDate] = useState(formatDate(new Date()));
  const [modalSession, setModalSession] = useState<Session>('Sáng');

  // Filters
  const [filterCategory, setFilterCategory] = useState('');
  const [filterColor, setFilterColor] = useState('');

  // Category manager
  const [showCatManager, setShowCatManager] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');

  // Notifications
  const [notifications, setNotifications] = useState<{ id: string; title: string }[]>([]);

  // Persist
  useEffect(() => { saveTasks(tasks); }, [tasks]);
  useEffect(() => { saveIdeas(ideas); }, [ideas]);
  useEffect(() => { saveCategories(categories); }, [categories]);

  // Check reminders every 30s
  useEffect(() => {
    const check = () => {
      const now = new Date();
      const active: { id: string; title: string }[] = [];
      tasks.forEach(t => {
        if (t.reminder && t.progress < 100) {
          const dt = new Date(t.reminder);
          if (dt <= now && dt >= new Date(now.getTime() - 60000)) {
            active.push({ id: t.id, title: t.title });
          }
        }
      });
      ideas.forEach(i => {
        if (i.reminder) {
          const dt = new Date(i.reminder);
          if (dt <= now && dt >= new Date(now.getTime() - 60000)) {
            active.push({ id: i.id, title: i.title || 'Ý tưởng' });
          }
        }
      });
      if (active.length > 0) setNotifications(active);
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [tasks, ideas]);

  // Week navigation
  const goWeek = (dir: number) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + dir * 7);
    setBaseDate(d);
  };
  const goToday = () => setBaseDate(new Date());

  // Task CRUD
  const openModal = useCallback((date: string, session: Session, task?: Task) => {
    setModalDate(date);
    setModalSession(session);
    setModalTask(task || null);
    setModalOpen(true);
  }, []);

  const handleSaveTask = (task: Task) => {
    setTasks(prev => {
      const exists = prev.find(t => t.id === task.id);
      if (exists) return prev.map(t => t.id === task.id ? task : t);
      return [...prev, task];
    });
    setModalOpen(false);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setModalOpen(false);
  };

  const handleMoveTask = (taskId: string, newDate: string, newSession: Session) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, date: newDate, session: newSession } : t));
  };

  // Reminder dismiss
  const dismissTaskReminder = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, reminder: '' } : t));
  };
  const dismissIdeaReminder = (ideaId: string) => {
    setIdeas(prev => prev.map(i => i.id === ideaId ? { ...i, reminder: '' } : i));
  };

  // Category management
  const addCategory = () => {
    if (!newCatName.trim()) return;
    setCategories(prev => [...prev, { id: generateId(), name: newCatName.trim(), color: newCatColor }]);
    setNewCatName('');
  };
  const removeCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Count reminders
  const now = new Date();
  const reminderCount = [
    ...tasks.filter(t => t.reminder && t.progress < 100 && new Date(t.reminder) <= now),
    ...ideas.filter(i => i.reminder && new Date(i.reminder) <= now),
  ].length;

  const currentMonth = baseDate.getMonth();
  const currentYear = baseDate.getFullYear();

  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Calendar size={22} />
          Kế Hoạch Tuần
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">Chính</div>
          <button className={`nav-item ${tab === 'calendar' ? 'active' : ''}`} onClick={() => setTab('calendar')}>
            <Calendar size={18} /> Lịch công việc
          </button>
          <button className={`nav-item ${tab === 'summary' ? 'active' : ''}`} onClick={() => setTab('summary')}>
            <BarChart3 size={18} /> Tổng kết tiến độ
          </button>
          <button className={`nav-item ${tab === 'ideas' ? 'active' : ''}`} onClick={() => setTab('ideas')}>
            <Lightbulb size={18} /> Ý tưởng nhanh
            {ideas.length > 0 && <span className="nav-badge" style={{ background: '#8b5cf6' }}>{ideas.length}</span>}
          </button>
          <button className={`nav-item ${tab === 'reminders' ? 'active' : ''}`} onClick={() => setTab('reminders')}>
            <Bell size={18} /> Nhắc nhở
            {reminderCount > 0 && <span className="nav-badge">{reminderCount}</span>}
          </button>

          <div className="sidebar-section" style={{ marginTop: 24 }}>Hạng mục</div>
          {categories.map(cat => (
            <button key={cat.id} className={`nav-item ${filterCategory === cat.name ? 'active' : ''}`}
              onClick={() => { setFilterCategory(filterCategory === cat.name ? '' : cat.name); setTab('calendar'); }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: cat.color, flexShrink: 0 }} />
              {cat.name}
            </button>
          ))}
          <button className="nav-item" onClick={() => setShowCatManager(true)}>
            <Plus size={16} /> Thêm hạng mục
          </button>
        </nav>
      </aside>

      {/* Main */}
      <main className="main-content">
        <header className="main-header">
          {tab === 'calendar' ? (
            <>
              <div className="week-nav">
                <button className="week-nav-btn" onClick={() => goWeek(-1)}><ChevronLeft size={16} /></button>
                <button className="week-nav-btn today-btn" onClick={goToday}>Hôm nay</button>
                <button className="week-nav-btn" onClick={() => goWeek(1)}><ChevronRight size={16} /></button>
                <span className="week-label">
                  {formatDateFull(weekStart)} — {formatDateFull(weekEnd)}
                </span>
              </div>
              <div className="header-actions">
                {(filterCategory || filterColor) && (
                  <button className="btn btn-ghost btn-sm" onClick={() => { setFilterCategory(''); setFilterColor(''); }}>
                    <X size={14} /> Xóa lọc
                  </button>
                )}
                <select value={filterColor} onChange={e => setFilterColor(e.target.value)}
                  style={{ width: 'auto', fontSize: '0.8rem', padding: '6px 10px' }}>
                  <option value="">🎨 Tất cả màu</option>
                  {TASK_COLORS.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
                </select>
              </div>
            </>
          ) : (
            <h2>
              {tab === 'summary' && <><BarChart3 size={18} /> Tổng kết tiến độ</>}
              {tab === 'ideas' && <><Lightbulb size={18} /> Ý tưởng nhanh</>}
              {tab === 'reminders' && <><Bell size={18} /> Nhắc nhở</>}
            </h2>
          )}
        </header>

        <div className="content-area">
          {tab === 'calendar' && (
            <CalendarView
              tasks={tasks}
              dates={weekDates}
              categories={categories}
              filterCategory={filterCategory}
              filterColor={filterColor}
              onOpenModal={openModal}
              onMoveTask={handleMoveTask}
            />
          )}
          {tab === 'summary' && (
            <SummaryView tasks={tasks} categories={categories} currentMonth={currentMonth} currentYear={currentYear} />
          )}
          {tab === 'ideas' && (
            <IdeasView ideas={ideas} onSave={setIdeas} />
          )}
          {tab === 'reminders' && (
            <RemindersView tasks={tasks} ideas={ideas} onDismissTask={dismissTaskReminder} onDismissIdea={dismissIdeaReminder} />
          )}
        </div>
      </main>

      {/* Task Modal */}
      {modalOpen && (
        <TaskModal
          task={modalTask}
          date={modalDate}
          session={modalSession}
          categories={categories}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* Category Manager Modal */}
      {showCatManager && (
        <div className="modal-overlay" onClick={() => setShowCatManager(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Quản lý hạng mục</h3>
              <button className="modal-close" onClick={() => setShowCatManager(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="cat-list">
                {categories.map(cat => (
                  <div key={cat.id} className="cat-item">
                    <span className="cat-color" style={{ background: cat.color }} />
                    <span className="cat-name">{cat.name}</span>
                    <button className="cat-del" onClick={() => removeCategory(cat.id)}><X size={14} /></button>
                  </div>
                ))}
              </div>
              <div className="add-cat-row">
                <input type="color" value={newCatColor} onChange={e => setNewCatColor(e.target.value)}
                  style={{ width: 40, height: 38, padding: 2, cursor: 'pointer' }} />
                <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)}
                  placeholder="Tên hạng mục mới..." onKeyDown={e => e.key === 'Enter' && addCategory()} />
                <button className="btn btn-primary btn-sm" onClick={addCategory}>Thêm</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Popups */}
      {notifications.length > 0 && (
        <div className="notification-popup">
          {notifications.map(n => (
            <div key={n.id} className="notification-toast">
              <span className="bell">🔔</span>
              <div className="n-info">
                <div className="n-title">{n.title}</div>
                <div className="n-time">Đã đến hạn nhắc nhở!</div>
              </div>
              <button className="modal-close" onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
