<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import { RouterLink } from "vue-router"

import {
  assignKidToCaregiver,
  createKid,
  deleteKid,
  getCaseManagerContext,
  listCaregivers,
  listVillageVolunteers,
  listKids,
  updateKid,
  type CaregiverResponse,
  type KidCreatePayload,
  type KidResponse,
  type KidUpdatePayload,
  type VillageVolunteerResponse,
} from "../../api/kids"
import { ApiError } from "../../api/client"
import {
  thaiAddressData,
  type ThaiDistrict,
  type ThaiProvince,
  type ThaiSubdistrict,
} from "../../data/thaiAddress"
import { useAuthStore } from "../../stores/auth"
import { toDigits } from "../../utils/digits"

const authStore = useAuthStore()
const provinceOptions = [...thaiAddressData.provinces]

const form = reactive({
  thai_id: "",
  full_name: "",
  house_no: "",
  village_no: "",
  road: "",
  province_id: "",
  district_id: "",
  subdistrict_id: "",
})

const kids = ref<KidResponse[]>([])
const caregivers = ref<CaregiverResponse[]>([])
const villageVolunteers = ref<VillageVolunteerResponse[]>([])
const managerProvince = ref("")
const selectedKidId = ref("")
const assigningCaregiverId = ref("")
const selectedSlotByCaregiverId = ref<Record<string, string>>({})
const editingKidId = ref("")
const deletingKidId = ref("")
const expandedKidIds = ref<Set<string>>(new Set())
const expandedCaregiverIds = ref<Set<string>>(new Set())
const expandedVillageVolunteerIds = ref<Set<string>>(new Set())
const isKidPanelOpen = ref(false)
const isLoading = ref(false)
const isLoadingCaregivers = ref(false)
const isLoadingVillageVolunteers = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref("")
const successMessage = ref("")

function updateThaiId(event: Event) {
  form.thai_id = toDigits((event.target as HTMLInputElement).value)
}

const selectedProvince = computed<ThaiProvince | undefined>(() => {
  return provinceOptions.find((province) => province.name_in_thai === managerProvince.value)
    ?? provinceOptions.find((province) => String(province.id) === form.province_id)
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
  return subdistrictOptions.value.find((subdistrict) => String(subdistrict.id) === form.subdistrict_id)
})

const postalCode = computed(() => {
  return selectedSubdistrict.value ? String(selectedSubdistrict.value.zip_code) : ""
})

const selectedKid = computed(() => {
  return kids.value.find((kid) => kid.id === selectedKidId.value)
})

const matchedKidsCount = computed(() => {
  return kids.value.filter((kid) => kid.assigned_caregiver).length
})

const openSlotCount = computed(() => {
  return caregivers.value.reduce((total, caregiver) => total + openSlots(caregiver).length, 0)
})

function caregiverAssignedCount(caregiverId: string): number {
  return kids.value.filter((kid) => kid.assigned_caregiver?.id === caregiverId).length
}

function openSlots(caregiver: CaregiverResponse) {
  return caregiver.availability_slots.filter((slot) => !slot.is_booked)
}

function formatSlot(slot: { available_date: string; start_time: string; end_time: string }) {
  return `${slot.available_date} ${slot.start_time.slice(0, 5)}-${slot.end_time.slice(0, 5)}`
}

