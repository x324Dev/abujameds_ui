// @/components/facilities/specialization-selector.tsx
"use client"

interface SpecializationSelectorProps {
  selected?: string               // Add this to accept the current state string
  onSelect: (spec: string) => void
}

export function SpecializationSelector({ selected, onSelect }: SpecializationSelectorProps) {
  const specializations = ["Pediatrics", "Cardiology", "Dermatology", "Gynaecology"] // example entries

  return (
    <div className="flex flex-wrap gap-2">
      {specializations.map((spec) => {
        const isActive = selected === spec
        return (
          <button
            key={spec}
            type="button"
            onClick={() => onSelect(isActive ? "" : spec)} // Toggle off if clicked again
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              isActive 
                ? "bg-primary text-primary-foreground border-primary" 
                : "bg-background text-foreground hover:bg-muted"
            }`}
          >
            {spec}
          </button>
        )
      })}
    </div>
  )
}