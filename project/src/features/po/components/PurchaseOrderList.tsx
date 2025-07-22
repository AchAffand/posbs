import React, { useState } from 'react'
import { usePurchaseOrders } from '../hooks/usePurchaseOrders'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Search, Filter, Download, Edit, Trash2 } from 'lucide-react'
import { exportToPDF, exportToExcel } from '../utils/export'

export function PurchaseOrderList() {
  const { purchaseOrders, loading, updatePurchaseOrder, deletePurchaseOrder, refetch } = usePurchaseOrders()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [productFilter, setProductFilter] = useState<string>('all')
  const [editingPO, setEditingPO] = useState<any | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null)

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         po.product_type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || po.status === statusFilter
    const matchesProduct = productFilter === 'all' || po.product_type === productFilter
    
    return matchesSearch && matchesStatus && matchesProduct
  })

  const handleExportPDF = () => {
    exportToPDF(filteredPOs, 'purchase-orders')
  }

  const handleExportExcel = () => {
    exportToExcel(filteredPOs, 'purchase-orders')
  }

  const handleEditClick = (po: any) => {
    setEditingPO(po)
    setEditForm({ ...po })
  }

  const handleEditChange = (field: string, value: any) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleEditSave = async () => {
    await updatePurchaseOrder(editingPO.id, editForm)
    setEditingPO(null)
  }

  const handleDeleteClick = (poId: string) => {
    setShowConfirmDelete(poId)
  }

  const handleDeleteConfirm = async () => {
    if (showConfirmDelete) {
      await deletePurchaseOrder(showConfirmDelete)
      setShowConfirmDelete(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Cari nomor PO atau produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Sebagian">Sebagian</option>
            <option value="Selesai">Selesai</option>
          </select>
          
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Semua Produk</option>
            <option value="CPO">CPO</option>
            <option value="UCO">UCO</option>
            <option value="Minyak Ikan">Minyak Ikan</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No PO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tonase Awal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Terkirim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sisa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga/Ton
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Nilai
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'all' || productFilter !== 'all' 
                      ? 'Tidak ada data yang sesuai dengan filter'
                      : 'Belum ada Purchase Order'
                    }
                  </td>
                </tr>
              ) : (
                filteredPOs.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {po.po_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(po.po_date), 'dd MMM yyyy', { locale: id })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {po.product_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {po.total_tonnage.toFixed(2)} ton
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {po.shipped_tonnage.toFixed(2)} ton
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {po.remaining_tonnage.toFixed(2)} ton
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Rp {po.price_per_ton.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Rp {po.total_value.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        po.status === 'Aktif' ? 'bg-green-100 text-green-800' :
                        po.status === 'Sebagian' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button onClick={() => handleEditClick(po)} className="text-blue-600 hover:text-blue-900 mr-2" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteClick(po.id)} className="text-red-600 hover:text-red-900" title="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingPO && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4">Edit Purchase Order</h2>
            <div className="space-y-3">
              <label className="block">
                Nomor PO
                <input type="text" value={editForm.po_number} onChange={e => handleEditChange('po_number', e.target.value)} className="w-full border rounded px-2 py-1" />
              </label>
              <label className="block">
                Tanggal
                <input type="date" value={editForm.po_date} onChange={e => handleEditChange('po_date', e.target.value)} className="w-full border rounded px-2 py-1" />
              </label>
              <label className="block">
                Produk
                <input type="text" value={editForm.product_type} onChange={e => handleEditChange('product_type', e.target.value)} className="w-full border rounded px-2 py-1" />
              </label>
              <label className="block">
                Tonase Awal
                <input type="number" value={editForm.total_tonnage} onChange={e => handleEditChange('total_tonnage', Number(e.target.value))} className="w-full border rounded px-2 py-1" />
              </label>
              <label className="block">
                Harga/Ton
                <input type="number" value={editForm.price_per_ton} onChange={e => handleEditChange('price_per_ton', Number(e.target.value))} className="w-full border rounded px-2 py-1" />
              </label>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button onClick={() => setEditingPO(null)} className="px-4 py-2 bg-gray-200 rounded">Batal</button>
              <button onClick={handleEditSave} className="px-4 py-2 bg-blue-600 text-white rounded">Simpan</button>
            </div>
          </div>
        </div>
      )}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4">Hapus Purchase Order?</h2>
            <p className="mb-4">Apakah Anda yakin ingin menghapus PO ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowConfirmDelete(null)} className="px-4 py-2 bg-gray-200 rounded">Batal</button>
              <button onClick={handleDeleteConfirm} className="px-4 py-2 bg-red-600 text-white rounded">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}