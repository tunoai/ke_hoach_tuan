import { useState, useRef } from 'react';
import { Plus, X, Upload, Search, Bell, Trash2 } from 'lucide-react';
import type { IdeaNote } from './types';
import { generateId, fileToBase64, resizeImage } from './utils';

interface Props {
  ideas: IdeaNote[];
  onSave: (ideas: IdeaNote[]) => void;
  onSaveIdea?: (idea: IdeaNote) => void;
  onDeleteIdea?: (id: string) => void;
}

export default function IdeasView({ ideas, onSave, onSaveIdea, onDeleteIdea }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editIdea, setEditIdea] = useState<IdeaNote | null>(null);
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('');

  // Form
  const [image, setImage] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [reminder, setReminder] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const allTags = [...new Set(ideas.flatMap(i => i.tags))];

  const filtered = ideas.filter(i => {
    if (search && !i.title.toLowerCase().includes(search.toLowerCase()) && !i.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterTag && !i.tags.includes(filterTag)) return false;
    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const openNew = () => {
    setEditIdea(null);
    setImage(''); setTitle(''); setDesc(''); setTagsInput(''); setReminder('');
    setShowModal(true);
  };

  const openEdit = (idea: IdeaNote) => {
    setEditIdea(idea);
    setImage(idea.image); setTitle(idea.title); setDesc(idea.description);
    setTagsInput(idea.tags.join(', ')); setReminder(idea.reminder);
    setShowModal(true);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    const resized = await resizeImage(b64);
    setImage(resized);
  };

  const handleSave = () => {
    if (!title.trim() && !image) return;
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const newIdea: IdeaNote = {
      id: editIdea?.id || generateId(),
      image,
      title: title.trim(),
      description: desc,
      tags,
      createdAt: editIdea?.createdAt || new Date().toISOString(),
      reminder,
    };
    if (onSaveIdea) {
      onSaveIdea(newIdea);
    } else {
      if (editIdea) {
        onSave(ideas.map(i => i.id === editIdea.id ? newIdea : i));
      } else {
        onSave([newIdea, ...ideas]);
      }
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (onDeleteIdea) {
      onDeleteIdea(id);
    } else {
      onSave(ideas.filter(i => i.id !== id));
    }
    setShowModal(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          💡 Ý tưởng nhanh
        </h2>
        <button className="btn btn-primary btn-sm" onClick={openNew}><Plus size={16} /> Thêm ý tưởng</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm..." style={{ paddingLeft: 32 }} />
        </div>
        <select value={filterTag} onChange={e => setFilterTag(e.target.value)} style={{ width: 'auto', minWidth: 140 }}>
          <option value="">Tất cả tags</option>
          {allTags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">💡</div>
          <p>Chưa có ý tưởng nào. Hãy bắt đầu ghi lại!</p>
        </div>
      ) : (
        <div className="ideas-grid">
          {filtered.map(idea => (
            <div key={idea.id} className="idea-card" onClick={() => openEdit(idea)}>
              {idea.image ? (
                <img src={idea.image} alt={idea.title} className="idea-card-img" />
              ) : (
                <div className="idea-card-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#f4f5f7' }}>💡</div>
              )}
              <div className="idea-card-body">
                <div className="idea-card-title">{idea.title || 'Không tiêu đề'}</div>
                {idea.description && <div className="idea-card-desc">{idea.description}</div>}
                <div className="idea-card-tags">
                  {idea.tags.map(t => <span key={t} className="idea-tag">{t}</span>)}
                </div>
                <div className="idea-card-footer">
                  <span>{new Date(idea.createdAt).toLocaleDateString('vi-VN')}</span>
                  {idea.reminder && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Bell size={11} /> Nhắc nhở</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editIdea ? 'Chỉnh sửa ý tưởng' : 'Thêm ý tưởng mới'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Ảnh</label>
                {image ? (
                  <div style={{ position: 'relative', marginBottom: 8 }}>
                    <img src={image} alt="preview" style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 8 }} />
                    <button onClick={() => setImage('')} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="upload-zone" onClick={() => fileRef.current?.click()}>
                    <Upload size={28} />
                    <p>Click để chọn ảnh hoặc kéo thả</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Tiêu đề</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Tiêu đề ý tưởng..." autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Ghi chú</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Mô tả chi tiết..." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Tags (cách bởi dấu phẩy)</label>
                  <input type="text" value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="VD: marketing, sáng tạo" />
                </div>
                <div className="form-group">
                  <label className="form-label">Nhắc nhở</label>
                  <input type="datetime-local" value={reminder} onChange={e => setReminder(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {editIdea && <button className="btn btn-danger" onClick={() => handleDelete(editIdea.id)}><Trash2 size={14} /> Xóa</button>}
              <div style={{ flex: 1 }} />
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave}>{editIdea ? 'Lưu' : 'Tạo'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
