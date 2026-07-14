"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import {
  ShieldCheck, ShieldAlert, ShieldX, Camera, Search,
  Loader2, ChevronRight, MapPin, Pill, AlertTriangle, Map as MapIcon
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Html5Qrcode } from "html5-qrcode"
import { toast } from "sonner"
import type { VerificationResult } from "@/lib/api/types"

// Import your custom dynamic Map view layers
import { MapView, type MapMarker } from "@/components/map/map-view"

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

// Normalized response shape accommodating geographical point coordinates
interface GeocodedPharmacy {
  pharmacy_id: string
  pharmacy_name: string
  address: string | null
  distance_km: number
  stock_status: 'in_stock' | 'out_of_stock'
  quantity_in_stock: number | null
  price_naira: number | null
  is_pcn_verified: boolean
  latitude: number
  longitude: number
}

interface GeocodedPartner {
  pharmacy_name: string
  distance_km: number
  partner_url: string | null
  latitude: number
  longitude: number
}

interface ExtendedSearchResponse {
  drug: Drug | null
  total: number
  results: GeocodedPharmacy[]
  partner_results: GeocodedPartner[]
}

const VERDICT_MAP = {
  verified: {
    icon: ShieldCheck,
    title: "Genuine Product",
    tone: "text-emerald-600",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200",
  },
  suspicious: {
    icon: ShieldAlert,
    title: "Suspicious — Verify Carefully",
    tone: "text-amber-600",
    bg: "bg-amber-50",
    ring: "ring-amber-200",
  },
  not_found: {
    icon: ShieldX,
    title: "Not Found in Official Registry",
    tone: "text-rose-600",
    bg: "bg-rose-50",
    ring: "ring-rose-200",
  },
} as const

