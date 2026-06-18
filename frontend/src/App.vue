<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from './stores/auth'

const isSidebarCollapsed = ref(false)
const isLogoutConfirmOpen = ref(false)
const authStore = useAuthStore()
const router = useRouter()

const isLoggedIn = computed(() => Boolean(authStore.token && authStore.user))

function requestLogout() {
  isLogoutConfirmOpen.value = true
}

function cancelLogout() {
  isLogoutConfirmOpen.value = false
}

async function confirmLogout() {
  isLogoutConfirmOpen.value = false
  authStore.clearSession()
  await router.push('/login')
}
</script>

<template>
  <div class="ot-admin-layout" :class="{ 'is-sidebar-collapsed': isSidebarCollapsed }">
    <aside class="ot-admin-sidebar" aria-label="Main navigation">
      <RouterLink class="ot-sidebar-brand" to="/">
        <span class="ot-sidebar-logo" aria-hidden="true"></span>
        <span>OT@HOME</span>
      </RouterLink>

      <hr class="ot-sidebar-divider" />

      <nav class="ot-sidebar-nav">
        <RouterLink to="/" class="ot-sidebar-link">
          <i class="bi bi-house-door"></i>
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
        <button
          v-else
          type="button"
          class="ot-sidebar-link ot-sidebar-button"
          @click="requestLogout"
        >
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
        <i
          class="bi"
          :class="
            isSidebarCollapsed ? 'bi-layout-sidebar-inset' : 'bi-layout-sidebar-inset-reverse'
          "
        ></i>
      </button>
      <RouterView />
    </div>

    <div
      v-if="isLogoutConfirmOpen"
      class="logout-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
      @click.self="cancelLogout"
    >
      <section class="logout-modal">
        <span class="logout-modal-icon" aria-hidden="true">
          <i class="bi bi-box-arrow-right"></i>
        </span>
        <div>
          <h2 id="logout-modal-title">ยืนยันการออกจากระบบ</h2>
          <p>คุณต้องการออกจากระบบ OT@HOME ใช่ไหม?</p>
        </div>
        <div class="logout-modal-actions">
          <button type="button" class="secondary-action" @click="cancelLogout">ยกเลิก</button>
          <button type="button" class="danger-action" @click="confirmLogout">ออกจากระบบ</button>
        </div>
      </section>
    </div>
  </div>
</template>
