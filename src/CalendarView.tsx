import { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import type { Task, Category, Session } from './types';
import { SESSIONS, SESSION_ICONS } from './types';
import { formatDateVN, isToday, formatDate } from './utils';

interface Props {
  tasks: Task[];
  dates: Date[];
  categories: Category[];
  filterCategory: string;
  filterColor: string;
  onOpenModal: (date: string, session: Session, task?: Task) => void;
  onMoveTask: (taskId: string, newDate: string, newSession: Session) => void;
}

export default function CalendarView({ tasks, dates, categories, filterCategory, filterColor, onOpenModal, onMoveTask }: Props) {
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [dragOverCell, setDragOverCell] = useState<string | null>(null);
  const [cellHeights, setCellHeights] = useState<Record<string, number>>({});
  const resizeRef = useRef<{ key: string; startY: number; startH: number } | null>(null);

  const filteredTasks = tasks.filter(t => {
    if (filterCategory && t.category !== filterCategory) return false;
    if (filterColor && t.color !== filterColor) return false;
    return true;
  });

  const getTasksForCell = (date: string, session: Session) =>
    filteredTasks.filter(t => t.date === date && t.session === session).sort((a, b) => a.order - b.order);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDragTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
    const el = e.currentTarget as HTMLElement;
    el.classList.add('dragging');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDragTaskId(null);
    setDragOverCell(null);
    (e.currentTarget as HTMLElement).classList.remove('dragging');
  };

  const handleDragOver = (e: React.DragEvent, cellKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCell(cellKey);
  };

  const handleDrop = (e: React.DragEvent, date: string, session: Session) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || dragTaskId;
    if (taskId) onMoveTask(taskId, date, session);
    setDragTaskId(null);
    setDragOverCell(null);
  };

  const handleResizeStart = (e: React.MouseEvent, cellKey: string, currentHeight: number) => {
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = { key: cellKey, startY: e.clientY, startH: currentHeight };
    const onMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return;
      const diff = ev.clientY - resizeRef.current.startY;
      const newH = Math.max(100, resizeRef.current.startH + diff);
      setCellHeights(prev => ({ ...prev, [resizeRef.current!.key]: newH }));
    };
    const onUp = () => {
      resizeRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };


  const getCategoryColor = (catName: string) => categories.find(c => c.name === catName)?.color || '#6b7280';

  return (
    <div className="calendar-grid">
      {/* Header row */}
      <div className="cal-header-corner cal-header"></div>
      {dates.map(d => {
        const today = isToday(d);
        return (
          <div key={d.toISOString()} className={`cal-header ${today ? 'today' : ''}`}>
            <div>{formatDateVN(d).split(' ')[0]}</div>
            <div className="date-num">{d.getDate()}</div>
          </div>
        );
      })}

      {/* Session rows */}
      {SESSIONS.map(session => (
        <>
          {/* Session label */}
          <div key={`label-${session}`} className="session-label">
            <span className="emoji">{SESSION_ICONS[session]}</span>
            <span>{session}</span>
          </div>

          {/* Day cells */}
          {dates.map(d => {
            const dateStr = formatDate(d);
            const cellKey = `${dateStr}-${session}`;
            const cellTasks = getTasksForCell(dateStr, session);
            const today = isToday(d);
            const h = cellHeights[cellKey] || 140;

            return (
              <div
                key={cellKey}
                className={`cal-cell ${today ? 'today' : ''} ${dragOverCell === cellKey ? 'drag-over' : ''}`}
                style={{ minHeight: `${h}px` }}
                onDragOver={e => handleDragOver(e, cellKey)}
                onDragLeave={() => setDragOverCell(null)}
                onDrop={e => handleDrop(e, dateStr, session)}
                onClick={() => { if (cellTasks.length === 0) onOpenModal(dateStr, session); }}
              >
                {cellTasks.map(task => (
                  <div
                    key={task.id}
                    className="task-card"
                    style={{ borderLeftColor: task.color }}
                    draggable
                    onDragStart={e => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    onClick={e => { e.stopPropagation(); onOpenModal(dateStr, session, task); }}
                  >
                    <div className="task-card-header">
                      <div className="task-color-dot" style={{ background: task.color }} />
                      <span className={`task-card-title ${task.completed || task.progress === 100 ? 'done' : ''}`}>
                        {task.title}
                      </span>
                    </div>
                    {task.description && (
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: 4, lineHeight: 1.4, wordBreak: 'break-word' }}>
                        {task.description.length > 60 ? task.description.slice(0, 60) + '...' : task.description}
                      </div>
                    )}
                    <div className="task-card-meta">
                      <span className="task-card-category" style={{
                        color: getCategoryColor(task.category),
                        background: getCategoryColor(task.category) + '18'
                      }}>{task.category}</span>
                      <span>{task.progress}%</span>
                    </div>
                    <div className="task-card-progress">
                      <div className="task-card-progress-fill" style={{
                        width: `${task.progress}%`,
                        background: task.progress === 100 ? '#22c55e' : task.color
                      }} />
                    </div>
                  </div>
                ))}
                <button className="add-task-inline" onClick={e => { e.stopPropagation(); onOpenModal(dateStr, session); }}>
                  <Plus size={14} /> Thêm
                </button>
                {/* Resize handle */}
                <div
                  style={{
                    position: 'absolute', bottom: 0, right: 0, width: '100%', height: 6,
                    cursor: 'row-resize', background: 'transparent'
                  }}
                  onMouseDown={e => handleResizeStart(e, cellKey, h)}
                />
              </div>
            );
          })}
        </>
      ))}

      {/* Phát sinh row */}
      <div className="session-label phatsinh">
        <span className="emoji">{SESSION_ICONS['Phát sinh']}</span>
        <span>Phát sinh</span>
      </div>
      {dates.map(d => {
        const dateStr = formatDate(d);
        const cellKey = `${dateStr}-Phát sinh`;
        const cellTasks = getTasksForCell(dateStr, 'Phát sinh' as Session);
        const today = isToday(d);
        const h = cellHeights[cellKey] || 100;

        return (
          <div
            key={cellKey}
            className={`cal-cell phatsinh ${today ? 'today' : ''} ${dragOverCell === cellKey ? 'drag-over' : ''}`}
            style={{ minHeight: `${h}px` }}
            onDragOver={e => handleDragOver(e, cellKey)}
            onDragLeave={() => setDragOverCell(null)}
            onDrop={e => handleDrop(e, dateStr, 'Phát sinh' as Session)}
            onClick={() => { if (cellTasks.length === 0) onOpenModal(dateStr, 'Phát sinh' as Session); }}
          >
            {cellTasks.map(task => (
              <div
                key={task.id}
                className="task-card"
                style={{ borderLeftColor: task.color }}
                draggable
                onDragStart={e => handleDragStart(e, task.id)}
                onDragEnd={handleDragEnd}
                onClick={e => { e.stopPropagation(); onOpenModal(dateStr, 'Phát sinh' as Session, task); }}
              >
                <div className="task-card-header">
                  <div className="task-color-dot" style={{ background: task.color }} />
                  <span className={`task-card-title ${task.completed || task.progress === 100 ? 'done' : ''}`}>
                    {task.title}
                  </span>
                </div>
                <div className="task-card-meta">
                  <span className="task-card-category" style={{
                    color: '#f59e0b',
                    background: '#f59e0b18'
                  }}>việc phát sinh</span>
                  <span>{task.progress}%</span>
                </div>
              </div>
            ))}
            <button className="add-task-inline" onClick={e => { e.stopPropagation(); onOpenModal(dateStr, 'Phát sinh' as Session); }}>
              <Plus size={14} /> Thêm
            </button>
            <div
              style={{
                position: 'absolute', bottom: 0, right: 0, width: '100%', height: 6,
                cursor: 'row-resize', background: 'transparent'
              }}
              onMouseDown={e => handleResizeStart(e, cellKey, h)}
            />
          </div>
        );
      })}
    </div>
  );
}
