// lib/hooks/api.ts
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { fetcher, poster, qs } from '@/lib/fetcher'
import { useLocation } from '@/hooks/use-Location'
import type {
  DrugSearchResponse,
  VerificationResult,
  HealthFacility,
  Order,
  PharmacyDashboard,
  InventoryItem,
  RestockAlert,
  PharmacyProfile,
  PaginatedResponse,
  Drug,
  AreaDemand,
  ShortageSignal,
  AvailabilityTrend,
} from '@/lib/api/types'
import { PharmacySearchResult } from '@/components/patient/pharmacy-result-card'

// ── Search ────────────────────────────────────────────────────────────────────

// GET /api/v1/search/drugs
// Note: radius param is radius_km not radius
export function useDrugSearch(query: string, radius_km: number = 10) {
  const { lat, lng } = useLocation()

  const url =
    query && lat && lng
      ? `/api/v1/search/drugs${qs({ q: query, lat, lng, radius_km })}`
      : null

  return useSWR<DrugSearchResponse>(url, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  })
}

// ── Drug Registry ─────────────────────────────────────────────────────────────

// GET /api/v1/drugs/ — list with optional search and category filter
export function useDrugList(query?: string, category?: string, page = 1) {
  const params: Record<string, string | number> = { page, limit: 20 }
  if (query)    params.q        = query
  if (category) params.category = category

  return useSWR<PaginatedResponse<Drug>>(
    `/api/v1/drugs/${qs(params)}`,
    fetcher,
    { revalidateOnFocus: false }
  )
}


export function useCreateOrder() {
  // Trailing slash required to match backend router configurations and preserve headers
  return useSWRMutation<
    Order, 
    Error, 
    '/api/v1/orders/', 
    { drug_id: string; facility_id: string; quantity: number }
  >(
    '/api/v1/orders/',
    (url, { arg }) => poster(url, arg)
  )
}

// GET /api/v1/drugs/categories
export function useDrugCategories() {
  return useSWR<string[]>('/api/v1/drugs/categories', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60 * 60 * 1000,  // cache for 1 hour — categories rarely change
  })
}

// GET /api/v1/drugs/nafdac/{number} — drug REGISTRY lookup (not verification)
// Returns the drug object if it exists in our registry.
// Use this for autocomplete and drug info display — NOT for authenticity checking.
export function useDrugByNafdac(nafdac_number: string) {
  const url = nafdac_number.trim()
    ? `/api/v1/drugs/nafdac/${encodeURIComponent(nafdac_number.trim().toUpperCase())}`
    : null

  return useSWR<Drug>(url, fetcher, {
    revalidateOnFocus: false,
  })
}

// GET /api/v1/drugs/{id}
export function useDrug(drug_id: string | null) {
  return useSWR<Drug>(drug_id ? `/api/v1/drugs/${drug_id}` : null, fetcher)
}

// ── Drug Verification ─────────────────────────────────────────────────────────

// GET /api/v1/verify/nafdac/{number}
// This is AUTHENTICITY VERIFICATION against NAFDAC Greenbook.
// Different from useDrugByNafdac — returns verdict, confidence, expiry status.
// Use this on the /verify page.
export function useVerifyNafdac(nafdac_number: string) {
  const url = nafdac_number.trim()
    ? `/api/v1/verify/nafdac/${encodeURIComponent(nafdac_number.trim().toUpperCase())}`
    : null

  return useSWR<VerificationResult>(url, fetcher, {
    revalidateOnFocus: false,
    // Do not revalidate automatically — verification is an on-demand action
    revalidateIfStale: false,
  })
}

// POST /api/v1/verify/barcode — use this when submitting a form
// Returns the same VerificationResult shape as useVerifyNafdac
export function useVerifyBarcode() {
  return useSWRMutation<VerificationResult, Error, string, { nafdac_number: string; batch_code: string | null }>(
    '/api/v1/verify/barcode',
    (url, { arg }) => poster(url, arg)
  )
}

// ── Health Facilities ─────────────────────────────────────────────────────────

// GET /api/v1/facilities/nearby
export function useNearbyFacilities(options?: {
  radius_km?: number
  facility_type?: string
  specialisation?: string
  service?: string
  accepts_nhis?: boolean
  limit?: number
}) {
  const { lat, lng } = useLocation()

  const params: Record<string, string | number | boolean> = {
    lat: lat ?? 0,
    lng: lng ?? 0,
    radius_km: options?.radius_km ?? 10,
    limit: options?.limit ?? 20,
  }
  if (options?.facility_type)  params.facility_type  = options.facility_type
  if (options?.specialisation) params.specialisation = options.specialisation
  if (options?.service)        params.service        = options.service
  if (options?.accepts_nhis !== undefined) params.accepts_nhis = options.accepts_nhis

  const url = lat && lng ? `/api/v1/facilities/nearby${qs(params)}` : null

  return useSWR<HealthFacility[]>(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5 * 60 * 1000,
  })
}

// GET /api/v1/facilities/search
export function useFacilitySearch(query: string, facility_type?: string) {
  const { lat, lng } = useLocation()

  const params: Record<string, string | number> = { q: query }
  if (lat)           params.lat           = lat
  if (lng)           params.lng           = lng
  if (facility_type) params.facility_type = facility_type

  const url = query.length >= 2
    ? `/api/v1/facilities/search${qs(params)}`
    : null

  return useSWR<HealthFacility[]>(url, fetcher)
}