function optionalValue(value: string): string | null {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function resetDistrictSelection() {
  form.district_id = ""
  form.subdistrict_id = ""
}

function resetSubdistrictSelection() {
  form.subdistrict_id = ""
}

function resetForm() {
  editingKidId.value = ""
  form.thai_id = ""
  form.full_name = ""
  form.house_no = ""
  form.village_no = ""
  form.road = ""
  resetDistrictSelection()
  syncResponsibleProvince()
}

function buildPayload(): KidCreatePayload {
  return {
    thai_id: form.thai_id.trim(),
    full_name: form.full_name.trim(),
    address: {
      house_no: optionalValue(form.house_no),
      village_no: optionalValue(form.village_no),
      road: optionalValue(form.road),
      subdistrict: selectedSubdistrict.value?.name_in_thai ?? "",
      district: selectedDistrict.value?.name_in_thai ?? "",
      province: managerProvince.value,
      postal_code: postalCode.value,
      country: "Thailand",
    },
  }
}

function buildUpdatePayload(): KidUpdatePayload {
  const payload = buildPayload()
  return {
    full_name: payload.full_name,
    address: payload.address,
  }
}

function fillFormFromKid(kid: KidResponse) {
  const province = provinceOptions.find((option) => option.name_in_thai === kid.address.province)
  const district = province
    ? thaiAddressData.districts.find(
        (option) => option.province_id === province.id && option.name_in_thai === kid.address.district,
      )
    : undefined
  const subdistrict = district
    ? thaiAddressData.subDistricts.find(
        (option) => option.district_id === district.id && option.name_in_thai === kid.address.subdistrict,
      )
    : undefined

  editingKidId.value = kid.id
  form.thai_id = ""
  form.full_name = kid.full_name
  form.house_no = kid.address.house_no ?? ""
  form.village_no = kid.address.village_no ?? ""
  form.road = kid.address.road ?? ""
  form.province_id = province ? String(province.id) : ""
  form.district_id = district ? String(district.id) : ""
  form.subdistrict_id = subdistrict ? String(subdistrict.id) : ""
  isKidPanelOpen.value = true
}

function syncResponsibleProvince() {
  const province = provinceOptions.find((option) => option.name_in_thai === managerProvince.value)
  form.province_id = province ? String(province.id) : ""
}

async function loadCaseManagerContext() {
  const context = await getCaseManagerContext()
  managerProvince.value = context.province
  syncResponsibleProvince()
}

async function loadKids() {
  isLoading.value = true
  errorMessage.value = ""

  try {
    kids.value = await listKids()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : "ไม่สามารถโหลดรายชื่อเด็กได้ กรุณาลองใหม่อีกครั้ง"
  } finally {
    isLoading.value = false
  }
}

async function loadCaregivers() {
  isLoadingCaregivers.value = true
  errorMessage.value = ""

  try {
    caregivers.value = await listCaregivers()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : "ไม่สามารถโหลดรายชื่อนักบำบัดได้ กรุณาลองใหม่อีกครั้ง"
  } finally {
    isLoadingCaregivers.value = false
  }
}

async function submitForm() {
  errorMessage.value = ""
  successMessage.value = ""
  isSubmitting.value = true

  try {
    if (editingKidId.value) {
      const kid = await updateKid(editingKidId.value, buildUpdatePayload())
      kids.value = kids.value.map((item) => (item.id === kid.id ? kid : item))
      successMessage.value = "แก้ไขข้อมูลเด็กแล้ว"
    } else {
      const kid = await createKid(buildPayload())
      kids.value = [kid, ...kids.value.filter((item) => item.id !== kid.id)]
      successMessage.value = "เพิ่มข้อมูลเด็กเข้าสู่ระบบแล้ว"
    }
    resetForm()
    isKidPanelOpen.value = false
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : "ไม่สามารถบันทึกข้อมูลเด็กได้ กรุณาลองใหม่อีกครั้ง"
  } finally {
    isSubmitting.value = false
  }
}

async function removeKid(kid: KidResponse) {
  errorMessage.value = ""
  successMessage.value = ""
  deletingKidId.value = kid.id

  try {
    await deleteKid(kid.id)
    kids.value = kids.value.filter((item) => item.id !== kid.id)
    if (selectedKidId.value === kid.id) {
      selectedKidId.value = ""
    }
    if (editingKidId.value === kid.id) {
      resetForm()
      isKidPanelOpen.value = false
    }
    successMessage.value = "ลบข้อมูลเด็กแล้ว"
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : "ไม่สามารถลบข้อมูลเด็กได้ กรุณาลองใหม่อีกครั้ง"
  } finally {
    deletingKidId.value = ""
  }
}

function toggleKidDetails(kidId: string) {
  const next = new Set(expandedKidIds.value)
  if (next.has(kidId)) {
    next.delete(kidId)
  } else {
    next.add(kidId)
  }
  expandedKidIds.value = next
}

function toggleCaregiverDetails(caregiverId: string) {
  const next = new Set(expandedCaregiverIds.value)
  if (next.has(caregiverId)) {
    next.delete(caregiverId)
  } else {
    next.add(caregiverId)
  }
  expandedCaregiverIds.value = next
}

function toggleVillageVolunteerDetails(volunteerId: string) {
  const next = new Set(expandedVillageVolunteerIds.value)
  if (next.has(volunteerId)) {
    next.delete(volunteerId)
  } else {
    next.add(volunteerId)
  }
  expandedVillageVolunteerIds.value = next
}

async function loadVillageVolunteers() {
  isLoadingVillageVolunteers.value = true
  errorMessage.value = ""

  try {
    villageVolunteers.value = await listVillageVolunteers()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : "ไม่สามารถโหลดรายชื่อผู้ดูแลเด็กได้ กรุณาลองใหม่อีกครั้ง"
  } finally {
    isLoadingVillageVolunteers.value = false
  }
}

async function assignSelectedKid(caregiverId: string) {
  if (!selectedKidId.value) {
    errorMessage.value = "กรุณาเลือกเด็กก่อนจับคู่นักบำบัด"
    return
  }
  const selectedSlotId = selectedSlotByCaregiverId.value[caregiverId]
  if (!selectedSlotId) {
    errorMessage.value = "กรุณาเลือกเวลาว่างก่อนจับคู่"
    return
  }

  errorMessage.value = ""
  successMessage.value = ""
  assigningCaregiverId.value = caregiverId

  try {
    const updatedKid = await assignKidToCaregiver(selectedKidId.value, caregiverId, selectedSlotId)
    kids.value = kids.value.map((kid) => (kid.id === updatedKid.id ? updatedKid : kid))
    await loadCaregivers()
    successMessage.value = `จับคู่ ${updatedKid.full_name} กับ ${updatedKid.assigned_caregiver?.full_name ?? "นักบำบัด"} แล้ว`
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : "ไม่สามารถจับคู่นักบำบัดได้ กรุณาลองใหม่อีกครั้ง"
  } finally {
    assigningCaregiverId.value = ""
  }
}

onMounted(async () => {
  try {
    await loadCaseManagerContext()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : "ไม่สามารถโหลดจังหวัดที่รับผิดชอบได้ กรุณาลองใหม่อีกครั้ง"
  }

  await loadKids()
  await loadCaregivers()
  await loadVillageVolunteers()
})
</script>

<template>
  <main class="case-manager-page">
    <nav class="top-nav" aria-label="Main navigation">
      <RouterLink class="brand" to="/" aria-label="OT@HOME home">
        <span class="logo-slot" aria-hidden="true"></span>
        <span class="brand-name">OT@HOME</span>
      </RouterLink>

      <div class="user-chip">{{ authStore.user?.full_name ?? "Case Manager" }}</div>
    </nav>

    <section class="dashboard-shell" aria-labelledby="case-manager-title">
      <div class="page-heading">
        <div>
          <p class="eyebrow">OT@HOME Case Manager</p>
          <h1 id="case-manager-title">
            ผู้ดูแลประจำจังหวัด {{ managerProvince || "..." }}
          </h1>
        </div>

        <div class="summary-strip" aria-label="ภาพรวม">
          <div class="summary-item">
            <span>เด็กในพื้นที่</span>
            <strong>{{ kids.length }}</strong>
          </div>
          <div class="summary-item">
            <span>จับคู่แล้ว</span>
            <strong>{{ matchedKidsCount }}</strong>
          </div>
          <div class="summary-item">
            <span>นักบำบัด</span>
            <strong>{{ caregivers.length }}</strong>
          </div>
          <div class="summary-item">
            <span>เวลาว่าง</span>
            <strong>{{ openSlotCount }}</strong>
          </div>
          <div class="summary-item">
            <span>ผู้ดูแลเด็ก</span>
            <strong>{{ villageVolunteers.length }}</strong>
          </div>
        </div>
      </div>

      <details
        class="create-panel"
        :open="isKidPanelOpen"
        @toggle="isKidPanelOpen = ($event.target as HTMLDetailsElement).open"
      >
        <summary>{{ editingKidId ? "แก้ไขข้อมูลเด็ก" : "เพิ่มข้อมูลเด็ก" }}</summary>
        <form class="kid-form" @submit.prevent="submitForm">
          <fieldset>
            <legend>ข้อมูลเด็ก</legend>

            <label class="wide-field">
              <span>ชื่อ-นามสกุลเด็ก <strong class="required-marker">*</strong></span>
              <input
                v-model="form.full_name"
                required
                maxlength="160"
                autocomplete="off"
                placeholder="กรอกชื่อ-นามสกุล"
              />
            </label>

            <label class="wide-field">
              <span>เลขประจำตัวประชาชนเด็ก <strong class="required-marker">*</strong></span>
              <input
                v-model="form.thai_id"
                inputmode="numeric"
                maxlength="13"
                minlength="13"
                pattern="[0-9]{13}"
                :required="!editingKidId"
                :disabled="Boolean(editingKidId)"
                autocomplete="off"
                :placeholder="editingKidId ? 'ไม่แก้ไขเลขประชาชนจากหน้านี้' : 'กรอกเลข 13 หลัก'"
                @input="updateThaiId"
              />
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
              <input :value="managerProvince" required readonly />
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
              {{ isSubmitting ? "กำลังบันทึก..." : editingKidId ? "บันทึกการแก้ไข" : "เพิ่มข้อมูลเด็ก" }}
            </button>
            <button v-if="editingKidId" class="secondary-action" type="button" @click="resetForm">
              ยกเลิก
            </button>
          </div>
        </form>
      </details>

      <p v-if="errorMessage" class="form-alert form-alert--error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="form-alert form-alert--success">{{ successMessage }}</p>

      <div class="match-grid">
        <section class="table-panel" aria-label="ตารางเด็กในพื้นที่">
          <div class="list-header">
            <div>
              <h2>เด็กในพื้นที่</h2>
              <p>{{ selectedKid ? `เลือกอยู่: ${selectedKid.full_name}` : "เลือกเด็ก 1 คนเพื่อจับคู่" }}</p>
            </div>
            <button
              type="button"
              class="refresh-button"
              :class="{ 'is-loading': isLoading }"
              :disabled="isLoading"
              aria-label="รีเฟรชรายชื่อเด็ก"
              @click="loadKids"
            >
              <i class="bi bi-arrow-clockwise" aria-hidden="true"></i>
            </button>
          </div>

          <div v-if="kids.length === 0" class="empty-state">
            ยังไม่มีข้อมูลเด็กในพื้นที่รับผิดชอบ
          </div>

          <table v-else>
            <thead>
              <tr>
                <th scope="col">ชื่อเด็ก</th>
                <th scope="col">นักบำบัด</th>
                <th scope="col" class="actions-column"></th>
              </tr>
            </thead>
            <tbody>
              <template v-for="kid in kids" :key="kid.id">
                <tr :class="{ 'is-selected': selectedKidId === kid.id }" @click="selectedKidId = kid.id">
                  <td>{{ kid.full_name }}</td>
                  <td class="actions-cell">
                    <span
                      class="status-pill"
                      :class="kid.assigned_caregiver ? 'status-pill--success' : 'status-pill--neutral'"
                    >
                      {{ kid.assigned_caregiver?.full_name ?? "ยังไม่จับคู่" }}
                    </span>
                  </td>
                  <td class="actions-cell">
                    <div class="row-actions">
                      <button type="button" class="text-button" @click.stop="fillFormFromKid(kid)">
                        <i class="bi bi-pencil-square" aria-hidden="true"></i>
                        <span>แก้ไข</span>
                      </button>
                      <button
                        type="button"
                        class="danger-button"
                        :disabled="deletingKidId === kid.id"
                        @click.stop="removeKid(kid)"
                      >
                        <i class="bi bi-trash" aria-hidden="true"></i>
                        <span>{{ deletingKidId === kid.id ? "กำลังลบ" : "ลบ" }}</span>
                      </button>
                      <button
                        type="button"
                        class="icon-toggle-button"
                        :aria-expanded="expandedKidIds.has(kid.id)"
                        :aria-label="expandedKidIds.has(kid.id) ? 'ซ่อนรายละเอียดเด็ก' : 'ดูรายละเอียดเด็ก'"
                        @click.stop="toggleKidDetails(kid.id)"
                      >
                        {{ expandedKidIds.has(kid.id) ? "ซ่อน" : "ดู" }}
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="expandedKidIds.has(kid.id)" class="detail-row">
                  <td colspan="3">
                    <span><strong>เลขประจำตัวประชาชน:</strong> {{ kid.thai_id_masked }}</span>
                    <span>
                      <strong>ที่อยู่:</strong>
                      {{ kid.address.subdistrict }}, {{ kid.address.district }}, {{ kid.address.province }}
                    </span>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </section>

        <section class="table-panel" aria-label="ตารางนักบำบัดในพื้นที่">
          <div class="list-header">
            <div>
              <h2>นักบำบัดในพื้นที่</h2>
              <p>จับคู่เด็กที่เลือกกับนักบำบัด</p>
            </div>
            <button
              type="button"
              class="refresh-button"
              :class="{ 'is-loading': isLoadingCaregivers }"
              :disabled="isLoadingCaregivers"
              aria-label="รีเฟรชรายชื่อนักบำบัด"
              @click="loadCaregivers"
            >
              <i class="bi bi-arrow-clockwise" aria-hidden="true"></i>
            </button>
          </div>

          <div v-if="caregivers.length === 0" class="empty-state">
            ยังไม่มีนักบำบัดที่ลงทะเบียนในจังหวัดนี้
          </div>

          <table v-else>
            <thead>
              <tr>
                <th scope="col">ชื่อนักบำบัด</th>
                <th scope="col">เด็ก</th>
                <th scope="col">เวลาว่าง</th>
                <th scope="col">จับคู่</th>
                <th scope="col" class="actions-column"></th>
              </tr>
            </thead>
            <tbody>
              <template v-for="caregiver in caregivers" :key="caregiver.id">
                <tr>
                  <td>{{ caregiver.full_name }}</td>
                  <td><span class="count-pill">{{ caregiverAssignedCount(caregiver.id) }}</span></td>
                  <td>
                    <select
                      v-model="selectedSlotByCaregiverId[caregiver.id]"
                      class="slot-select"
                      :disabled="openSlots(caregiver).length === 0"
                    >
                      <option value="">เลือกเวลา</option>
                      <option v-for="slot in openSlots(caregiver)" :key="slot.id" :value="slot.id">
                        {{ formatSlot(slot) }}
                      </option>
                    </select>
                  </td>
                  <td class="actions-cell actions-cell--compact">
                    <button
                      type="button"
                      class="assign-button"
                      :disabled="
                        !selectedKidId ||
                        !selectedSlotByCaregiverId[caregiver.id] ||
                        assigningCaregiverId === caregiver.id
                      "
                      @click="assignSelectedKid(caregiver.id)"
                    >
                      {{ assigningCaregiverId === caregiver.id ? "กำลังจับคู่" : "จับคู่" }}
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      class="icon-toggle-button"
                      :aria-expanded="expandedCaregiverIds.has(caregiver.id)"
                      :aria-label="expandedCaregiverIds.has(caregiver.id) ? 'ซ่อนรายละเอียดนักบำบัด' : 'ดูรายละเอียดนักบำบัด'"
                      @click="toggleCaregiverDetails(caregiver.id)"
                    >
                      {{ expandedCaregiverIds.has(caregiver.id) ? "ซ่อน" : "ดู" }}
                    </button>
                  </td>
                </tr>
                <tr v-if="expandedCaregiverIds.has(caregiver.id)" class="detail-row">
                  <td colspan="5">
                    <span><strong>สถานพยาบาล:</strong> {{ caregiver.hospital_or_clinic }}</span>
                    <span><strong>ใบประกอบวิชาชีพ:</strong> {{ caregiver.license_id }}</span>
                    <span>
                      <strong>ที่อยู่:</strong>
                      {{ caregiver.address.subdistrict }}, {{ caregiver.address.district }}
                    </span>
                    <span v-if="caregiver.availability_slots.length">
                      <strong>เวลาทั้งหมด:</strong> {{ caregiver.availability_slots.map(formatSlot).join(", ") }}
                    </span>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </section>

        <section class="table-panel village-volunteer-panel" aria-label="ตารางผู้ดูแลเด็กในพื้นที่">
          <div class="list-header">
            <div>
              <h2>ผู้ดูแลเด็กในพื้นที่</h2>
              <p>รายชื่อผู้ดูแลเด็กที่ลงทะเบียนในจังหวัด {{ managerProvince || "..." }}</p>
            </div>
            <button
              type="button"
              class="refresh-button"
              :class="{ 'is-loading': isLoadingVillageVolunteers }"
              :disabled="isLoadingVillageVolunteers"
              aria-label="รีเฟรชรายชื่อผู้ดูแลเด็ก"
              @click="loadVillageVolunteers"
            >
              <i class="bi bi-arrow-clockwise" aria-hidden="true"></i>
            </button>
          </div>

          <div v-if="villageVolunteers.length === 0" class="empty-state">
            ยังไม่มีผู้ดูแลเด็กที่ลงทะเบียนในจังหวัดนี้
          </div>

          <table v-else>
            <thead>
              <tr>
                <th scope="col">ชื่อผู้ดูแลเด็ก</th>
                <th scope="col">สถานพยาบาล</th>
                <th scope="col">ติดต่อ</th>
                <th scope="col" class="actions-column"></th>
              </tr>
            </thead>
            <tbody>
              <template v-for="volunteer in villageVolunteers" :key="volunteer.id">
                <tr>
                  <td>{{ volunteer.full_name }}</td>
                  <td>{{ volunteer.hospital_or_clinic }}</td>
                  <td>{{ volunteer.phone || volunteer.email || "-" }}</td>
                  <td class="actions-cell actions-cell--compact">
                    <button
                      type="button"
                      class="icon-toggle-button"
                      :aria-expanded="expandedVillageVolunteerIds.has(volunteer.id)"
                      :aria-label="expandedVillageVolunteerIds.has(volunteer.id) ? 'ซ่อนรายละเอียดผู้ดูแลเด็ก' : 'ดูรายละเอียดผู้ดูแลเด็ก'"
                      @click="toggleVillageVolunteerDetails(volunteer.id)"
                    >
                      {{ expandedVillageVolunteerIds.has(volunteer.id) ? "ซ่อน" : "ดู" }}
                    </button>
                  </td>
                </tr>
                <tr v-if="expandedVillageVolunteerIds.has(volunteer.id)" class="detail-row">
                  <td colspan="4">
                    <span><strong>เลขประจำตัวประชาชน:</strong> {{ volunteer.thai_id_masked }}</span>
                    <span><strong>สถานพยาบาล:</strong> {{ volunteer.hospital_or_clinic }}</span>
                    <span v-if="volunteer.license_id">
                      <strong>รหัส/เลขประจำตัว:</strong> {{ volunteer.license_id }}
                    </span>
                    <span>
                      <strong>ที่อยู่:</strong>
                      {{ volunteer.address.subdistrict }}, {{ volunteer.address.district }},
                      {{ volunteer.address.province }}
                    </span>
                    <span><strong>เบอร์โทร:</strong> {{ volunteer.phone || "-" }}</span>
                    <span><strong>อีเมล:</strong> {{ volunteer.email || "-" }}</span>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.case-manager-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgb(96 165 250 / 0.16), transparent 24rem),
    linear-gradient(135deg, #ffffff 0%, var(--color-background) 46%, #eef6ff 100%);
}

