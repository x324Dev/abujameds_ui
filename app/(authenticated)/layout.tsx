// "use client"

// import { useState } from "react"
// import Link from "next/link"
// import { usePathname } from "next/navigation"
// import { 
//   LayoutDashboard, 
//   Package, 
//   RefreshCw, 
//   ClipboardList, 
//   User, 
//   Building2, 
//   ShieldCheck, 
//   LogOut, 
//   Menu, 
//   X,
//   Stethoscope,
//   Activity
// } from "lucide-react"
// import { useAuth } from "@/hooks/use-auth"
// import { Button } from "@/components/ui/button"
// import { cn } from "@/lib/utils"
// import { config } from "@/lib/api/config"

// // Sidebar configuration schema mapped directly by user role matrix
// const SIDEBAR_LINKS = {
//   patient: [
//     { label: "My Profile", href: "/account", icon: User },
//     { label: "Verify Medicine", href: "/verify", icon: ShieldCheck },
//     { label: "Find Hospitals", href: "/hospitals", icon: Stethoscope },
//   ],
//   pharmacy_admin: [
//     { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
//     { label: "Inventory State", href: "/dashboard/inventory", icon: Package },
//     { label: "Drug Reservations", href: "/dashboard/reservations", icon: ClipboardList },
//     { label: "Predictive Restock", href: "/dashboard/restock", icon: RefreshCw },
//   ],
//   institutional: [
//     { label: "Facility Matrix", href: "/institutional", icon: Building2 },
//     { label: "Compliance Audits", href: "/institutional/compliance", icon: ShieldCheck },
//     { label: "Verification Logs", href: "/institutional/logs", icon: Activity },
//   ],
//   superadmin: [
//     { label: "System Control", href: "/institutional", icon: LayoutDashboard },
//     { label: "Facilities Control", href: "/institutional/facilities", icon: Building2 },
//     { label: "Global Auditing", href: "/institutional/compliance", icon: ShieldCheck },
//   ]
// } as const

// export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
//   const { user, logout, isLoading } = useAuth()
//   const pathname = usePathname()
//   const [sidebarOpen, setSidebarOpen] = useState(false)

//   // Fallback to patient configuration if session is still populating or bypassed
//   const userRole = (user?.role as keyof typeof SIDEBAR_LINKS) || "patient"
//   const currentNavigation = SIDEBAR_LINKS[userRole] || SIDEBAR_LINKS.patient

//   if (isLoading) {
//     return (
//       <div className="flex h-screen w-screen items-center justify-center bg-background">
//         <Loader2 className="h-6 w-6 animate-spin text-primary" />
//       </div>
//     )
//   }

//   return (
//     <div className="flex min-h-screen bg-muted/20">
//       {/* Mobile Sidebar Toggle Header Overlay */}
//       <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-4 md:hidden">
//         <span className="font-bold tracking-tight text-primary text-sm">{config.appName}</span>
//         <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
//           {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
//         </Button>
//       </div>

//       {/* Primary Workspace Sidebar Navigation Canvas */}
//       <aside className={cn(
//         "fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-border bg-card px-4 py-6 transition-transform duration-200 md:translate-x-0",
//         sidebarOpen ? "translate-x-0" : "-translate-x-full",
//         "max-md:top-14"
//       )}>
//         <div className="mb-6 max-md:hidden">
//           <span className="font-black text-lg tracking-tight text-primary">{config.appName}</span>
//           <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5 font-semibold">
//             {userRole.replace("_", " ")} Workspace
//           </p>
//         </div>

//         <nav className="flex-1 space-y-1" aria-label="Sidebar Navigation">
//           {currentNavigation.map((link) => {
//             const isActive = pathname === link.href
//             return (
//               <Link
//                 key={link.href}
//                 href={link.href}
//                 onClick={() => setSidebarOpen(false)}
//                 className={cn(
//                   "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
//                   isActive 
//                     ? "bg-primary text-primary-foreground shadow-sm" 
//                     : "text-muted-foreground hover:bg-muted hover:text-foreground"
//                 )}
//               >
//                 <link.icon className="h-4 w-4 shrink-0" />
//                 <span>{link.label}</span>
//               </Link>
//             )
//           })}
//         </nav>

//         <div className="mt-auto border-t border-border pt-4">
//           <div className="flex items-center gap-3 px-3 py-2 mb-2">
//             <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
//               {user?.username?.slice(0, 2) || "AM"}
//             </div>
//             <div className="min-w-0 flex-1">
//               <p className="truncate text-xs font-semibold text-foreground">{user?.username || "Operator"}</p>
//               <p className="truncate text-[10px] text-muted-foreground">{user?.email}</p>
//             </div>
//           </div>
//           <Button 
//             variant="ghost" 
//             size="sm" 
//             className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
//             onClick={() => logout()}
//           >
//             <LogOut className="h-4 w-4" />
//             <span>Sign out</span>
//           </Button>
//         </div>
//       </aside>

