import { useState } from 'react';
import { Plus, Trash2, StickyNote, X, Save } from 'lucide-react';
import type { Note } from '@/types';
import { useNotes } from '@/hooks/useSupabase';

const NOTE_COLORS = [
  { id: 'amber', color: '#f59e0b' },
  { id: 'blue', color: '#3b82f6' },
  { id: 'green', color: '#22c55e' },
  { id: 'red', color: '#ef4444' },
  { id: 'purple', color: '#a855f7' },
  { id: 'cyan', color: '#06b6d4' },
];

export default function NotesPanel() {
  const { notes, loading, addNote, updateNote, deleteNote } = useNotes();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('amber');

  const handleSubmit = async () => {
    if (!title.trim()) return;
    if (editingId) {
      await updateNote(editingId, { title, content, color });
    } else {
      await addNote(title, content, color);
    }
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setTitle('');
    setContent('');
    setColor('amber');
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setColor(note.color);
    setShowForm(true);
  };

  const getColor = (id: string) => NOTE_COLORS.find((c) => c.id === id)?.color ?? '#f59e0b';

  return (
    <div className="hud-panel rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-mono text-[10px] text-amber-500/60 tracking-widest">MEMORIA</span>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 transition-all text-xs font-medium"
        >
          <Plus size={14} />
          <span className="font-body">Nueva</span>
        </button>
      </div>

      {showForm && (
        <div className="mb-4 p-4 rounded-lg border border-amber-500/20 bg-amber-500/5 animate-fade-in">
          <input
            type="text"
            placeholder="Título..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="hud-input w-full mb-3"
            autoFocus
          />
          <textarea
            placeholder="Contenido..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="hud-input w-full mb-3 resize-none"
          />
          <div className="flex items-center gap-2 mb-3">
            {NOTE_COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => setColor(c.id)}
                className={`w-6 h-6 rounded-full transition-all ${color === c.id ? 'ring-2 ring-white/30 scale-110' : 'opacity-50 hover:opacity-100'}`}
                style={{ background: c.color }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleSubmit} className="hud-btn flex items-center gap-1.5">
              <Save size={14} />
              {editingId ? 'Actualizar' : 'Guardar'}
            </button>
            <button onClick={resetForm} className="hud-btn flex items-center gap-1.5 opacity-60">
              <X size={14} />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-neutral-600">
          <StickyNote size={32} className="mb-2 opacity-30" />
          <span className="font-body text-sm">Sin notas guardadas</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-1">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => startEdit(note)}
              className="group relative p-4 rounded-lg border border-white/5 hover:border-white/10 bg-white/[0.02] cursor-pointer transition-all"
              style={{ borderLeft: `3px solid ${getColor(note.color)}` }}
            >
              <h4 className="font-body font-semibold text-sm text-neutral-200 mb-1 pr-6">{note.title}</h4>
              <p className="font-body text-xs text-neutral-500 line-clamp-3 whitespace-pre-wrap">{note.content}</p>
              <span className="font-mono text-[10px] text-neutral-600 mt-2 block">
                {new Date(note.updated_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                className="absolute top-2 right-2 text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
