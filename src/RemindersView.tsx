import { Bell, Check, Clock, AlertTriangle } from 'lucide-react';
import type { Task, IdeaNote } from './types';

interface Props {
  tasks: Task[];
  ideas: IdeaNote[];
  onDismissTask: (taskId: string) => void;
  onDismissIdea: (ideaId: string) => void;
}

interface ReminderItem {
  id: string;
  type: 'task' | 'idea';
  title: string;
  datetime: string;
  isOverdue: boolean;
  refId: string;
}

export default function RemindersView({ tasks, ideas, onDismissTask, onDismissIdea }: Props) {
  const now = new Date();

  const reminders: ReminderItem[] = [];

  tasks.forEach(t => {
    if (t.reminder && t.progress < 100) {
      const dt = new Date(t.reminder);
      reminders.push({
        id: `task-${t.id}`,
        type: 'task',
        title: t.title,
        datetime: t.reminder,
        isOverdue: dt <= now,
        refId: t.id,
      });
    }
  });

  ideas.forEach(i => {
    if (i.reminder) {
      const dt = new Date(i.reminder);
      reminders.push({
        id: `idea-${i.id}`,
        type: 'idea',
        title: i.title || 'Ý tưởng không tiêu đề',
        datetime: i.reminder,
        isOverdue: dt <= now,
        refId: i.id,
      });
    }
  });

  reminders.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

  const overdue = reminders.filter(r => r.isOverdue);
  const upcoming = reminders.filter(r => !r.isOverdue);

  const formatDt = (dt: string) => {
    const d = new Date(dt);
    return d.toLocaleString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const handleDismiss = (r: ReminderItem) => {
    if (r.type === 'task') onDismissTask(r.refId);
    else onDismissIdea(r.refId);
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Bell size={20} /> Nhắc nhở
      </h2>

      {reminders.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">🔔</div>
          <p>Không có nhắc nhở nào</p>
        </div>
      ) : (
        <>
          {overdue.length > 0 && (
            <div className="summary-section">
              <h3><AlertTriangle size={16} style={{ color: '#ef4444' }} /> Quá hạn ({overdue.length})</h3>
              <div className="reminder-list">
                {overdue.map(r => (
                  <div key={r.id} className="reminder-item overdue">
                    <span className="reminder-icon">⚠️</span>
                    <div className="reminder-info">
                      <div className="reminder-title">{r.title}</div>
                      <div className="reminder-time">{r.type === 'task' ? '📋 Task' : '💡 Ý tưởng'} • {formatDt(r.datetime)}</div>
                    </div>
                    <button className="reminder-dismiss" onClick={() => handleDismiss(r)}>
                      <Check size={14} /> Xong
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {upcoming.length > 0 && (
            <div className="summary-section">
              <h3><Clock size={16} style={{ color: '#f59e0b' }} /> Sắp tới ({upcoming.length})</h3>
              <div className="reminder-list">
                {upcoming.map(r => (
                  <div key={r.id} className="reminder-item upcoming">
                    <span className="reminder-icon">🔔</span>
                    <div className="reminder-info">
                      <div className="reminder-title">{r.title}</div>
                      <div className="reminder-time">{r.type === 'task' ? '📋 Task' : '💡 Ý tưởng'} • {formatDt(r.datetime)}</div>
                    </div>
                    <button className="reminder-dismiss" onClick={() => handleDismiss(r)}>
                      Bỏ qua
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
