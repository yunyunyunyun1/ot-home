<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { registerVillageVolunteer, type VillageVolunteerRegisterPayload } from '../../api/auth'
import { ApiError } from '../../api/client'
import {
  thaiAddressData,
  type ThaiDistrict,
  type ThaiProvince,
  type ThaiSubdistrict,
} from '../../data/thaiAddress'
import { toDigits } from '../../utils/digits'

const provinceOptions = [...thaiAddressData.provinces]
const genderOptions = [
  { value: 'male', label: 'ชาย' },
  { value: 'female', label: 'หญิง' },
  { value: 'other', label: 'อื่น ๆ' },
  { value: 'prefer_not_to_say', label: 'ไม่ระบุ' },
]

const form = reactive({
  thai_id: '',
  password: '',
  full_name: '',
  date_of_birth: '',
  gender: '',
  phone: '',
  email: '',
  hospital_or_clinic: '',
  house_no: '',
  village_no: '',
  road: '',
  province_id: '',
  district_id: '',
  subdistrict_id: '',
})

const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

function updateThaiId(event: Event) {
  form.thai_id = toDigits((event.target as HTMLInputElement).value)
}

const selectedProvince = computed<ThaiProvince | undefined>(() => {
  return provinceOptions.find((province) => String(province.id) === form.province_id)
})

const districtOptions = computed<ThaiDistrict[]>(() => {
  if (!selectedProvince.value) {
    return []
  }

  return thaiAddressData.districts.filter(
    (district) => district.province_id === selectedProvince.value?.id,
  )
})

const selectedDistrict = computed<ThaiDistrict | undefined>(() => {
  return districtOptions.value.find((district) => String(district.id) === form.district_id)
})

const subdistrictOptions = computed<ThaiSubdistrict[]>(() => {
  if (!selectedDistrict.value) {
    return []
  }

  return thaiAddressData.subDistricts.filter(
    (subdistrict) => subdistrict.district_id === selectedDistrict.value?.id,
  )
})

const selectedSubdistrict = computed<ThaiSubdistrict | undefined>(() => {
  return subdistrictOptions.value.find(
    (subdistrict) => String(subdistrict.id) === form.subdistrict_id,
  )
})

const postalCode = computed(() => {
  return selectedSubdistrict.value ? String(selectedSubdistrict.value.zip_code) : ''
})

