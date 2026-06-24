<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'

import ProfileMenu from '../../components/ProfileMenu.vue'
import {
  assignKidToCaregiver,
  assignKidToVillageVolunteer,
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
} from '../../api/kids'
import { ApiError } from '../../api/client'
import {
  thaiAddressData,
  type ThaiDistrict,
  type ThaiProvince,
  type ThaiSubdistrict,
} from '../../data/thaiAddress'
import { useAuthStore } from '../../stores/auth'
import { isValidThaiId, toDigits } from '../../utils/digits'

const authStore = useAuthStore()
const provinceOptions = [...thaiAddressData.provinces]
const genderOptions = [
  { value: 'male', label: 'ชาย' },
  { value: 'female', label: 'หญิง' },
  { value: 'other', label: 'อื่น ๆ' },
  { value: 'prefer_not_to_say', label: 'ไม่ระบุ' },
]

const form = reactive({
  thai_id: '',
  full_name: '',
  date_of_birth: '',
  gender: '',
  notable_symptoms: '',
  house_no: '',
  village_no: '',
  road: '',
  province_id: '',
  district_id: '',
  subdistrict_id: '',
})

const kids = ref<KidResponse[]>([])
const caregivers = ref<CaregiverResponse[]>([])
const villageVolunteers = ref<VillageVolunteerResponse[]>([])
const managerProvince = ref('')
const selectedKidId = ref('')
const assigningCaregiverId = ref('')
const assigningVillageVolunteerId = ref('')
const selectedSlotByCaregiverId = ref<Record<string, string>>({})
const editingKidId = ref('')
const deletingKidId = ref('')
const kidPendingDeletion = ref<KidResponse | null>(null)
const activeWorkspace = ref<'' | 'kids' | 'caregivers' | 'volunteers' | 'child-form' | 'matching'>(
  '',
)
const directoryModalType = ref<'kids' | 'caregivers' | 'volunteers' | ''>('')
const directorySearchTerm = ref('')
const childSearchTerm = ref('')
const caregiverSearchTerm = ref('')
const volunteerSearchTerm = ref('')
const expandedKidIds = ref<Set<string>>(new Set())
const expandedCaregiverIds = ref<Set<string>>(new Set())
const expandedVillageVolunteerIds = ref<Set<string>>(new Set())
const isCaregiverMatchOpen = ref(true)
const isVillageVolunteerMatchOpen = ref(false)
const isKidPanelOpen = ref(false)
const isLoading = ref(false)
const isLoadingCaregivers = ref(false)
const isLoadingVillageVolunteers = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

function updateThaiId(event: Event) {
  form.thai_id = toDigits((event.target as HTMLInputElement).value)
}

const selectedProvince = computed<ThaiProvince | undefined>(() => {
  return (
    provinceOptions.find((province) => province.name_in_thai === managerProvince.value) ??
    provinceOptions.find((province) => String(province.id) === form.province_id)
  )
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

const selectedKid = computed(() => {
  return kids.value.find((kid) => kid.id === selectedKidId.value)
})

const directoryModalTitle = computed(() => {
  if (directoryModalType.value === 'kids') {
    return 'รายชื่อเด็ก'
  }
  if (directoryModalType.value === 'caregivers') {
    return 'รายชื่อนักกิจกรรมบำบัด'
  }
  if (directoryModalType.value === 'volunteers') {
    return 'รายชื่อผู้ดูแลเด็ก'
  }
  return ''
})

const filteredKids = computed(() => {
  return filterByName(kids.value, childSearchTerm.value)
})

const filteredCaregivers = computed(() => {
  return filterByName(caregivers.value, caregiverSearchTerm.value)
})

const filteredVillageVolunteers = computed(() => {
  return filterByName(villageVolunteers.value, volunteerSearchTerm.value)
})

const directoryKids = computed(() => {
  return filterByName(kids.value, directorySearchTerm.value)
})

const hasKidFormDraft = computed(() => {
  if (editingKidId.value) {
    return true
  }

  return [
    form.thai_id,
    form.full_name,
    form.date_of_birth,
    form.gender,
    form.notable_symptoms,
    form.house_no,
    form.village_no,
    form.road,
    form.district_id,
    form.subdistrict_id,
  ].some((value) => value.trim())
})

const directoryCaregivers = computed(() => {
  return filterByName(caregivers.value, directorySearchTerm.value)
})

const directoryVillageVolunteers = computed(() => {
  return filterByName(villageVolunteers.value, directorySearchTerm.value)
})

function normalizeSearchText(value: string): string {
  return value.trim().toLocaleLowerCase('th-TH')
}

function filterByName<T extends { full_name: string }>(items: T[], searchTerm: string): T[] {
  const normalizedSearchTerm = normalizeSearchText(searchTerm)
  if (!normalizedSearchTerm) {
    return items
  }

  return items.filter((item) => {
    return normalizeSearchText(item.full_name).includes(normalizedSearchTerm)
  })
}

function caregiverAssignedCount(caregiverId: string): number {
  return kids.value.filter((kid) => kid.assigned_caregiver?.id === caregiverId).length
}

function caregiverAssignedKids(caregiverId: string): KidResponse[] {
  return kids.value.filter((kid) => kid.assigned_caregiver?.id === caregiverId)
}

function villageVolunteerAssignedCount(villageVolunteerId: string): number {
  return kids.value.filter((kid) =>
    kid.assigned_village_volunteers.some((volunteer) => volunteer.id === villageVolunteerId),
  ).length
}

function villageVolunteerAssignedKids(villageVolunteerId: string): KidResponse[] {
  return kids.value.filter((kid) =>
    kid.assigned_village_volunteers.some((volunteer) => volunteer.id === villageVolunteerId),
  )
}

function stageSummaryForKids(assignedKids: KidResponse[]) {
  const summary = new Map<string, { label: string; className: string; count: number }>()

  assignedKids.forEach((kid) => {
    const status = kidMatchStatus(kid)
    const current = summary.get(status.label)
    if (current) {
      current.count += 1
      return
    }

    summary.set(status.label, {
      label: status.label,
      className: status.className,
      count: 1,
    })
  })

  return Array.from(summary.values())
}

function villageVolunteerNames(kid: KidResponse): string {
  if (kid.assigned_village_volunteers.length === 0) {
    return 'ยังไม่จับคู่'
  }

  return kid.assigned_village_volunteers.map((volunteer) => volunteer.full_name).join(', ')
}

function genderLabel(gender: string | null): string {
  const option = genderOptions.find((item) => item.value === gender)
  return option?.label ?? '-'
}

function formatDate(value: string | null): string {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

function kidMatchStatus(kid: KidResponse): { label: string; className: string } {
  const hasCaregiver = Boolean(kid.assigned_caregiver)
  const hasVillageVolunteer = kid.assigned_village_volunteers.length > 0

  if (hasCaregiver && hasVillageVolunteer) {
    return { label: 'จับคู่ครบแล้ว', className: 'match-status--complete' }
  }
  if (!hasCaregiver && !hasVillageVolunteer) {
    return { label: 'ยังไม่จับคู่', className: 'match-status--empty' }
  }
  if (!hasCaregiver) {
    return { label: 'ขาดนักบำบัด', className: 'match-status--warning' }
  }
  return { label: 'ขาดผู้ดูแลเด็ก', className: 'match-status--warning' }
}

function selectedKidAddress(): string {
  if (!selectedKid.value) {
    return 'ยังไม่ได้เลือกเด็ก'
  }

  return [
    selectedKid.value.address.subdistrict,
    selectedKid.value.address.district,
    selectedKid.value.address.province,
  ]
    .filter(Boolean)
    .join(', ')
}

function isVillageVolunteerAssignedToSelectedKid(volunteerId: string): boolean {
  return Boolean(
    selectedKid.value?.assigned_village_volunteers.some(
      (volunteer) => volunteer.id === volunteerId,
    ),
  )
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
  form.district_id = ''
  form.subdistrict_id = ''
}

function resetSubdistrictSelection() {
  form.subdistrict_id = ''
}

function resetForm() {
  editingKidId.value = ''
  form.thai_id = ''
  form.full_name = ''
  form.date_of_birth = ''
  form.gender = ''
  form.notable_symptoms = ''
  form.house_no = ''
  form.village_no = ''
  form.road = ''
  resetDistrictSelection()
  syncResponsibleProvince()
}

function openCreateKidPanel() {
  if (editingKidId.value || !hasKidFormDraft.value) {
    resetForm()
  }
  errorMessage.value = ''
  successMessage.value = ''
  activeWorkspace.value = 'child-form'
  isKidPanelOpen.value = false
}

function closeKidModal() {
  if (isSubmitting.value) {
    return
  }
  errorMessage.value = ''
  successMessage.value = ''
  isKidPanelOpen.value = false
}

function cancelKidModal() {
  if (isSubmitting.value) {
    return
  }

  if (hasKidFormDraft.value && !window.confirm('ต้องการปิดและล้างข้อมูลที่กรอกไว้ใช่ไหม?')) {
    return
  }

  resetForm()
  errorMessage.value = ''
  successMessage.value = ''
  isKidPanelOpen.value = false
  activeWorkspace.value = ''
}

function openMatchingWorkspace() {
  activeWorkspace.value = 'matching'
  const firstKid = kids.value[0]
  if (!selectedKidId.value && firstKid) {
    selectedKidId.value = firstKid.id
  }
}

function closeMatchingWorkspace() {
  activeWorkspace.value = ''
}

function openDirectoryModal(type: 'kids' | 'caregivers' | 'volunteers') {
  directorySearchTerm.value = ''
  directoryModalType.value = ''
  activeWorkspace.value = type
  if (type === 'kids') {
    void loadKids()
  } else if (type === 'caregivers') {
    void loadCaregivers()
  } else {
    void loadVillageVolunteers()
  }
}

function closeDirectoryModal() {
  directorySearchTerm.value = ''
  directoryModalType.value = ''
}

function buildPayload(): KidCreatePayload {
  return {
    thai_id: form.thai_id.trim(),
    full_name: form.full_name.trim(),
    date_of_birth: form.date_of_birth,
    gender: form.gender,
    notable_symptoms: optionalValue(form.notable_symptoms),
    address: {
      house_no: optionalValue(form.house_no),
      village_no: optionalValue(form.village_no),
      road: optionalValue(form.road),
      subdistrict: selectedSubdistrict.value?.name_in_thai ?? '',
      district: selectedDistrict.value?.name_in_thai ?? '',
      province: managerProvince.value,
      postal_code: postalCode.value,
      country: 'Thailand',
    },
  }
}

function buildUpdatePayload(): KidUpdatePayload {
  const payload = buildPayload()
  return {
    full_name: payload.full_name,
    date_of_birth: payload.date_of_birth,
    gender: payload.gender,
    notable_symptoms: payload.notable_symptoms,
    address: payload.address,
  }
}

function validateKidForm(): boolean {
  syncResponsibleProvince()

  if (!editingKidId.value && !isValidThaiId(form.thai_id)) {
    errorMessage.value = 'กรุณากรอกเลขประจำตัวประชาชนเด็กที่ถูกต้อง'
    return false
  }

  if (!form.full_name.trim()) {
    errorMessage.value = 'กรุณากรอกชื่อ-นามสกุลเด็ก'
    return false
  }

  if (!form.date_of_birth) {
    errorMessage.value = 'กรุณาเลือกวันเดือนปีเกิด'
    return false
  }

  if (!form.gender) {
    errorMessage.value = 'กรุณาเลือกเพศ'
    return false
  }

  if (!selectedProvince.value) {
    errorMessage.value = 'ไม่พบจังหวัดที่รับผิดชอบ กรุณาลองโหลดหน้าใหม่'
    return false
  }

  if (!selectedDistrict.value || !selectedSubdistrict.value || !postalCode.value) {
    errorMessage.value = 'กรุณาเลือกอำเภอ/เขต และตำบล/แขวงจากรายการ'
    return false
  }

  return true
}

function fillFormFromKid(kid: KidResponse) {
  const province = provinceOptions.find((option) => option.name_in_thai === kid.address.province)
  const district = province
    ? thaiAddressData.districts.find(
        (option) =>
          option.province_id === province.id && option.name_in_thai === kid.address.district,
      )
    : undefined
  const subdistrict = district
    ? thaiAddressData.subDistricts.find(
        (option) =>
          option.district_id === district.id && option.name_in_thai === kid.address.subdistrict,
      )
    : undefined

  editingKidId.value = kid.id
  form.thai_id = ''
  form.full_name = kid.full_name
  form.date_of_birth = kid.date_of_birth ?? ''
  form.gender = kid.gender ?? ''
  form.notable_symptoms = kid.notable_symptoms ?? ''
  form.house_no = kid.address.house_no ?? ''
  form.village_no = kid.address.village_no ?? ''
  form.road = kid.address.road ?? ''
  form.province_id = province ? String(province.id) : ''
  form.district_id = district ? String(district.id) : ''
  form.subdistrict_id = subdistrict ? String(subdistrict.id) : ''
  errorMessage.value = ''
  successMessage.value = ''
  activeWorkspace.value = 'child-form'
  isKidPanelOpen.value = false
}

function syncResponsibleProvince() {
  const province = provinceOptions.find((option) => option.name_in_thai === managerProvince.value)
  form.province_id = province ? String(province.id) : ''
}

async function loadCaseManagerContext() {
  const context = await getCaseManagerContext()
  managerProvince.value = context.province
  syncResponsibleProvince()
}

async function loadKids() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    kids.value = await listKids()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : 'ไม่สามารถโหลดรายชื่อเด็กได้ กรุณาลองใหม่อีกครั้ง'
  } finally {
    isLoading.value = false
  }
}

async function loadCaregivers() {
  isLoadingCaregivers.value = true
  errorMessage.value = ''

  try {
    caregivers.value = await listCaregivers()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError
        ? error.message
        : 'ไม่สามารถโหลดรายชื่อนักบำบัดได้ กรุณาลองใหม่อีกครั้ง'
  } finally {
    isLoadingCaregivers.value = false
  }
}

async function submitForm() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!validateKidForm()) {
    return
  }

  isSubmitting.value = true

  try {
    if (editingKidId.value) {
      const kid = await updateKid(editingKidId.value, buildUpdatePayload())
      kids.value = kids.value.map((item) => (item.id === kid.id ? kid : item))
      successMessage.value = 'แก้ไขข้อมูลเด็กแล้ว'
    } else {
      const kid = await createKid(buildPayload())
      kids.value = [kid, ...kids.value.filter((item) => item.id !== kid.id)]
      successMessage.value = 'เพิ่มข้อมูลเด็กเข้าสู่ระบบแล้ว'
    }
    resetForm()
    isKidPanelOpen.value = false
    activeWorkspace.value = 'kids'
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError
        ? error.message
        : 'ไม่สามารถบันทึกข้อมูลเด็กได้ กรุณาลองใหม่อีกครั้ง'
  } finally {
    isSubmitting.value = false
  }
}

