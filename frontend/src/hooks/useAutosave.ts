'use client'

import { useEffect, useRef, useCallback } from 'react'
import debounce from 'lodash/debounce'

/**
 * Custom hook to handle autosaving of form data or any state.
 * @param data The data to be saved.
 * @param onSave The callback function that performs the save operation.
 * @param delay The delay in milliseconds for debouncing. Default is 2000ms.
 */
export function useAutosave<T>(
  data: T, 
  onSave: (data: T) => Promise<void> | void, 
  delay = 2000
) {
  const saveRef = useRef(onSave)
  const isFirstRender = useRef(true)

  // Update the ref whenever onSave changes to avoid stale closures
  useEffect(() => {
    saveRef.current = onSave
  }, [onSave])

  // Create a debounced version of the save function
  const debouncedSave = useCallback(
    debounce((newData: T) => {
      saveRef.current(newData)
    }, delay),
    [delay]
  )

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    debouncedSave(data)
    
    // Cleanup pending debounced calls on unmount
    return () => {
      debouncedSave.cancel()
    }
  }, [data, debouncedSave])
}
