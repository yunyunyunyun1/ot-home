<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'

import ProfileMenu from '../../components/ProfileMenu.vue'
import {
  createCaseManager,
  deleteCaseManager,
  listCaseManagers,
  resetUserPassword,
  updateCaseManager,
  type CaseManagerPayload,
  type CaseManagerResponse,
  type CaseManagerUpdatePayload,
  type UserResponse,
} from '../../api/auth'
import { ApiError } from '../../api/client'
import { useAuthStore } from '../../stores/auth'
import { isValidThaiId, toDigits } from '../../utils/digits'

const authStore = useAuthStore()
const isSubmittingReset = ref(false)
const isSubmittingCaseManager = ref(false)
const isLoadingCaseManagers = ref(false)
const deletingCaseManagerId = ref('')
const editingCaseManagerId = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const resetUser = ref<UserResponse | null>(null)
const caseManagers = ref<CaseManagerResponse[]>([])

const provinceOptions = ['ฉะเชิงเทรา', 'นครนายก', 'ชัยนาท', 'นครศรีธรรมราช', 'สุพรรณบุรี']
const genderOptions = [
  { value: 'male', label: 'ชาย' },
  { value: 'female', label: 'หญิง' },
  { value: 'other', label: 'อื่น ๆ' },
  { value: 'prefer_not_to_say', label: 'ไม่ระบุ' },
]

const resetForm = reactive({
  thai_id: '',
  temporary_password: '',
})

const caseManagerForm = reactive({
  thai_id: '',
  password: '',
  full_name: '',
  date_of_birth: '',
  gender: 'prefer_not_to_say',
  phone: '',
  email: '',
  house_no: '',
  village_no: '',
  road: '',
  subdistrict: '',
  district: '',
  province: '',
  postal_code: '',
})

const isEditingCaseManager = computed(() => Boolean(editingCaseManagerId.value))