export function VerifyClient() {
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState<string>("nafdac")
  const [loading, setLoading] = useState(false)
  const [nafdacInputValue, setNafdacInputValue] = useState("")
  const [searchInputValue, setSearchInputValue] = useState("")

  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [searchResult, setSearchResult] = useState<ExtendedSearchResponse | null>(null)

  // Interactive Map focus tracking triggers
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null)
  const [mobileShowMap, setMobileShowMap] = useState(false)

  const [isScanning, setIsScanning] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    const tab = searchParams.get("tab")
    const query = searchParams.get("q")
    const code = searchParams.get("code")

    if (tab === "search" && query) {
      setActiveTab("search")
      setSearchInputValue(query)
      executeSearch(query)
    } else if (tab === "nafdac" && code) {
      setActiveTab("nafdac")
      setNafdacInputValue(code)
      executeVerification(code)
    }
  }, [searchParams])

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, [])

  // // Parse backend items into MapMarker format elements
  const compositeMapMarkers = useMemo<MapMarker[]>(() => {
    if (!searchResult) return []

    // 1. Map regular pharmacy results with an explicit MapMarker | null return type
    const storeMarkers = (searchResult.results || [])
      .map((p: any): MapMarker | null => {
        const lat = parseFloat(p.latitude ?? p.lat)
        const lng = parseFloat(p.longitude ?? p.lng ?? p.long)

        if (isNaN(lat) || isNaN(lng)) return null

        return {
          id: p.pharmacy_id,
          lat,
          lng,
          kind: "pharmacy", // TypeScript now accepts this as a valid member of MarkerKind
          label: p.pharmacy_name,
          sublabel: `₦${p.price_naira?.toLocaleString() ?? "—"} • ${p.quantity_in_stock ?? 0} left`,
        }
      })
      .filter((m): m is MapMarker => m !== null) // Works perfectly now

    // 2. Map partner channels with an explicit MapMarker | null return type
    const partnerMarkers = (searchResult.partner_results || [])
      .map((p: any, idx): MapMarker | null => {
        const lat = parseFloat(p.latitude ?? p.lat)
        const lng = parseFloat(p.longitude ?? p.lng ?? p.long)

        if (isNaN(lat) || isNaN(lng)) return null

        return {
          id: `partner-${idx}`,
          lat,
          lng,
          kind: "partner",
          label: p.pharmacy_name,
          sublabel: "Partner Dispatch Channel",
        }
      })
      .filter((m): m is MapMarker => m !== null)

    return [...storeMarkers, ...partnerMarkers]
  }, [searchResult])
  async function executeVerification(targetCode: string) {
    if (!targetCode.trim()) return
    setLoading(true)
    setVerificationResult(null)
    setSearchResult(null)

    try {
      const cleanCode = encodeURIComponent(targetCode.trim().toUpperCase())
      const res = await fetch(`/api/v1/verify/nafdac/${cleanCode}`)
      if (!res.ok) throw new Error()
      let data: VerificationResult = await res.json()

      if (data.verdict === "not_found") {
        const fallbackRes = await fetch(`/api/v1/drugs/nafdac/${cleanCode}`)
        if (fallbackRes.ok) {
          const drugRegistryItem: Drug = await fallbackRes.json()
          if (drugRegistryItem && drugRegistryItem.nafdac_number) {
            data = {
              verdict: "verified",
              message: "Drug verified against NAFDAC Greenbook.",
              checked_at: new Date().toISOString(),
              nafdac_data: {
                nafdac_number: drugRegistryItem.nafdac_number,
                product_name: drugRegistryItem.brand_names?.join(", ") || drugRegistryItem.generic_name,
                manufacturer: drugRegistryItem.manufacturer || "Registered Provider",
                generic_name: drugRegistryItem.generic_name || null,
                brand_name: drugRegistryItem.brand_names?.join(", ") || null,
                dosage_form: drugRegistryItem.dosage_form || null,
                strength: drugRegistryItem.strength || null,
                drug_category: drugRegistryItem.drug_category || null,
                is_controlled: drugRegistryItem.is_controlled || null,
                registration_status: "Active",
                last_verified: new Date().toISOString(),
              }
            }
          }
        }
      }
      setVerificationResult(data)
    } catch {
      toast.error("Could not complete verification process.")
    } finally {
      setLoading(false)
    }
  }

  async function startCameraScanner() {
    setIsScanning(true)
    setVerificationResult(null)
    setSearchResult(null)
    setTimeout(async () => {
      try {
        scannerRef.current = new Html5Qrcode("verify-camera-box")
        await scannerRef.current.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 260 },
          async (decodedText) => {
            if (scannerRef.current?.isScanning) await scannerRef.current.stop()
            setIsScanning(false)
            executeVerification(decodedText)
          },
          () => { }
        )
      } catch {
        toast.error("Camera connection failed.")
        setIsScanning(false)
      }
    }, 80)
  }

  function stopCameraScanner() {
    if (scannerRef.current?.isScanning) {
      scannerRef.current.stop().then(() => setIsScanning(false)).catch(console.error)
    } else {
      setIsScanning(false)
    }
  }

  async function executeSearch(queryText: string) {
    if (!queryText.trim()) return
    setLoading(true)
    setVerificationResult(null)
    setSearchResult(null)
    setActiveMarkerId(null)

    try {
      const lat = localStorage.getItem("user_lat") || "9.0578"
      const lng = localStorage.getItem("user_lng") || "7.4951"
      const res = await fetch(
        `/api/v1/search/drugs?q=${encodeURIComponent(queryText.trim())}&lat=${lat}&lng=${lng}&radius_km=10`
      )
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSearchResult(data)
    } catch {
      toast.error("Pharmacy lookups interrupted.")
    } finally {
      setLoading(false)
    }
  }

  const activeVerdict = verificationResult ? VERDICT_MAP[verificationResult.verdict] : null
  const VerdictIcon = activeVerdict?.icon

  return (
    <div className={cn(
      "mx-auto w-full px-4 pt-28 md:pt-32 pb-24 space-y-6 transition-all duration-300 min-h-screen",
      searchResult ? "max-w-7xl" : "max-w-xl"
    )}>
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Verification Engine</h1>
        <p className="text-slate-500 text-sm mt-1">Cross-examine listings and registries natively.</p>
      </div>

      {/* Primary Panels Grid */}
      <div className={cn("grid grid-cols-1 gap-6", searchResult && "lg:grid-cols-12")}>

        {/* Left Side: Controllers & Result Cards Column */}
        <div className={cn("space-y-6", searchResult ? "lg:col-span-7 xl:col-span-6" : "w-full")}>
          <Tabs value={activeTab} onValueChange={(v) => { stopCameraScanner(); setActiveTab(v); }} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-100 rounded-xl p-1">
              <TabsTrigger value="nafdac" className="rounded-lg">NAFDAC</TabsTrigger>
              <TabsTrigger value="scan" className="rounded-lg">QR Scan</TabsTrigger>
              <TabsTrigger value="search" className="rounded-lg">Find Medicine</TabsTrigger>
            </TabsList>

            <TabsContent value="nafdac" className="pt-2">
              <form onSubmit={(e) => { e.preventDefault(); executeVerification(nafdacInputValue); }} className="flex gap-2">
                <Input
                  value={nafdacInputValue}
                  onChange={(e) => setNafdacInputValue(e.target.value)}
                  placeholder="Enter numerical registration ID..."
                  className="bg-white h-11"
                />
                <Button type="submit" disabled={loading} className="h-11 px-5">
                  {loading ? <Loader2 className="animate-spin size-4" /> : "Verify"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="scan" className="pt-2">
              {isScanning ? (
                <div className="space-y-3">
                  <div id="verify-camera-box" className="w-full aspect-video rounded-2xl overflow-hidden border-2 border-slate-200 bg-black" />
                  <Button variant="outline" onClick={stopCameraScanner} className="w-full h-11">
                    Cancel Camera Session
                  </Button>
                </div>
              ) : (
                <Button onClick={startCameraScanner} variant="outline" className="w-full h-32 flex flex-col gap-2 rounded-2xl border-dashed border-slate-300 hover:bg-slate-50">
                  {loading ? <Loader2 className="animate-spin size-6 text-slate-400" /> : <Camera className="size-6 text-slate-500" />}
                  <span className="text-sm font-semibold text-slate-700">Initialize Device Camera Capture</span>
                </Button>
              )}
            </TabsContent>

            <TabsContent value="search" className="pt-2">
              <form onSubmit={(e) => { e.preventDefault(); executeSearch(searchInputValue); }} className="flex gap-2">
                <Input
                  value={searchInputValue}
                  onChange={(e) => setSearchInputValue(e.target.value)}
                  placeholder="What generic or brand name are you looking for?"
                  className="bg-white h-11"
                />
                <Button type="submit" disabled={loading} className="h-11 px-5">
                  {loading ? <Loader2 className="animate-spin size-4" /> : "Locate"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Verification Banner Outputs */}
          {verificationResult && activeVerdict && VerdictIcon && (
            <Card className={cn("p-6 ring-1 transition-all duration-200 rounded-3xl shadow-sm", activeVerdict.bg, activeVerdict.ring)}>
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-white rounded-2xl shadow-sm shrink-0">
                  <VerdictIcon className={cn("size-6", activeVerdict.tone)} />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Registry Assessment</span>
                  <h2 className={cn("text-xl font-bold tracking-tight", activeVerdict.tone)}>{activeVerdict.title}</h2>
                  <p className="text-sm text-slate-600 font-medium leading-normal mt-1">{verificationResult.message}</p>

                  {/* Comprehensive Registry Details Display */}
                  {verificationResult.nafdac_data && (
                    <div className="mt-4 pt-4 border-t border-slate-200/40 space-y-4">
                      {/* Name Heading Block */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Product Details</span>
                          <p className="font-extrabold text-slate-900 text-base leading-tight">
                            {verificationResult.nafdac_data.product_name || verificationResult.nafdac_data.brand_name || verificationResult.nafdac_data.generic_name}
                            {verificationResult.nafdac_data.strength && ` (${verificationResult.nafdac_data.strength})`}
                          </p>
                          {verificationResult.nafdac_data.generic_name &&
                            (verificationResult.nafdac_data.product_name || verificationResult.nafdac_data.brand_name) && (
                              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                                Generic formulation: {verificationResult.nafdac_data.generic_name}
                              </p>
                            )}
                        </div>
                        {verificationResult.nafdac_data.is_controlled && (
                          <span className="inline-flex items-center gap-1 bg-rose-100 border border-rose-200 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs shrink-0">
                            Controlled Item
                          </span>
                        )}
                      </div>

                      {/* Registry Specification Grid */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs text-slate-700">
                        {verificationResult.nafdac_data.manufacturer && (
                          <div>
                            <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">Manufacturer</span>
                            <span className="font-bold text-slate-800">{verificationResult.nafdac_data.manufacturer}</span>
                          </div>
                        )}

                        {verificationResult.nafdac_data.nafdac_number && (
                          <div>
                            <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">NAFDAC Reg No</span>
                            <span className="font-mono font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200/60 inline-block">
                              {verificationResult.nafdac_data.nafdac_number}
                            </span>
                          </div>
                        )}

                        {verificationResult.nafdac_data.dosage_form && (
                          <div>
                            <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">Dosage Form</span>
                            <span className="font-semibold text-slate-600">{verificationResult.nafdac_data.dosage_form}</span>
                          </div>
                        )}

                        {verificationResult.nafdac_data.drug_category && (
                          <div>
                            <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">Classification</span>
                            <span className="font-semibold text-slate-600">{verificationResult.nafdac_data.drug_category}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Search Result Stack */}
          {searchResult && (
            <div className="space-y-4">
              {searchResult.drug && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-4">
                  {/* Brand Header & Control Indicator */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                        <Pill className="text-indigo-600 size-5 shrink-0" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-500">Generic Formulation</span>
                        <p className="font-extrabold text-slate-900 text-base leading-tight">
                          {searchResult.drug.generic_name}
                          {searchResult.drug.strength && ` (${searchResult.drug.strength})`}
                        </p>
                      </div>
                    </div>
                    {searchResult.drug.is_controlled && (
                      <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold px-2 py-1 rounded-md shadow-2xs shrink-0">
                        <AlertTriangle className="size-3 text-rose-500" /> Controlled
                      </span>
                    )}
                  </div>

                  {/* Brand Names Tags */}
                  {searchResult.drug.brand_names && searchResult.drug.brand_names.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {searchResult.drug.brand_names.map((brand, i) => (
                        <span key={i} className="inline-flex items-center text-xs font-semibold bg-white border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-lg">
                          {brand}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Comprehensive Drug Information Grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3.5 border-t border-slate-200/60 text-xs">
                    {searchResult.drug.manufacturer && (
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">Manufacturer Company</span>
                        <span className="font-bold text-slate-800">{searchResult.drug.manufacturer}</span>
                      </div>
                    )}

                    {searchResult.drug.nafdac_number && (
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">NAFDAC Reg No</span>
                        <span className="font-mono font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200/40 inline-block">
                          {searchResult.drug.nafdac_number}
                        </span>
                      </div>
                    )}

                    {searchResult.drug.dosage_form && (
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">Dosage Form</span>
                        <span className="font-semibold text-slate-700">{searchResult.drug.dosage_form}</span>
                      </div>
                    )}

                    {searchResult.drug.drug_category && (
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">Classification</span>
                        <span className="font-semibold text-slate-700">{searchResult.drug.drug_category}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sub-Header Actions */}
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Stock Matches ({searchResult.total})
                </h3>
                {/* Mobile Map Display Toggle Action */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setMobileShowMap(!mobileShowMap)}
                  className="lg:hidden h-8 px-2.5 text-xs font-bold text-indigo-600 border-indigo-100 bg-indigo-50/50"
                >
                  <MapIcon className="size-3.5 mr-1" />
                  {mobileShowMap ? "Hide Map View" : "View Map Grid"}
                </Button>
              </div>

              {/* Mobile Inline Map Slot */}
              {mobileShowMap && (
                <div className="w-full h-64 rounded-2xl overflow-hidden border border-slate-200 lg:hidden shadow-xs">
                  <MapView
                    markers={compositeMapMarkers}
                    activeId={activeMarkerId}
                    onMarkerClick={(id) => setActiveMarkerId(id)}
                    className="h-full w-full"
                  />
                </div>
              )}

              {/* Pharmacy Data List */}
              <div className="space-y-2">
                {searchResult.results.length === 0 && searchResult.partner_results.length === 0 ? (
                  <p className="text-center py-8 text-sm text-slate-400">No matching stocks confirmed within range.</p>
                ) : (
                  <>
                    {searchResult.results.map((pharmacy) => {
                      const isTargeted = activeMarkerId === pharmacy.pharmacy_id
                      return (
                        <Card
                          key={pharmacy.pharmacy_id}
                          className={cn(
                            "p-4 rounded-2xl border bg-white shadow-xs transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                            isTargeted ? "border-indigo-500 ring-2 ring-indigo-100 bg-indigo-50/10" : "border-slate-200/70 hover:border-slate-300"
                          )}
                        >
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3 sm:justify-start">
                              <h4 className="font-bold text-slate-950 text-base tracking-tight truncate">
                                {pharmacy.pharmacy_name}
                              </h4>
                              <span className="text-base font-black text-slate-950 tracking-tight sm:hidden shrink-0">
                                ₦{pharmacy.price_naira?.toLocaleString() ?? "—"}
                              </span>
                            </div>

                            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                              <MapPin className="size-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[150px] xs:max-w-[220px] sm:max-w-none">
                                {pharmacy.address || "Address omitted"}
                              </span>
                              <span className="text-slate-300 font-light shrink-0">|</span>
                              <span className="font-bold text-indigo-600 shrink-0">
                                {pharmacy.distance_km.toFixed(1)} km out
                              </span>
                            </p>

                            <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                              <div className="flex flex-wrap gap-1.5">
                                <span className={cn(
                                  "inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md border",
                                  pharmacy.stock_status === 'in_stock' ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-amber-50 border-amber-100 text-amber-700"
                                )}>
                                  {pharmacy.quantity_in_stock ?? 0} left
                                </span>
                                {pharmacy.is_pcn_verified && (
                                  <span className="inline-flex items-center text-[10px] font-bold bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                                    PCN Verified
                                  </span>
                                )}
                              </div>

                              {/* Interactive Focus Tracking Map Target Trigger Pin */}
                              <Button
                                size="sm"
                                variant={isTargeted ? "default" : "outline"}
                                onClick={() => {
                                  setActiveMarkerId(pharmacy.pharmacy_id)
                                  if (!mobileShowMap) setMobileShowMap(true)
                                }}
                                className="h-7 px-2.5 text-[11px] font-bold rounded-lg transition-all"
                              >
                                <MapIcon className="size-3 mr-1" />
                                {isTargeted ? "Selected on Map" : "Find on Map"}
                              </Button>
                            </div>
                          </div>

                          <div className="hidden sm:block text-right shrink-0 pl-4 border-l border-slate-100 min-w-[100px]">
                            <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">Price</span>
                            <p className="text-lg font-black text-slate-950 tracking-tight">
                              ₦{pharmacy.price_naira?.toLocaleString() ?? "—"}
                            </p>
                          </div>
                        </Card>
                      )
                    })}

                    {/* Partners Layout Panel */}
                    {searchResult.partner_results.map((partner, index) => {
                      const pId = `partner-${index}`
                      const isTargeted = activeMarkerId === pId
                      return (
                        <Card key={index} className={cn(
                          "p-4 flex items-center justify-between rounded-2xl border shadow-sm transition-all",
                          isTargeted ? "border-purple-500 ring-2 ring-purple-100 bg-purple-50/30" : "border-purple-100 bg-purple-50/15"
                        )}>
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-bold text-purple-950 text-base truncate">{partner.pharmacy_name}</h4>
                              <span className="bg-purple-100 text-purple-700 font-extrabold text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wide">Partner Channel</span>
                            </div>
                            <div className="flex items-center justify-between pr-2">
                              <p className="text-xs text-slate-500 font-medium">{partner.distance_km.toFixed(1)} km out</p>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setActiveMarkerId(pId)
                                  if (!mobileShowMap) setMobileShowMap(true)
                                }}
                                className="h-6 text-[10px] font-bold text-purple-700 hover:bg-purple-100/50 px-2"
                              >
                                <MapIcon className="size-2.5 mr-1" /> Map
                              </Button>
                            </div>
                          </div>
                          {partner.partner_url && (
                            <a href={partner.partner_url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-purple-100/50 rounded-xl transition-colors shrink-0">
                              <ChevronRight className="size-5 text-purple-600" />
                            </a>
                          )}
                        </Card>
                      )
                    })}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Sticky Large-Viewport Desktop Map Workspace */}
        {searchResult && (
          <div className="hidden lg:block lg:col-span-5 xl:col-span-6 relative">
            {/* top-32: Locks the map directly parallel to your search results, perfectly clearing the header.
              h-[calc(100vh-14rem)]: Calculates exactly how tall the map should be so it stops stretching before it hits the footer.
            */}
            <div className="sticky top-32 z-10 w-full h-[calc(100vh-14rem)] min-h-[480px] rounded-3xl overflow-hidden border border-slate-200/60 shadow-sm bg-slate-50">
              <MapView 
                markers={compositeMapMarkers} 
                activeId={activeMarkerId}
                onMarkerClick={(id) => setActiveMarkerId(id)}
                className="h-full w-full"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}