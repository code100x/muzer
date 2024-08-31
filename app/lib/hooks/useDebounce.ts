import { useState, useEffect, useCallback } from 'react'
import { YT_REGEX } from '../utils'

export function useDebounce<T>(value: T, delay: number): boolean {
  const [debouncedValue, setDebouncedValue] = useState<boolean>(false)

  const validateInput = useCallback((input: T): boolean => {
    if (typeof input === 'string') {
      return !!(input && input.match(YT_REGEX))
    }
    return false
  }, [])

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(validateInput(value))
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay, validateInput])

  return debouncedValue
}