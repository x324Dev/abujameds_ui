// app/facilities/search/page.tsx
'use client'

import { useState } from 'react';
import { useFacilitySearch } from '@/hooks/api';
import { Input } from '@/components/ui/input';

export default function FacilitySearchPage() {
  const [query, setQuery] = useState('');
  const { data, isLoading } = useFacilitySearch(query);
  const results = Array.isArray(data) ? data : [];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Search Facilities</h1>
      
      <Input 
        placeholder="Search hospitals, pharmacies, clinics..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-6"
      />

      {isLoading && <p>Searching...</p>}
      
      <div className="grid gap-3">
        {results.map((f: any) => (
          <div key={f.id} className="p-4 border rounded-xl hover:shadow-sm transition-shadow">
            <h3 className="font-semibold">{f.name}</h3>
            <p className="text-sm text-muted-foreground">{f.address}</p>
          </div>
        ))}
      </div>
    </div>
  );
}