import type { Task, Category } from './types';
import { BarChart3, CheckCircle, Clock, TrendingUp, ListChecks } from 'lucide-react';

interface Props {
  tasks: Task[];
  categories: Category[];
  currentMonth: number;
  currentYear: number;
}

export default function SummaryView({ tasks, categories, currentMonth, currentYear }: Props) {
  // Filter tasks for the current month
  const monthTasks = tasks.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const total = monthTasks.length;
  const completed = monthTasks.filter(t => t.progress === 100).length;
  const inProgress = monthTasks.filter(t => t.progress > 0 && t.progress < 100).length;
  const notStarted = monthTasks.filter(t => t.progress === 0).length;
  const avgProgress = total === 0 ? 0 : Math.round(monthTasks.reduce((s, t) => s + t.progress, 0) / total);

  // Group by category
  const catStats = categories.map(cat => {
    const catTasks = monthTasks.filter(t => t.category === cat.name);
    const catTotal = catTasks.length;
    const catCompleted = catTasks.filter(t => t.progress === 100).length;
    const catAvg = catTotal === 0 ? 0 : Math.round(catTasks.reduce((s, t) => s + t.progress, 0) / catTotal);
    return { ...cat, total: catTotal, completed: catCompleted, avg: catAvg };
  }).filter(c => c.total > 0);

  // Incomplete tasks
  const incomplete = monthTasks.filter(t => t.progress < 100).sort((a, b) => b.progress - a.progress);

  const monthNames = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];

  return (
    <div>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <TrendingUp size={20} /> Tổng kết {monthNames[currentMonth]} / {currentYear}
      </h2>

      <div className="summary-grid">
        <div className="stat-card">
          <div className="stat-card-label"><BarChart3 size={16} /> Tổng công việc</div>
          <div className="stat-card-value">{total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label"><CheckCircle size={16} /> Hoàn thành</div>
          <div className="stat-card-value" style={{ color: '#22c55e' }}>{completed}</div>
          <div className="stat-card-sub">{total > 0 ? Math.round(completed / total * 100) : 0}% tổng số</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label"><Clock size={16} /> Đang làm</div>
          <div className="stat-card-value" style={{ color: '#f59e0b' }}>{inProgress}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label"><ListChecks size={16} /> Chưa bắt đầu</div>
          <div className="stat-card-value" style={{ color: '#ef4444' }}>{notStarted}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label"><TrendingUp size={16} /> Tiến độ TB</div>
          <div className="stat-card-value" style={{ color: avgProgress >= 70 ? '#22c55e' : avgProgress >= 40 ? '#f59e0b' : '#ef4444' }}>
            {avgProgress}%
          </div>
          <div className="progress-bar-sm mt-2">
            <div className="progress-bar-sm-fill" style={{ width: `${avgProgress}%`, background: avgProgress >= 70 ? '#22c55e' : avgProgress >= 40 ? '#f59e0b' : '#ef4444' }} />
          </div>
        </div>
      </div>

      {catStats.length > 0 && (
        <div className="summary-section">
          <h3>📊 Thống kê theo hạng mục</h3>
          <table className="summary-table">
            <thead>
              <tr>
                <th>Hạng mục</th>
                <th>Tổng</th>
                <th>Hoàn thành</th>
                <th>TB tiến độ</th>
                <th style={{ minWidth: 120 }}>Tiến độ</th>
              </tr>
            </thead>
            <tbody>
              {catStats.map(c => (
                <tr key={c.id}>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: c.color, display: 'inline-block' }} />
                      {c.name}
                    </span>
                  </td>
                  <td>{c.total}</td>
                  <td>{c.completed} / {c.total}</td>
                  <td>{c.avg}%</td>
                  <td>
                    <div className="progress-bar-sm">
                      <div className="progress-bar-sm-fill" style={{ width: `${c.avg}%`, background: c.color }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {incomplete.length > 0 && (
        <div className="summary-section">
          <h3>📝 Công việc chưa hoàn thành ({incomplete.length})</h3>
          <table className="summary-table">
            <thead>
              <tr>
                <th>Tên công việc</th>
                <th>Hạng mục</th>
                <th>Ngày</th>
                <th>Tiến độ</th>
                <th style={{ minWidth: 100 }}></th>
              </tr>
            </thead>
            <tbody>
              {incomplete.slice(0, 20).map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 500 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.color, display: 'inline-block' }} />
                      {t.title}
                    </span>
                  </td>
                  <td>{t.category}</td>
                  <td>{t.date}</td>
                  <td>{t.progress}%</td>
                  <td>
                    <div className="progress-bar-sm">
                      <div className="progress-bar-sm-fill" style={{ width: `${t.progress}%`, background: t.color }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total === 0 && (
        <div className="empty-state">
          <div className="emoji">📊</div>
          <p>Chưa có dữ liệu trong tháng này</p>
        </div>
      )}
    </div>
  );
}
