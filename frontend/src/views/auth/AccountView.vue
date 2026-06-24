<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { ApiError } from '../../api/client'
import { updateAccount } from '../../api/auth'
import ProfileMenu from '../../components/ProfileMenu.vue'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const profileInput = ref<HTMLInputElement | null>(null)

const form = reactive({
  full_name: authStore.user?.full_name ?? '',
  date_of_birth: authStore.user?.date_of_birth ?? '',
  gender: authStore.user?.gender ?? '',
  current_password: '',
  new_password: '',
  confirm_new_password: '',
  profile_image_data: authStore.user?.profile_image_data ?? '',
})

const roleLabels: Record<string, string> = {
  admin: 'ผู้ดูแลระบบ',
  parent: 'ผู้ปกครอง',
  case_manager: 'Case Manager',
  caregiver: 'นักกิจกรรมบำบัด',
  village_volunteer: 'ผู้ดูแลเด็ก',
}

const genderOptions = [
  { value: 'male', label: 'ชาย' },
  { value: 'female', label: 'หญิง' },
  { value: 'other', label: 'อื่น ๆ' },
  { value: 'prefer_not_to_say', label: 'ไม่ระบุ' },
]

const roleLabel = computed(() => {
  return authStore.user ? (roleLabels[authStore.user.role] ?? authStore.user.role) : ''
})

const profileInitial = computed(() => {
  const name = form.full_name.trim() || authStore.user?.full_name || 'OT'
  return name.slice(0, 2).toUpperCase()
})

const passwordHint = 'อย่างน้อย 8 ตัวอักษร มีพิมพ์เล็ก พิมพ์ใหญ่ ตัวเลข และอักขระพิเศษ'
const maxProfileImageSize = 512 * 1024
const allowedProfileImageTypes = ['image/jpeg', 'image/png', 'image/webp']

function triggerProfilePicker() {
  profileInput.value?.click()
}

function updateProfileImage(event: Event) {
  errorMessage.value = ''
  successMessage.value = ''

  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) {
    return
  }

  if (!allowedProfileImageTypes.includes(file.type)) {
    errorMessage.value = 'กรุณาเลือกรูปภาพชนิด JPG, PNG หรือ WebP'
    target.value = ''
    return
  }

  if (file.size > maxProfileImageSize) {
    errorMessage.value = 'รูปภาพต้องมีขนาดไม่เกิน 512 KB'
    target.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    form.profile_image_data = typeof reader.result === 'string' ? reader.result : ''
  }
  reader.readAsDataURL(file)
}

function removeProfileImage() {
  form.profile_image_data = ''
  if (profileInput.value) {
    profileInput.value.value = ''
  }
}

async function submitAccount() {
  errorMessage.value = ''
  successMessage.value = ''

  if (form.new_password && !form.current_password) {
    errorMessage.value = 'กรุณากรอกรหัสผ่านปัจจุบันก่อนเปลี่ยนรหัสผ่าน'
    return
  }

  if (!form.new_password && form.confirm_new_password) {
    errorMessage.value = 'กรุณากรอกรหัสผ่านใหม่ก่อนยืนยันรหัสผ่าน'
    return
  }

  if (form.new_password && !form.confirm_new_password) {
    errorMessage.value = 'กรุณาพิมพ์รหัสผ่านใหม่อีกครั้ง'
    return
  }

  if (form.new_password && form.new_password !== form.confirm_new_password) {
    errorMessage.value = 'รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน'
    return
  }

  isSubmitting.value = true
  try {
    const updatedUser = await updateAccount({
      full_name: form.full_name.trim(),
      date_of_birth: form.date_of_birth || null,
      gender: form.gender || null,
      current_password: form.new_password ? form.current_password : null,
      new_password: form.new_password || null,
      profile_image_data: form.profile_image_data || null,
    })
    authStore.setUser(updatedUser)
    form.profile_image_data = updatedUser.profile_image_data ?? ''
    form.date_of_birth = updatedUser.date_of_birth ?? ''
    form.gender = updatedUser.gender ?? ''
    form.current_password = ''
    form.new_password = ''
    form.confirm_new_password = ''
    successMessage.value = 'บันทึก'
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError
        ? error.message
        : 'ไม่สามารถบันทึกข้อมูลบัญชีได้ กรุณาลองใหม่อีกครั้ง'
  } finally {
    isSubmitting.value = false
  }
}

function goBack() {
  router.back()
}
</script>

