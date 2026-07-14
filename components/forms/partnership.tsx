'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { poster } from '@/lib/fetcher'
import { toast } from 'sonner'

interface PartnershipFormProps {
  onSuccess?: () => void
}

export function PartnershipForm({ onSuccess }: PartnershipFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Explicitly enforcing snake_case field definitions to match the database schemas
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      pharmacy_name: '',
      pcn_license_number: '',
      contact_name: '',
      email: '',
      phone_number: '',
      physical_address: '',
    }
  })

  async function onSubmit(data: any) {
    setIsSubmitting(true)
    try {
      await poster('/api/v1/partners/apply', data)
      setIsSuccess(true)
      toast.success('Partnership application submitted successfully!')
      
      setTimeout(() => {
        reset()
        if (onSuccess) onSuccess()
      }, 2000)
    } catch (error) {
      toast.error('Submission failed. Please verify your PCN credentials and retry.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
        <CheckCircle className="size-12 text-emerald-500 mb-3" />
        <h3 className="text-lg font-bold text-foreground">Application Received</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Our team is validating your regulatory status with the Pharmacists Council of Nigeria. We will reach out via email shortly.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-3 text-left">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="pharmacy_name">Pharmacy Premises Name</Label>
          <Input 
            id="pharmacy_name" 
            placeholder="e.g., Abuja Central Pharmacy" 
            {...register('pharmacy_name', { required: true })} 
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pcn_license_number">PCN License Number</Label>
          <Input 
            id="pcn_license_number" 
            placeholder="e.g., RPH/XXXX/XX" 
            {...register('pcn_license_number', { required: true })} 
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact_name">Superintendent Pharmacist / Contact Name</Label>
        <Input 
          id="contact_name" 
          placeholder="Full Name" 
          {...register('contact_name', { required: true })} 
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Official Email Address</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="pharmacy@domain.com" 
            {...register('email', { required: true })} 
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone_number">Contact Phone Number</Label>
          <Input 
            id="phone_number" 
            type="tel" 
            placeholder="+234..." 
            {...register('phone_number', { required: true })} 
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="physical_address">Full Physical Address</Label>
        <Input 
          id="physical_address" 
          placeholder="Suite, Street Address, Area Council, Abuja" 
          {...register('physical_address', { required: true })} 
        />
      </div>

      <div className="pt-2">
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin mr-2" />}
          Submit Verification Application
        </Button>
      </div>
    </form>
  )
}