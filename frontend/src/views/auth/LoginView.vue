<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { login } from '../../api/auth'
import { ApiError } from '../../api/client'
import { useAuthStore } from '../../stores/auth'
import { toDigits } from '../../utils/digits'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  thai_id: '',
  password: '',
})

const isSubmitting = ref(false)
const errorMessage = ref('')

function updateThaiId(event: Event) {
  form.thai_id = toDigits((event.target as HTMLInputElement).value)
}

const roleRedirects: Record<string, string> = {
  admin: '/admin',
  parent: '/parent',
  case_manager: '/case-manager',
  caregiver: '/caregiver',
  village_volunteer: '/village-volunteer',
}

async function submitForm() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    const session = await login({
      thai_id: form.thai_id.trim(),
      password: form.password,
    })
    authStore.setSession(session.access_token, session.user)
    await router.push(roleRedirects[session.user.role] ?? '/')
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : 'ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <nav class="top-nav" aria-label="Main navigation">
      <RouterLink class="brand" to="/" aria-label="OT@HOME home">
        <span class="logo-slot" aria-hidden="true"></span>
        <span class="brand-name">OT@HOME</span>
      </RouterLink>

      <div class="nav-actions">
        <RouterLink class="nav-link" to="/">หน้าแรก</RouterLink>
        <RouterLink class="nav-button" to="/register">สมัครใช้งาน</RouterLink>
      </div>
    </nav>

    <section class="login-shell" aria-labelledby="login-title">
      <div class="page-heading">
        <h1 id="login-title">เข้าสู่ระบบ</h1>
      </div>

      <form class="login-form" @submit.prevent="submitForm">
        <fieldset>
          <legend>ข้อมูลบัญชี</legend>

          <label>
            <span>เลขประจำตัวประชาชน <strong class="required-marker">*</strong></span>
            <input
              v-model="form.thai_id"
              inputmode="numeric"
              maxlength="13"
              minlength="13"
              pattern="[0-9]{13}"
              required
              autocomplete="username"
              placeholder="กรอกเลข 13 หลัก"
              @input="updateThaiId"
            />
          </label>

          <label>
            <span>รหัสผ่าน <strong class="required-marker">*</strong></span>
            <input
              v-model="form.password"
              type="password"
              minlength="1"
              maxlength="128"
              required
              autocomplete="current-password"
              placeholder="กรอกรหัสผ่าน"
            />
          </label>
        </fieldset>

        <p v-if="errorMessage" class="form-alert form-alert--error">{{ errorMessage }}</p>

        <div class="form-actions">
          <button class="primary-action" type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
          </button>
        </div>
      </form>
    </section>
  </main>
</template>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at top right, rgb(96 165 250 / 0.15), transparent 24rem),
    linear-gradient(
      135deg,
      #ffffff 0%,
      var(--color-background) 46%,
      var(--color-background-soft) 100%
    );
}

.login-page::before {
  display: none;
}

.top-nav,
.login-shell {
  position: relative;
  z-index: 1;
  width: min(1120px, calc(100% - 2rem));
  margin: 0 auto;
}

.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.25rem 0;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
}

.logo-slot {
  display: inline-grid;
  width: 3rem;
  height: 3rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid var(--color-border);
  border-radius: 0.8rem;
  background: var(--color-surface);
  box-shadow: 0 10px 28px rgb(59 130 246 / 0.12);
}

.logo-slot::before {
  width: 1.25rem;
  height: 1.25rem;
  border: 0.3rem solid var(--color-primary);
  border-top-color: var(--color-secondary);
  border-radius: 50%;
  content: '';
}

.brand-name {
  color: var(--color-text);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0;
  white-space: nowrap;
}

.nav-actions,
.form-actions {
  display: flex;
  gap: 0.75rem;
}

.nav-link,
.nav-button,
.primary-action {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
}

.nav-link {
  padding: 0 0.85rem;
  color: var(--color-muted);
}

.nav-button,
.primary-action {
  border: 0;
  padding: 0 1.1rem;
  color: #ffffff;
  background: var(--color-primary);
  box-shadow: 0 14px 26px rgb(59 130 246 / 0.22);
  cursor: pointer;
}

.primary-action:disabled {
  cursor: wait;
  opacity: 0.72;
}

.login-shell {
  display: grid;
  max-width: 680px;
  min-height: calc(100vh - 6rem);
  align-content: center;
  padding: 2rem 0 5rem;
}

.page-heading {
  margin: 0 auto;
  text-align: center;
}

h1 {
  margin: 0;
  color: var(--color-text);
  font-size: clamp(2.25rem, 5vw, 4rem);
  line-height: 1.08;
  letter-spacing: 0;
}

.login-form {
  display: grid;
  gap: 1.1rem;
  margin-top: 2.2rem;
}

fieldset {
  display: grid;
  gap: 1rem;
  margin: 0;
  min-inline-size: 0;
  padding: 1.35rem 1.15rem 1.15rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: rgb(255 255 255 / 0.86);
  box-shadow: var(--shadow-soft);
}

legend {
  display: block;
  float: left;
  width: 100%;
  margin: 0 0 0.15rem;
  padding: 0;
  color: var(--color-text);
  font-size: 1.05rem;
  font-weight: 800;
}

label {
  display: grid;
  gap: 0.45rem;
}

label span {
  color: var(--color-text);
  font-size: 0.95rem;
  font-weight: 700;
}

.required-marker {
  color: #dc2626;
  font-weight: 800;
}

input {
  width: 100%;
  height: 2.9rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 0 0.85rem;
  background: #ffffff;
  color: var(--color-text);
  outline: none;
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease;
}

input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.14);
}

.form-alert {
  margin: 0;
  padding: 0.9rem 1rem;
  border: 1px solid rgb(220 38 38 / 0.22);
  border-radius: 0.5rem;
  color: #991b1b;
  background: #fef2f2;
  font-weight: 700;
  line-height: 1.6;
}

.form-actions {
  justify-content: flex-end;
}

.primary-action {
  min-width: 12rem;
  padding: 0 1.25rem;
}

@media (max-width: 560px) {
  .top-nav,
  .login-shell {
    width: min(100% - 1.25rem, 1120px);
  }

  .brand {
    gap: 0.55rem;
  }

  .logo-slot {
    width: 2.55rem;
    height: 2.55rem;
    border-radius: 0.65rem;
  }

  .brand-name {
    font-size: 1.05rem;
  }

  .nav-link {
    display: none;
  }

  .nav-button {
    min-height: 2.5rem;
    padding: 0 0.75rem;
    font-size: 0.92rem;
  }

  .form-actions {
    display: grid;
  }

  .primary-action {
    width: 100%;
  }
}
</style>