<template>
  <main class="account-page">
    <nav class="top-nav" aria-label="Main navigation">
      <RouterLink class="brand" to="/" aria-label="OT@HOME home">
        <span class="logo-slot" aria-hidden="true"></span>
        <span class="brand-name">OT@HOME</span>
      </RouterLink>

      <div class="account-nav-actions">
        <button class="back-button" type="button" @click="goBack">
          <i class="bi bi-arrow-left" aria-hidden="true"></i>
          <span>กลับ</span>
        </button>
        <ProfileMenu />
      </div>
    </nav>

    <section class="account-shell" aria-labelledby="account-title">
      <header class="account-heading">
        <div>
          <p class="eyebrow">Account Settings</p>
          <h1 id="account-title">ข้อมูลบัญชี</h1>
        </div>
        <div class="account-summary">
          <span>ประเภทบัญชี</span>
          <strong>{{ roleLabel }}</strong>
          <small>{{ authStore.user?.thai_id_masked }}</small>
        </div>
      </header>

      <form class="account-form" @submit.prevent="submitAccount">
        <section class="form-panel">
          <div class="panel-heading">
            <span class="panel-icon"><i class="bi bi-person-circle" aria-hidden="true"></i></span>
            <div>
              <h2>ชื่อบัญชี</h2>
              <p>ชื่อนี้และรูปโปรไฟล์จะแสดงในหน้าทำงานที่เกี่ยวข้องกับบัญชีของคุณ</p>
            </div>
          </div>

          <div class="profile-uploader">
            <div class="profile-preview" aria-label="รูปโปรไฟล์">
              <img v-if="form.profile_image_data" :src="form.profile_image_data" alt="รูปโปรไฟล์" />
              <span v-else>{{ profileInitial }}</span>
            </div>

            <div class="profile-tools">
              <strong>รูปโปรไฟล์</strong>
              <p>รองรับ JPG, PNG หรือ WebP ขนาดไม่เกิน 512 KB</p>
              <div class="profile-actions">
                <button class="secondary-action" type="button" @click="triggerProfilePicker">
                  <i class="bi bi-image" aria-hidden="true"></i>
                  <span>เลือกรูป</span>
                </button>
                <button
                  v-if="form.profile_image_data"
                  class="ghost-action"
                  type="button"
                  @click="removeProfileImage"
                >
                  <i class="bi bi-x-lg" aria-hidden="true"></i>
                  <span>ลบรูป</span>
                </button>
              </div>
            </div>

            <input
              ref="profileInput"
              class="profile-file-input"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              @change="updateProfileImage"
            />
          </div>

          <label>
            <span>ชื่อ-นามสกุล</span>
            <input v-model="form.full_name" required maxlength="160" autocomplete="name" />
          </label>

          <div class="profile-field-grid">
            <label>
              <span>วันเดือนปีเกิด</span>
              <input v-model="form.date_of_birth" type="date" autocomplete="bday" />
            </label>

            <label>
              <span>เพศ</span>
              <select v-model="form.gender">
                <option value="">ไม่ระบุ</option>
                <option v-for="option in genderOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>
          </div>
        </section>

        <section class="form-panel">
          <div class="panel-heading">
            <span class="panel-icon panel-icon--lock">
              <i class="bi bi-shield-lock" aria-hidden="true"></i>
            </span>
            <div>
              <h2>รหัสผ่าน</h2>
              <p>เว้นว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่าน</p>
            </div>
          </div>

          <div class="password-grid">
            <label>
              <span>รหัสผ่านปัจจุบัน</span>
              <input
                v-model="form.current_password"
                type="password"
                maxlength="128"
                autocomplete="current-password"
                placeholder="กรอกเมื่อเปลี่ยนรหัสผ่าน"
              />
            </label>

            <label>
              <span>รหัสผ่านใหม่</span>
              <input
                v-model="form.new_password"
                type="password"
                minlength="8"
                maxlength="128"
                autocomplete="new-password"
                :placeholder="passwordHint"
              />
            </label>

            <label>
              <span>ยืนยันรหัสผ่านใหม่</span>
              <input
                v-model="form.confirm_new_password"
                type="password"
                minlength="8"
                maxlength="128"
                autocomplete="new-password"
                placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
              />
            </label>
          </div>
        </section>

        <p v-if="errorMessage" class="form-alert form-alert--error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="form-alert form-alert--success">{{ successMessage }}</p>

        <div class="form-actions">
          <button class="primary-action" type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'กำลังบันทึก...' : 'บันทึก' }}
          </button>
        </div>
      </form>
    </section>
  </main>
</template>

<style scoped>
.account-page {
  min-height: 100vh;
  background: var(--admin-bg);
}

.account-shell {
  display: grid;
  gap: 1.25rem;
  width: min(920px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 1.5rem 0 4rem;
}

.account-nav-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
}

.account-heading,
.form-panel {
  border: 1px solid var(--admin-border);
  border-radius: var(--radius-panel);
  background: var(--app-surface);
  box-shadow: var(--shadow-soft);
}

