'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { PartnershipForm } from '../forms/partnership' // Adjust path as needed
import { Handshake } from 'lucide-react'

export function BecomePartnerButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Button variant="default" className="gap-2 shrink-0 font-medium shadow-sm">
          <Handshake className="size-4" />
          <span>Become a Partner</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-lg border-border bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-bold tracking-tight">
            Partner with Our Registry
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Submit your retail pharmacy or wholesale facility credentials to link your live inventory telemetry to patients across Abuja.
          </DialogDescription>
        </DialogHeader>

        {/* Passing close control down so the form can dismiss the modal on success */}
        <PartnershipForm onSuccess={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}