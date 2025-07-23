import { useState, useEffect } from 'react';
import { DeliveryNote, DeliveryStats } from '../types';
import { 
  getDeliveryNotesFromSupabase, 
  addDeliveryNoteToSupabase, 
  updateDeliveryNoteInSupabase, 
  deleteDeliveryNoteFromSupabase 
} from '../utils/supabaseStorage';
import { shouldAutoUpdateStatus } from '../utils/format';

export const useDeliveryNotes = () => {
  const [notes, setNotes] = useState<DeliveryNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const autoUpdateStatuses = (notes: DeliveryNote[]): DeliveryNote[] => {
    return notes.map(note => {
      if (note.status === 'menunggu' && shouldAutoUpdateStatus(note.date)) {
        return {
          ...note,
          status: 'dalam-perjalanan' as const,
          updatedAt: new Date().toISOString(),
        };
      }
      return note;
    });
  };

  const loadNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedNotes = await getDeliveryNotesFromSupabase();
      const updatedNotes = autoUpdateStatuses(loadedNotes);
      
      // Update status in database if any status was auto-updated
      for (const note of updatedNotes) {
        const original = loadedNotes.find(n => n.id === note.id);
        if (original && original.status !== note.status) {
          await updateDeliveryNoteInSupabase(note.id, { status: note.status });
        }
      }
      
      setNotes(updatedNotes);
    } catch (err) {
      console.error('Error loading notes:', err);
      setError('Gagal memuat data surat jalan. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
    
    // Check for status updates every minute
    const interval = setInterval(async () => {
      try {
        const currentNotes = await getDeliveryNotesFromSupabase();
        const updatedNotes = autoUpdateStatuses(currentNotes);
        
        if (JSON.stringify(currentNotes) !== JSON.stringify(updatedNotes)) {
          setNotes(updatedNotes);
          for (const note of updatedNotes) {
            const original = currentNotes.find(n => n.id === note.id);
            if (original && original.status !== note.status) {
              await updateDeliveryNoteInSupabase(note.id, { status: note.status });
            }
          }
        }
      } catch (err) {
        console.error('Error in auto-update:', err);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const createNote = async (noteData: Omit<DeliveryNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      // Auto-set status based on delivery date
      let status = noteData.status;
      if (status === 'menunggu' && shouldAutoUpdateStatus(noteData.date)) {
        status = 'dalam-perjalanan';
      }
      
      const newNote = await addDeliveryNoteToSupabase({ ...noteData, status });
      setNotes(prev => [newNote, ...prev]);
      return newNote;
    } catch (err) {
      console.error('Error creating note:', err);
      setError('Gagal menyimpan surat jalan. Periksa koneksi internet Anda.');
      throw err;
    }
  };

  const updateNote = async (id: string, updates: Partial<DeliveryNote>) => {
    try {
      setError(null);
      const updatedNote = await updateDeliveryNoteInSupabase(id, updates);
      if (updatedNote) {
        setNotes(prev => prev.map(note => note.id === id ? updatedNote : note));
      }
      return updatedNote;
    } catch (err) {
      console.error('Error updating note:', err);
      setError('Gagal memperbarui surat jalan. Periksa koneksi internet Anda.');
      throw err;
    }
  };

  const removeNote = async (id: string) => {
    try {
      setError(null);
      const success = await deleteDeliveryNoteFromSupabase(id);
      if (success) {
        setNotes(prev => prev.filter(note => note.id !== id));
      }
      return success;
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Gagal menghapus surat jalan. Periksa koneksi internet Anda.');
      throw err;
    }
  };

  const getStats = (): DeliveryStats => {
    return {
      total: notes.length,
      menunggu: notes.filter(note => note.status === 'menunggu').length,
      dalamPerjalanan: notes.filter(note => note.status === 'dalam-perjalanan').length,
      selesai: notes.filter(note => note.status === 'selesai').length,
      totalWeight: notes.reduce((sum, note) => sum + (note.netWeight || 0), 0),
    };
  };

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    removeNote,
    getStats,
    refreshNotes: loadNotes,
  };
};