async function removeKid(kid: KidResponse) {
  errorMessage.value = ''
  successMessage.value = ''
  deletingKidId.value = kid.id

  try {
    await deleteKid(kid.id)
    kids.value = kids.value.filter((item) => item.id !== kid.id)
    if (selectedKidId.value === kid.id) {
      selectedKidId.value = ''
    }
    if (editingKidId.value === kid.id) {
      resetForm()
      isKidPanelOpen.value = false
    }
    successMessage.value = 'ลบข้อมูลเด็กแล้ว'
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : 'ไม่สามารถลบข้อมูลเด็กได้ กรุณาลองใหม่อีกครั้ง'
  } finally {
    deletingKidId.value = ''
  }
}

function requestDeleteKid(kid: KidResponse) {
  kidPendingDeletion.value = kid
}

function cancelDeleteKid() {
  kidPendingDeletion.value = null
}

async function confirmDeleteKid() {
  if (!kidPendingDeletion.value) {
    return
  }

  const kid = kidPendingDeletion.value
  kidPendingDeletion.value = null
  await removeKid(kid)
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
  errorMessage.value = ''

  try {
    villageVolunteers.value = await listVillageVolunteers()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError
        ? error.message
        : 'ไม่สามารถโหลดรายชื่อผู้ดูแลเด็กได้ กรุณาลองใหม่อีกครั้ง'
  } finally {
    isLoadingVillageVolunteers.value = false
  }
}

async function assignSelectedKid(caregiverId: string) {
  if (!selectedKidId.value) {
    errorMessage.value = 'กรุณาเลือกเด็กก่อนจับคู่นักบำบัด'
    return
  }
  const selectedSlotId = selectedSlotByCaregiverId.value[caregiverId]
  if (!selectedSlotId) {
    errorMessage.value = 'กรุณาเลือกเวลาว่างก่อนจับคู่'
    return
  }

  errorMessage.value = ''
  successMessage.value = ''
  assigningCaregiverId.value = caregiverId

  try {
    const updatedKid = await assignKidToCaregiver(selectedKidId.value, caregiverId, selectedSlotId)
    kids.value = kids.value.map((kid) => (kid.id === updatedKid.id ? updatedKid : kid))
    await loadCaregivers()
    successMessage.value = `จับคู่ ${updatedKid.full_name} กับ ${updatedKid.assigned_caregiver?.full_name ?? 'นักบำบัด'} แล้ว`
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : 'ไม่สามารถจับคู่นักบำบัดได้ กรุณาลองใหม่อีกครั้ง'
  } finally {
    assigningCaregiverId.value = ''
  }
}

async function assignSelectedKidToVillageVolunteer(villageVolunteerId: string) {
  if (!selectedKidId.value) {
    errorMessage.value = 'กรุณาเลือกเด็กก่อนจับคู่ผู้ดูแลเด็ก'
    return
  }

  errorMessage.value = ''
  successMessage.value = ''
  assigningVillageVolunteerId.value = villageVolunteerId

  try {
    const updatedKid = await assignKidToVillageVolunteer(selectedKidId.value, villageVolunteerId)
    kids.value = kids.value.map((kid) => (kid.id === updatedKid.id ? updatedKid : kid))
    const assignedVolunteer = updatedKid.assigned_village_volunteers.find(
      (volunteer) => volunteer.id === villageVolunteerId,
    )
    successMessage.value = `จับคู่ ${updatedKid.full_name} กับ ${assignedVolunteer?.full_name ?? 'ผู้ดูแลเด็ก'} แล้ว`
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError
        ? error.message
        : 'ไม่สามารถจับคู่ผู้ดูแลเด็กได้ กรุณาลองใหม่อีกครั้ง'
  } finally {
    assigningVillageVolunteerId.value = ''
  }
}