function optionalValue(value: string): string | null {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function updateResetThaiId(event: Event) {
  resetForm.thai_id = toDigits((event.target as HTMLInputElement).value)
}

function updateCaseManagerThaiId(event: Event) {
  caseManagerForm.thai_id = toDigits((event.target as HTMLInputElement).value)
}

function buildCaseManagerPayload(): CaseManagerPayload {
  return {
    thai_id: caseManagerForm.thai_id.trim(),
    password: caseManagerForm.password,
    full_name: caseManagerForm.full_name.trim(),
    date_of_birth: caseManagerForm.date_of_birth,
    gender: caseManagerForm.gender,
    phone: optionalValue(caseManagerForm.phone),
    email: optionalValue(caseManagerForm.email),
    address: {
      house_no: optionalValue(caseManagerForm.house_no),
      village_no: optionalValue(caseManagerForm.village_no),
      road: optionalValue(caseManagerForm.road),
      subdistrict: caseManagerForm.subdistrict.trim(),
      district: caseManagerForm.district.trim(),
      province: caseManagerForm.province,
      postal_code: caseManagerForm.postal_code.trim(),
      country: 'Thailand',
    },
  }
}

function buildCaseManagerUpdatePayload(): CaseManagerUpdatePayload {
  const payload = buildCaseManagerPayload()
  return {
    full_name: payload.full_name,
    date_of_birth: payload.date_of_birth,
    gender: payload.gender,
    phone: payload.phone,
    email: payload.email,
    address: payload.address,
  }
}

function resetCaseManagerForm() {
  editingCaseManagerId.value = ''
  caseManagerForm.thai_id = ''
  caseManagerForm.password = ''
  caseManagerForm.full_name = ''
  caseManagerForm.date_of_birth = ''
  caseManagerForm.gender = 'prefer_not_to_say'
  caseManagerForm.phone = ''
  caseManagerForm.email = ''
  caseManagerForm.house_no = ''
  caseManagerForm.village_no = ''
  caseManagerForm.road = ''
  caseManagerForm.subdistrict = ''
  caseManagerForm.district = ''
  caseManagerForm.province = ''
  caseManagerForm.postal_code = ''
}

function editCaseManager(caseManager: CaseManagerResponse) {
  editingCaseManagerId.value = caseManager.id
  caseManagerForm.thai_id = ''
  caseManagerForm.password = ''
  caseManagerForm.full_name = caseManager.full_name
  caseManagerForm.date_of_birth = caseManager.date_of_birth ?? ''
  caseManagerForm.gender = caseManager.gender ?? 'prefer_not_to_say'
  caseManagerForm.phone = caseManager.phone ?? ''
  caseManagerForm.email = caseManager.email ?? ''
  caseManagerForm.house_no = caseManager.address.house_no ?? ''
  caseManagerForm.village_no = caseManager.address.village_no ?? ''
  caseManagerForm.road = caseManager.address.road ?? ''
  caseManagerForm.subdistrict = caseManager.address.subdistrict
  caseManagerForm.district = caseManager.address.district
  caseManagerForm.province = caseManager.address.province
  caseManagerForm.postal_code = caseManager.address.postal_code
}

async function loadCaseManagers() {
  isLoadingCaseManagers.value = true
  errorMessage.value = ''

  try {
    caseManagers.value = await listCaseManagers()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError
        ? error.message
        : 'ไม่สามารถโหลดรายชื่อ Case Manager ได้ กรุณาลองใหม่อีกครั้ง'
  } finally {
    isLoadingCaseManagers.value = false
  }
}

async function submitCaseManager() {
  errorMessage.value = ''
  successMessage.value = ''
  resetUser.value = null

  if (!editingCaseManagerId.value && !isValidThaiId(caseManagerForm.thai_id)) {
    errorMessage.value = 'กรุณากรอกเลขประจำตัวประชาชนที่ถูกต้อง'
    return
  }

  const confirmed = window.confirm(
    editingCaseManagerId.value
      ? 'ยืนยันการแก้ไขข้อมูล Case Manager ใช่ไหม?'
      : 'ยืนยันการสร้างบัญชี Case Manager ใหม่ใช่ไหม?',
  )
  if (!confirmed) {
    return
  }

  isSubmittingCaseManager.value = true

  try {
    if (editingCaseManagerId.value) {
      const updated = await updateCaseManager(
        editingCaseManagerId.value,
        buildCaseManagerUpdatePayload(),
      )
      caseManagers.value = caseManagers.value.map((item) =>
        item.id === updated.id ? updated : item,
      )
      successMessage.value = `แก้ไขข้อมูล ${updated.full_name} แล้ว`
    } else {
      const created = await createCaseManager(buildCaseManagerPayload())
      caseManagers.value = [created, ...caseManagers.value]
      successMessage.value = `สร้างบัญชี ${created.full_name} แล้ว`
    }
    resetCaseManagerForm()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError
        ? error.message
        : 'ไม่สามารถบันทึกบัญชี Case Manager ได้ กรุณาลองใหม่อีกครั้ง'
  } finally {
    isSubmittingCaseManager.value = false
  }
}

async function removeCaseManager(caseManager: CaseManagerResponse) {
  const confirmed = window.confirm(
    `ยืนยันการลบบัญชี ${caseManager.full_name} ใช่ไหม?\nบัญชีนี้จะถูกปิดการใช้งาน แต่ประวัติข้อมูลเดิมจะยังคงอยู่`,
  )
  if (!confirmed) {
    return
  }

  deletingCaseManagerId.value = caseManager.id
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await deleteCaseManager(caseManager.id)
    caseManagers.value = caseManagers.value.filter((item) => item.id !== caseManager.id)
    if (editingCaseManagerId.value === caseManager.id) {
      resetCaseManagerForm()
    }
    successMessage.value = `ลบบัญชี ${caseManager.full_name} แล้ว`
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError
        ? error.message
        : 'ไม่สามารถลบบัญชี Case Manager ได้ กรุณาลองใหม่อีกครั้ง'
  } finally {
    deletingCaseManagerId.value = ''
  }
}

