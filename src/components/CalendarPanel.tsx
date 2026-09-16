import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Calendar as CalendarIcon, X } from 'lucide-react';
import type { CalendarEvent } from '@/types';
import { useCalendarEvents } from '@/hooks/useSupabase';

const CATEGORY_COLORS: Record<string, string> = {
  flight: '#3b82f6',
  meeting: '#f59e0b',
  personal: '#22c55e',
  work: '#a855f7',
  general: '#06b6d4',
};

const WEEKDAYS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export default function CalendarPanel() {
  const { events, loading, addEvent, deleteEvent } = useCalendarEvents();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventCategory, setEventCategory] = useState('general');

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    let startWeekday = firstDay.getDay() - 1;
    if (startWeekday < 0) startWeekday = 6;

    const days: (number | null)[] = [];
    for (let i = 0; i < startWeekday; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [year, month]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((e) => {
      if (!map[e.event_date]) map[e.event_date] = [];
      map[e.event_date].push(e);
    });
    return map;
  }, [events]);

  const todayStr = new Date().toISOString().split('T')[0];

  const formatDateKey = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const handleDayClick = (day: number | null) => {
    if (!day) return;
    const dateKey = formatDateKey(day);
    setSelectedDate(dateKey);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!eventTitle.trim() || !selectedDate) return;
    await addEvent({
      title: eventTitle,
      description: eventDesc || null,
      event_date: selectedDate,
      event_time: eventTime || null,
      category: eventCategory,
    });
    setEventTitle('');
    setEventDesc('');
    setEventTime('');
    setEventCategory('general');
    setShowForm(false);
    setSelectedDate(null);
  };

  const upcomingEvents = events
    .filter((e) => new Date(e.event_date) >= new Date(todayStr))
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .slice(0, 5);

  return (
    <div className="hud-panel rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-mono text-[10px] text-amber-500/60 tracking-widest">CALENDARIO DE VUELO</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="text-neutral-400 hover:text-amber-500 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <span className="font-display text-sm text-amber-500 font-medium">
          {MONTHS_ES[month]} {year}
        </span>
        <button onClick={nextMonth} className="text-neutral-400 hover:text-amber-500 transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS_ES.map((day) => (
          <div key={day} className="text-center font-mono text-[10px] text-neutral-600 py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, i) => {
          if (!day) return <div key={i} className="aspect-square" />;
          const dateKey = formatDateKey(day);
          const dayEvents = eventsByDate[dateKey] ?? [];
          const isToday = dateKey === todayStr;

          return (
            <button
              key={i}
              onClick={() => handleDayClick(day)}
              className={`
                aspect-square rounded-md flex flex-col items-center justify-center relative
                transition-all text-sm font-body
                ${isToday
                  ? 'bg-amber-500/10 border border-amber-500/40 text-amber-500'
                  : dayEvents.length > 0
                    ? 'bg-white/[0.03] border border-white/5 text-neutral-300 hover:border-amber-500/20'
                    : 'text-neutral-500 hover:bg-white/5'
                }
              `}
            >
              <span className={isToday ? 'font-bold' : ''}>{day}</span>
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayEvents.slice(0, 3).map((e) => (
                    <div
                      key={e.id}
                      className="w-1 h-1 rounded-full"
                      style={{ background: CATEGORY_COLORS[e.category] ?? '#06b6d4' }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Upcoming events */}
      <div className="mt-5 pt-4 border-t border-white/5">
        <span className="font-mono text-[10px] text-amber-500/60 tracking-widest mb-3 block">PRÓXIMOS EVENTOS</span>
        {loading ? (
          <div className="flex items-center justify-center h-16">
            <div className="w-6 h-6 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-16 text-neutral-600">
            <CalendarIcon size={24} className="mb-1 opacity-30" />
            <span className="font-body text-xs">Sin eventos próximos</span>
          </div>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {upcomingEvents.map((e) => (
              <div
                key={e.id}
                className="group flex items-center gap-3 p-2 rounded-md bg-white/[0.02] hover:bg-white/5 transition-colors"
              >
                <div
                  className="w-1 h-8 rounded-full flex-shrink-0"
                  style={{ background: CATEGORY_COLORS[e.category] ?? '#06b6d4' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm text-neutral-200 truncate">{e.title}</p>
                  <p className="font-mono text-[10px] text-neutral-500">
                    {new Date(e.event_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    {e.event_time && ` · ${e.event_time}`}
                  </p>
                </div>
                <button
                  onClick={() => deleteEvent(e.id)}
                  className="text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event form modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => { setShowForm(false); setSelectedDate(null); }}
        >
          <div
            className="hud-panel rounded-lg p-6 w-full max-w-md mx-4 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-sm text-amber-500 tracking-wider">NUEVO EVENTO</h3>
              <button
                onClick={() => { setShowForm(false); setSelectedDate(null); }}
                className="text-neutral-500 hover:text-amber-500"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Título del evento..."
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="hud-input w-full"
                autoFocus
              />
              <textarea
                placeholder="Descripción (opcional)..."
                value={eventDesc}
                onChange={(e) => setEventDesc(e.target.value)}
                rows={2}
                className="hud-input w-full resize-none"
              />
              <div className="flex gap-3">
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="hud-input flex-1"
                />
                <select
                  value={eventCategory}
                  onChange={(e) => setEventCategory(e.target.value)}
                  className="hud-input flex-1"
                >
                  <option value="general">General</option>
                  <option value="flight">Vuelo</option>
                  <option value="meeting">Reunión</option>
                  <option value="personal">Personal</option>
                  <option value="work">Trabajo</option>
                </select>
              </div>
              <p className="font-mono text-xs text-neutral-500">
                Fecha: {selectedDate}
              </p>
              <button onClick={handleSubmit} className="hud-btn w-full flex items-center justify-center gap-2">
                <Plus size={16} />
                Agregar Evento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
