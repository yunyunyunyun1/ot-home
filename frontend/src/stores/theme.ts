import { computed, ref } from 'vue'

export type ThemePreference = 'light' | 'dark' | 'system'

const THEME_STORAGE_KEY = 'ot_at_home_theme'
const themePreference = ref<ThemePreference>(getStoredThemePreference())
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')

function getStoredThemePreference(): ThemePreference {
  const storedPreference = localStorage.getItem(THEME_STORAGE_KEY)
  if (
    storedPreference === 'light' ||
    storedPreference === 'dark' ||
    storedPreference === 'system'
  ) {
    return storedPreference
  }
  return 'system'
}

function resolvedTheme(preference: ThemePreference): 'light' | 'dark' {
  if (preference === 'system') {
    return prefersDark.matches ? 'dark' : 'light'
  }
  return preference
}

export function applyTheme(preference = themePreference.value) {
  const theme = resolvedTheme(preference)
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

export function initializeTheme() {
  applyTheme()
  prefersDark.addEventListener('change', () => {
    if (themePreference.value === 'system') {
      applyTheme()
    }
  })
}

export function useTheme() {
  const currentTheme = computed(() => resolvedTheme(themePreference.value))
  const isDarkTheme = computed(() => currentTheme.value === 'dark')

  function setThemePreference(preference: ThemePreference) {
    themePreference.value = preference
    localStorage.setItem(THEME_STORAGE_KEY, preference)
    applyTheme(preference)
  }

  function toggleDarkMode() {
    setThemePreference(isDarkTheme.value ? 'light' : 'dark')
  }

  return {
    currentTheme,
    isDarkTheme,
    themePreference,
    setThemePreference,
    toggleDarkMode,
  }
}