// GET /api/v1/facilities/hospitals/by-specialisation
// Note: parameter is specialisation (British spelling) not specialization
// Note: endpoint is /hospitals/by-specialisation not /facilities/specialized
export function useHospitalsBySpecialisation(specialisation: string) {
  const { lat, lng } = useLocation()

  const params: Record<string, string | number> = { specialisation }
  if (lat) params.lat = lat
  if (lng) params.lng = lng

  const url = specialisation.trim()
    ? `/api/v1/facilities/hospitals/by-specialisation${qs(params)}`
    : null

  return useSWR<HealthFacility[]>(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10 * 60 * 1000,
  })
}

// GET /api/v1/facilities/emergency
// Nearest facilities with 24hr emergency — no filter params needed
export function useEmergencyFacilities() {
  const { lat, lng } = useLocation()

  const url = lat && lng
    ? `/api/v1/facilities/emergency${qs({ lat, lng, radius_km: 20 })}`
    : null

  return useSWR<HealthFacility[]>(url, fetcher, {
    refreshInterval: 60 * 1000,  // refresh every 60 seconds — emergency data should be current
  })
}

// GET /api/v1/facilities/partner-pharmacies
export function usePartnerPharmacies(drug_name?: string) {
  const { lat, lng } = useLocation()

  const params: Record<string, string | number> = {}
  if (drug_name) params.drug_name = drug_name
  if (lat)       params.lat       = lat
  if (lng)       params.lng       = lng

  return useSWR<PharmacySearchResult[]>(
    `/api/v1/facilities/partner-pharmacies${qs(params)}`,
    fetcher,
    { revalidateOnFocus: false }
  )
}

// GET /api/v1/facilities/{id}
export function useFacility(facility_id: string | null) {
  return useSWR<HealthFacility>(
    facility_id ? `/api/v1/facilities/${facility_id}` : null,
    fetcher
  )
}

// ── Auth ──────────────────────────────────────────────────────────────────────

// GET /api/v1/auth/me
export function useCurrentUser() {
  return useSWR('/api/v1/auth/me', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,  // do not retry 401s
  })
}

// ── Pharmacy Dashboard ────────────────────────────────────────────────────────

// GET /api/v1/pharmacy/dashboard
// Note: NOT /pharmacy/metrics-summary — that endpoint does not exist
export function usePharmacyDashboard() {
  return useSWR<PharmacyDashboard>('/api/v1/pharmacy/dashboard', fetcher, {
    refreshInterval: 60 * 1000,
  })
}

// GET /api/v1/pharmacy/profile
export function usePharmacyProfile() {
  return useSWR<PharmacyProfile>('/api/v1/pharmacy/profile', fetcher, {
    revalidateOnFocus: false,
  })
}

// GET /api/v1/pharmacy/inventory/
// Note: trailing slash is required — without it FastAPI returns a 307 redirect
// which strips the Authorization header causing a 403
export function usePharmacyInventory() {
  return useSWR<InventoryItem[]>('/api/v1/pharmacy/inventory/', fetcher, {
    refreshInterval: 30 * 1000,
  })
}

// GET /api/v1/pharmacy/orders
export function usePharmacyOrders(status?: string) {
  const url = status
    ? `/api/v1/pharmacy/orders${qs({ status })}`
    : '/api/v1/pharmacy/orders'

  return useSWR<PaginatedResponse<Order>>(url, fetcher, {
    refreshInterval: 30 * 1000,
  })
}

// GET /api/v1/pharmacy/alerts/restock
export function useRestockAlerts() {
  return useSWR<RestockAlert[]>('/api/v1/pharmacy/alerts/restock', fetcher, {
    refreshInterval: 5 * 60 * 1000,
  })
}

// ── Patient Orders ────────────────────────────────────────────────────────────

// GET /api/v1/orders/
// Note: trailing slash required — same redirect issue as inventory
export function useMyOrders() {
  return useSWR<Order[]>('/api/v1/orders/', fetcher, {
    revalidateOnFocus: false,
  })
}

// GET /api/v1/orders/{id}
export function useOrder(order_id: string | null) {
  return useSWR<Order>(
    order_id ? `/api/v1/orders/${order_id}` : null,
    fetcher
  )
}

// ── Institutional ─────────────────────────────────────────────────────────────

// GET /api/v1/institutional/demand/by-area
export function useAreaDemand(area_council?: string, drug_id?: string) {
  const params: Record<string, string> = {}
  if (area_council) params.area_council = area_council
  if (drug_id)      params.drug_id      = drug_id

  return useSWR<AreaDemand[]>(
    `/api/v1/institutional/demand/by-area${qs(params)}`,
    fetcher
  )
}

// GET /api/v1/institutional/demand/shortages
export function useDrugShortages(limit = 20) {
  return useSWR<ShortageSignal[]>(
    `/api/v1/institutional/demand/shortages${qs({ limit })}`,
    fetcher
  )
}

// GET /api/v1/institutional/availability/trends
export function useAvailabilityTrends(days = 30) {
  return useSWR<AvailabilityTrend[]>(
    `/api/v1/institutional/availability/trends${qs({ days })}`,
    fetcher
  )
}