.top-nav,
.dashboard-shell {
  width: min(1220px, calc(100% - 2rem));
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
  border: 1px solid rgb(219 231 245 / 0.95);
  border-radius: 0.8rem;
  background: #ffffff;
  box-shadow: 0 12px 28px rgb(59 130 246 / 0.12);
}

.logo-slot::before {
  width: 1.25rem;
  height: 1.25rem;
  border: 0.3rem solid var(--color-primary);
  border-top-color: var(--color-secondary);
  border-radius: 50%;
  content: "";
}

.brand-name {
  color: var(--color-text);
  font-size: 1.2rem;
  font-weight: 850;
  letter-spacing: 0;
  white-space: nowrap;
}

.user-chip {
  max-width: 18rem;
  overflow: hidden;
  padding: 0.65rem 0.9rem;
  border: 1px solid rgb(219 231 245 / 0.9);
  border-radius: 999px;
  color: var(--color-text);
  background: rgb(255 255 255 / 0.86);
  font-size: 0.92rem;
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
  box-shadow: 0 10px 24px rgb(31 41 55 / 0.06);
}

.dashboard-shell {
  padding: clamp(1.5rem, 4vw, 2.8rem) 0 4rem;
}

.page-heading {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(24rem, 0.72fr);
  gap: 1.25rem;
  align-items: end;
}