onMounted(async () => {
  try {
    await loadCaseManagerContext()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError
        ? error.message
        : 'ไม่สามารถโหลดจังหวัดที่รับผิดชอบได้ กรุณาลองใหม่อีกครั้ง'
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

      <ProfileMenu />
    </nav>

    <section class="dashboard-shell" aria-labelledby="case-manager-title">
      <div class="page-heading">
        <div>
          <h1 id="case-manager-title">ผู้ดูแลประจำจังหวัด {{ managerProvince || '...' }}</h1>
        </div>

        <div class="summary-strip" aria-label="ภาพรวม">
          <div class="summary-item">
            <span>เด็กในพื้นที่</span>
            <strong>{{ kids.length }}</strong>
          </div>
          <div class="summary-item">
            <span>นักบำบัด</span>
            <strong>{{ caregivers.length }}</strong>
          </div>
          <div class="summary-item">
            <span>ผู้ดูแลเด็ก</span>
            <strong>{{ villageVolunteers.length }}</strong>
          </div>
        </div>
      </div>

      <section class="command-center" aria-label="เมนูหลักสำหรับผู้ดูแลประจำจังหวัด">
        <aside class="workspace-menu" aria-label="แทบเมนูจัดการ">
          <div class="workspace-menu-group">
            <p>การจัดการข้อมูลเด็ก</p>
            <button
              type="button"
              class="workspace-menu-button"
              :class="{ 'is-active': activeWorkspace === 'child-form' }"
              @click="openCreateKidPanel"
            >
              <i class="bi bi-person-plus" aria-hidden="true"></i>
              <span>เพิ่ม/แก้ไขข้อมูลเด็ก</span>
            </button>
            <button
              type="button"
              class="workspace-menu-button"
              :class="{ 'is-active': activeWorkspace === 'matching' }"
              @click="openMatchingWorkspace"
            >
              <i class="bi bi-diagram-3" aria-hidden="true"></i>
              <span>จับคู่เด็กกับผู้ให้บริการ</span>
            </button>
          </div>

          <div class="workspace-menu-group">
            <p>รายชื่อ</p>
            <button
              type="button"
              class="workspace-menu-button"
              :class="{ 'is-active': activeWorkspace === 'kids' }"
              @click="openDirectoryModal('kids')"
            >
              <i class="bi bi-person-hearts" aria-hidden="true"></i>
              <span>รายชื่อเด็ก</span>
            </button>
            <button
              type="button"
              class="workspace-menu-button"
              :class="{ 'is-active': activeWorkspace === 'caregivers' }"
              @click="openDirectoryModal('caregivers')"
            >
              <i class="bi bi-clipboard2-pulse" aria-hidden="true"></i>
              <span>รายชื่อนักกิจกรรมบำบัด</span>
            </button>
            <button
              type="button"
              class="workspace-menu-button"
              :class="{ 'is-active': activeWorkspace === 'volunteers' }"
              @click="openDirectoryModal('volunteers')"
            >
              <i class="bi bi-people" aria-hidden="true"></i>
              <span>รายชื่อผู้ดูแลเด็ก</span>
            </button>
          </div>
        </aside>

        <div class="command-section">
          <div v-if="!activeWorkspace" class="workspace-empty-state">
            <i class="bi bi-layout-sidebar-inset" aria-hidden="true"></i>
            <h2>กรุณาเลือกเมนู</h2>
            <p>เลือกเมนูจากแทบด้านซ้ายเพื่อดูข้อมูลหรือเริ่มจัดการข้อมูลเด็ก</p>
          </div>

          <section v-else-if="activeWorkspace === 'kids'" class="inline-workspace-panel">
            <div class="inline-workspace-header">
              <div>
                <p class="eyebrow">รายชื่อในพื้นที่ {{ managerProvince || '...' }}</p>
                <h2>รายชื่อเด็ก</h2>
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

            <label class="search-field directory-search-field">
              <i class="bi bi-search" aria-hidden="true"></i>
              <input v-model="directorySearchTerm" type="search" placeholder="ค้นหาจากชื่อ" />
            </label>

            <div class="directory-list directory-list--inline">
              <article v-for="kid in directoryKids" :key="kid.id" class="directory-card">
                <div class="directory-card-icon directory-card-icon--child">
                  <i class="bi bi-person-hearts" aria-hidden="true"></i>
                </div>
                <div class="directory-card-body">
                  <div class="directory-card-title">
                    <h3>{{ kid.full_name }}</h3>
                    <div class="directory-card-title-actions">
                      <span class="match-status" :class="kidMatchStatus(kid).className">
                        {{ kidMatchStatus(kid).label }}
                      </span>
                      <button
                        type="button"
                        class="icon-action icon-action--edit"
                        aria-label="แก้ไขข้อมูลเด็ก"
                        title="แก้ไขข้อมูลเด็ก"
                        @click="fillFormFromKid(kid)"
                      >
                        <i class="bi bi-pencil-square" aria-hidden="true"></i>
                      </button>
                      <button
                        type="button"
                        class="icon-action icon-action--danger"
                        :disabled="deletingKidId === kid.id"
                        aria-label="ลบข้อมูลเด็ก"
                        title="ลบข้อมูลเด็ก"
                        @click="requestDeleteKid(kid)"
                      >
                        <i
                          class="bi"
                          :class="deletingKidId === kid.id ? 'bi-hourglass-split' : 'bi-trash'"
                          aria-hidden="true"
                        ></i>
                      </button>
                    </div>
                  </div>
                  <dl>
                    <div>
                      <dt>เลขประจำตัวประชาชน</dt>
                      <dd>{{ kid.thai_id_masked }}</dd>
                    </div>
                    <div>
                      <dt>วันเดือนปีเกิด</dt>
                      <dd>{{ formatDate(kid.date_of_birth) }}</dd>
                    </div>
                    <div>
                      <dt>เพศ</dt>
                      <dd>{{ genderLabel(kid.gender) }}</dd>
                    </div>
                    <div>
                      <dt>อาการสำคัญ</dt>
                      <dd>{{ kid.notable_symptoms || '-' }}</dd>
                    </div>
                    <div>
                      <dt>ที่อยู่</dt>
                      <dd>
                        {{ kid.address.subdistrict }}, {{ kid.address.district }},
                        {{ kid.address.province }}
                      </dd>
                    </div>
                    <div>
                      <dt>นักบำบัด</dt>
                      <dd>{{ kid.assigned_caregiver?.full_name ?? 'ยังไม่จับคู่' }}</dd>
                    </div>
                    <div>
                      <dt>ผู้ดูแลเด็ก</dt>
                      <dd>{{ villageVolunteerNames(kid) }}</dd>
                    </div>
                  </dl>
                </div>
              </article>

              <div v-if="kids.length === 0" class="empty-state">ยังไม่มีข้อมูลเด็กในพื้นที่</div>
              <div v-else-if="directoryKids.length === 0" class="empty-state">
                ไม่พบชื่อเด็กที่ค้นหา
              </div>
            </div>
          </section>

          <section v-else-if="activeWorkspace === 'caregivers'" class="inline-workspace-panel">
            <div class="inline-workspace-header">
              <div>
                <p class="eyebrow">รายชื่อในพื้นที่ {{ managerProvince || '...' }}</p>
                <h2>รายชื่อนักกิจกรรมบำบัด</h2>
              </div>
              <button
                type="button"
                class="refresh-button"
                :class="{ 'is-loading': isLoadingCaregivers }"
                :disabled="isLoadingCaregivers"
                aria-label="รีเฟรชรายชื่อนักกิจกรรมบำบัด"
                @click="loadCaregivers"
              >
                <i class="bi bi-arrow-clockwise" aria-hidden="true"></i>
              </button>
            </div>

            <label class="search-field directory-search-field">
              <i class="bi bi-search" aria-hidden="true"></i>
              <input v-model="directorySearchTerm" type="search" placeholder="ค้นหาจากชื่อ" />
            </label>

            <div class="directory-list directory-list--inline">
              <article
                v-for="caregiver in directoryCaregivers"
                :key="caregiver.id"
                class="directory-card"
              >
                <div class="directory-card-icon directory-card-icon--therapist">
                  <i class="bi bi-clipboard2-pulse" aria-hidden="true"></i>
                </div>
                <div class="directory-card-body">
                  <div class="directory-card-title">
                    <h3>
                      {{ caregiver.full_name }}
                      <span
                        v-if="openSlots(caregiver).length > 0"
                        class="availability-badge"
                        title="มีเวลาว่างสำหรับจับคู่"
                      >
                        <i class="bi bi-calendar-check" aria-hidden="true"></i>
                        {{ openSlots(caregiver).length }}
                      </span>
                    </h3>
                    <span class="count-pill">{{ caregiverAssignedCount(caregiver.id) }} คน</span>
                  </div>
                  <dl>
                    <div>
                      <dt>สถานพยาบาล</dt>
                      <dd>{{ caregiver.hospital_or_clinic || '-' }}</dd>
                    </div>
                    <div>
                      <dt>ใบประกอบวิชาชีพ</dt>
                      <dd>{{ caregiver.license_id || '-' }}</dd>
                    </div>
                    <div>
                      <dt>ที่อยู่</dt>
                      <dd>
                        {{ caregiver.address.subdistrict }}, {{ caregiver.address.district }},
                        {{ caregiver.address.province }}
                      </dd>
                    </div>
                    <div>
                      <dt>เวลาว่าง</dt>
                      <dd>
                        {{
                          openSlots(caregiver).length
                            ? openSlots(caregiver).map(formatSlot).join(', ')
                            : 'ไม่มีเวลาว่าง'
                        }}
                      </dd>
                    </div>
                  </dl>
                  <div class="provider-stage-summary" aria-label="สถานะการดูแลของนักกิจกรรมบำบัด">
                    <strong>ดูแลเด็ก {{ caregiverAssignedCount(caregiver.id) }} คน</strong>
                    <div v-if="caregiverAssignedCount(caregiver.id)" class="provider-stage-list">
                      <span
                        v-for="stage in stageSummaryForKids(caregiverAssignedKids(caregiver.id))"
                        :key="stage.label"
                        class="match-status"
                        :class="stage.className"
                      >
                        {{ stage.label }} {{ stage.count }}
                      </span>
                    </div>
                    <span v-else class="provider-stage-empty">ยังไม่มีเด็กในความดูแล</span>
                  </div>
                </div>
              </article>

              <div v-if="caregivers.length === 0" class="empty-state">
                ยังไม่มีนักกิจกรรมบำบัดในพื้นที่
              </div>
              <div v-else-if="directoryCaregivers.length === 0" class="empty-state">
                ไม่พบชื่อนักกิจกรรมบำบัดที่ค้นหา
              </div>
            </div>
          </section>

          <section v-else-if="activeWorkspace === 'volunteers'" class="inline-workspace-panel">
            <div class="inline-workspace-header">
              <div>
                <p class="eyebrow">รายชื่อในพื้นที่ {{ managerProvince || '...' }}</p>
                <h2>รายชื่อผู้ดูแลเด็ก</h2>
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

            <label class="search-field directory-search-field">
              <i class="bi bi-search" aria-hidden="true"></i>
              <input v-model="directorySearchTerm" type="search" placeholder="ค้นหาจากชื่อ" />
            </label>

            <div class="directory-list directory-list--inline">
              <article
                v-for="volunteer in directoryVillageVolunteers"
                :key="volunteer.id"
                class="directory-card"
              >
                <div class="directory-card-icon directory-card-icon--volunteer">
                  <i class="bi bi-people" aria-hidden="true"></i>
                </div>
                <div class="directory-card-body">
                  <div class="directory-card-title">
                    <h3>{{ volunteer.full_name }}</h3>
                    <span class="count-pill"
                      >{{ villageVolunteerAssignedCount(volunteer.id) }} คน</span
                    >
                  </div>
                  <dl>
                    <div>
                      <dt>เลขประจำตัวประชาชน</dt>
                      <dd>{{ volunteer.thai_id_masked }}</dd>
                    </div>
                    <div>
                      <dt>สถานพยาบาล</dt>
                      <dd>{{ volunteer.hospital_or_clinic || '-' }}</dd>
                    </div>
                    <div>
                      <dt>ติดต่อ</dt>
                      <dd>{{ volunteer.phone || volunteer.email || '-' }}</dd>
                    </div>
                    <div>
                      <dt>ที่อยู่</dt>
                      <dd>
                        {{ volunteer.address.subdistrict }}, {{ volunteer.address.district }},
                        {{ volunteer.address.province }}
                      </dd>
                    </div>
                  </dl>
                  <div class="provider-stage-summary" aria-label="สถานะการดูแลของผู้ดูแลเด็ก">
                    <strong>ดูแลเด็ก {{ villageVolunteerAssignedCount(volunteer.id) }} คน</strong>
                    <div
                      v-if="villageVolunteerAssignedCount(volunteer.id)"
                      class="provider-stage-list"
                    >
                      <span
                        v-for="stage in stageSummaryForKids(
                          villageVolunteerAssignedKids(volunteer.id),
                        )"
                        :key="stage.label"
                        class="match-status"
                        :class="stage.className"
                      >
                        {{ stage.label }} {{ stage.count }}
                      </span>
                    </div>
                    <span v-else class="provider-stage-empty">ยังไม่มีเด็กในความดูแล</span>
                  </div>
                </div>
              </article>

              <div v-if="villageVolunteers.length === 0" class="empty-state">
                ยังไม่มีผู้ดูแลเด็กในพื้นที่
              </div>
              <div v-else-if="directoryVillageVolunteers.length === 0" class="empty-state">
                ไม่พบชื่อผู้ดูแลเด็กที่ค้นหา
              </div>
            </div>
          </section>

          <section v-else-if="activeWorkspace === 'child-form'" class="inline-workspace-panel">
            <div class="inline-workspace-header">
              <div>
                <p class="eyebrow">การจัดการข้อมูลเด็ก</p>
                <h2>{{ editingKidId ? 'แก้ไขข้อมูลเด็ก' : 'เพิ่มรายชื่อเด็ก' }}</h2>
              </div>
            </div>

            <form class="kid-form kid-form--inline" @submit.prevent="submitForm">
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

                <label>
                  <span>วันเดือนปีเกิด <strong class="required-marker">*</strong></span>
                  <input v-model="form.date_of_birth" type="date" required autocomplete="off" />
                </label>

                <label>
                  <span>เพศ <strong class="required-marker">*</strong></span>
                  <select v-model="form.gender" required>
                    <option value="" disabled>เลือกเพศ</option>
                    <option
                      v-for="option in genderOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
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

                <label class="wide-field">
                  <span>อาการสำคัญ</span>
                  <textarea
                    v-model="form.notable_symptoms"
                    maxlength="2000"
                    rows="4"
                    placeholder="ระบุอาการสำคัญหรือข้อสังเกตที่ต้องติดตาม"
                  ></textarea>
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

              <div class="form-actions">
                <button class="secondary-action" type="button" @click="cancelKidModal">
                  ยกเลิก
                </button>
                <button class="primary-action" type="submit" :disabled="isSubmitting">
                  {{
                    isSubmitting
                      ? 'กำลังบันทึก...'
                      : editingKidId
                        ? 'บันทึกการแก้ไข'
                        : 'เพิ่มรายชื่อเด็ก'
                  }}
                </button>
              </div>
            </form>
          </section>

          <div v-else class="workspace-empty-state workspace-empty-state--compact">
            <i class="bi bi-diagram-3" aria-hidden="true"></i>
            <h2>จับคู่เด็กกับผู้ให้บริการ</h2>
            <p>เลือกเด็กจากรายการด้านล่าง แล้วจับคู่นักกิจกรรมบำบัดและผู้ดูแลเด็ก</p>
          </div>
        </div>
      </section>

      <p v-if="errorMessage" class="form-alert form-alert--error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="form-alert form-alert--success">{{ successMessage }}</p>

      <div
        v-if="activeWorkspace === 'matching'"
        class="matching-modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="matching-modal-title"
        @click.self="closeMatchingWorkspace"
      >
        <section class="matching-modal">
          <header class="matching-modal-header">
            <div>
              <p class="eyebrow">การจัดการข้อมูลเด็ก</p>
              <h2 id="matching-modal-title">จับคู่เด็กกับผู้ให้บริการ</h2>
            </div>
            <button
              type="button"
              class="modal-close-button"
              aria-label="ปิดหน้าต่างจับคู่เด็ก"
              @click="closeMatchingWorkspace"
            >
              <i class="bi bi-x-lg" aria-hidden="true"></i>
            </button>
          </header>

          <div id="matching-workspace" class="matching-workspace">
            <section class="matching-panel child-selector-panel" aria-label="เลือกเด็กเพื่อจับคู่">
              <div class="list-header">
                <div>
                  <h2>เด็กในพื้นที่</h2>
                  <p>เลือกเด็ก 1 คน แล้วจัดทีมนักบำบัดและผู้ดูแลเด็กในแผงด้านขวา</p>
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

              <label class="search-field">
                <i class="bi bi-search" aria-hidden="true"></i>
                <input v-model="childSearchTerm" type="search" placeholder="ค้นหาชื่อเด็ก" />
              </label>

              <div v-if="kids.length === 0" class="empty-state">
                ยังไม่มีข้อมูลเด็กในพื้นที่รับผิดชอบ
              </div>
              <div v-else-if="filteredKids.length === 0" class="empty-state empty-state--compact">
                ไม่พบชื่อเด็กที่ค้นหา
              </div>

              <div v-else class="child-card-list">
                <article
                  v-for="kid in filteredKids"
                  :key="kid.id"
                  class="child-match-card"
                  :class="{ 'is-selected': selectedKidId === kid.id }"
                  @click="selectedKidId = kid.id"
                >
                  <div class="child-card-main">
                    <h3>{{ kid.full_name }}</h3>
                    <span class="match-status" :class="kidMatchStatus(kid).className">
                      {{ kidMatchStatus(kid).label }}
                    </span>
                  </div>
                </article>
              </div>
            </section>

            <section class="matching-panel assignment-panel" aria-label="จัดทีมดูแลเด็ก">
              <div v-if="!selectedKid" class="empty-selection">
                <i class="bi bi-diagram-3" aria-hidden="true"></i>
                <h3>เลือกเด็กจากรายการด้านซ้าย</h3>
                <p>หลังเลือกแล้วจะแสดงตัวเลือกสำหรับจับคู่ในแผงนี้</p>
              </div>

              <template v-else>
                <div class="assignment-summary">
                  <div class="assignment-summary-main">
                    <span class="assignment-summary-label">เด็กที่เลือก</span>
                    <strong>{{ selectedKid.full_name }}</strong>
                    <small>{{ selectedKidAddress() }}</small>
                  </div>
                  <span class="match-status" :class="kidMatchStatus(selectedKid).className">
                    {{ kidMatchStatus(selectedKid).label }}
                  </span>
                  <div class="assignment-summary-meta">
                    <span>
                      <i class="bi bi-clipboard2-pulse" aria-hidden="true"></i>
                      {{ selectedKid.assigned_caregiver?.full_name ?? 'ยังไม่ได้จับคู่' }}
                    </span>
                    <span>
                      <i class="bi bi-people" aria-hidden="true"></i>
                      {{ villageVolunteerNames(selectedKid) }}
                    </span>
                  </div>
                </div>

                <section class="resource-section" aria-labelledby="caregiver-match-title">
                  <div class="resource-heading">
                    <div>
                      <h3 id="caregiver-match-title">เลือกนักบำบัดและเวลาว่าง</h3>
                      <p>
                        ต้องเลือกเวลาว่างก่อนกดจับคู่ เพื่อให้การนัดหมายผูกกับ session ได้ถูกต้อง
                      </p>
                    </div>
                    <div class="resource-heading-actions">
                      <button
                        type="button"
                        class="section-toggle-button"
                        :aria-expanded="isCaregiverMatchOpen"
                        :aria-label="
                          isCaregiverMatchOpen
                            ? 'ซ่อนรายชื่อนักบำบัดและเวลาว่าง'
                            : 'แสดงรายชื่อนักบำบัดและเวลาว่าง'
                        "
                        aria-controls="caregiver-match-body"
                        @click="isCaregiverMatchOpen = !isCaregiverMatchOpen"
                      >
                        <i
                          class="bi"
                          :class="isCaregiverMatchOpen ? 'bi-chevron-up' : 'bi-chevron-down'"
                          aria-hidden="true"
                        ></i>
                      </button>
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
                  </div>

                  <div v-if="isCaregiverMatchOpen" id="caregiver-match-body" class="resource-body">
                    <label class="search-field search-field--compact">
                      <i class="bi bi-search" aria-hidden="true"></i>
                      <input
                        v-model="caregiverSearchTerm"
                        type="search"
                        placeholder="ค้นหาชื่อนักบำบัด"
                      />
                    </label>

                    <div v-if="caregivers.length === 0" class="empty-state empty-state--compact">
                      ยังไม่มีนักบำบัดที่ลงทะเบียนในจังหวัดนี้
                    </div>
                    <div
                      v-else-if="filteredCaregivers.length === 0"
                      class="empty-state empty-state--compact"
                    >
                      ไม่พบชื่อนักบำบัดที่ค้นหา
                    </div>

                    <div v-else class="resource-list">
                      <article
                        v-for="caregiver in filteredCaregivers"
                        :key="caregiver.id"
                        class="resource-card"
                      >
                        <div class="resource-card-main">
                          <div>
                            <h4 class="therapist-name">
                              <span>{{ caregiver.full_name }}</span>
                              <span
                                v-if="openSlots(caregiver).length > 0"
                                class="availability-badge"
                                title="มีเวลาว่างสำหรับจับคู่"
                              >
                                <i class="bi bi-calendar-check" aria-hidden="true"></i>
                                {{ openSlots(caregiver).length }}
                              </span>
                            </h4>
                            <p>{{ caregiver.hospital_or_clinic || 'ยังไม่ระบุสถานพยาบาล' }}</p>
                          </div>
                          <span class="count-pill">{{ caregiverAssignedCount(caregiver.id) }}</span>
                        </div>

                        <div class="resource-controls">
                          <select
                            v-model="selectedSlotByCaregiverId[caregiver.id]"
                            class="slot-select"
                            :disabled="openSlots(caregiver).length === 0"
                          >
                            <option value="">
                              {{
                                openSlots(caregiver).length === 0 ? 'ไม่มีเวลาว่าง' : 'เลือกเวลา'
                              }}
                            </option>
                            <option
                              v-for="slot in openSlots(caregiver)"
                              :key="slot.id"
                              :value="slot.id"
                            >
                              {{ formatSlot(slot) }}
                            </option>
                          </select>
                          <button
                            type="button"
                            class="assign-button"
                            :disabled="
                              !selectedSlotByCaregiverId[caregiver.id] ||
                              assigningCaregiverId === caregiver.id
                            "
                            @click="assignSelectedKid(caregiver.id)"
                          >
                            {{ assigningCaregiverId === caregiver.id ? 'กำลังจับคู่' : 'จับคู่' }}
                          </button>
                          <button
                            type="button"
                            class="icon-toggle-button"
                            :aria-expanded="expandedCaregiverIds.has(caregiver.id)"
                            :aria-label="
                              expandedCaregiverIds.has(caregiver.id)
                                ? 'ซ่อนรายละเอียดนักบำบัด'
                                : 'ดูรายละเอียดนักบำบัด'
                            "
                            @click="toggleCaregiverDetails(caregiver.id)"
                          ></button>
                        </div>

                        <div v-if="expandedCaregiverIds.has(caregiver.id)" class="resource-detail">
                          <span><strong>ใบประกอบวิชาชีพ:</strong> {{ caregiver.license_id }}</span>
                          <span>
                            <strong>ที่อยู่:</strong>
                            {{ caregiver.address.subdistrict }}, {{ caregiver.address.district }}
                          </span>
                          <span v-if="caregiver.availability_slots.length">
                            <strong>เวลาทั้งหมด:</strong>
                            {{ caregiver.availability_slots.map(formatSlot).join(', ') }}
                          </span>
                        </div>
                      </article>
                    </div>
                  </div>
                </section>

                <section class="resource-section" aria-labelledby="volunteer-match-title">
                  <div class="resource-heading">
                    <div>
                      <h3 id="volunteer-match-title">เพิ่มผู้ดูแลเด็ก</h3>
                      <p>เด็ก 1 คนสามารถมีผู้ดูแลเด็กได้หลายคน เพื่อช่วยติดตาม Home Program</p>
                    </div>
                    <div class="resource-heading-actions">
                      <button
                        type="button"
                        class="section-toggle-button"
                        :aria-expanded="isVillageVolunteerMatchOpen"
                        :aria-label="
                          isVillageVolunteerMatchOpen
                            ? 'ซ่อนรายชื่อผู้ดูแลเด็ก'
                            : 'แสดงรายชื่อผู้ดูแลเด็ก'
                        "
                        aria-controls="volunteer-match-body"
                        @click="isVillageVolunteerMatchOpen = !isVillageVolunteerMatchOpen"
                      >
                        <i
                          class="bi"
                          :class="isVillageVolunteerMatchOpen ? 'bi-chevron-up' : 'bi-chevron-down'"
                          aria-hidden="true"
                        ></i>
                      </button>
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
                  </div>

                  <div
                    v-if="isVillageVolunteerMatchOpen"
                    id="volunteer-match-body"
                    class="resource-body"
                  >
                    <label class="search-field search-field--compact">
                      <i class="bi bi-search" aria-hidden="true"></i>
                      <input
                        v-model="volunteerSearchTerm"
                        type="search"
                        placeholder="ค้นหาชื่อผู้ดูแลเด็ก"
                      />
                    </label>

                    <div
                      v-if="villageVolunteers.length === 0"
                      class="empty-state empty-state--compact"
                    >
                      ยังไม่มีผู้ดูแลเด็กที่ลงทะเบียนในจังหวัดนี้
                    </div>
                    <div
                      v-else-if="filteredVillageVolunteers.length === 0"
                      class="empty-state empty-state--compact"
                    >
                      ไม่พบชื่อผู้ดูแลเด็กที่ค้นหา
                    </div>

                    <div v-else class="resource-list resource-list--volunteers">
                      <article
                        v-for="volunteer in filteredVillageVolunteers"
                        :key="volunteer.id"
                        class="resource-card"
                        :class="{
                          'resource-card--assigned': isVillageVolunteerAssignedToSelectedKid(
                            volunteer.id,
                          ),
                        }"
                      >
                        <div class="resource-card-main">
                          <div>
                            <h4>{{ volunteer.full_name }}</h4>
                            <p>
                              {{ volunteer.phone || volunteer.email || 'ยังไม่ระบุข้อมูลติดต่อ' }}
                            </p>
                          </div>
                          <span class="count-pill">{{
                            villageVolunteerAssignedCount(volunteer.id)
                          }}</span>
                        </div>

                        <div class="resource-controls">
                          <span
                            v-if="isVillageVolunteerAssignedToSelectedKid(volunteer.id)"
                            class="status-pill status-pill--success"
                          >
                            จับคู่แล้ว
                          </span>
                          <button
                            v-else
                            type="button"
                            class="assign-button"
                            :disabled="assigningVillageVolunteerId === volunteer.id"
                            @click="assignSelectedKidToVillageVolunteer(volunteer.id)"
                          >
                            {{
                              assigningVillageVolunteerId === volunteer.id
                                ? 'กำลังจับคู่'
                                : 'จับคู่'
                            }}
                          </button>
                          <button
                            type="button"
                            class="icon-toggle-button"
                            :aria-expanded="expandedVillageVolunteerIds.has(volunteer.id)"
                            :aria-label="
                              expandedVillageVolunteerIds.has(volunteer.id)
                                ? 'ซ่อนรายละเอียดผู้ดูแลเด็ก'
                                : 'ดูรายละเอียดผู้ดูแลเด็ก'
                            "
                            @click="toggleVillageVolunteerDetails(volunteer.id)"
                          ></button>
                        </div>

                        <div
                          v-if="expandedVillageVolunteerIds.has(volunteer.id)"
                          class="resource-detail"
                        >
                          <span>
                            <strong>เลขประจำตัวประชาชน:</strong> {{ volunteer.thai_id_masked }}
                          </span>
                          <span
                            ><strong>สถานพยาบาล:</strong> {{ volunteer.hospital_or_clinic }}</span
                          >
                          <span v-if="volunteer.license_id">
                            <strong>รหัส/เลขประจำตัว:</strong> {{ volunteer.license_id }}
                          </span>
                          <span>
                            <strong>ที่อยู่:</strong>
                            {{ volunteer.address.subdistrict }}, {{ volunteer.address.district }},
                            {{ volunteer.address.province }}
                          </span>
                        </div>
                      </article>
                    </div>
                  </div>
                </section>
              </template>
            </section>
          </div>
        </section>
      </div>
    </section>

    <div
      v-if="isKidPanelOpen"
      class="directory-modal-overlay kid-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kid-modal-title"
      @click.self="closeKidModal"
    >
      <section class="directory-modal kid-modal">
        <header class="directory-modal-header">
          <div>
            <p class="eyebrow">การจัดการข้อมูลเด็ก</p>
            <h2 id="kid-modal-title">
              {{ editingKidId ? 'แก้ไขข้อมูลเด็ก' : 'เพิ่มรายชื่อเด็ก' }}
            </h2>
          </div>
          <button
            type="button"
            class="modal-close-button"
            aria-label="ปิดหน้าต่างข้อมูลเด็ก"
            @click="closeKidModal"
          >
            <i class="bi bi-x-lg" aria-hidden="true"></i>
          </button>
        </header>

        <form class="kid-form kid-form--modal" @submit.prevent="submitForm">
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

            <label>
              <span>วันเดือนปีเกิด <strong class="required-marker">*</strong></span>
              <input v-model="form.date_of_birth" type="date" required autocomplete="off" />
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

            <label class="wide-field">
              <span>อาการสำคัญ</span>
              <textarea
                v-model="form.notable_symptoms"
                maxlength="2000"
                rows="4"
                placeholder="ระบุอาการสำคัญหรือข้อสังเกตที่ต้องติดตาม"
              ></textarea>
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

          <div class="form-actions kid-modal-actions">
            <button class="secondary-action" type="button" @click="cancelKidModal">ยกเลิก</button>
            <button class="primary-action" type="submit" :disabled="isSubmitting">
              {{
                isSubmitting
                  ? 'กำลังบันทึก...'
                  : editingKidId
                    ? 'บันทึกการแก้ไข'
                    : 'เพิ่มรายชื่อเด็ก'
              }}
            </button>
          </div>
        </form>
      </section>
    </div>

    <div
      v-if="directoryModalType"
      class="directory-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="directory-modal-title"
      @click.self="closeDirectoryModal"
    >
      <section class="directory-modal">
        <header class="directory-modal-header">
          <div>
            <p class="eyebrow">รายชื่อในพื้นที่ {{ managerProvince || '...' }}</p>
            <h2 id="directory-modal-title">{{ directoryModalTitle }}</h2>
          </div>
          <button
            type="button"
            class="modal-close-button"
            aria-label="ปิดหน้าต่างรายชื่อ"
            @click="closeDirectoryModal"
          >
            <i class="bi bi-x-lg" aria-hidden="true"></i>
          </button>
        </header>

        <label class="search-field directory-search-field">
          <i class="bi bi-search" aria-hidden="true"></i>
          <input v-model="directorySearchTerm" type="search" placeholder="ค้นหาจากชื่อ" />
        </label>

        <div v-if="directoryModalType === 'kids'" class="directory-list">
          <article v-for="kid in directoryKids" :key="kid.id" class="directory-card">
            <div class="directory-card-icon directory-card-icon--child">
              <i class="bi bi-person-hearts" aria-hidden="true"></i>
            </div>
            <div class="directory-card-body">
              <div class="directory-card-title">
                <h3>{{ kid.full_name }}</h3>
                <div class="directory-card-title-actions">
                  <span class="match-status" :class="kidMatchStatus(kid).className">
                    {{ kidMatchStatus(kid).label }}
                  </span>
                  <button
                    type="button"
                    class="icon-action icon-action--edit"
                    aria-label="แก้ไขข้อมูลเด็ก"
                    title="แก้ไขข้อมูลเด็ก"
                    @click="fillFormFromKid(kid)"
                  >
                    <i class="bi bi-pencil-square" aria-hidden="true"></i>
                  </button>
                  <button
                    type="button"
                    class="icon-action icon-action--danger"
                    :disabled="deletingKidId === kid.id"
                    aria-label="ลบข้อมูลเด็ก"
                    title="ลบข้อมูลเด็ก"
                    @click="requestDeleteKid(kid)"
                  >
                    <i
                      class="bi"
                      :class="deletingKidId === kid.id ? 'bi-hourglass-split' : 'bi-trash'"
                      aria-hidden="true"
                    ></i>
                  </button>
                </div>
              </div>
              <dl>
                <div>
                  <dt>เลขประจำตัวประชาชน</dt>
                  <dd>{{ kid.thai_id_masked }}</dd>
                </div>
                <div>
                  <dt>วันเดือนปีเกิด</dt>
                  <dd>{{ formatDate(kid.date_of_birth) }}</dd>
                </div>
                <div>
                  <dt>เพศ</dt>
                  <dd>{{ genderLabel(kid.gender) }}</dd>
                </div>
                <div>
                  <dt>อาการสำคัญ</dt>
                  <dd>{{ kid.notable_symptoms || '-' }}</dd>
                </div>
                <div>
                  <dt>ที่อยู่</dt>
                  <dd>
                    {{ kid.address.subdistrict }}, {{ kid.address.district }},
                    {{ kid.address.province }}
                  </dd>
                </div>
                <div>
                  <dt>นักบำบัด</dt>
                  <dd>{{ kid.assigned_caregiver?.full_name ?? 'ยังไม่จับคู่' }}</dd>
                </div>
                <div>
                  <dt>ผู้ดูแลเด็ก</dt>
                  <dd>{{ villageVolunteerNames(kid) }}</dd>
                </div>
              </dl>
            </div>
          </article>

          <div v-if="kids.length === 0" class="empty-state">ยังไม่มีข้อมูลเด็กในพื้นที่</div>
          <div v-else-if="directoryKids.length === 0" class="empty-state">
            ไม่พบชื่อเด็กที่ค้นหา
          </div>
        </div>

        <div v-else-if="directoryModalType === 'caregivers'" class="directory-list">
          <article
            v-for="caregiver in directoryCaregivers"
            :key="caregiver.id"
            class="directory-card"
          >
            <div class="directory-card-icon directory-card-icon--therapist">
              <i class="bi bi-clipboard2-pulse" aria-hidden="true"></i>
            </div>
            <div class="directory-card-body">
              <div class="directory-card-title">
                <h3>
                  {{ caregiver.full_name }}
                  <span
                    v-if="openSlots(caregiver).length > 0"
                    class="availability-badge"
                    title="มีเวลาว่างสำหรับจับคู่"
                  >
                    <i class="bi bi-calendar-check" aria-hidden="true"></i>
                    {{ openSlots(caregiver).length }}
                  </span>
                </h3>
                <span class="count-pill">{{ caregiverAssignedCount(caregiver.id) }} คน</span>
              </div>
              <dl>
                <div>
                  <dt>สถานพยาบาล</dt>
                  <dd>{{ caregiver.hospital_or_clinic || '-' }}</dd>
                </div>
                <div>
                  <dt>ใบประกอบวิชาชีพ</dt>
                  <dd>{{ caregiver.license_id || '-' }}</dd>
                </div>
                <div>
                  <dt>ที่อยู่</dt>
                  <dd>
                    {{ caregiver.address.subdistrict }}, {{ caregiver.address.district }},
                    {{ caregiver.address.province }}
                  </dd>
                </div>
                <div>
                  <dt>เวลาว่าง</dt>
                  <dd>
                    {{
                      openSlots(caregiver).length
                        ? openSlots(caregiver).map(formatSlot).join(', ')
                        : 'ไม่มีเวลาว่าง'
                    }}
                  </dd>
                </div>
              </dl>
              <div class="provider-stage-summary" aria-label="สถานะการดูแลของนักกิจกรรมบำบัด">
                <strong>ดูแลเด็ก {{ caregiverAssignedCount(caregiver.id) }} คน</strong>
                <div v-if="caregiverAssignedCount(caregiver.id)" class="provider-stage-list">
                  <span
                    v-for="stage in stageSummaryForKids(caregiverAssignedKids(caregiver.id))"
                    :key="stage.label"
                    class="match-status"
                    :class="stage.className"
                  >
                    {{ stage.label }} {{ stage.count }}
                  </span>
                </div>
                <span v-else class="provider-stage-empty">ยังไม่มีเด็กในความดูแล</span>
              </div>
            </div>
          </article>

          <div v-if="caregivers.length === 0" class="empty-state">
            ยังไม่มีนักกิจกรรมบำบัดในพื้นที่
          </div>
          <div v-else-if="directoryCaregivers.length === 0" class="empty-state">
            ไม่พบชื่อนักกิจกรรมบำบัดที่ค้นหา
          </div>
        </div>

        <div v-else class="directory-list">
          <article
            v-for="volunteer in directoryVillageVolunteers"
            :key="volunteer.id"
            class="directory-card"
          >
            <div class="directory-card-icon directory-card-icon--volunteer">
              <i class="bi bi-people" aria-hidden="true"></i>
            </div>
            <div class="directory-card-body">
              <div class="directory-card-title">
                <h3>{{ volunteer.full_name }}</h3>
                <span class="count-pill">{{ villageVolunteerAssignedCount(volunteer.id) }} คน</span>
              </div>
              <dl>
                <div>
                  <dt>เลขประจำตัวประชาชน</dt>
                  <dd>{{ volunteer.thai_id_masked }}</dd>
                </div>
                <div>
                  <dt>สถานพยาบาล</dt>
                  <dd>{{ volunteer.hospital_or_clinic || '-' }}</dd>
                </div>
                <div>
                  <dt>ติดต่อ</dt>
                  <dd>{{ volunteer.phone || volunteer.email || '-' }}</dd>
                </div>
                <div>
                  <dt>ที่อยู่</dt>
                  <dd>
                    {{ volunteer.address.subdistrict }}, {{ volunteer.address.district }},
                    {{ volunteer.address.province }}
                  </dd>
                </div>
              </dl>
              <div class="provider-stage-summary" aria-label="สถานะการดูแลของผู้ดูแลเด็ก">
                <strong>ดูแลเด็ก {{ villageVolunteerAssignedCount(volunteer.id) }} คน</strong>
                <div v-if="villageVolunteerAssignedCount(volunteer.id)" class="provider-stage-list">
                  <span
                    v-for="stage in stageSummaryForKids(villageVolunteerAssignedKids(volunteer.id))"
                    :key="stage.label"
                    class="match-status"
                    :class="stage.className"
                  >
                    {{ stage.label }} {{ stage.count }}
                  </span>
                </div>
                <span v-else class="provider-stage-empty">ยังไม่มีเด็กในความดูแล</span>
              </div>
            </div>
          </article>

          <div v-if="villageVolunteers.length === 0" class="empty-state">
            ยังไม่มีผู้ดูแลเด็กในพื้นที่
          </div>
          <div v-else-if="directoryVillageVolunteers.length === 0" class="empty-state">
            ไม่พบชื่อผู้ดูแลเด็กที่ค้นหา
          </div>
        </div>
      </section>
    </div>

    <div
      v-if="kidPendingDeletion"
      class="confirm-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-kid-title"
      @click.self="cancelDeleteKid"
    >
      <section class="confirm-modal">
        <span class="confirm-modal-icon confirm-modal-icon--danger" aria-hidden="true">
          <i class="bi bi-trash"></i>
        </span>
        <div>
          <h2 id="delete-kid-title">ยืนยันการลบข้อมูลเด็ก</h2>
          <p>
            ต้องการลบข้อมูลของ
            <strong>{{ kidPendingDeletion.full_name }}</strong>
            ใช่ไหม? การลบนี้จะนำเด็กออกจากรายการในพื้นที่
          </p>
        </div>
        <div class="confirm-modal-actions">
          <button type="button" class="secondary-action" @click="cancelDeleteKid">ยกเลิก</button>
          <button type="button" class="danger-action" @click="confirmDeleteKid">
            <i class="bi bi-trash" aria-hidden="true"></i>
            <span>ลบข้อมูล</span>
          </button>
        </div>
      </section>
    </div>
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
  content: '';
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
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

.command-center {
  display: grid;
  grid-template-columns: minmax(15rem, 0.32fr) minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
  margin-top: 1.25rem;
}

.workspace-menu {
  position: sticky;
  top: 1rem;
  display: grid;
  gap: 0.85rem;
  border: 1px solid rgb(219 231 245 / 0.92);
  border-radius: var(--radius-panel);
  padding: 0.9rem;
  background: var(--app-surface);
  box-shadow: var(--shadow-soft);
}

.workspace-menu-group {
  display: grid;
  gap: 0.45rem;
}

.workspace-menu-group + .workspace-menu-group {
  border-top: 1px solid rgb(219 231 245 / 0.8);
  padding-top: 0.75rem;
}

.workspace-menu-group p {
  margin: 0 0 0.1rem;
  color: var(--color-muted);
  font-size: 0.74rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.workspace-menu-button {
  display: grid;
  grid-template-columns: 2.15rem minmax(0, 1fr);
  align-items: center;
  gap: 0.65rem;
  min-height: 2.85rem;
  border: 1px solid transparent;
  border-radius: 0.7rem;
  padding: 0.35rem 0.55rem;
  color: var(--color-text);
  background: transparent;
  font-weight: 850;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 140ms ease,
    background-color 140ms ease,
    color 140ms ease,
    transform 140ms ease;
}

.workspace-menu-button i {
  display: inline-grid;
  width: 2.15rem;
  height: 2.15rem;
  place-items: center;
  border-radius: 0.65rem;
  color: var(--color-primary);
  background: rgb(59 130 246 / 0.1);
}

.workspace-menu-button span {
  min-width: 0;
  line-height: 1.35;
}

.workspace-menu-button:hover,
.workspace-menu-button:focus-visible,
.workspace-menu-button.is-active {
  transform: translateY(-1px);
  border-color: rgb(59 130 246 / 0.28);
  background: rgb(59 130 246 / 0.07);
  outline: none;
}

.workspace-menu-button.is-active i {
  color: #ffffff;
  background: var(--color-primary);
}

.command-section {
  display: grid;
  gap: 0.75rem;
  min-height: 18rem;
  border: 1px solid rgb(219 231 245 / 0.92);
  border-radius: var(--radius-panel);
  padding: 1rem;
  background: var(--app-surface);
  box-shadow: var(--shadow-soft);
}

.workspace-empty-state {
  display: grid;
  min-height: 16rem;
  place-items: center;
  align-content: center;
  gap: 0.55rem;
  border: 1px dashed rgb(96 165 250 / 0.35);
  border-radius: 0.9rem;
  padding: 2rem;
  color: var(--color-muted);
  text-align: center;
  background:
    linear-gradient(135deg, rgb(59 130 246 / 0.06), transparent 58%), var(--app-surface-soft);
}

.workspace-empty-state--compact {
  min-height: 10rem;
}

.workspace-empty-state i {
  display: inline-grid;
  width: 3rem;
  height: 3rem;
  place-items: center;
  border-radius: 999px;
  color: var(--color-primary);
  background: rgb(59 130 246 / 0.1);
  font-size: 1.35rem;
}

.workspace-empty-state h2,
.workspace-empty-state p {
  margin: 0;
}

.workspace-empty-state h2 {
  color: var(--color-text);
  font-size: 1.35rem;
}

.workspace-empty-state p {
  max-width: 28rem;
  line-height: 1.6;
}

.inline-workspace-panel {
  display: grid;
  min-width: 0;
  gap: 0.85rem;
}

.inline-workspace-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid rgb(219 231 245 / 0.84);
  padding-bottom: 0.8rem;
}

.inline-workspace-header h2 {
  font-size: 1.35rem;
}

.directory-list--inline {
  max-height: min(36rem, calc(100vh - 18rem));
  padding: 0;
}

.kid-form--inline {
  padding: 0;
}

.kid-form textarea {
  width: 100%;
  min-height: 6.5rem;
  resize: vertical;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 0.75rem 0.8rem;
  color: var(--color-text);
  background: var(--app-input-bg);
  font: inherit;
  outline: none;
}

.kid-form textarea:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.14);
}

