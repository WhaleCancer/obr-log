// localStore.ts
import { writable } from 'svelte/store'
import type { JsonValue } from './types/json.type'

export const localStore = <T extends JsonValue>(key: string, initial: T) => {          // receives the key of the local storage and an initial value

  const toString = (value: T) => JSON.stringify(value, null, 2)           // helper function
  const toObj = JSON.parse                                                // helper function

  let saved: T = initial; // Default to initial value
  
  try {
    // Check if localStorage is available
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem(key);
        // Check if stored value is valid (not null, not undefined string, not empty, and is valid JSON)
        if (stored !== null && stored !== undefined && stored !== "undefined" && stored !== "" && typeof stored === 'string' && stored.trim().length > 0) {
          // Try to parse it
          if (stored.trim().startsWith('{') || stored.trim().startsWith('[')) {
            try {
              const parsed = toObj(stored);
              if (parsed !== null && parsed !== undefined) {
                saved = parsed as T;
              } else {
                throw new Error('Parsed value is null or undefined');
              }
            } catch (parseError) {
              // If parsing fails, use initial value and reset localStorage
              console.warn(`Failed to parse localStorage for key "${key}", resetting to initial value:`, parseError);
              localStorage.setItem(key, toString(initial));
              saved = initial;
            }
          } else {
            // Not valid JSON format, reset it
            console.warn(`Invalid JSON format in localStorage for key "${key}", resetting to initial value`);
            localStorage.setItem(key, toString(initial));
            saved = initial;
          }
        } else {
          // Item not present or invalid, initialize with default
          localStorage.setItem(key, toString(initial));
          saved = initial;
        }
      } catch (getError) {
        // Error getting from localStorage
        console.warn(`Error getting localStorage for key "${key}", using initial value:`, getError);
        saved = initial;
      }
    } else {
      // localStorage not available, use initial value
      saved = initial;
    }
  } catch (e) {
    // If anything fails, use initial value
    console.warn(`Error accessing localStorage for key "${key}", using initial value:`, e);
    saved = initial;
  }

  const { subscribe, set, update } = writable<T>(saved)                   // create the underlying writable store

  return {
    subscribe,
    set: (value: T) => {
      localStorage.setItem(key, toString(value))                          // save also to local storage as a string
      return set(value)
    },
    update
  }
}