.eyebrow {
  margin: 0 0 0.55rem;
  color: var(--color-primary);
  font-size: 0.82rem;
  font-weight: 850;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

h1,
h2 {
  margin: 0;
  color: var(--color-text);
  letter-spacing: 0;
}

h1 {
  font-size: clamp(1.9rem, 3.6vw, 3.1rem);
  line-height: 1.1;
}

h2 {
  font-size: 1.06rem;
  line-height: 1.25;
}

.summary-strip {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  overflow: hidden;
  border: 1px solid rgb(219 231 245 / 0.92);
  border-radius: 0.8rem;
  background: rgb(255 255 255 / 0.84);
  box-shadow: 0 18px 44px rgb(31 41 55 / 0.07);
}

.summary-item {
  display: grid;
  gap: 0.2rem;
  min-width: 0;
  padding: 0.85rem 0.95rem;
  border-left: 1px solid var(--color-border);
}

.summary-item:first-child {
  border-left: 0;
}

.summary-item span {
  overflow: hidden;
  color: var(--color-muted);
  font-size: 0.78rem;
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary-item strong {
  color: var(--color-text);
  font-size: 1.45rem;
  line-height: 1;
}

.create-panel,
.table-panel {
  border: 1px solid rgb(219 231 245 / 0.96);
  border-radius: var(--radius-panel);
  background: rgb(255 255 255 / 0.92);
  box-shadow: var(--shadow-soft);
}

.create-panel {
  margin-top: 1.25rem;
  padding: 0.95rem 1rem;
}

.create-panel summary {
  cursor: pointer;
  color: var(--color-text);
  font-weight: 850;
}

.create-panel summary::marker {
  color: var(--color-primary);
}

.create-panel[open] summary {
  margin-bottom: 1rem;
}

.kid-form {
  display: grid;
  gap: 1rem;
}

fieldset {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem 1rem;
  margin: 0;
  min-inline-size: 0;
  padding: 1.1rem;
  border: 1px solid rgb(219 231 245 / 0.82);
  border-radius: 0.6rem;
  background: #fbfdff;
}

legend {
  grid-column: 1 / -1;
  float: left;
  width: 100%;
  margin-bottom: 0.1rem;
  padding: 0;
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 850;
}

label {
  display: grid;
  gap: 0.42rem;
}

label span {
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 750;
}

.required-marker {
  color: #dc2626;
  font-weight: 850;
}

input,
select {
  width: 100%;
  height: 2.65rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: #ffffff;
  color: var(--color-text);
  outline: none;
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease,
    background-color 150ms ease;
}

input {
  padding: 0 0.8rem;
}

select {
  padding: 0 2rem 0 0.8rem;
  appearance: none;
  background-image:
    linear-gradient(45deg, transparent 50%, var(--color-muted) 50%),
    linear-gradient(135deg, var(--color-muted) 50%, transparent 50%);
  background-position:
    calc(100% - 1rem) 1.12rem,
    calc(100% - 0.68rem) 1.12rem;
  background-repeat: no-repeat;
  background-size:
    0.35rem 0.35rem,
    0.35rem 0.35rem;
}

select:disabled,
input:read-only,
input:disabled {
  color: var(--color-muted);
  background-color: #f8fafc;
}

input:focus,
select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.14);
}