function optionalValue(value: string): string | null {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function resetDistrictSelection() {
  form.district_id = ''
  form.subdistrict_id = ''
}

function resetSubdistrictSelection() {
  form.subdistrict_id = ''
}

function buildPayload(): VillageVolunteerRegisterPayload {
  return {
    thai_id: form.thai_id.trim(),
    password: form.password,
    full_name: form.full_name.trim(),
    date_of_birth: form.date_of_birth,
    gender: form.gender,
    phone: optionalValue(form.phone),
    email: optionalValue(form.email),
    hospital_or_clinic: form.hospital_or_clinic.trim(),
    address: {
      house_no: optionalValue(form.house_no),
      village_no: optionalValue(form.village_no),
      road: optionalValue(form.road),
      subdistrict: selectedSubdistrict.value?.name_in_thai ?? '',
      district: selectedDistrict.value?.name_in_thai ?? '',
      province: selectedProvince.value?.name_in_thai ?? '',
      postal_code: postalCode.value,
      country: 'Thailand',
    },
  }
}

async function submitForm() {
  errorMessage.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  try {
    const user = await registerVillageVolunteer(buildPayload())
    successMessage.value = `สมัครบัญชีผู้ดูแลเด็กสำเร็จ: ${user.full_name}`
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : 'ไม่สามารถสมัครใช้งานได้ กรุณาลองใหม่อีกครั้ง'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="register-form-page">
    <nav class="top-nav" aria-label="Main navigation">
      <RouterLink class="brand" to="/" aria-label="OT@HOME home">
        <span class="logo-slot" aria-hidden="true"></span>
        <span class="brand-name">OT@HOME</span>
      </RouterLink>

      <div class="nav-actions">
        <RouterLink class="nav-link" to="/register">ย้อนกลับ</RouterLink>
        <RouterLink class="nav-button" to="/login">เข้าสู่ระบบ</RouterLink>
      </div>
    </nav>

    <section class="form-shell" aria-labelledby="volunteer-register-title">
      <div class="page-heading">
        <h1 id="volunteer-register-title">สมัครบัญชีผู้ดูแลเด็ก</h1>
      </div>

      <form class="register-form" @submit.prevent="submitForm">
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
            <span>
              รหัสผ่าน <strong class="required-marker">*</strong>
              <small>(อย่างน้อย 8 ตัวอักษร มีพิมเล็กพิมใหญ่ และ มีตัวอักษรพิเศษ _+=-!@#$%^)</small>
            </span>
            <input
              v-model="form.password"
              type="password"
              minlength="8"
              maxlength="128"
              required
              autocomplete="new-password"
              placeholder="สร้างรหัสผ่าน"
            />
          </label>
        </fieldset>

        <fieldset>
          <legend>ข้อมูลส่วนตัว</legend>

          <label>
            <span>ชื่อ-นามสกุล <strong class="required-marker">*</strong></span>
            <input v-model="form.full_name" required maxlength="160" autocomplete="name" />
          </label>

          <label>
            <span>วันเดือนปีเกิด <strong class="required-marker">*</strong></span>
            <input v-model="form.date_of_birth" type="date" required autocomplete="bday" />
          </label>

          <label>
            <span>เพศ <strong class="required-marker">*</strong></span>
            <select v-model="form.gender" required>
              <option value="" disabled>เลือกเพศ</option>
              <option v-for="option in genderOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>

          <label class="wide-field">
            <span>โรงพยาบาลหรือคลินิก <strong class="required-marker">*</strong></span>
            <input v-model="form.hospital_or_clinic" required maxlength="200" />
          </label>

          <label>
            <span>เบอร์โทรศัพท์</span>
            <input v-model="form.phone" type="tel" maxlength="30" autocomplete="tel" />
          </label>

          <label>
            <span>อีเมล</span>
            <input v-model="form.email" type="email" maxlength="255" autocomplete="email" />
          </label>
        </fieldset>

        <fieldset>
          <legend>ที่อยู่</legend>

          <label>
            <span>บ้านเลขที่</span>
            <input v-model="form.house_no" maxlength="60" />
          </label>

          <label>
            <span>หมู่ที่</span>
            <input v-model="form.village_no" maxlength="60" />
          </label>

          <label class="wide-field">
            <span>ถนน</span>
            <input v-model="form.road" maxlength="160" />
          </label>

          <label>
            <span>จังหวัด <strong class="required-marker">*</strong></span>
            <select v-model="form.province_id" required @change="resetDistrictSelection">
              <option value="" disabled>เลือกจังหวัด</option>
              <option
                v-for="province in provinceOptions"
                :key="province.id"
                :value="String(province.id)"
              >
                {{ province.name_in_thai }}
              </option>
            </select>
          </label>

          <label>
            <span>อำเภอ/เขต <strong class="required-marker">*</strong></span>
            <select
              v-model="form.district_id"
              required
              :disabled="!selectedProvince"
              @change="resetSubdistrictSelection"
            >
              <option value="" disabled>เลือกอำเภอ/เขต</option>
              <option
                v-for="district in districtOptions"
                :key="district.id"
                :value="String(district.id)"
              >
                {{ district.name_in_thai }}
              </option>
            </select>
          </label>

          <label>
            <span>ตำบล/แขวง <strong class="required-marker">*</strong></span>
            <select v-model="form.subdistrict_id" required :disabled="!selectedDistrict">
              <option value="" disabled>เลือกตำบล/แขวง</option>
              <option
                v-for="subdistrict in subdistrictOptions"
                :key="subdistrict.id"
                :value="String(subdistrict.id)"
              >
                {{ subdistrict.name_in_thai }}
              </option>
            </select>
          </label>

          <label>
            <span>รหัสไปรษณีย์ <strong class="required-marker">*</strong></span>
            <input
              :value="postalCode"
              required
              inputmode="numeric"
              minlength="5"
              maxlength="10"
              readonly
              placeholder="เลือกตำบล/แขวงก่อน"
            />
          </label>
        </fieldset>

        <p v-if="errorMessage" class="form-alert form-alert--error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="form-alert form-alert--success">{{ successMessage }}</p>

        <div class="form-actions">
          <button class="primary-action" type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'กำลังสมัคร...' : 'สมัครบัญชี' }}
          </button>
        </div>
      </form>
    </section>
  </main>
</template>

<style scoped>
.register-form-page {
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

.register-form-page::before {
  display: none;
}

.top-nav,
.form-shell {
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

.form-shell {
  padding: clamp(2rem, 6vw, 4rem) 0 4rem;
}

.page-heading {
  max-width: 44rem;
  margin: 0 auto;
  text-align: center;
}

h1 {
  margin: 0;
  color: var(--color-text);
  font-size: clamp(1.85rem, 3.8vw, 3.35rem);
  line-height: 1.08;
  letter-spacing: 0;
  white-space: nowrap;
}

.register-form {
  display: grid;
  gap: 1.1rem;
  margin-top: 2.2rem;
}

fieldset {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin: 0;
  min-inline-size: 0;
  padding: 1.35rem 1.15rem 1.15rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: rgb(255 255 255 / 0.92);
  box-shadow: var(--shadow-soft);
}

legend {
  display: block;
  grid-column: 1 / -1;
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

label span small {
  color: var(--color-muted);
  font-weight: 600;
}

.required-marker {
  color: #dc2626;
  font-weight: 800;
}

input,
select {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: #ffffff;
  color: var(--color-text);
  outline: none;
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease;
}

input,
select {
  height: 2.9rem;
  padding: 0 0.85rem;
}

select {
  padding-right: 2.25rem;
  appearance: none;
  background-image:
    linear-gradient(45deg, transparent 50%, var(--color-muted) 50%),
    linear-gradient(135deg, var(--color-muted) 50%, transparent 50%);
  background-position:
    calc(100% - 1rem) 1.22rem,
    calc(100% - 0.68rem) 1.22rem;
  background-repeat: no-repeat;
  background-size:
    0.35rem 0.35rem,
    0.35rem 0.35rem;
}

select:disabled,
input:read-only {
  color: var(--color-muted);
  background-color: #f8fafc;
}

input:focus,
select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.14);
}

small {
  color: var(--color-muted);
  line-height: 1.6;
}

.wide-field {
  grid-column: 1 / -1;
}

.form-alert {
  margin: 0;
  padding: 0.9rem 1rem;
  border-radius: 0.5rem;
  font-weight: 700;
  line-height: 1.6;
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
  flex-wrap: wrap;
  justify-content: flex-end;
}

.primary-action {
  min-width: 12rem;
  padding: 0 1.25rem;
}

@media (max-width: 760px) {
  fieldset {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .top-nav,
  .form-shell {
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

  h1 {
    white-space: normal;
  }

  .primary-action {
    width: 100%;
  }
}
</style>
