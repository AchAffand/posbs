import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

export type DeliveryNote = Database['public']['Tables']['delivery_notes']['Row'];

export function useDeliveryNotes() {
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeliveryNotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('delivery_notes')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setDeliveryNotes(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDeliveryNotes();
  }, []);

  return { deliveryNotes, loading, refetch: fetchDeliveryNotes };
} 