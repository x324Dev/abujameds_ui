// "use client"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { useAuth } from "@/hooks/use-auth"
// import { Card } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Button } from "@/components/ui/button"

// export default function LoginPage() {
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const { login } = useAuth()
//   const router = useRouter()

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault()
//     try {
//       // Adjust parameters to match your specific useAuth signature
//       await login(email, password)
//       router.push("/dashboard")
//     } catch (err) {
//       console.error("Login failed", err)
//     }
//   }

//   return (
//     <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
//       <Card className="w-full max-w-sm p-6">
//         <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//           <div className="space-y-1">
//             <h1 className="text-xl font-bold tracking-tight">Welcome back</h1>
//             <p className="text-sm text-muted-foreground">Sign in to your AbujaMeds account</p>
//           </div>
//           <div className="space-y-1.5">
//             <Label htmlFor="email">Email address</Label>
//             <Input
//               id="email"
//               type="email"
//               required
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//           </div>
//           <div className="space-y-1.5">
//             <Label htmlFor="password">Password</Label>
//             <Input
//               id="password"
//               type="password"
//               required
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//           </div>
//           <Button type="submit" className="w-full mt-2">
//             Sign In
//           </Button>
//         </form>
//       </Card>
//     </div>
//   )
// }

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Trigger loading state immediately upon submission
    setIsLoading(true)
    
    try {
      await login(email, password)
      router.push("/dashboard")
    } catch (err) {
      console.error("Login failed", err)
      // Optional: Add a toast notification here to surface the error to the user
    } finally {
      // Ensure the spinner stops whether the request succeeds or fails
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <Card className="w-full max-w-sm p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your AbujaMeds account</p>
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading} // Lock input during submission
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading} // Lock input during submission
            />
          </div>
          
          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </Card>
    </div>
  )
}