.wide-field {
  grid-column: 1 / -1;
}

.form-alert {
  margin: 1rem 0 0;
  padding: 0.85rem 1rem;
  border-radius: 0.55rem;
  font-weight: 750;
  line-height: 1.55;
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
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.65rem;
}

.primary-action,
.secondary-action,
.refresh-button,
.assign-button,
.text-button,
.danger-button {
  display: inline-flex;
  min-height: 2.35rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  font-size: 0.88rem;
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition:
    transform 120ms ease,
    border-color 120ms ease,
    background-color 120ms ease,
    box-shadow 120ms ease,
    opacity 120ms ease;
}

.primary-action,
.assign-button {
  border: 1px solid rgb(59 130 246 / 0.1);
  color: #ffffff;
  background: var(--color-primary);
  box-shadow: 0 12px 22px rgb(59 130 246 / 0.22);
}

.primary-action {
  min-width: 11rem;
  padding: 0 1.15rem;
}

.assign-button {
  padding: 0 0.8rem;
}

.primary-action:hover:not(:disabled),
.assign-button:hover:not(:disabled) {
  transform: translateY(-1px);
  background: #2563eb;
  box-shadow: 0 14px 26px rgb(59 130 246 / 0.26);
}

.secondary-action,
.refresh-button {
  border: 1px solid var(--color-border);
  padding: 0 0.9rem;
  color: var(--color-text);
  background: #ffffff;
}

