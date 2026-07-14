// 'use client'

// import Link from 'next/link'
// import {
//   LayoutDashboard, 
//   LogOut, 
//   ShieldCheck, 
//   Stethoscope, 
//   User2, 
//   AlertTriangle 
// } from 'lucide-react'
// import { Logo } from '@/components/brand/logo'
// import { Button } from '@/components/ui/button' // Your Base UI Button
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuGroup,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu'
// import { useAuth } from '@/hooks/use-auth'

// const NAV = [
//   { label: 'Verify Drug', href: '/verify', icon: ShieldCheck },
//   { label: 'Find Hospitals', href: '/hospitals', icon: Stethoscope },
// ]

// export function SiteHeader() {
//   const { user, isAuthenticated, logout } = useAuth()

//   const dashboardHref =
//     user?.role === 'pharmacy_admin'
//       ? '/dashboard'
//       : user?.role === 'institutional' || user?.role === 'superadmin'
//         ? '/institutional'
//         : '/account'

//   return (
//     <header className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-7xl px-4">
//       {/* Floating Container */}
//       <div className="flex h-16 items-center justify-between px-6 rounded-full bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_4px_20px_rgb(0,0,0,0.05)]">
        
//         {/* Left: Logo */}
//         <div className="flex-shrink-0">
//           <Logo />
//         </div>
        
//         {/* Center: Navigation */}
//         <nav className="hidden md:flex items-center gap-1" aria-label="Primary Navigation">
//           {NAV.map((item) => (
//             <Button
//               key={item.href}
//               variant="ghost"
//               size="sm"
//               className="rounded-full px-4 font-medium text-slate-600 hover:text-emerald-600"
//               render={<Link href={item.href} />}
//             >
//               <item.icon className="mr-2 size-4" aria-hidden="true" />
//               {item.label}
//             </Button>
//           ))}
          
//           {/* Medical Emergency Button */}
//           <Button 
//             variant="ghost" 
//             size="sm" 
//             className="rounded-full px-4 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold" 
//             render={<Link href="/emergency" />}
//           >
//             <AlertTriangle className="mr-2 size-4 animate-pulse" aria-hidden="true" /> 
//             Medical Emergency
//           </Button>
//         </nav>
        
//         {/* Right: Auth / User */}
//         <div className="flex items-center">
//           {isAuthenticated ? (
//             <DropdownMenu>
//               {/* Keep asChild here: DropdownMenuTrigger is a Radix component, not Base UI */}
//               <DropdownMenuTrigger>
//                 <Button variant="outline" size="sm" className="rounded-full gap-2 pl-2 pr-4">
//                   <div className="flex size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
//                     <User2 className="size-3.5" />
//                   </div>
//                   <span className="max-w-24 truncate">
//                     {user?.username ? user.username.split(' ')[0] : 'Account'}
//                   </span>
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2">
//                 <DropdownMenuGroup>
//                   <DropdownMenuLabel className="truncate font-medium text-xs text-slate-500">
//                     {user?.username || 'Signed In'}
//                   </DropdownMenuLabel>
//                   <DropdownMenuSeparator className="my-1" />
                  
//                   {/* MenuItem is usually Radix, keep asChild if using shadcn patterns */}
//                   <DropdownMenuItem>
//                     <Link href={dashboardHref} className="w-full flex items-center gap-2 cursor-pointer">
//                       <LayoutDashboard className="size-4 text-slate-500" />
//                       <span>{user?.role === 'patient' ? 'My Account' : 'Dashboard'}</span>
//                     </Link>
//                   </DropdownMenuItem>
                  
//                   <DropdownMenuSeparator className="my-1" />
                  
//                   <DropdownMenuItem 
//                     onClick={() => logout()} 
//                     className="gap-2 text-rose-600 focus:bg-rose-50 focus:text-rose-700 cursor-pointer"
//                   >
//                     <LogOut className="size-4" />
//                     <span>Sign out</span>
//                   </DropdownMenuItem>
//                 </DropdownMenuGroup>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           ) : (
//             <Button 
//               size="sm" 
//               className="bg-slate-900 text-white px-5" 
//               render={<Link href="/login" />}
//             >
//               Sign in
//             </Button>
//           )}
//         </div>
//       </div>
//     </header>
//   )
// }

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard, 
  LogOut, 
  ShieldCheck, 
  Stethoscope, 
  User2, 
  AlertTriangle 
} from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Verify Drug', href: '/verify', icon: ShieldCheck },
  { label: 'Find Hospitals', href: '/hospitals', icon: Stethoscope },
]

export function SiteHeader() {
  const { user, isAuthenticated, logout } = useAuth()
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Keep it fixed at the very top of the page
      if (currentScrollY > 40) {
        if (currentScrollY > lastScrollY.current) {
          // Scrolling down -> hide header
          setIsVisible(false)
        } else {
          // Scrolling up -> show header
          setIsVisible(true)
        }
      } else {
        setIsVisible(true)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const dashboardHref =
    user?.role === 'pharmacy_admin'
      ? '/dashboard'
      : user?.role === 'institutional' || user?.role === 'superadmin'
        ? '/institutional'
        : '/account'

  return (
    <header 
      className={cn(
        "fixed top-4 left-0 right-0 z-50 mx-auto max-w-7xl px-4 transition-all duration-300 ease-in-out transform",
        isVisible 
          ? "translate-y-0 opacity-100 pointer-events-auto" 
          : "-translate-y-24 opacity-0 pointer-events-none"
      )}
    >
      {/* Floating Container */}
      <div className="flex h-16 items-center justify-between px-6 rounded-full bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_4px_20px_rgb(0,0,0,0.05)]">
        
        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <Logo />
        </div>
        
        {/* Center: Navigation */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Primary Navigation">
          {NAV.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              className="rounded-full px-4 font-medium text-slate-600 hover:text-emerald-600"
              render={<Link href={item.href} />}
            >
              <item.icon className="mr-2 size-4" aria-hidden="true" />
              {item.label}
            </Button>
          ))}
          
          {/* Medical Emergency Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-full px-4 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold" 
            render={<Link href="/emergency" />}
          >
            <AlertTriangle className="mr-2 size-4 animate-pulse" aria-hidden="true" /> 
            Medical Emergency
          </Button>
        </nav>
        
        {/* Right: Auth / User */}
        <div className="flex items-center">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" size="sm" className="rounded-full gap-2 pl-2 pr-4">
                  <div className="flex size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <User2 className="size-3.5" />
                  </div>
                  <span className="max-w-24 truncate">
                    {user?.username ? user.username.split(' ')[0] : 'Account'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="truncate font-medium text-xs text-slate-500">
                    {user?.username || 'Signed In'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1" />
                  
                  <DropdownMenuItem>
                    <Link href={dashboardHref} className="w-full flex items-center gap-2 cursor-pointer">
                      <LayoutDashboard className="size-4 text-slate-500" />
                      <span>{user?.role === 'patient' ? 'My Account' : 'Dashboard'}</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="my-1" />
                  
                  <DropdownMenuItem 
                    onClick={() => logout()} 
                    className="gap-2 text-rose-600 focus:bg-rose-50 focus:text-rose-700 cursor-pointer"
                  >
                    <LogOut className="size-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              size="sm" 
              className="bg-slate-900 text-white px-5" 
              render={<Link href="/login" />}
            >
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}