async function submitReset() {
  errorMessage.value = ''
  successMessage.value = ''
  resetUser.value = null

  const confirmed = window.confirm(
    `ยืนยันการรีเซ็ตรหัสผ่านของเลขประชาชน ${resetForm.thai_id} ใช่ไหม?`,
  )
  if (!confirmed) {
    return
  }

  isSubmittingReset.value = true

  try {
    const user = await resetUserPassword({
      thai_id: resetForm.thai_id.trim(),
      temporary_password: resetForm.temporary_password,
    })
    resetUser.value = user
    successMessage.value = `รีเซ็ตรหัสผ่านของ ${user.full_name} แล้ว`
    resetForm.temporary_password = ''
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : 'ไม่สามารถรีเซ็ตรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง'
  } finally {
    isSubmittingReset.value = false
  }
}

onMounted(loadCaseManagers)
</script>

<template>
  <main class="admin-page">
    <nav class="top-nav" aria-label="Main navigation">
      <RouterLink class="brand" to="/" aria-label="OT@HOME home">
        <span class="logo-slot" aria-hidden="true"></span>
        <span class="brand-name">OT@HOME</span>
      </RouterLink>

      <ProfileMenu />
    </nav>

    <section class="admin-shell" aria-labelledby="admin-title">
      <header class="page-heading">
        <div>
          <p class="eyebrow">OT@HOME Admin</p>
          <h1 id="admin-title">จัดการบัญชีผู้ใช้งาน</h1>
          <p class="page-subtitle">สร้างและจัดการบัญชี Case Manager รวมถึงรีเซ็ตรหัสผ่านผู้ใช้</p>
        </div>
      </header>

      <p v-if="errorMessage" class="form-alert form-alert--error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="form-alert form-alert--success">{{ successMessage }}</p>

      <form class="admin-panel" @submit.prevent="submitCaseManager">
        <div class="panel-heading">
          <span class="panel-icon">
            <i class="bi bi-person-gear" aria-hidden="true"></i>
          </span>
          <div>
            <h2>{{ isEditingCaseManager ? 'แก้ไข Case Manager' : 'สร้าง Case Manager' }}</h2>
            <p>จังหวัดในที่อยู่จะเป็นพื้นที่รับผิดชอบของ Case Manager คนนั้น</p>
          </div>
        </div>

        <div class="form-grid">
          <label v-if="!isEditingCaseManager">
            <span>เลขประจำตัวประชาชน</span>
            <input
              v-model="caseManagerForm.thai_id"
              inputmode="numeric"
              maxlength="13"
              minlength="13"
              pattern="[0-9]{13}"
              required
              autocomplete="off"
              placeholder="กรอกเลข 13 หลัก"
              @input="updateCaseManagerThaiId"
            />
          </label>

          <label v-if="!isEditingCaseManager">
            <span>รหัสผ่านเริ่มต้น</span>
            <input
              v-model="caseManagerForm.password"
              type="password"
              minlength="8"
              maxlength="128"
              required
              autocomplete="new-password"
              placeholder="เช่น CaseManager@123"
            />
          </label>

          <label>
            <span>ชื่อ-นามสกุล</span>
            <input v-model="caseManagerForm.full_name" required maxlength="160" />
          </label>

          <label>
            <span>วันเดือนปีเกิด</span>
            <input v-model="caseManagerForm.date_of_birth" type="date" required />
          </label>

          <label>
            <span>เพศ</span>
            <select v-model="caseManagerForm.gender" required>
              <option v-for="option in genderOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>

          <label>
            <span>เบอร์โทรศัพท์</span>
            <input v-model="caseManagerForm.phone" maxlength="30" />
          </label>

          <label>
            <span>อีเมล</span>
            <input v-model="caseManagerForm.email" type="email" maxlength="255" />
          </label>

          <label>
            <span>จังหวัด</span>
            <select v-model="caseManagerForm.province" required>
              <option value="" disabled>เลือกจังหวัด</option>
              <option v-for="province in provinceOptions" :key="province" :value="province">
                {{ province }}
              </option>
            </select>
          </label>

          <label>
            <span>อำเภอ/เขต</span>
            <input v-model="caseManagerForm.district" required maxlength="160" />
          </label>

          <label>
            <span>ตำบล/แขวง</span>
            <input v-model="caseManagerForm.subdistrict" required maxlength="160" />
          </label>

          <label>
            <span>รหัสไปรษณีย์</span>
            <input v-model="caseManagerForm.postal_code" required maxlength="10" />
          </label>

          <label>
            <span>บ้านเลขที่</span>
            <input v-model="caseManagerForm.house_no" maxlength="60" />
          </label>

          <label>
            <span>หมู่ที่</span>
            <input v-model="caseManagerForm.village_no" maxlength="60" />
          </label>

          <label class="wide-field">
            <span>ถนน</span>
            <input v-model="caseManagerForm.road" maxlength="160" />
          </label>
        </div>

        <div class="form-actions">
          <button
            v-if="isEditingCaseManager"
            class="secondary-action"
            type="button"
            @click="resetCaseManagerForm"
          >
            ยกเลิกแก้ไข
          </button>
          <button class="primary-action" type="submit" :disabled="isSubmittingCaseManager">
            {{
              isSubmittingCaseManager
                ? 'กำลังบันทึก...'
                : isEditingCaseManager
                  ? 'บันทึกการแก้ไข'
                  : 'สร้างบัญชี'
            }}
          </button>
        </div>
      </form>

      <section class="admin-panel" aria-labelledby="case-manager-list-title">
        <div class="panel-heading">
          <span class="panel-icon">
            <i class="bi bi-list-check" aria-hidden="true"></i>
          </span>
          <div>
            <h2 id="case-manager-list-title">รายชื่อ Case Manager</h2>
            <p>แก้ไขข้อมูลหรือลบบัญชีที่ไม่ใช้งานแล้ว</p>
          </div>
          <button
            type="button"
            class="refresh-button"
            :class="{ 'is-loading': isLoadingCaseManagers }"
            :disabled="isLoadingCaseManagers"
            aria-label="รีเฟรชรายชื่อ Case Manager"
            @click="loadCaseManagers"
          >
            <i class="bi bi-arrow-clockwise" aria-hidden="true"></i>
          </button>
        </div>

        <div v-if="caseManagers.length === 0" class="empty-state">ยังไม่มีบัญชี Case Manager</div>

        <div v-else class="case-manager-list">
          <article v-for="caseManager in caseManagers" :key="caseManager.id" class="manager-card">
            <div>
              <h3>{{ caseManager.full_name }}</h3>
              <p>{{ caseManager.thai_id_masked }} · {{ caseManager.address.province }}</p>
            </div>
            <div class="row-actions">
              <button type="button" class="text-button" @click="editCaseManager(caseManager)">
                <i class="bi bi-pencil-square" aria-hidden="true"></i>
                <span>แก้ไข</span>
              </button>
              <button
                type="button"
                class="danger-button"
                :disabled="deletingCaseManagerId === caseManager.id"
                @click="removeCaseManager(caseManager)"
              >
                <i class="bi bi-trash" aria-hidden="true"></i>
                <span>{{ deletingCaseManagerId === caseManager.id ? 'กำลังลบ' : 'ลบ' }}</span>
              </button>
            </div>
          </article>
        </div>
      </section>

      <form class="admin-panel" @submit.prevent="submitReset">
        <div class="panel-heading">
          <span class="panel-icon">
            <i class="bi bi-shield-lock" aria-hidden="true"></i>
          </span>
          <div>
            <h2>รีเซ็ตรหัสผ่าน</h2>
            <p>ตั้งรหัสผ่านชั่วคราวให้ผู้ใช้ แล้วแจ้งให้ผู้ใช้เปลี่ยนรหัสผ่านในหน้าบัญชี</p>
          </div>
        </div>

        <div class="form-grid form-grid--compact">
          <label>
            <span>เลขประจำตัวประชาชน</span>
            <input
              v-model="resetForm.thai_id"
              inputmode="numeric"
              maxlength="13"
              minlength="13"
              pattern="[0-9]{13}"
              required
              autocomplete="off"
              placeholder="กรอกเลข 13 หลัก"
              @input="updateResetThaiId"
            />
          </label>

          <label>
            <span>รหัสผ่านชั่วคราว</span>
            <input
              v-model="resetForm.temporary_password"
              type="password"
              minlength="8"
              maxlength="128"
              required
              autocomplete="new-password"
              placeholder="เช่น TempPass@123"
            />
          </label>
        </div>

        <div v-if="resetUser" class="reset-result">
          <span>บัญชีที่รีเซ็ต</span>
          <strong>{{ resetUser.full_name }}</strong>
          <small>{{ resetUser.role }} · {{ resetUser.thai_id_masked }}</small>
        </div>

        <div class="form-actions">
          <button class="primary-action" type="submit" :disabled="isSubmittingReset">
            {{ isSubmittingReset ? 'กำลังรีเซ็ต...' : 'รีเซ็ตรหัสผ่าน' }}
          </button>
        </div>
      </form>
    </section>
  </main>
