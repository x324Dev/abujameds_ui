// lib/api/types.ts
// Field names match the API exactly — no camelCase transformation.
// The API uses snake_case throughout. Do not transform in the fetcher.

export type UserRole =
  | 'patient'
  | 'pharmacy_admin'
  | 'institutional'
  | 'superadmin'

export interface User {
  id: string
  phone: string
  email: string | null
  username: string | null
  display_name: string        // use this for all profile display
  role: UserRole
  is_active: boolean
  is_verified: boolean
  created_at: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: {
    id: string
    phone: string
    email: string | null
    username: string | null
    display_name: string
    role: UserRole
    is_verified: boolean
  }
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'unknown'

export interface Drug {
  id: string
  nafdac_number: string
  generic_name: string
  brand_names: string[]
  drug_category: string | null
  dosage_form: string | null
  strength: string | null
  manufacturer: string | null
  is_controlled: boolean
}

// Shape of each pharmacy result in GET /search/drugs
export interface PharmacySearchResult {
  pharmacy_id: string | null
  pharmacy_name: string
  address: string | null
  distance_km: number
  quantity_in_stock: number | null
  price_naira: number | null
  stock_status: StockStatus
  last_updated_at: string | null
  is_pcn_verified: boolean
  is_partner: boolean             // true for external partner pharmacies
  partner_url: string | null      // deep link to partner website
  integration: string | null
}

// Response from GET /search/drugs
export interface DrugSearchResponse {
  drug: Drug | null
  results: PharmacySearchResult[]         // native AbujaMeds pharmacies
  partner_results: PharmacySearchResult[] // external partner pharmacies
  match_found: boolean
  total: number
  partner_total: number
}

// Response from POST /verify/barcode or GET /verify/nafdac/{number}
export interface VerificationResult {
  verdict: 'verified' | 'suspicious' | 'not_found'
  confidence?: number
  status?: string
  message: string
  nafdac_data: {
    nafdac_number: string
    product_name: string | null
    generic_name: string | null
    brand_name: string | null
    dosage_form?: string | null
    strength?: string | null
    manufacturer?: string | null
    country?: string | null
    registration_status?: string | null
    registration_date?: string | null
    expiry_date?: string | null
    drug_category?: string | null
    is_active?: boolean
    is_controlled: boolean | null
    is_expired?: boolean
    source?: string
    last_verified?: string | null
  } | null
  checked_at?: string
}

export type FacilityType =
  | 'pharmacy_partner'
  | 'hospital'
  | 'clinic'
  | 'diagnostic_centre'
  | 'maternity'
  | 'dental'
  | 'optometry'
  | 'mental_health'
  | 'physiotherapy'

export type FacilityTier = 'primary' | 'secondary' | 'tertiary'

export type FacilityOwnership =
  | 'federal'
  | 'state'
  | 'private'
  | 'ngo'
  | 'military'
  | 'faith_based'

// Response from GET /facilities/* endpoints
export interface HealthFacility {
  id: string
  name: string
  facility_type: FacilityType
  tier: FacilityTier | null
  ownership: FacilityOwnership | null
  address: string | null
  area_council: string | null
  latitude: number | null
  longitude: number | null
  distance_km?: number              // present when coordinates were sent
  phone: string | null
  website: string | null
  external_url: string | null
  drug_search_url?: string          // present in partner pharmacy results when drug_name sent
  specialisations: string[]
  services: string[]
  operating_hours: Record<string, string> | null
  accepts_nhis: boolean
  insurance_providers: string[]
  is_verified: boolean
  rating: number | null
  review_count: number
  match_reason?: 'name' | 'specialisation' | 'service'  // present in search results
}

// Response from GET /pharmacy/dashboard
export interface PharmacyDashboard {
  low_stock_count: number
  out_of_stock_count: number
  pending_orders: number
  unacknowledged_restock_alerts: number
}

// Response from GET /pharmacy/profile
export interface PharmacyProfile {
  id: string
  name: string
  pcn_licence_number: string
  address: string | null
  area_council: string
  latitude: number | null
  longitude: number | null
  phone: string | null
  is_pcn_verified: boolean
  is_active: boolean
  subscription_tier: 'free' | 'basic' | 'premium'
  created_at: string
}

// Item in GET /pharmacy/inventory/
export interface InventoryItem {
  id: string
  pharmacy_id: string
  drug_id: string               // UUID — join with drug registry to get name
  quantity_in_stock: number
  price_naira: number | null
  expiry_date: string | null
  stock_status: StockStatus
  last_updated_at: string
  update_source: 'dashboard' | 'whatsapp' | 'api' | 'manual'
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'ready'
  | 'dispatched'
  | 'completed'
  | 'cancelled'
  | 'expired'

export type OrderType = 'reservation' | 'delivery'
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded'

// Response from GET /orders/, GET /orders/{id}
export interface Order {
  id: string
  pharmacy_id: string
  drug_id: string
  quantity: number
  order_type: OrderType
  status: OrderStatus
  total_amount_naira: number | null
  commission_naira: number | null
  delivery_address: string | null
  payment_status: PaymentStatus
  reserved_until: string | null   // ISO timestamp — reservation expires at this time
  created_at: string
}

// Item in GET /pharmacy/alerts/restock
export interface RestockAlert {
  id: string
  pharmacy_id: string
  drug_id: string               // UUID — join with drug registry to get name
  predicted_stockout_date: string
  suggested_order_quantity: number
  confidence_score: number      // 0.0 to 1.0
  alert_sent_at: string | null
  acknowledged_at: string | null  // null means unacknowledged
  created_at: string
}

// Helper — derive acknowledged boolean from acknowledged_at
export const isAlertAcknowledged = (alert: RestockAlert): boolean =>
  alert.acknowledged_at !== null

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}

// Institutional data types
export interface AreaDemand {
  area_council: string
  drug_id: string
  total_searches: number
  matches_found: number
  unmet_demand: number
}

export interface ShortageSignal {
  drug_id: string
  drug_name: string
  total_searches: number
  matches_found: number
  shortage_rate: number   // 0.0 to 1.0 — higher means worse shortage
}

export interface AvailabilityTrend {
  date: string            // YYYY-MM-DD
  total_searches: number
  matches_found: number
  match_rate: number      // 0.0 to 1.0
}

export interface ApiError {
  message: string
  status: number | undefined
  detail: string | undefined
}