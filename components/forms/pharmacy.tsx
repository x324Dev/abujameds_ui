"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export function PharmacyOnboardingForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(formData: any) {
    setLoading(true)
    setError(null)
    try {
      // POSTing directly to the registration router matching newAPI.md
      const res = await fetch("/api/v1/pharmacy/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || "Onboarding registration failed.")
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message || "Onboarding submission failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault()
        const data = new FormData(e.currentTarget)
        onSubmit(Object.fromEntries(data.entries()))
      }} 
      className="flex flex-col gap-4 py-4"
    >
      {/* Pharmacy Name */}
      <div className="grid gap-2">
        <Label htmlFor="name">Pharmacy Name</Label>
        <Input name="name" id="name" required placeholder="e.g. HealthBridge Pharmacy" />
      </div>

      {/* PCN License Number -> Maps directly to pcn_licence_number */}
      <div className="grid gap-2">
        <Label htmlFor="pcn_licence_number">PCN Licence Number</Label>
        <Input 
          name="pcn_licence_number" 
          id="pcn_licence_number" 
          required 
          placeholder="e.g. PCN-R-12345" 
        />
      </div>

      {/* Phone Contact */}
      <div className="grid gap-2">
        <Label htmlFor="phone">Official Telephone</Label>
        <Input 
          type="tel" 
          name="phone" 
          id="phone" 
          required 
          placeholder="e.g. +2348030000000" 
        />
      </div>

      {/* Physical Street Address */}
      <div className="grid gap-2">
        <Label htmlFor="address">Physical Street Address</Label>
        <Input name="address" id="address" required placeholder="e.g. 42 Aminu Kano Crescent, Wuse 2" />
      </div>

      {/* Area Council Selection -> Crucial for internal regional analytics query groupings */}
      <div className="grid gap-2">
        <Label htmlFor="area_council">Abuja Area Council</Label>
        <select
          name="area_council"
          id="area_council"
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select local area council...</option>
          <option value="AMAC">Abuja Municipal (AMAC)</option>
          <option value="Bwari">Bwari</option>
          <option value="Gwagwalada">Gwagwalada</option>
          <option value="Kuje">Kuje</option>
          <option value="Kwali">Kwali</option>
          <option value="Abaji">Abaji</option>
        </select>
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      
      <Button type="submit" disabled={loading} className="w-full h-11 mt-2">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Credentials...
          </>
        ) : (
          "Submit Onboarding Request"
        )}
      </Button>
    </form>
  )
}