//       {/* Primary Dynamic Dashboard Content Frame Viewport */}
//       <main className="flex-1 md:pl-64 max-md:pt-14 animate-in fade-in duration-200">
//         <div className="p-6 md:p-8">
//           {children}
//         </div>
//       </main>
//     </div>
//   )
// }

// function Loader2({ className }: { className?: string }) {
//   return <RefreshCw className={cn("animate-spin", className)} />
// }

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Package, 
  RefreshCw, 
  ClipboardList, 
  User, 
  Building2, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X,
  Stethoscope,
  Activity
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { config } from "@/lib/api/config"

const SIDEBAR_LINKS = {
  patient: [
    { label: "My Profile", href: "/account", icon: User },
    { label: "Verify Medicine", href: "/verify", icon: ShieldCheck },
    { label: "Find Hospitals", href: "/hospitals", icon: Stethoscope },
  ],
  pharmacy_admin: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Inventory State", href: "/dashboard/inventory", icon: Package },
    { label: "Drug Reservations", href: "/dashboard/reservations", icon: ClipboardList },
    { label: "Predictive Restock", href: "/dashboard/restock", icon: RefreshCw },
  ],
  institutional: [
    { label: "Facility Matrix", href: "/institutional", icon: Building2 },
    { label: "Compliance Audits", href: "/institutional/compliance", icon: ShieldCheck },
    { label: "Verification Logs", href: "/institutional/logs", icon: Activity },
  ],
  superadmin: [
    { label: "System Control", href: "/institutional", icon: LayoutDashboard },
    { label: "Facilities Control", href: "/institutional/facilities", icon: Building2 },
    { label: "Global Auditing", href: "/institutional/compliance", icon: ShieldCheck },
  ]
} as const

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Prevent scroll lock when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = "auto"
    return () => { document.body.style.overflow = "auto" }
  }, [sidebarOpen])

  const userRole = (user?.role as keyof typeof SIDEBAR_LINKS) || "patient"
  const currentNavigation = SIDEBAR_LINKS[userRole] || SIDEBAR_LINKS.patient

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <>
      {/* 1. Flexbox Parent Wrapper */}
      <div className="min-h-screen bg-slate-50/50 selection:bg-indigo-100 selection:text-indigo-900 flex flex-col md:flex-row md:items-start">
      
      {/* Mobile Navbar Overlay (Hidden on Desktop) */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-slate-200/60 bg-white/80 backdrop-blur-md px-4 md:hidden shadow-sm">
        <span className="font-extrabold tracking-tight text-slate-900 text-lg">{config.appName}</span>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-full">
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Backdrop Blocker */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 2. The Workspace Sidebar Island */}
     <aside className={cn(
        "flex flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        
        // Mobile Drawer Styles (CRITICAL: Removed md:hidden entirely)
        "fixed inset-y-0 left-0 z-40 w-[280px] bg-white shadow-2xl",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        
        // Desktop Island Styles (Sticky layout takes over here and resets translate)
        "md:sticky md:translate-x-0 md:top-[96px] md:z-10 md:ml-6 md:w-64 md:h-[calc(100vh-120px)]",
        "md:rounded-3xl md:border md:border-slate-200/60 md:bg-white/80 md:backdrop-blur-2xl md:shadow-sm md:overflow-hidden"
      )}>
        
        <div className="px-6 py-6 max-md:pt-8 shrink-0">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Dashboard</p>
          <span className="font-black text-xl tracking-tight text-slate-900 capitalize">
            {userRole.replace("_", " ")}
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3 overflow-y-auto scrollbar-hide" aria-label="Sidebar Navigation">
          {currentNavigation.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                  isActive 
                    ? "bg-indigo-50/80 text-indigo-700 shadow-sm ring-1 ring-indigo-100/50" 
                    : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-indigo-600" />
                )}
                <link.icon className={cn(
                  "size-4.5 transition-colors", 
                  isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                )} />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="mt-auto p-4 shrink-0">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase shadow-inner">
                {user?.display_name?.slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">{user?.display_name}</p>
                <p className="truncate text-[10px] font-medium text-slate-500">{user?.email}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full h-8 justify-start gap-2 rounded-xl text-rose-600 hover:bg-rose-100 hover:text-rose-700"
              onClick={() => logout()}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="text-xs font-bold">Logout</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* 3. Main Content App Canvas */}
      <main className={cn(
        "flex-1 min-w-0 w-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "max-md:pt-16",
        // Desktop padding: Flex natively handles the left spacing now.
        "md:pt-[96px] md:pr-6 md:pb-6 md:pl-6"
      )}>
        <div className="min-h-[calc(100vh-120px)] w-full rounded-3xl bg-white border border-slate-200/60 shadow-sm p-4 sm:p-8 animate-in fade-in zoom-in-95 duration-500">
          {children}
        </div>
      </main>
    </div>
    </>
  )
}

function Loader2({ className }: { className?: string }) {
  return <RefreshCw className={cn("animate-spin", className)} />
}