"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  Search, 
  ShieldCheck, 
  ArrowRight, 
  Command, 
  MapPin, 
  Sparkles, 
  HelpCircle 
} from "lucide-react"

export function CommandCenter() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"search" | "verify">("search")
  const [searchQuery, setSearchQuery] = useState("")
  const [nafdacCode, setNafdacCode] = useState("")
  
  const searchInputRef = useRef<HTMLInputElement>(null)
  const verifyInputRef = useRef<HTMLInputElement>(null)

  // Listen for ⌘K or / to instantly focus active input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k" || e.key === "/") {
        e.preventDefault()
        if (activeTab === "search") {
          searchInputRef.current?.focus()
        } else {
          verifyInputRef.current?.focus()
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeTab])

  const onSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/verify?tab=search&q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const onVerifySubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (nafdacCode.trim()) {
      router.push(`/verify?tab=nafdac&code=${encodeURIComponent(nafdacCode.trim().toUpperCase())}`)
    }
  }

  // Handle clicking quick tags
  const handleTagClick = (val: string) => {
    if (activeTab === "search") {
      setSearchQuery(val)
      // Small timeout to allow state to sync before routing
      setTimeout(() => router.push(`/verify?tab=search&q=${encodeURIComponent(val)}`), 50)
    } else {
      setNafdacCode(val)
      setTimeout(() => router.push(`/verify?tab=nafdac&code=${encodeURIComponent(val)}`), 50)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Immersive Glassmorphic Shell */}
      <div 
        className={cn(
          "w-full bg-white/70 p-3 rounded-[2.25rem] border backdrop-blur-2xl transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.04)]",
          activeTab === "search" 
            ? "border-emerald-500/20 shadow-emerald-500/[0.02] focus-within:ring-4 focus-within:ring-emerald-500/5" 
            : "border-indigo-500/20 shadow-indigo-500/[0.02] focus-within:ring-4 focus-within:ring-indigo-500/5"
        )}
      >
        <Tabs 
          defaultValue="search" 
          value={activeTab} 
          onValueChange={(val) => setActiveTab(val as "search" | "verify")} 
          className="w-full"
        >
          {/* Segmented Controller */}
          <TabsList className="grid w-full grid-cols-2 bg-slate-100/80 rounded-[1.75rem] p-1.5 mb-3">
            <TabsTrigger 
              value="search" 
              className="rounded-[1.25rem] py-3 text-sm font-bold tracking-tight transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
            >
              <Search className="mr-2 h-4 w-4 stroke-[2.5]" /> Locate Medicine
            </TabsTrigger>
            <TabsTrigger 
              value="verify" 
              className="rounded-[1.25rem] py-3 text-sm font-bold tracking-tight transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
            >
              <ShieldCheck className="mr-2 h-4 w-4 stroke-[2.5]" /> Verify Authenticity
            </TabsTrigger>
          </TabsList>
          
          {/* Find Tab Panel */}
          <TabsContent value="search" className="mt-0 focus-visible:ring-0">
            <form onSubmit={onSearchSubmit} className="group flex items-center bg-white rounded-[1.75rem] border border-slate-100 shadow-sm p-1.5 transition-all duration-200 focus-within:border-emerald-200">
              <div className="flex items-center pl-4 text-slate-400">
                <MapPin className="h-5 w-5 stroke-[2] group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <Input 
                ref={searchInputRef}
                className="h-14 border-none bg-transparent focus-visible:ring-0 text-base font-medium placeholder:text-slate-400 text-slate-800" 
                placeholder="Enter drug generic name (e.g., Artemether)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                className="rounded-[1.35rem] h-13 px-6 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all duration-200 hover:shadow-lg hover:shadow-emerald-600/10 active:scale-95 flex items-center gap-2"
              >
                <span>Find</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </Button>
            </form>
          </TabsContent>

          {/* Verify Tab Panel */}
          <TabsContent value="verify" className="mt-0 focus-visible:ring-0">
            <form onSubmit={onVerifySubmit} className="group flex items-center bg-white rounded-[1.75rem] border border-slate-100 shadow-sm p-1.5 transition-all duration-200 focus-within:border-indigo-200">
              <div className="flex items-center pl-4 text-slate-400">
                <ShieldCheck className="h-5 w-5 stroke-[2] group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <Input 
                ref={verifyInputRef}
                className="h-14 border-none bg-transparent focus-visible:ring-0 text-base font-semibold tracking-wide placeholder:text-slate-400 text-slate-800 placeholder:font-normal uppercase" 
                placeholder="Enter NAFDAC Reg Number (e.g., A4-1845)..." 
                value={nafdacCode}
                onChange={(e) => setNafdacCode(e.target.value)}
              />
              <Button 
                type="submit" 
                className="rounded-[1.35rem] h-13 px-6 shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all duration-200 hover:shadow-lg hover:shadow-indigo-600/10 active:scale-95 flex items-center gap-2"
              >
                <span>Verify</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dynamic Inline Quick-Tags & Helpers */}
      <div className="flex flex-wrap items-center justify-between px-6 gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-medium">Quick examples:</span>
          {activeTab === "search" ? (
            <>
              {["Coartem", "Amoxicillin", "Insulin"].map((drug) => (
                <button
                  key={drug}
                  onClick={() => handleTagClick(drug)}
                  className="bg-slate-50 border border-slate-200/60 text-slate-600 font-semibold px-2.5 py-1 rounded-full hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all cursor-pointer"
                >
                  {drug}
                </button>
              ))}
            </>
          ) : (
            <>
              {["A4-1845", "B4-0241", "04-9876"].map((code) => (
                <button
                  key={code}
                  onClick={() => handleTagClick(code)}
                  className="bg-slate-50 border border-slate-200/60 text-slate-600 font-semibold px-2.5 py-1 rounded-full hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all cursor-pointer"
                >
                  {code}
                </button>
              ))}
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 font-medium">
          {activeTab === "search" ? (
            <>
              <Sparkles className="size-3.5 text-emerald-500 animate-pulse" />
              <span>Real-time stock in FCT</span>
            </>
          ) : (
            <>
              <HelpCircle className="size-3.5 text-indigo-500" />
              <span>Validate NAFDAC clearance instantly</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}