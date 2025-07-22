import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { PurchaseOrder, Shipment } from '../lib/database.types'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export function exportToPDF(data: PurchaseOrder[], filename: string) {
  const doc = new jsPDF()
  
  // Add title
  doc.setFontSize(16)
  doc.text('Laporan Purchase Orders', 14, 22)
  
  // Add date
  doc.setFontSize(10)
  doc.text(`Tanggal: ${format(new Date(), 'dd MMMM yyyy', { locale: id })}`, 14, 30)
  
  // Prepare table data
  const tableData = data.map(po => [
    po.po_number,
    format(new Date(po.po_date), 'dd/MM/yyyy'),
    po.product_type,
    po.total_tonnage.toFixed(2),
    po.shipped_tonnage.toFixed(2),
    po.remaining_tonnage.toFixed(2),
    `Rp ${po.price_per_ton.toLocaleString('id-ID')}`,
    `Rp ${po.total_value.toLocaleString('id-ID')}`,
    po.status
  ])
  
  autoTable(doc, {
    head: [['No PO', 'Tanggal', 'Produk', 'Total (ton)', 'Terkirim (ton)', 'Sisa (ton)', 'Harga/ton', 'Total Nilai', 'Status']],
    body: tableData,
    startY: 35,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] }
  })
  
  doc.save(`${filename}-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
}

export function exportToExcel(data: PurchaseOrder[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map(po => ({
      'No PO': po.po_number,
      'Tanggal': format(new Date(po.po_date), 'dd/MM/yyyy'),
      'Produk': po.product_type,
      'Total Tonase': po.total_tonnage,
      'Terkirim': po.shipped_tonnage,
      'Sisa': po.remaining_tonnage,
      'Harga per Ton': po.price_per_ton,
      'Total Nilai': po.total_value,
      'Status': po.status
    }))
  )
  
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Purchase Orders')
  
  XLSX.writeFile(workbook, `${filename}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
}