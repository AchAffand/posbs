import { usePurchaseOrders } from '../hooks/usePurchaseOrders'
import { useDeliveryNotes } from '../hooks/useDeliveryNotes'
import { Package, Truck, TrendingUp, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export function Dashboard() {
  const { purchaseOrders, loading: poLoading } = usePurchaseOrders()
  const { deliveryNotes, loading: dnLoading } = useDeliveryNotes()

  if (poLoading || dnLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Hitung total pengiriman dan status PO berdasarkan delivery_notes
  const getTotalDelivered = (poNumber: string) =>
    deliveryNotes
      .filter(note => note.po_number === poNumber && note.status === 'selesai' && note.net_weight)
      .reduce((sum, note) => sum + (note.net_weight || 0), 0)

  const getPOStatus = (po: any) => {
    const delivered = getTotalDelivered(po.po_number)
    if (delivered >= po.total_tonnage) return 'Selesai'
    if (delivered > 0) return 'Sebagian'
    return 'Aktif'
  }

  const stats = {
    totalPOs: purchaseOrders.length,
    activePOs: purchaseOrders.filter(po => getPOStatus(po) === 'Aktif').length,
    completedPOs: purchaseOrders.filter(po => getPOStatus(po) === 'Selesai').length,
    partialPOs: purchaseOrders.filter(po => getPOStatus(po) === 'Sebagian').length,
    totalShipments: deliveryNotes.length,
    totalRemainingTonnage: purchaseOrders.reduce((sum, po) => sum + Math.max(0, po.total_tonnage - getTotalDelivered(po.po_number)), 0),
    totalValue: purchaseOrders.reduce((sum, po) => sum + po.total_value, 0)
  }

  const recentShipments = deliveryNotes.slice(0, 5)
  const activePOs = purchaseOrders.filter(po => getPOStatus(po) !== 'Selesai').slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total PO
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalPOs}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    PO Aktif
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.activePOs + stats.partialPOs}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Truck className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Pengiriman
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalShipments}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Sisa Tonase
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalRemainingTonnage.toFixed(2)} ton
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active POs */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              PO Aktif
            </h3>
            <div className="space-y-3">
              {activePOs.length === 0 ? (
                <p className="text-gray-500 text-sm">Tidak ada PO aktif</p>
              ) : (
                activePOs.map((po) => (
                  <div key={po.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{po.po_number}</p>
                      <p className="text-xs text-gray-500">{po.product_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {po.remaining_tonnage.toFixed(2)} ton
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        po.status === 'Aktif' ? 'bg-green-100 text-green-800' :
                        po.status === 'Sebagian' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {po.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Shipments */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Pengiriman Terbaru
            </h3>
            <div className="space-y-3">
              {recentShipments.length === 0 ? (
                <p className="text-gray-500 text-sm">Belum ada pengiriman</p>
              ) : (
                recentShipments.map((note) => (
                  <div key={note.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{note.delivery_note_number}</p>
                      <p className="text-xs text-gray-500">{note.driver_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {(note.net_weight || 0).toFixed(2)} kg
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(note.date), 'dd MMM yyyy', { locale: id })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}