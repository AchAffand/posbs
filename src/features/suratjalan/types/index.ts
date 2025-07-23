export interface DeliveryNote {
  id: string;
  date: string;
  vehiclePlate: string;
  driverName: string;
  deliveryNoteNumber: string;
  poNumber: string; // Boleh kosong ('') atau '-'
  destination: string;
  netWeight?: number;
  status: 'menunggu' | 'dalam-perjalanan' | 'selesai';
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface DeliveryStats {
  total: number;
  menunggu: number;
  dalamPerjalanan: number;
  selesai: number;
  totalWeight: number;
}