</template>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: var(--admin-bg);
}

.admin-shell {
  display: grid;
  gap: 1rem;
  width: min(1100px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 1.5rem 0 4rem;
}

.page-heading,
.admin-panel {
  border: 1px solid var(--admin-border);
  border-radius: var(--radius-panel);
  background: #ffffff;
  box-shadow: var(--shadow-soft);
}

.page-heading {
  padding: 1.2rem;
}

.page-heading h1,
.page-heading p,
.panel-heading h2,
.panel-heading p {
  margin: 0;
}

.page-heading h1 {
  color: var(--admin-text);
  font-size: clamp(1.7rem, 4vw, 2.35rem);
}

.page-subtitle,
.panel-heading p,
.manager-card p,
.reset-result span,
.reset-result small {
  color: #858796;
}

.admin-panel {
  display: grid;
  gap: 1rem;
  padding: 1.15rem;
}

.panel-heading {
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
}

.panel-heading > div {
  min-width: 0;
  flex: 1;
}

.panel-heading h2 {
  color: var(--admin-text);
  font-size: 1.08rem;
}

.panel-heading p {
  margin-top: 0.2rem;
  line-height: 1.55;
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

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.form-grid--compact {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.wide-field {
  grid-column: span 2;
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

input,
select {
  width: 100%;
  height: 2.75rem;
  border: 1px solid var(--admin-border);
  border-radius: 0.5rem;
  padding: 0 0.85rem;
  color: var(--admin-text);
  background: #ffffff;
  outline: none;
}

input:focus,
select:focus {
  border-color: var(--admin-primary);
  box-shadow: 0 0 0 3px rgb(78 115 223 / 0.14);
}

.form-actions,
.row-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
}

.case-manager-list {
  display: grid;
  gap: 0.65rem;
}

.manager-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid var(--admin-border);
  border-radius: 0.6rem;
  padding: 0.85rem;
  background: #fbfdff;
}

.manager-card h3,
.manager-card p {
  margin: 0;
}

.manager-card h3 {
  color: var(--admin-text);
  font-size: 1rem;
}

.empty-state {
  padding: 1.5rem;
  color: #858796;
  text-align: center;
}

.reset-result {
  display: grid;
  gap: 0.2rem;
  border-left: 4px solid #1cc88a;
  border-radius: 0.45rem;
  padding: 0.85rem 1rem;
  background: #f0fdf4;
}

.reset-result strong {
  color: var(--admin-text);
}

@media (max-width: 900px) {
  .form-grid,
  .form-grid--compact {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .form-grid,
  .form-grid--compact,
  .wide-field {
    grid-template-columns: 1fr;
    grid-column: auto;
  }

  .manager-card,
  .panel-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .form-actions,
  .row-actions,
  .primary-action,
  .secondary-action {
    width: 100%;
  }
}
</style>