.secondary-action:hover {
  border-color: rgb(96 165 250 / 0.7);
  background: #f8fbff;
}

.text-button,
.danger-button {
  gap: 0.35rem;
  min-height: 2.05rem;
  border: 1px solid transparent;
  padding: 0 0.62rem;
  box-shadow: none;
}

.text-button {
  border-color: rgb(59 130 246 / 0.24);
  color: var(--color-primary);
  background: rgb(59 130 246 / 0.08);
}

.danger-button {
  border-color: rgb(185 28 28 / 0.2);
  color: #b91c1c;
  background: rgb(254 242 242 / 0.92);
}

.text-button:hover:not(:disabled),
.text-button:focus-visible {
  border-color: rgb(59 130 246 / 0.46);
  background: rgb(59 130 246 / 0.14);
}

.danger-button:hover:not(:disabled),
.danger-button:focus-visible {
  border-color: rgb(185 28 28 / 0.38);
  background: #fee2e2;
}

.refresh-button {
  display: inline-grid;
  width: 2.4rem;
  height: 2.4rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 0;
  color: var(--color-primary);
  background: #ffffff;
  font-size: 1rem;
  box-shadow: none;
}

.refresh-button:hover:not(:disabled),
.refresh-button:focus-visible {
  border-color: rgb(59 130 246 / 0.42);
  background: rgb(59 130 246 / 0.08);
}

