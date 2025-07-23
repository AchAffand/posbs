import React, { useState, useMemo } from 'react';
import { useDeliveryNotes } from './hooks/useDeliveryNotes';
import { usePurchaseOrders } from '../po/hooks/usePurchaseOrders';
import { DeliveryNote } from './types';
import { DeliveryNoteForm } from './components/DeliveryNoteForm';
import { WeightModal } from './components/WeightModal';
import { DeliveryNoteCard } from './components/DeliveryNoteCard';
import { Dashboard } from './components/Dashboard';
import { SearchAndFilter } from './components/SearchAndFilter';
import { Plus, Truck, RefreshCw, FileText, AlertCircle, Wifi, Menu, X } from 'lucide-react';
import { getDeliveryNotesFromSupabase } from './utils/supabaseStorage';

function App() {
  const { notes, loading, error, createNote, updateNote, removeNote, getStats, refreshNotes } = useDeliveryNotes();
  const { purchaseOrders, updatePurchaseOrder, refetch: refetchPOs } = usePurchaseOrders();
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<DeliveryNote | undefined>();
  const [weightModal, setWeightModal] = useState<DeliveryNote | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = 
        note.deliveryNoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (note.poNumber && note.poNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        note.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || note.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [notes, searchTerm, statusFilter]);

  const sortedNotes = useMemo(() => {
    return [...filteredNotes].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [filteredNotes]);

  const handleSaveNote = async (noteData: Omit<DeliveryNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingNote) {
        await updateNote(editingNote.id, noteData);
        setEditingNote(undefined);
      } else {
        await createNote(noteData);
      }
      setShowForm(false);
    } catch (err) {
      // Error is handled in the hook
    }
  };

  const handleEditNote = (note: DeliveryNote) => {
    setEditingNote(note);
    setShowForm(true);
  };

  const handleDeleteNote = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus surat jalan ini? Data yang sudah dihapus tidak dapat dikembalikan.')) {
      try {
        const noteToDelete = notes.find(n => n.id === id);
        const poNumber = noteToDelete?.poNumber;
        await removeNote(id);
        if (poNumber) {
          // Ambil data terbaru dari Supabase
          const allNotes = await getDeliveryNotesFromSupabase();
          const relatedNotes = allNotes.filter(n => n.poNumber === poNumber);
          const totalShipped = relatedNotes.reduce((sum, n) => sum + (n.netWeight || 0), 0);
          const po = purchaseOrders.find(po => po.po_number === poNumber);
          if (po) {
            const remaining = po.total_tonnage - totalShipped;
            let status: 'Aktif' | 'Sebagian' | 'Selesai' = 'Aktif';
            if (totalShipped >= po.total_tonnage) status = 'Selesai';
            else if (totalShipped > 0) status = 'Sebagian';
            await updatePurchaseOrder(po.id, {
              shipped_tonnage: totalShipped,
              remaining_tonnage: remaining > 0 ? remaining : 0,
              status
            });
            refetchPOs();
          }
        }
        await refreshNotes();
      } catch (err) {
        // Error is handled in the hook
      }
    }
  };

  const handleAddWeight = (note: DeliveryNote) => {
    if (note.status !== 'selesai') {
      alert('Berat timbangan hanya bisa diinput setelah status pengiriman menjadi "Selesai"');
      return;
    }
    setWeightModal(note);
  };

  const handleSaveWeight = async (weight: number) => {
    if (weightModal) {
      try {
        await updateNote(weightModal.id, { netWeight: weight });
        setWeightModal(undefined);
      } catch (err) {
        // Error is handled in the hook
      }
    }
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 flex items-center space-x-4 max-w-sm w-full">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-900">Memuat Data</h3>
            <p className="text-gray-600 text-sm">Sedang mengambil data surat jalan dari cloud...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-lg border-b border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0">
                <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Sistem Surat Jalan</h1>
                  <div className="hidden sm:flex items-center space-x-1 flex-shrink-0">
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">Cloud Sync</span>
                  </div>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">
                  Kelola pengiriman dan timbangan kendaraan - Tersinkron di semua perangkat
                </p>
              </div>
            </div>
            
            {/* Desktop Create Button */}
            <button
              onClick={() => {
                setEditingNote(undefined);
                setShowForm(true);
              }}
              className="hidden sm:flex bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all items-center space-x-2 font-medium shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="hidden lg:inline">Buat Surat Jalan</span>
              <span className="lg:hidden">Buat</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="sm:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="sm:hidden border-t border-gray-200 py-4 space-y-3">
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <Wifi className="w-4 h-4" />
                <span className="font-medium">Cloud Sync Aktif</span>
              </div>
              <button
                onClick={() => {
                  setEditingNote(undefined);
                  setShowForm(true);
                  setShowMobileMenu(false);
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center space-x-2 font-medium shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Buat Surat Jalan Baru</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content with top padding for fixed header */}
      <div className="pt-16 sm:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-800">Terjadi Kesalahan</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
              <button
                onClick={refreshNotes}
                className="text-red-600 hover:text-red-800 transition-colors p-1"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}

          <Dashboard stats={stats} />
          
          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 flex-shrink-0" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Daftar Surat Jalan
                </h2>
                <span className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                  {filteredNotes.length} surat jalan
                </span>
              </div>
              <button
                onClick={refreshNotes}
                className="self-start sm:self-auto p-2 sm:p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                title="Muat Ulang Data"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <SearchAndFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />

            {sortedNotes.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="bg-gray-100 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Truck className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {notes.length === 0 ? 'Belum Ada Surat Jalan' : 'Tidak Ada Hasil'}
                </h3>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base px-4">
                  {notes.length === 0
                    ? 'Mulai dengan membuat surat jalan pertama Anda'
                    : 'Tidak ada surat jalan yang sesuai dengan kriteria pencarian'}
                </p>
                {notes.length === 0 && (
                  <button
                    onClick={() => {
                      setEditingNote(undefined);
                      setShowForm(true);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl mx-auto text-sm sm:text-base"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Buat Surat Jalan Pertama</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {sortedNotes.map(note => (
                  <DeliveryNoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleEditNote}
                    onDelete={handleDeleteNote}
                    onAddWeight={handleAddWeight}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Mobile FAB (Floating Action Button) */}
      <button
        onClick={() => {
          setEditingNote(undefined);
          setShowForm(true);
        }}
        className="sm:hidden fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-full shadow-2xl hover:from-blue-600 hover:to-blue-700 transition-all hover:scale-110 z-30"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modals */}
      {showForm && (
        <DeliveryNoteForm
          note={editingNote}
          onSave={handleSaveNote}
          onCancel={() => {
            setShowForm(false);
            setEditingNote(undefined);
          }}
        />
      )}

      {weightModal && (
        <WeightModal
          currentWeight={weightModal.netWeight}
          deliveryNoteNumber={weightModal.deliveryNoteNumber}
          onSave={handleSaveWeight}
          onClose={() => setWeightModal(undefined)}
        />
      )}
    </div>
  );
}

export default App;