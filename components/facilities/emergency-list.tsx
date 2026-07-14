// components/facilities/emergency-list.tsx
'use client'

import { useEmergencyFacilities } from '@/hooks/api';
import { Skeleton } from '@/components/ui/skeleton';

export function EmergencyFacilitiesList() {
  // Automatically includes lat/lng from useLocation
  const { data, isLoading, error } = useEmergencyFacilities();

  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (error || !data) return <div>Failed to load emergency facilities.</div>;

  return (
    <div className="grid gap-4">
      <h2 className="text-xl font-semibold">24-Hour Facilities Near You</h2>
      {(Array.isArray(data) ? data : []).map((facility: any) => (
        <div key={facility.id} className="p-4 border rounded-xl bg-card">
          <h3 className="font-bold">{facility.name}</h3>
          <p className="text-sm text-muted-foreground">{facility.address}</p>
          <span className="text-xs text-primary font-medium">
            {facility.distance_km.toFixed(1)} km away
          </span>
        </div>
      ))}
    </div>
  );
}