.refresh-button.is-loading .bi {
  animation: spin-refresh 0.8s linear infinite;
}

@keyframes spin-refresh {
  to {
    transform: rotate(360deg);
  }
}

.icon-toggle-button {
  display: inline-grid;
  width: 2.1rem;
  height: 2.1rem;
  place-items: center;
  border: 0;
  border-radius: 0.45rem;
  color: var(--color-muted);
  background: transparent;
  font-size: 0;
  cursor: pointer;
  vertical-align: middle;
}

.icon-toggle-button::before {
  display: block;
  width: 0.5rem;
  height: 0.5rem;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  content: "";
  transform: translateY(-0.12rem) rotate(45deg);
}

.icon-toggle-button[aria-expanded="true"]::before {
  transform: translateY(0.12rem) rotate(225deg);
}

.icon-toggle-button:hover,
.icon-toggle-button:focus-visible {
  color: var(--color-primary);
  background: rgb(59 130 246 / 0.06);
}

.primary-action:disabled,
.refresh-button:disabled,
.assign-button:disabled,
.text-button:disabled,
.danger-button:disabled {
  cursor: not-allowed;
  opacity: 0.48;
  transform: none;
  box-shadow: none;
}

.match-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
  gap: 1.25rem;
  align-items: start;
  margin-top: 1.25rem;
}

.table-panel {
  overflow: hidden;
}

