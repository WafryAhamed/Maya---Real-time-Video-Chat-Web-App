// ============================================
// Maya — useSettings Hook
// ============================================
// Manages user preferences with localStorage persistence.

import { useCallback, useState } from 'react';
import type { UserPreferences } from '../types';
import {
  DEFAULT_PREFERENCES,
  PREFERENCES_STORAGE_KEY } from
'../utils/constants';

/** Load preferences from localStorage */
function loadPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<UserPreferences>;
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch {

    // Ignore parse errors, use defaults
  }return { ...DEFAULT_PREFERENCES };
}

/** Save preferences to localStorage */
function savePreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
  } catch {

    // Ignore storage errors
  }}

interface UseSettingsReturn {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(
  key: K,
  value: UserPreferences[K])
  => void;
  resetPreferences: () => void;
}

export function useSettings(): UseSettingsReturn {
  const [preferences, setPreferences] =
  useState<UserPreferences>(loadPreferences);

  const updatePreference = useCallback(
    <K extends keyof UserPreferences,>(key: K, value: UserPreferences[K]) => {
      setPreferences((prev) => {
        const next = { ...prev, [key]: value };
        savePreferences(next);
        return next;
      });
    },
    []
  );

  const resetPreferences = useCallback(() => {
    const defaults = { ...DEFAULT_PREFERENCES };
    setPreferences(defaults);
    savePreferences(defaults);
  }, []);

  return { preferences, updatePreference, resetPreferences };
}