.launcher-grid {
  display: grid;
  gap: 0.7rem;
}

.launcher-grid--directory {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.launcher-grid--management {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.launcher-button {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.78rem;
  border: 1px solid rgb(219 231 245 / 0.95);
  border-radius: 0.85rem;
  padding: 0.82rem;
  color: var(--color-text);
  background: #ffffff;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 12px 28px rgb(31 41 55 / 0.06);
  transition:
    border-color 140ms ease,
    box-shadow 140ms ease,
    transform 140ms ease,
    background-color 140ms ease;
}

.launcher-button:hover,
.launcher-button:focus-visible {
  transform: translateY(-1px);
  border-color: rgb(59 130 246 / 0.38);
  background: #f8fbff;
  box-shadow: 0 16px 34px rgb(59 130 246 / 0.14);
}

.launcher-button--primary {
  border-color: rgb(59 130 246 / 0.2);
  background: linear-gradient(135deg, #ffffff, #f8fbff);
}

.launcher-icon {
  display: inline-grid;
  width: 3rem;
  height: 3rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 1rem;
  font-size: 1.35rem;
}

.launcher-icon--child,
.directory-card-icon--child {
  color: #2563eb;
  background: #dbeafe;
}

.launcher-icon--therapist,
.directory-card-icon--therapist {
  color: #047857;
  background: #d1fae5;
}

.launcher-icon--volunteer,
.directory-card-icon--volunteer {
  color: #7c3aed;
  background: #ede9fe;
}

.launcher-icon--add {
  color: #1d4ed8;
  background: #e0f2fe;
}

.launcher-icon--match {
  color: #b45309;
  background: #fef3c7;
}

.launcher-button strong,
.launcher-button small {
  display: block;
}

.launcher-button strong {
  color: var(--color-text);
  font-size: 0.96rem;
  line-height: 1.25;
}

.launcher-button small {
  margin-top: 0.18rem;
  color: var(--color-muted);
  font-size: 0.78rem;
  font-weight: 750;
  line-height: 1.3;
}

.table-panel,
.matching-panel {
  border: 1px solid rgb(219 231 245 / 0.96);
  border-radius: var(--radius-panel);
  background: rgb(255 255 255 / 0.92);
  box-shadow: var(--shadow-soft);
}

.kid-form {
  display: grid;
  gap: 1rem;
}

.kid-form--modal {
  overflow: auto;
  padding: 1rem;
}

.kid-modal {
  width: min(48rem, 100%);
}

.kid-modal-actions {
  position: sticky;
  bottom: -1rem;
  margin: 0 -1rem -1rem;
  border-top: 1px solid rgb(219 231 245 / 0.86);
  padding: 0.85rem 1rem;
  background: rgb(255 255 255 / 0.96);
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

.search-field {
  position: relative;
  display: block;
  margin: 0.85rem 1rem 0;
}

.search-field i {
  position: absolute;
  top: 50%;
  left: 0.85rem;
  color: var(--color-muted);
  font-size: 0.9rem;
  pointer-events: none;
  transform: translateY(-50%);
}

.search-field input {
  height: 2.5rem;
  padding-left: 2.35rem;
  border-radius: 999px;
  background: #fbfdff;
}

.search-field--compact {
  margin: 0;
}

.directory-search-field {
  margin: 1rem 1rem 0.75rem;
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
  content: '';
  transform: translateY(-0.12rem) rotate(45deg);
}

.icon-toggle-button[aria-expanded='true']::before {
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

.matching-workspace {
  display: grid;
  grid-template-columns: minmax(19rem, 0.72fr) minmax(0, 1.28fr);
  gap: 1.25rem;
  align-items: start;
  margin-top: 1.25rem;
}

.matching-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 4100;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(15 23 42 / 0.5);
  backdrop-filter: blur(6px);
}

.matching-modal {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  width: min(76rem, 100%);
  max-height: calc(100vh - 2rem);
  overflow: hidden;
  border: 1px solid rgb(219 231 245 / 0.95);
  border-radius: 1rem;
  background: var(--color-background);
  box-shadow: 0 28px 70px rgb(15 23 42 / 0.26);
}

.matching-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid rgb(219 231 245 / 0.86);
  padding: 1rem 1.1rem;
  background: linear-gradient(135deg, rgb(59 130 246 / 0.08), transparent 48%), #ffffff;
}

.matching-modal-header h2 {
  font-size: 1.35rem;
}

.matching-modal .matching-workspace {
  min-height: 0;
  overflow: auto;
  margin-top: 0;
  padding: 1rem;
}

.matching-modal .child-selector-panel {
  position: static;
}

.matching-modal .child-card-list {
  max-height: min(34rem, calc(100vh - 15rem));
}

.matching-panel {
  min-width: 0;
  overflow: hidden;
}

.child-selector-panel {
  position: sticky;
  top: 1rem;
}

.child-card-list {
  display: grid;
  gap: 0.45rem;
  max-height: min(47rem, calc(100vh - 8rem));
  overflow: auto;
  padding: 0.65rem;
}

.child-match-card {
  display: block;
  border: 1px solid rgb(219 231 245 / 0.9);
  border-left: 4px solid transparent;
  border-radius: 0.55rem;
  padding: 0.62rem 0.7rem;
  background: #ffffff;
  cursor: pointer;
  transition:
    border-color 140ms ease,
    box-shadow 140ms ease,
    transform 140ms ease,
    background-color 140ms ease;
}

.child-match-card:hover,
.child-match-card.is-selected {
  border-color: rgb(59 130 246 / 0.34);
  border-left-color: var(--color-primary);
  background: #f8fbff;
  box-shadow: 0 14px 28px rgb(31 41 55 / 0.08);
}

.child-match-card.is-selected {
  transform: translateY(-1px);
}

.child-card-main,
.resource-card-main,
.resource-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.child-card-main {
  align-items: center;
}

.child-card-main h3,
.resource-card-main h4,
.empty-selection h3 {
  margin: 0;
  color: var(--color-text);
}

.child-card-main h3 {
  overflow: hidden;
  font-size: 0.96rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.child-card-main p,
.resource-card-main p,
.assignment-lines,
.resource-heading p,
.assignment-hero p,
.empty-selection p {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.86rem;
  line-height: 1.5;
}

.assignment-lines {
  display: grid;
  gap: 0.35rem;
}

.assignment-lines span {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 0.45rem;
}

.assignment-lines i {
  color: var(--color-primary);
}

.match-status {
  display: inline-flex;
  min-height: 1.75rem;
  flex: 0 0 auto;
  align-items: center;
  border-radius: 999px;
  padding: 0.2rem 0.62rem;
  font-size: 0.76rem;
  font-weight: 900;
}

.match-status--complete {
  color: #166534;
  background: #dcfce7;
}

.match-status--warning {
  color: #92400e;
  background: #fef3c7;
}

.match-status--empty {
  color: #475569;
  background: #eef2f7;
}

.assignment-panel {
  display: grid;
  gap: 0.85rem;
  padding: 0.85rem;
}

.empty-selection {
  display: grid;
  justify-items: center;
  gap: 0.45rem;
  padding: 2rem 1rem;
  color: var(--color-muted);
  text-align: center;
}

.empty-selection i {
  display: inline-grid;
  width: 3.4rem;
  height: 3.4rem;
  place-items: center;
  border-radius: 999px;
  color: var(--color-primary);
  background: rgb(59 130 246 / 0.1);
  font-size: 1.45rem;
}

.assignment-summary {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(16rem, 0.9fr);
  gap: 0.75rem;
  align-items: center;
  border: 1px solid rgb(59 130 246 / 0.18);
  border-radius: 0.75rem;
  padding: 0.75rem 0.85rem;
  background: linear-gradient(135deg, rgb(59 130 246 / 0.08), transparent 48%), #ffffff;
}

.assignment-summary-main {
  display: grid;
  min-width: 0;
}

.assignment-summary-label,
.assignment-summary-main small {
  color: var(--color-muted);
  font-size: 0.76rem;
  font-weight: 800;
}

.assignment-summary-main strong {
  overflow: hidden;
  color: var(--color-text);
  font-size: 1.15rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.assignment-summary-meta {
  display: grid;
  gap: 0.28rem;
  min-width: 0;
}

.assignment-summary-meta span {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 0.42rem;
  overflow: hidden;
  color: var(--color-muted);
  font-size: 0.82rem;
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.assignment-summary-meta i {
  color: var(--color-primary);
}

.resource-section {
  display: grid;
  gap: 0.75rem;
  border-top: 1px solid rgb(219 231 245 / 0.78);
  padding-top: 1rem;
}

.resource-heading-actions {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.45rem;
}

.section-toggle-button {
  display: inline-flex;
  width: 2.55rem;
  min-height: 2.55rem;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--admin-border);
  border-radius: 0.5rem;
  padding: 0;
  color: var(--admin-text);
  background: #ffffff;
  box-shadow: 0 0.125rem 0.25rem rgb(58 59 69 / 0.08);
  font-weight: 850;
  cursor: pointer;
}

.section-toggle-button:hover,
.section-toggle-button:focus-visible {
  border-color: rgb(78 115 223 / 0.35);
  color: var(--admin-primary);
  outline: none;
}

.resource-body {
  display: grid;
  gap: 0.75rem;
}

.resource-heading h3 {
  margin: 0;
  color: var(--color-text);
  font-size: 1rem;
}

.resource-list {
  display: grid;
  gap: 0.48rem;
}

.resource-card {
  display: grid;
  grid-template-columns: minmax(11rem, 0.72fr) minmax(16rem, 1fr);
  gap: 0.6rem;
  align-items: center;
  border: 1px solid rgb(219 231 245 / 0.9);
  border-radius: 0.58rem;
  padding: 0.58rem 0.68rem;
  background: #ffffff;
}

.resource-card--assigned {
  border-color: rgb(34 197 94 / 0.28);
  background: #fbfffd;
}

.resource-card-main h4 {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.25;
}

.resource-card-main p {
  margin-top: 0.12rem;
  font-size: 0.8rem;
  line-height: 1.25;
}

.therapist-name {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
}

.availability-badge {
  display: inline-flex;
  min-height: 1.38rem;
  align-items: center;
  gap: 0.28rem;
  border: 1px solid rgb(22 163 74 / 0.22);
  border-radius: 999px;
  padding: 0.08rem 0.42rem;
  color: #15803d;
  background: #ecfdf5;
  font-size: 0.72rem;
  font-weight: 900;
  line-height: 1;
}

.availability-badge i {
  font-size: 0.8rem;
}

.resource-controls {
  display: grid;
  grid-template-columns: minmax(10rem, 1fr) auto auto;
  gap: 0.42rem;
  align-items: center;
}

.resource-controls .assign-button {
  min-height: 2.05rem;
  padding: 0 0.7rem;
  font-size: 0.82rem;
}

.resource-controls .icon-toggle-button {
  width: 2rem;
  height: 2rem;
}

.resource-card .count-pill {
  min-width: 1.8rem;
  min-height: 1.8rem;
  padding: 0.12rem 0.48rem;
  font-size: 0.76rem;
}

.resource-list--volunteers .resource-controls {
  grid-template-columns: 1fr auto;
}

.resource-detail {
  display: grid;
  grid-column: 1 / -1;
  gap: 0.28rem;
  border-top: 1px solid rgb(219 231 245 / 0.75);
  padding-top: 0.55rem;
  color: var(--color-muted);
  font-size: 0.84rem;
  line-height: 1.55;
}

.resource-detail strong {
  color: var(--color-text);
}

.empty-state--compact {
  padding: 1.4rem 1rem;
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
  height: 2.05rem;
  font-size: 0.84rem;
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
  width: 24%;
}

.match-grid .table-panel:first-child th:nth-child(2),
.match-grid .table-panel:first-child td:nth-child(2) {
  width: 26%;
  text-align: center;
}

.match-grid .table-panel:first-child th:nth-child(3),
.match-grid .table-panel:first-child td:nth-child(3) {
  width: 26%;
  text-align: center;
}

.match-grid .table-panel:first-child th:nth-child(4),
.match-grid .table-panel:first-child td:nth-child(4) {
  width: 24%;
  text-align: right;
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

.village-volunteer-panel table {
  table-layout: fixed;
  min-width: 62rem;
}

.village-volunteer-panel th:nth-child(1),
.village-volunteer-panel td:nth-child(1) {
  width: 22%;
}

.village-volunteer-panel th:nth-child(2),
.village-volunteer-panel td:nth-child(2) {
  width: 8%;
  text-align: center;
}

.village-volunteer-panel th:nth-child(3),
.village-volunteer-panel td:nth-child(3) {
  width: 24%;
}

.village-volunteer-panel th:nth-child(4),
.village-volunteer-panel td:nth-child(4) {
  width: 20%;
}

.village-volunteer-panel th:nth-child(5),
.village-volunteer-panel td:nth-child(5) {
  width: 11%;
  text-align: right;
}

.village-volunteer-panel th:nth-child(6),
.village-volunteer-panel td:nth-child(6) {
  width: 15%;
  text-align: right;
}

.empty-state {
  padding: 2.5rem 1rem;
  color: var(--color-muted);
  text-align: center;
}

.directory-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(15 23 42 / 0.48);
  backdrop-filter: blur(6px);
}

.kid-modal-overlay {
  z-index: 60;
}

.directory-modal {
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  width: min(58rem, 100%);
  max-height: min(44rem, calc(100vh - 2rem));
  overflow: hidden;
  border: 1px solid rgb(219 231 245 / 0.95);
  border-radius: 1rem;
  background: #ffffff;
  box-shadow: 0 28px 70px rgb(15 23 42 / 0.26);
}

.directory-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid rgb(219 231 245 / 0.86);
  padding: 1rem 1.1rem;
  background: linear-gradient(135deg, rgb(59 130 246 / 0.08), transparent 48%), #ffffff;
}

.directory-modal-header h2 {
  font-size: 1.35rem;
}

.modal-close-button {
  display: inline-grid;
  width: 2.45rem;
  height: 2.45rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid var(--color-border);
  border-radius: 0.65rem;
  color: var(--color-muted);
  background: #ffffff;
  cursor: pointer;
  transition:
    border-color 140ms ease,
    color 140ms ease,
    background-color 140ms ease;
}

.modal-close-button:hover,
.modal-close-button:focus-visible {
  border-color: rgb(59 130 246 / 0.38);
  color: var(--color-primary);
  background: #f8fbff;
}

.directory-list {
  display: grid;
  gap: 0.75rem;
  overflow: auto;
  padding: 1rem;
}

.directory-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.85rem;
  border: 1px solid rgb(219 231 245 / 0.9);
  border-radius: 0.8rem;
  padding: 0.85rem;
  background: #ffffff;
}

.directory-card-icon {
  display: inline-grid;
  width: 3.15rem;
  height: 3.15rem;
  place-items: center;
  border-radius: 1rem;
  font-size: 1.35rem;
}

.directory-card-body {
  display: grid;
  gap: 0.7rem;
  min-width: 0;
}

.directory-card-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.directory-card-title h3 {
  display: inline-flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
  margin: 0;
  color: var(--color-text);
  font-size: 1rem;
  line-height: 1.35;
}

.directory-card-title-actions {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.4rem;
}

.icon-action {
  display: inline-grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  border: 1px solid rgb(219 231 245 / 0.95);
  border-radius: 0.55rem;
  background: #ffffff;
  box-shadow: 0 0.18rem 0.55rem rgb(31 41 55 / 0.08);
  cursor: pointer;
}

.icon-action:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.icon-action--edit {
  color: #2563eb;
  border-color: rgb(59 130 246 / 0.3);
  background: #eff6ff;
}

.icon-action--danger {
  color: #dc2626;
  border-color: rgb(239 68 68 / 0.28);
  background: #fef2f2;
}

.icon-action:hover,
.icon-action:focus-visible {
  outline: none;
  transform: translateY(-1px);
  box-shadow: 0 0.35rem 0.8rem rgb(31 41 55 / 0.12);
}

.confirm-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(15 23 42 / 0.5);
  backdrop-filter: blur(5px);
}

.confirm-modal {
  display: grid;
  width: min(430px, 100%);
  gap: 1rem;
  border: 1px solid rgb(219 231 245 / 0.95);
  border-radius: 0.9rem;
  padding: 1.25rem;
  background: #ffffff;
  box-shadow: 0 28px 70px rgb(15 23 42 / 0.26);
}

.confirm-modal-icon {
  display: inline-grid;
  width: 3.1rem;
  height: 3.1rem;
  place-items: center;
  border-radius: 999px;
  font-size: 1.25rem;
}

.confirm-modal-icon--danger {
  color: #dc2626;
  background: #fee2e2;
}

.confirm-modal h2 {
  margin: 0;
  color: var(--color-text);
  font-size: 1.18rem;
}

.confirm-modal p {
  margin: 0.4rem 0 0;
  color: var(--color-muted);
  line-height: 1.6;
}

.confirm-modal strong {
  color: var(--color-text);
}

.confirm-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
}

.directory-card dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem 1rem;
  margin: 0;
}

