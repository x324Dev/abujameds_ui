"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Loader2, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Card } from "@/components/ui/card"

export default function LogoutPage() {
  const { logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const hasCalledLogout = useRef(false)

  useEffect(() => {
    // Prevent double-activation during React StrictMode development cycles
    if (hasCalledLogout.current) return
    hasCalledLogout.current = true

    async function performLogout() {
      try {
        await logout()
      } catch (err) {
        console.error("Error during session teardown:", err)
      } finally {
        // Smoothly send them back to the main discovery channel
        router.replace("/")
      }
    }

    performLogout()
  }, [logout, router])

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-sm p-6 text-center shadow-sm border-border">
        <div className="flex flex-col items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive animate-pulse">
            <LogOut className="h-5 w-5" />
          </span>
          <div className="space-y-1">
            <h1 className="text-lg font-semibold text-foreground">Signing you out</h1>
            <p className="text-sm text-muted-foreground text-pretty">
              Securely clearing your session data and inventory state...
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary font-medium mt-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Please wait</span>
          </div>
        </div>
      </Card>
    </div>
  )
}