.account-heading {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(14rem, 0.32fr);
  gap: 1rem;
  align-items: stretch;
  padding: 1.15rem;
}

.eyebrow,
.account-heading p,
.panel-heading p,
.account-summary span,
.account-summary small {
  margin: 0;
  color: var(--color-muted);
}

.eyebrow {
  margin-bottom: 0.45rem;
  color: var(--admin-primary);
  font-size: 0.78rem;
  font-weight: 850;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

h1,
h2 {
  margin: 0;
  color: var(--admin-text);
  letter-spacing: 0;
}

h1 {
  font-size: clamp(1.7rem, 4vw, 2.4rem);
}

h2 {
  font-size: 1.05rem;
}

.account-summary {
  display: grid;
  align-content: center;
  gap: 0.25rem;
  border-left: 4px solid var(--admin-primary);
  border-radius: 0.35rem;
  padding: 0.85rem;
  background: var(--app-surface-soft);
}

.account-summary strong {
  color: var(--admin-text);
  font-size: 1.1rem;
}

.account-form {
  display: grid;
  gap: 1rem;
}

.form-panel {
  display: grid;
  gap: 1rem;
  padding: 1.15rem;
}

.panel-heading {
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
}

.panel-icon {
  display: inline-grid;
  width: 2.75rem;
  height: 2.75rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 0.65rem;
  color: var(--admin-primary);
  background: rgb(78 115 223 / 0.1);
  font-size: 1.2rem;
}

.panel-icon--lock {
  color: #047857;
  background: rgb(16 185 129 / 0.16);
}

.profile-uploader {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 1rem;
  align-items: center;
  border: 1px solid var(--admin-border);
  border-radius: 0.75rem;
  padding: 1rem;
  background: var(--app-surface-soft);
}

.profile-preview {
  display: grid;
  width: 5.25rem;
  height: 5.25rem;
  place-items: center;
  overflow: hidden;
  border: 3px solid #ffffff;
  border-radius: 999px;
  color: #ffffff;
  background: linear-gradient(135deg, var(--admin-primary), #36b9cc);
  box-shadow: 0 0.5rem 1rem rgb(58 59 69 / 0.16);
  font-size: 1.2rem;
  font-weight: 900;
}

.profile-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-tools {
  display: grid;
  gap: 0.35rem;
}

.profile-tools strong {
  color: var(--admin-text);
}

.profile-tools p {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.9rem;
}

.profile-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.35rem;
}

.profile-file-input {
  display: none;
}

label {
  display: grid;
  gap: 0.45rem;
}

label span {
  color: var(--admin-text);
  font-size: 0.9rem;
  font-weight: 800;
}

.profile-field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

input,
select {
  width: 100%;
  height: 2.75rem;
  border: 1px solid var(--admin-border);
  border-radius: 0.5rem;
  padding: 0 0.85rem;
  color: var(--admin-text);
  background: var(--app-input-bg);
  outline: none;
}

input:focus,
select:focus {
  border-color: var(--admin-primary);
  box-shadow: 0 0 0 3px rgb(78 115 223 / 0.14);
}

.password-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.form-alert {
  margin: 0;
  border-radius: 0.5rem;
  padding: 0.85rem 1rem;
  font-weight: 800;
}

.form-alert--error {
  border: 1px solid rgb(220 38 38 / 0.22);
  color: #991b1b;
  background: #fef2f2;
}

.form-alert--success {
  border: 1px solid rgb(22 163 74 / 0.2);
  color: #166534;
  background: #f0fdf4;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.primary-action,
.secondary-action,
.ghost-action,
.back-button {
  display: inline-flex;
  min-height: 2.55rem;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border-radius: 0.5rem;
  font-weight: 850;
  cursor: pointer;
}

.primary-action {
  border: 1px solid rgb(78 115 223 / 0.1);
  padding: 0 1.15rem;
  color: #ffffff;
  background: var(--admin-primary);
  box-shadow: var(--shadow-action);
}

.secondary-action,
.ghost-action {
  border: 1px solid var(--admin-border);
  padding: 0 0.9rem;
  background: var(--app-input-bg);
}

.secondary-action {
  color: var(--admin-primary);
}

.ghost-action {
  color: #dc2626;
}

.back-button {
  border: 1px solid var(--admin-border);
  padding: 0 0.9rem;
  color: var(--admin-text);
  background: var(--app-input-bg);
}

.primary-action:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  box-shadow: none;
}

@media (max-width: 900px) {
  .password-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .account-heading,
  .profile-field-grid,
  .password-grid {
    grid-template-columns: 1fr;
  }

  .profile-uploader {
    grid-template-columns: 1fr;
    justify-items: start;
  }
}
</style>
