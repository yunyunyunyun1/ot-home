<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { useAuthStore } from '../stores/auth'
import { useTheme } from '../stores/theme'

const authStore = useAuthStore()
const router = useRouter()
const theme = useTheme()
const isMenuOpen = ref(false)
const isLogoutConfirmOpen = ref(false)

const profileInitial = computed(() => {
  const name = authStore.user?.full_name?.trim() || 'OT'
  return name.slice(0, 2).toUpperCase()
})

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

function requestLogout() {
  closeMenu()
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
  <div class="profile-menu">
    <button
      class="user-avatar-link profile-menu-trigger"
      type="button"
      aria-label="เมนูบัญชี"
      :aria-expanded="isMenuOpen"
      aria-haspopup="menu"
      @click="toggleMenu"
    >
      <img
        v-if="authStore.user?.profile_image_data"
        :src="authStore.user.profile_image_data"
        alt=""
      />
      <span v-else class="profile-avatar-fallback">{{ profileInitial }}</span>
    </button>

    <div v-if="isMenuOpen" class="profile-menu-backdrop" @click="closeMenu"></div>

    <div v-if="isMenuOpen" class="profile-menu-panel" role="menu">
      <RouterLink class="profile-menu-item" to="/account" role="menuitem" @click="closeMenu">
        <i class="bi bi-person-gear" aria-hidden="true"></i>
        <span>แก้ไขโปรไฟล์</span>
      </RouterLink>
      <button class="profile-menu-item" type="button" role="menuitem" @click="theme.toggleDarkMode">
        <i
          class="bi"
          :class="theme.isDarkTheme.value ? 'bi-sun' : 'bi-moon-stars'"
          aria-hidden="true"
        ></i>
        <span>{{ theme.isDarkTheme.value ? 'โหมดสว่าง' : 'โหมดมืด' }}</span>
      </button>
      <button
        class="profile-menu-item profile-menu-item--danger"
        type="button"
        role="menuitem"
        @click="requestLogout"
      >
        <i class="bi bi-box-arrow-right" aria-hidden="true"></i>
        <span>ออกจากระบบ</span>
      </button>
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

<style scoped>
.profile-menu {
  position: relative;
  display: inline-flex;
}

.profile-menu-trigger {
  border: 2px solid var(--app-surface);
  cursor: pointer;
}

.profile-avatar-fallback {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: #4e73df;
  font-size: 0.82rem;
  font-weight: 900;
}

.profile-menu-backdrop {
  position: fixed;
  z-index: 1040;
  inset: 0;
}

.profile-menu-panel {
  position: absolute;
  z-index: 1041;
  top: calc(100% + 0.6rem);
  right: 0;
  display: grid;
  width: 12.5rem;
  overflow: hidden;
  border: 1px solid var(--admin-border);
  border-radius: 0.55rem;
  background: var(--app-surface);
  box-shadow: 0 0.85rem 2rem rgb(58 59 69 / 0.18);
}

.profile-menu-item {
  display: flex;
  min-height: 2.75rem;
  align-items: center;
  gap: 0.65rem;
  border: 0;
  padding: 0 0.9rem;
  color: var(--admin-text);
  background: var(--app-surface);
  font-weight: 800;
  text-align: left;
  cursor: pointer;
}

.profile-menu-item i {
  width: 1.1rem;
  color: #4e73df;
  text-align: center;
}

.profile-menu-item:hover,
.profile-menu-item:focus-visible {
  background: var(--app-hover-bg);
  outline: none;
}

.profile-menu-item--danger {
  color: #d52a1a;
}

.profile-menu-item--danger i {
  color: #e74a3b;
}
</style>