.directory-card dl div {
  min-width: 0;
}

.directory-card dt {
  color: var(--color-muted);
  font-size: 0.76rem;
  font-weight: 850;
}

.directory-card dd {
  margin: 0.15rem 0 0;
  color: var(--color-text);
  font-size: 0.88rem;
  font-weight: 650;
  line-height: 1.45;
}

.provider-stage-summary {
  display: grid;
  gap: 0.45rem;
  border-top: 1px solid rgb(219 231 245 / 0.76);
  padding-top: 0.7rem;
}

.provider-stage-summary > strong {
  color: var(--color-text);
  font-size: 0.86rem;
}

.provider-stage-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.provider-stage-empty {
  color: var(--color-muted);
  font-size: 0.84rem;
  font-weight: 750;
}

@media (max-width: 980px) {
  .page-heading,
  .command-center,
  .matching-workspace,
  .match-grid {
    grid-template-columns: 1fr;
  }

  .launcher-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .workspace-menu {
    position: static;
  }

  .child-selector-panel {
    position: static;
  }

  .summary-strip {
    grid-template-columns: repeat(3, minmax(0, 1fr));
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

  .assignment-summary,
  .resource-controls,
  .resource-list--volunteers .resource-controls,
  .directory-card dl {
    grid-template-columns: 1fr;
  }

  .assignment-summary,
  .child-card-main,
  .resource-card-main,
  .resource-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .resource-heading-actions {
    width: 100%;
  }

  .section-toggle-button {
    flex: 0 0 2.55rem;
  }

  .summary-strip {
    grid-template-columns: 1fr 1fr;
  }

  .launcher-grid {
    grid-template-columns: 1fr;
  }

  .directory-card {
    grid-template-columns: 1fr;
  }
}
</style>
