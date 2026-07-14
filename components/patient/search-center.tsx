"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ShieldCheck, ArrowRight } from "lucide-react"

export function CommandCenter() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [nafdacCode, setNafdacCode] = useState("")

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/verify?tab=search&q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const onVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (nafdacCode.trim()) {
      router.push(`/verify?tab=nafdac&code=${encodeURIComponent(nafdacCode.trim().toUpperCase())}`)
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-white/60 p-2 rounded-[2rem] border border-white/20 shadow-xl backdrop-blur-2xl">
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-100 rounded-[1.5rem] p-1 mb-2">
          <TabsTrigger value="search" className="rounded-xl data-[state=active]:bg-white font-medium">
            <Search className="mr-2 h-4 w-4" /> Locate Drug
          </TabsTrigger>
          <TabsTrigger value="verify" className="rounded-xl data-[state=active]:bg-white font-medium">
            <ShieldCheck className="mr-2 h-4 w-4" /> Verify Drug
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="search" className="mt-0">
          <form onSubmit={onSearchSubmit} className="flex items-center bg-white rounded-[1.5rem] shadow-inner border border-slate-100 p-1">
            <Input 
              className="h-14 border-none bg-transparent focus-visible:ring-0 text-base placeholder:text-slate-400" 
              placeholder="Search by drug name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" className="rounded-[1.2rem] h-12 w-12 p-0 shrink-0">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="verify" className="mt-0">
          <form onSubmit={onVerifySubmit} className="flex items-center bg-white rounded-[1.5rem] shadow-inner border border-slate-100 p-1">
            <Input 
              className="h-14 border-none bg-transparent focus-visible:ring-0 text-base placeholder:text-slate-400" 
              placeholder="Enter NAFDAC registration number..." 
              value={nafdacCode}
              onChange={(e) => setNafdacCode(e.target.value)}
            />
            <Button type="submit" className="rounded-[1.2rem] h-12 w-12 p-0 shrink-0 bg-slate-900 hover:bg-slate-800">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}