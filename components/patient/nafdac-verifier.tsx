"use client"

import { useState, useEffect, useRef } from "react"
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Search, 
  Loader2, 
  ScanLine, 
  Camera, 
  VideoOff 
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Html5Qrcode } from "html5-qrcode"
import { toast } from "sonner"
import { poster } from "@/lib/fetcher"

const STATUS_MAP = {
  verified: {
    icon: ShieldCheck,
    title: "Genuine Product",
    tone: "text-emerald-600",
    bg: "bg-emerald-50/60 dark:bg-emerald-950/20",
    ring: "ring-emerald-200 dark:ring-emerald-900/40",
  },
  suspicious: {
    icon: ShieldAlert,
    title: "Suspicious — Verify Carefully",
    tone: "text-amber-600",
    bg: "bg-amber-50/60 dark:bg-amber-950/20",
    ring: "ring-amber-200 dark:ring-amber-900/40",
  },
  not_found: {
    icon: ShieldX,
    title: "Not Found in Registry",
    tone: "text-muted-foreground",
    bg: "bg-muted/40",
    ring: "ring-border",
  },
} as const

export function VerifyClient() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerId = "camera-scan-region"

  async function executeVerification(targetCode: string) {
    if (!targetCode.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      // Endpoint mapping cleanly to global authentication/verification routers
      const data = await poster("/api/v1/verify/barcode", { code: targetCode.trim() })
      setResult(data)
      
      if (data?.verdict === 'verified') {
        toast.success("Medication registry lookup successful!")
      } else if (data?.verdict === 'suspicious') {
        toast.warning("Verification alert raised for this serial code.")
      }
    } catch (err) {
      setError("Could not verify this code. Please check authentication status or retry.")
      toast.error("Registry lookup request failure.")
    } finally {
      setLoading(false)
    }
  }

  function onManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    executeVerification(code)
  }

  // Scanner hook logic setup 
  useEffect(() => {
    if (isScanning) {
      const html5Qrcode = new Html5Qrcode(scannerId)
      scannerRef.current = html5Qrcode

      html5Qrcode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setCode(decodedText)
          setIsScanning(false)
          executeVerification(decodedText)
        },
        () => {} // Silent parse frame failures
      ).catch(() => {
        toast.error("Failed to access camera interface.")
        setIsScanning(false)
      })
    }

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [isScanning])

  const status = result ? STATUS_MAP[result.verdict as keyof typeof STATUS_MAP] || STATUS_MAP.not_found : null
  const StatusIcon = status?.icon

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8">
      <div className="mb-6 text-left">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Verify Medication</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Scan the product barcode, serialization marker, or input its identifier to check NAFDAC registry validity.
        </p>
      </div>

      <Card className="p-4 border-border bg-card shadow-sm">
        <div className="space-y-4">
          {isScanning ? (
            <div className="relative overflow-hidden rounded-xl bg-black border border-border aspect-square max-h-[300px] mx-auto w-full">
              <div id={scannerId} className="w-full h-full" />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <ScanLine className="size-full text-primary/30 animate-pulse p-8" />
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                className="absolute bottom-3 right-3 gap-1.5"
                onClick={() => setIsScanning(false)}
              >
                <VideoOff className="size-4" /> Stop Camera
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full h-24 border-dashed border-2 flex flex-col gap-2 rounded-xl text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
              onClick={() => setIsScanning(true)}
            >
              <Camera className="size-6 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider">Use Video Scan Interface</span>
            </Button>
          )}

          <div className="relative flex items-center justify-center my-2">
            <span className="absolute inset-x-0 h-px bg-border" />
            <span className="relative bg-card px-3 text-xs font-medium uppercase text-muted-foreground tracking-widest">Or Entry</span>
          </div>

          <form onSubmit={onManualSubmit} className="space-y-3">
            <div className="space-y-1.5 text-left">
              <Label htmlFor="barcode-input" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Serial / Barcode Identifier</Label>
              <div className="flex gap-2">
                <Input
                  id="barcode-input"
                  placeholder="Enter code manually..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={loading}
                  className="bg-background border-border flex-1"
                />
                <Button type="submit" disabled={loading || !code.trim()} className="shrink-0">
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Card>

      {error && (
        <p className="mt-4 text-sm font-medium text-destructive text-left bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
          {error}
        </p>
      )}

      {/* FIXED: Updated Result Rendering targeting database layout contracts */}
      {result && status && StatusIcon ? (
        <Card className={cn("mt-4 p-6 ring-1 duration-300 border-transparent text-left", status.bg, status.ring)}>
          <div className="flex items-start gap-4">
            <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-card border shadow-sm", status.tone)}>
              <StatusIcon className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className={cn("text-lg font-bold tracking-tight", status.tone)}>{status.title}</h2>
              
              {/* Accessing corrected database string properties */}
              {result.drug?.generic_name || result.drug?.name ? (
                <p className="mt-1 font-semibold text-foreground text-base">
                  {result.drug.generic_name || result.drug.name}
                </p>
              ) : null}

              {result.drug?.brand_name && (
                <p className="text-xs font-medium text-muted-foreground">
                  Brand: {result.drug.brand_name} {result.drug.strength && `(${result.drug.strength})`}
                </p>
              )}
              
              {result.drug?.manufacturer ? (
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                  Manufactured by: {result.drug.manufacturer}
                </p>
              ) : null}
              
              <dl className="mt-4 pt-3 border-t border-muted grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <dt className="text-muted-foreground font-medium">NAFDAC Reg No.</dt>
                  <dd className="font-mono font-bold text-foreground mt-0.5">{result.nafdac_number || result.nafdacNumber || "N/A"}</dd>
                </div>
                {result.drug?.form && (
                  <div>
                    <dt className="text-muted-foreground font-medium">Dosage Form</dt>
                    <dd className="font-medium text-foreground mt-0.5 capitalize">{result.drug.form}</dd>
                  </div>
                )}
              </dl>
              
              {result.nafdac_check?.message ? (
                <div className="mt-4 rounded-lg bg-card/60 p-3 border text-xs text-foreground/80 leading-relaxed font-medium">
                  {result.nafdac_check.message}
                </div>
              ) : null}
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  )
}