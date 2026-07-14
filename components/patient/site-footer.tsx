"use client"

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { PharmacyOnboardingForm } from "@/components/forms/pharmacy"
import { useState } from "react"
import { Button } from "../ui/button"

export function SiteFooter() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <footer className="border-t py-6 px-4">
      <div className="flex flex-col gap-4 md:flex-row justify-between items-center">
        <p className="text-sm text-muted-foreground">© 2026 AbujaMeds. All rights reserved.</p>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger nativeButton={true}
            render={
              <Button 
                variant="outline" 
                size="sm" 
                className="w-fit text-xs font-medium border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary transition-colors"
              />
            }
          >
            Become a Partner Pharmacy
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[540px]">
            <DialogHeader>
              <DialogTitle className="text-xl tracking-tight">Onboard your Pharmacy</DialogTitle>
              <DialogDescription className="text-xs">
                Connect your inventory tracking systems to the unified FCT live deployment network.
              </DialogDescription>
            </DialogHeader>
            
            <PharmacyOnboardingForm onSuccess={() => setIsOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </footer>
  )
}