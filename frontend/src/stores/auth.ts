import { defineStore } from "pinia"
import { ref } from "vue"

import type { UserResponse } from "../api/auth"

const TOKEN_STORAGE_KEY = "ot_at_home_access_token"
const USER_STORAGE_KEY = "ot_at_home_user"

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_STORAGE_KEY))
  const user = ref<UserResponse | null>(getStoredUser())

  function getStoredUser(): UserResponse | null {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY)
    if (!storedUser) {
      return null
    }

    try {
      return JSON.parse(storedUser) as UserResponse
    } catch {
      localStorage.removeItem(USER_STORAGE_KEY)
      return null
    }
  }

  function setSession(accessToken: string, currentUser: UserResponse) {
    token.value = accessToken
    user.value = currentUser
    localStorage.setItem(TOKEN_STORAGE_KEY, accessToken)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser))
  }

  function clearSession() {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
  }

  return {
    token,
    user,
    setSession,
    clearSession,
  }
})
