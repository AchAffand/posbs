export interface Database {
  public: {
    Tables: {
      purchase_orders: {
        Row: {
          id: string
          po_number: string
          po_date: string
          product_type: 'CPO' | 'UCO' | 'Minyak Ikan'
          total_tonnage: number
          price_per_ton: number
          total_value: number
          status: 'Aktif' | 'Selesai' | 'Sebagian'
          shipped_tonnage: number
          remaining_tonnage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          po_number: string
          po_date: string
          product_type: 'CPO' | 'UCO' | 'Minyak Ikan'
          total_tonnage: number
          price_per_ton: number
          total_value: number
          status?: 'Aktif' | 'Selesai' | 'Sebagian'
          shipped_tonnage?: number
          remaining_tonnage?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          po_number?: string
          po_date?: string
          product_type?: 'CPO' | 'UCO' | 'Minyak Ikan'
          total_tonnage?: number
          price_per_ton?: number
          total_value?: number
          status?: 'Aktif' | 'Selesai' | 'Sebagian'
          shipped_tonnage?: number
          remaining_tonnage?: number
          created_at?: string
          updated_at?: string
        }
      }
      delivery_notes: {
        Row: {
          id: string;
          date: string;
          vehicle_plate: string;
          driver_name: string;
          delivery_note_number: string;
          destination: string;
          po_number: string;
          net_weight: number | null;
          status: 'menunggu' | 'dalam-perjalanan' | 'selesai';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          vehicle_plate: string;
          driver_name: string;
          delivery_note_number: string;
          destination: string;
          po_number: string;
          net_weight?: number | null;
          status?: 'menunggu' | 'dalam-perjalanan' | 'selesai';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          vehicle_plate?: string;
          driver_name?: string;
          delivery_note_number?: string;
          destination?: string;
          po_number?: string;
          net_weight?: number | null;
          status?: 'menunggu' | 'dalam-perjalanan' | 'selesai';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    }
  }
}

export type PurchaseOrder = Database['public']['Tables']['purchase_orders']['Row']