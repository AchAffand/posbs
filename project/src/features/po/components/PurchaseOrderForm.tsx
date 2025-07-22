import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usePurchaseOrders } from '../hooks/usePurchaseOrders'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const purchaseOrderSchema = z.object({
  po_number: z.string().min(1, 'Nomor PO wajib diisi'),
  po_date: z.string().min(1, 'Tanggal PO wajib diisi'),
  product_type: z.enum(['CPO', 'UCO', 'Minyak Ikan'], {
    required_error: 'Jenis produk wajib dipilih'
  }),
  total_tonnage: z.number().min(0.01, 'Tonase harus lebih dari 0'),
  price_per_ton: z.number().min(1, 'Harga per ton harus lebih dari 0')
})

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>

export function PurchaseOrderForm() {
  const navigate = useNavigate()
  const { createPurchaseOrder } = usePurchaseOrders()
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema)
  })

  const totalTonnage = watch('total_tonnage') || 0
  const pricePerTon = watch('price_per_ton') || 0
  const totalValue = totalTonnage * pricePerTon

  const onSubmit = async (data: PurchaseOrderFormData) => {
    try {
      await createPurchaseOrder({
        ...data,
        total_value: totalValue
      })
      navigate('/purchase-orders')
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/purchase-orders')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Purchase Order Baru</h1>
      </div>

      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="po_number" className="block text-sm font-medium text-gray-700">
                Nomor PO *
              </label>
              <input
                type="text"
                id="po_number"
                {...register('po_number')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Contoh: PO-2024-001"
              />
              {errors.po_number && (
                <p className="mt-1 text-sm text-red-600">{errors.po_number.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="po_date" className="block text-sm font-medium text-gray-700">
                Tanggal PO *
              </label>
              <input
                type="date"
                id="po_date"
                {...register('po_date')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.po_date && (
                <p className="mt-1 text-sm text-red-600">{errors.po_date.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="product_type" className="block text-sm font-medium text-gray-700">
                Jenis Produk *
              </label>
              <select
                id="product_type"
                {...register('product_type')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Pilih jenis produk</option>
                <option value="CPO">CPO</option>
                <option value="UCO">UCO</option>
                <option value="Minyak Ikan">Minyak Ikan</option>
              </select>
              {errors.product_type && (
                <p className="mt-1 text-sm text-red-600">{errors.product_type.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="total_tonnage" className="block text-sm font-medium text-gray-700">
                Tonase Total (ton) *
              </label>
              <input
                type="number"
                step="0.01"
                id="total_tonnage"
                {...register('total_tonnage', { valueAsNumber: true })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
              />
              {errors.total_tonnage && (
                <p className="mt-1 text-sm text-red-600">{errors.total_tonnage.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="price_per_ton" className="block text-sm font-medium text-gray-700">
                Harga per Ton (Rp) *
              </label>
              <input
                type="number"
                id="price_per_ton"
                {...register('price_per_ton', { valueAsNumber: true })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="0"
              />
              {errors.price_per_ton && (
                <p className="mt-1 text-sm text-red-600">{errors.price_per_ton.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Total Nilai (Rp)
              </label>
              <div className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-900">
                Rp {totalValue.toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/purchase-orders')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan PO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}