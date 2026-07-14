"use client"

import { useState, useEffect } from 'react';

const ABUJA_COORDS = { lat: 9.0765, lng: 7.3986 };

export function useLocation() {
  const [location, setLocation] = useState(ABUJA_COORDS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLoading(false);
        },
        () => {
          console.warn("Location permission denied, using default Abuja coordinates.");
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  return { ...location, loading };
}