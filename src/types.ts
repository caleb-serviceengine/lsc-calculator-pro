export interface SavedBid {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  bid_id: string
  customer_name: string
  bundle_data: Record<string, unknown>
  total_price: number
  status: 'draft' | 'sent' | 'won' | 'lost'
}

export interface User {
  id: string
  email: string
}
