import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import type { Task, Category, Session } from './types';
import { SESSIONS, TASK_COLORS } from './types';
import { generateId, formatDate } from './utils';

interface Props {
  task: Task | null;
  date: string;
  session: Session;
  categories: Category[];
  onSave: (task: Task) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function TaskModal({ task, date, session, categories, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskDate, setTaskDate] = useState(date);
  const [taskSession, setTaskSession] = useState<Session>(session);
  const [category, setCategory] = useState(categories[0]?.name || '');
  const [color, setColor] = useState(TASK_COLORS[4].value);
  const [progress, setProgress] = useState(0);
  const [progressNote, setProgressNote] = useState('');
  const [reminder, setReminder] = useState('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setTaskDate(task.date);
      setTaskSession(task.session);
      setCategory(task.category);
      setColor(task.color);
      setProgress(task.progress);
      setProgressNote(task.progressNote);
      setReminder(task.reminder);
      setCompleted(task.completed);
    }
  }, [task]);

  const handleSave = () => {
    if (!title.trim()) return;
    const saved: Task = {
      id: task?.id || generateId(),
      title: title.trim(),
      description,
      date: taskDate,
      session: taskSession,
      category,
      color,
      progress,
      progressNote,
      reminder,
      completed: progress === 100 ? true : completed,
      createdAt: task?.createdAt || new Date().toISOString(),
      order: task?.order || Date.now(),
    };
    onSave(saved);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{task ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Tên công việc *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Nhập tên công việc..." autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Mô tả / Ghi chú</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Ghi chú thêm..." />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Ngày</label>
              <input type="date" value={taskDate} onChange={e => setTaskDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Buổi</label>
              <select value={taskSession} onChange={e => setTaskSession(e.target.value as Session)}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Hạng mục</label>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Nhắc nhở</label>
              <input type="datetime-local" value={reminder} onChange={e => setReminder(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Màu nhãn</label>
            <div className="color-picker">
              {TASK_COLORS.map(c => (
                <div key={c.value}
                  className={`color-dot ${color === c.value ? 'selected' : ''}`}
                  style={{ background: c.value }}
                  onClick={() => setColor(c.value)}
                  title={c.label}>
                  {color === c.value && <Check size={14} />}
                </div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Tiến độ: {progress}%</label>
            <input type="range" min="0" max="100" step="5" value={progress}
              onChange={e => setProgress(Number(e.target.value))}
              style={{ padding: 0, border: 'none', background: 'transparent' }} />
            <div className="progress-bar-sm mt-1">
              <div className="progress-bar-sm-fill"
                style={{ width: `${progress}%`, background: progress === 100 ? '#22c55e' : 'var(--accent)' }} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Ghi chú tiến độ</label>
            <input type="text" value={progressNote} onChange={e => setProgressNote(e.target.value)}
              placeholder="VD: Đã xong phần 1..." />
          </div>
        </div>
        <div className="modal-footer">
          {task && (
            <button className="btn btn-danger" onClick={() => { onDelete(task.id); }}>Xóa</button>
          )}
          <div style={{ flex: 1 }} />
          <button className="btn btn-ghost" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={handleSave}>
            {task ? 'Lưu thay đổi' : 'Tạo công việc'}
          </button>
        </div>
      </div>
    </div>
  );
}
