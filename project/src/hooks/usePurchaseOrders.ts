import { useState, useEffect } from 'react'
import { supabase } from '../features/po/lib/supabase'
import { PurchaseOrder } from '../lib/database.types'
import toast from 'react-hot-toast'

export function usePurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPurchaseOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPurchaseOrders(data || [])
    } catch (error) {
      console.error('Error fetching purchase orders:', error)
      toast.error('Gagal memuat data PO')
    } finally {
      setLoading(false)
    }
  }

  const createPurchaseOrder = async (po: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at' | 'shipped_tonnage' | 'remaining_tonnage' | 'status'>) => {
    try {
      const newPO = {
        ...po,
        status: 'Aktif' as const,
        shipped_tonnage: 0,
        remaining_tonnage: po.total_tonnage,
        total_value: po.total_tonnage * po.price_per_ton
      }

      const { data, error } = await supabase
        .from('purchase_orders')
        .insert([newPO])
        .select()
        .single()

      if (error) throw error
      
      setPurchaseOrders(prev => [data, ...prev])
      toast.success('PO berhasil ditambahkan')
      return data
    } catch (error) {
      console.error('Error creating purchase order:', error)
      toast.error('Gagal menambahkan PO')
      throw error
    }
  }

  const updatePurchaseOrderTonnage = async (poId: string, shippedTonnage: number) => {
    try {
      const po = purchaseOrders.find(p => p.id === poId)
      if (!po) throw new Error('PO tidak ditemukan')

      const newShippedTonnage = po.shipped_tonnage + shippedTonnage
      const newRemainingTonnage = po.total_tonnage - newShippedTonnage
      const newStatus = newRemainingTonnage <= 0 ? 'Selesai' : 
                       newShippedTonnage > 0 ? 'Sebagian' : 'Aktif'

      const { data, error } = await supabase
        .from('purchase_orders')
        .update({
          shipped_tonnage: newShippedTonnage,
          remaining_tonnage: Math.max(0, newRemainingTonnage),
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', poId)
        .select()
        .single()

      if (error) throw error

      setPurchaseOrders(prev => 
        prev.map(p => p.id === poId ? data : p)
      )

      return data
    } catch (error) {
      console.error('Error updating purchase order tonnage:', error)
      throw error
    }
  }

  const updatePurchaseOrder = async (poId: string, updates: Partial<PurchaseOrder>) => {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', poId)
        .select()
        .single();
      if (error) throw error;
      setPurchaseOrders(prev => prev.map(p => p.id === poId ? data : p));
      toast.success('PO berhasil diperbarui');
      return data;
    } catch (error) {
      console.error('Error updating purchase order:', error);
      toast.error('Gagal memperbarui PO');
      throw error;
    }
  };

  const deletePurchaseOrder = async (poId: string) => {
    try {
      const { error } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', poId);
      if (error) throw error;
      setPurchaseOrders(prev => prev.filter(p => p.id !== poId));
      toast.success('PO berhasil dihapus');
      return true;
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      toast.error('Gagal menghapus PO');
      throw error;
    }
  };

  useEffect(() => {
    fetchPurchaseOrders()
  }, [])

  return {
    purchaseOrders,
    loading,
    createPurchaseOrder,
    updatePurchaseOrderTonnage,
    updatePurchaseOrder,
    deletePurchaseOrder,
    refetch: fetchPurchaseOrders
  }
}