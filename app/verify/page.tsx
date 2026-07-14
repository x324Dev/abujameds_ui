// import { SiteHeader } from "@/components/patient/site-header"
// import { SiteFooter } from "@/components/patient/site-footer"
// import { VerifyClient } from "@/components/patient/verify-client"

// export const metadata = {
//   title: "Verify Medicine — AbujaMeds",
//   description: "Confirm your medicine is genuine and NAFDAC-registered before you use it.",
// }

// export default function VerifyPage() {
//   return (
//     <div className="flex min-h-dvh flex-col">
//       <main className="flex-1 bg-muted/30">
//         <VerifyClient />
//       </main>
//     </div>
//   )
// }

import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { VerifyClient } from "@/components/patient/verify-client" // Adjust path if necessary

export default function VerifyPage() {
  return (
    // The Suspense boundary catches the useSearchParams() bailout and renders 
    // the fallback spinner during SSR/Static Generation.
    <Suspense 
      fallback={
        <div className="flex min-h-[60vh] w-full items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <Loader2 className="size-8 animate-spin text-indigo-600" />
            <p className="text-sm font-medium animate-pulse">Initializing Verification Engine...</p>
          </div>
        </div>
      }
    >
      <VerifyClient />
    </Suspense>
  )
}