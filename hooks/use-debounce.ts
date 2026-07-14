// hooks/use-debounce.ts
'use client'

import { useState, useEffect } from 'react'

/**
 * A hook to delay updating a value until a specified timeout has elapsed.
 * Perfect for preventing API spamming during rapid search inputs.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set a timer to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clear the timeout if the value changes before the delay finishes
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}