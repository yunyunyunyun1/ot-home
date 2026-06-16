<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter } from "vue-router"

import { useAuthStore } from "./stores/auth"

const isSidebarCollapsed = ref(false)
const authStore = useAuthStore()
const router = useRouter()

const isLoggedIn = computed(() => Boolean(authStore.token && authStore.user))

async function logout() {
  authStore.clearSession()
  await router.push("/login")
}
</script>

<template>
  <div class="ot-admin-layout" :class="{ 'is-sidebar-collapsed': isSidebarCollapsed }">
    <aside class="ot-admin-sidebar" aria-label="Main navigation">
      <RouterLink class="ot-sidebar-brand" to="/">
        <span class="ot-sidebar-logo" aria-hidden="true">
          <i class="bi bi-house-heart-fill"></i>
        </span>
        <span>OT@HOME</span>
      </RouterLink>

      <hr class="ot-sidebar-divider" />

      <nav class="ot-sidebar-nav">
        <RouterLink to="/" class="ot-sidebar-link">
          <i class="bi bi-speedometer2"></i>
          <span>หน้าแรก</span>
        </RouterLink>
        <RouterLink v-if="!isLoggedIn" to="/register" class="ot-sidebar-link">
          <i class="bi bi-person-plus"></i>
          <span>สมัครบัญชี</span>
        </RouterLink>
        <RouterLink v-if="!isLoggedIn" to="/login" class="ot-sidebar-link">
          <i class="bi bi-box-arrow-in-right"></i>
          <span>เข้าสู่ระบบ</span>
        </RouterLink>
        <button v-else type="button" class="ot-sidebar-link ot-sidebar-button" @click="logout">
          <i class="bi bi-box-arrow-right"></i>
          <span>ออกจากระบบ</span>
        </button>
      </nav>
    </aside>

    <div class="ot-admin-content">
      <button
        class="ot-sidebar-toggle"
        type="button"
        :aria-expanded="!isSidebarCollapsed"
        aria-label="Toggle sidebar"
        @click="isSidebarCollapsed = !isSidebarCollapsed"
      >
        <i class="bi" :class="isSidebarCollapsed ? 'bi-layout-sidebar-inset' : 'bi-layout-sidebar-inset-reverse'"></i>
      </button>
      <RouterView />
    </div>
  </div>
</template>