.village-volunteer-panel {
  grid-column: 1 / -1;
}

.list-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.9rem;
  padding: 1rem 1rem 0.85rem;
  border-bottom: 1px solid rgb(219 231 245 / 0.8);
}

.list-header p {
  margin: 0.28rem 0 0;
  color: var(--color-muted);
  font-size: 0.88rem;
  line-height: 1.45;
}

.table-panel > table,
.table-panel > .empty-state {
  margin: 0;
}

.table-panel {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 34rem;
  border-collapse: collapse;
}

th,
td {
  padding: 0.75rem 0.85rem;
  border-bottom: 1px solid rgb(219 231 245 / 0.76);
  text-align: left;
  vertical-align: middle;
}

th {
  color: var(--color-muted);
  background: #f8fbff;
  font-size: 0.76rem;
  font-weight: 850;
}

.actions-column {
  color: transparent;
  width: 16rem;
}

td {
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 650;
}

tbody tr:not(.detail-row) {
  cursor: pointer;
}

tbody tr:not(.detail-row):hover,
.is-selected {
  background: rgb(59 130 246 / 0.07);
}

.is-selected td:first-child {
  box-shadow: inset 3px 0 0 var(--color-primary);
}

.detail-row td {
  padding-top: 0.55rem;
  color: var(--color-muted);
  background: #fbfdff;
  font-weight: 500;
}

.detail-row span {
  display: block;
  line-height: 1.65;
}

.detail-row strong {
  color: var(--color-text);
  font-weight: 850;
}

.status-pill,
.count-pill {
  display: inline-flex;
  min-height: 1.8rem;
  align-items: center;
  border-radius: 999px;
  padding: 0.2rem 0.62rem;
  font-size: 0.8rem;
  font-weight: 850;
}

.status-pill--success {
  color: #166534;
  background: #dcfce7;
}

.status-pill--neutral {
  color: #475569;
  background: #eef2f7;
}

.count-pill {
  min-width: 2rem;
  justify-content: center;
  color: var(--color-primary);
  background: rgb(59 130 246 / 0.1);
}

.slot-select {
  min-width: 12.5rem;
  height: 2.35rem;
}

.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.actions-cell {
  text-align: right;
  white-space: nowrap;
  width: 16rem;
}

.actions-cell--compact {
  width: 3rem;
}

.actions-cell .row-actions {
  justify-content: flex-end;
}

.match-grid .table-panel:first-child table {
  table-layout: fixed;
}

.match-grid .table-panel:first-child th:nth-child(1),
.match-grid .table-panel:first-child td:nth-child(1) {
  width: 38%;
}

.match-grid .table-panel:first-child th:nth-child(2),
.match-grid .table-panel:first-child td:nth-child(2) {
  width: 36%;
  text-align: center;
}

.match-grid .table-panel:first-child th:nth-child(3),
.match-grid .table-panel:first-child td:nth-child(3) {
  width: 26%;
}

.match-grid .table-panel:nth-child(2) table {
  table-layout: fixed;
  min-width: 52rem;
}

.match-grid .table-panel:nth-child(2) th:nth-child(1),
.match-grid .table-panel:nth-child(2) td:nth-child(1) {
  width: 24%;
}

.match-grid .table-panel:nth-child(2) th:nth-child(2),
.match-grid .table-panel:nth-child(2) td:nth-child(2) {
  width: 8%;
  text-align: center;
}

.match-grid .table-panel:nth-child(2) th:nth-child(3),
.match-grid .table-panel:nth-child(2) td:nth-child(3) {
  width: 32%;
}

.match-grid .table-panel:nth-child(2) th:nth-child(4),
.match-grid .table-panel:nth-child(2) td:nth-child(4) {
  width: 12%;
}

.match-grid .table-panel:nth-child(2) th:nth-child(5),
.match-grid .table-panel:nth-child(2) td:nth-child(5) {
  width: 24%;
  text-align: right;
}

.match-grid .table-panel:nth-child(2) td:nth-child(5).actions-cell--compact {
  width: 24%;
}

.empty-state {
  padding: 2.5rem 1rem;
  color: var(--color-muted);
  text-align: center;
}

@media (max-width: 980px) {
  .page-heading,
  .match-grid {
    grid-template-columns: 1fr;
  }

  .summary-strip {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .summary-item:nth-child(4) {
    border-left: 0;
  }
}

@media (max-width: 680px) {
  .top-nav,
  .dashboard-shell {
    width: min(100% - 1.25rem, 1220px);
  }

  fieldset {
    grid-template-columns: 1fr;
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

  .user-chip {
    max-width: 11rem;
  }

  .form-actions,
  .primary-action,
  .secondary-action {
    width: 100%;
  }

  .summary-strip {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
