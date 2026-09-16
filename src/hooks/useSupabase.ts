import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Note, CalendarEvent, AppSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/types';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) {
      console.error('Error fetching notes:', error.message);
      setNotes([]);
    } else {
      setNotes(data as Note[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = useCallback(async (title: string, content: string, color: string) => {
    const { data, error } = await supabase
      .from('notes')
      .insert({ title, content, color })
      .select()
      .single();
    if (error) {
      console.error('Error adding note:', error.message);
      return null;
    }
    setNotes((prev) => [data as Note, ...prev]);
    return data as Note;
  }, []);

  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    const { data, error } = await supabase
      .from('notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating note:', error.message);
      return null;
    }
    setNotes((prev) => prev.map((n) => (n.id === id ? (data as Note) : n)));
    return data as Note;
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) {
      console.error('Error deleting note:', error.message);
      return false;
    }
    setNotes((prev) => prev.filter((n) => n.id !== id));
    return true;
  }, []);

  return { notes, loading, addNote, updateNote, deleteNote, refetch: fetchNotes };
}

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('event_date', { ascending: true });
    if (error) {
      console.error('Error fetching events:', error.message);
      setEvents([]);
    } else {
      setEvents(data as CalendarEvent[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const addEvent = useCallback(async (event: Omit<CalendarEvent, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert(event)
      .select()
      .single();
    if (error) {
      console.error('Error adding event:', error.message);
      return null;
    }
    setEvents((prev) => [...prev, data as CalendarEvent].sort(
      (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
    ));
    return data as CalendarEvent;
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    const { error } = await supabase.from('calendar_events').delete().eq('id', id);
    if (error) {
      console.error('Error deleting event:', error.message);
      return false;
    }
    setEvents((prev) => prev.filter((e) => e.id !== id));
    return true;
  }, []);

  return { events, loading, addEvent, deleteEvent, refetch: fetchEvents };
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    const { data, error } = await supabase.from('app_settings').select('*');
    if (error) {
      console.error('Error fetching settings:', error.message);
      setSettings(DEFAULT_SETTINGS);
    } else if (data && data.length > 0) {
      const settingsMap: Record<string, unknown> = {};
      data.forEach((row: { key: string; value: unknown }) => {
        settingsMap[row.key] = row.value;
      });
      setSettings({ ...DEFAULT_SETTINGS, ...settingsMap } as unknown as AppSettings);
    } else {
      setSettings(DEFAULT_SETTINGS);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = useCallback(async (key: string, value: unknown) => {
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key, value: value as string }, { onConflict: 'key' });
    if (error) {
      console.error('Error updating setting:', error.message);
      return false;
    }
    setSettings((prev) => ({ ...prev, [key]: value }));
    return true;
  }, []);

  return { settings, loading, updateSetting, refetch: fetchSettings };
}
