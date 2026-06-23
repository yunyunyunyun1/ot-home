import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { UserResponse } from '../api/auth'

export const TOKEN_STORAGE_KEY = 'ot_at_home_access_token'
export const USER_STORAGE_KEY = 'ot_at_home_user'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY) ?? sessionStorage.getItem(TOKEN_STORAGE_KEY)
}

function getStorage(rememberSession: boolean): Storage {
  return rememberSession ? localStorage : sessionStorage
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(getStoredToken())
  const user = ref<UserResponse | null>(getStoredUser())

  function getStoredUser(): UserResponse | null {
    const storedUser =
      localStorage.getItem(USER_STORAGE_KEY) ?? sessionStorage.getItem(USER_STORAGE_KEY)
    if (!storedUser) {
      return null
    }

    try {
      return JSON.parse(storedUser) as UserResponse
    } catch {
      localStorage.removeItem(USER_STORAGE_KEY)
      sessionStorage.removeItem(USER_STORAGE_KEY)
      return null
    }
  }

  function setSession(accessToken: string, currentUser: UserResponse, rememberSession = true) {
    const storage = getStorage(rememberSession)
    const otherStorage = rememberSession ? sessionStorage : localStorage

    token.value = accessToken
    user.value = currentUser
    storage.setItem(TOKEN_STORAGE_KEY, accessToken)
    storage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser))
    otherStorage.removeItem(TOKEN_STORAGE_KEY)
    otherStorage.removeItem(USER_STORAGE_KEY)
  }

  function setUser(currentUser: UserResponse) {
    user.value = currentUser
    const storage = localStorage.getItem(TOKEN_STORAGE_KEY) ? localStorage : sessionStorage
    storage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser))
  }

  function clearSession() {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
    sessionStorage.removeItem(TOKEN_STORAGE_KEY)
    sessionStorage.removeItem(USER_STORAGE_KEY)
  }

  return {
    token,
    user,
    setSession,
    setUser,
    clearSession,
  }
})
