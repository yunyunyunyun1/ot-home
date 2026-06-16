<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { RouterLink } from "vue-router"

import { ApiError } from "../../api/client"
import {
  createAvailabilitySlot,
  deleteAvailabilitySlot,
  listMyAssignedKids,
  listMyAvailabilitySlots,
  updateAvailabilitySlot,
  type CaregiverAvailabilitySlotResponse,
  type KidResponse,
} from "../../api/kids"
import { useAuthStore } from "../../stores/auth"

const authStore = useAuthStore()
const kids = ref<KidResponse[]>([])
const availabilitySlots = ref<CaregiverAvailabilitySlotResponse[]>([])
const expandedKidIds = ref<Set<string>>(new Set())
const isLoading = ref(false)
const isLoadingAvailability = ref(false)
const isSubmittingAvailability = ref(false)
const editingSlotId = ref("")
const deletingSlotId = ref("")
const errorMessage = ref("")
const availabilityMessage = ref("")
const availabilityForm = ref({
  available_date: "",
  start_time: "",
  end_time: "",
})
const editAvailabilityForm = ref({
  available_date: "",
  start_time: "",
  end_time: "",
})

const openAvailabilityCount = computed(() => {
  return availabilitySlots.value.filter((slot) => !slot.is_booked).length
})

const visibleAvailabilitySlots = computed(() => {
  return availabilitySlots.value.filter((slot) => !slot.is_booked)
})

const bookedAvailabilityCount = computed(() => {
  return availabilitySlots.value.filter((slot) => slot.is_booked).length
})

function sortSlots(slots: CaregiverAvailabilitySlotResponse[]) {
  return [...slots].sort((a, b) => {
    return `${a.available_date}${a.start_time}`.localeCompare(`${b.available_date}${b.start_time}`)
  })
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

async function loadKids() {
  isLoading.value = true
  errorMessage.value = ""

  try {
    kids.value = await listMyAssignedKids()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : "ไม่สามารถโหลดรายชื่อเด็กได้ กรุณาลองใหม่อีกครั้ง"
  } finally {
    isLoading.value = false
  }
}

async function loadAvailability() {
  isLoadingAvailability.value = true
  errorMessage.value = ""

  try {
    availabilitySlots.value = await listMyAvailabilitySlots()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : "ไม่สามารถโหลดเวลาว่างได้ กรุณาลองใหม่อีกครั้ง"
  } finally {
    isLoadingAvailability.value = false
  }
}

async function submitAvailability() {
  errorMessage.value = ""
  availabilityMessage.value = ""
  isSubmittingAvailability.value = true

  try {
    const slot = await createAvailabilitySlot(availabilityForm.value)
    availabilitySlots.value = sortSlots([...availabilitySlots.value, slot])
    availabilityForm.value = {
      available_date: "",
      start_time: "",
      end_time: "",
    }
    availabilityMessage.value = "เพิ่มเวลาว่างแล้ว"
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : "ไม่สามารถเพิ่มเวลาว่างได้ กรุณาลองใหม่อีกครั้ง"
  } finally {
    isSubmittingAvailability.value = false
  }
}

function startEditSlot(slot: CaregiverAvailabilitySlotResponse) {
  editingSlotId.value = slot.id
  editAvailabilityForm.value = {
    available_date: slot.available_date,
    start_time: slot.start_time.slice(0, 5),
    end_time: slot.end_time.slice(0, 5),
  }
  availabilityMessage.value = ""
  errorMessage.value = ""
}

function cancelEditSlot() {
  editingSlotId.value = ""
  editAvailabilityForm.value = {
    available_date: "",
    start_time: "",
    end_time: "",
  }
}

async function submitSlotUpdate(slotId: string) {
  errorMessage.value = ""
  availabilityMessage.value = ""
  isSubmittingAvailability.value = true

  try {
    const updatedSlot = await updateAvailabilitySlot(slotId, editAvailabilityForm.value)
    availabilitySlots.value = sortSlots(
      availabilitySlots.value.map((slot) => (slot.id === updatedSlot.id ? updatedSlot : slot)),
    )
    cancelEditSlot()
    availabilityMessage.value = "แก้ไขเวลาว่างแล้ว"
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : "ไม่สามารถแก้ไขเวลาว่างได้ กรุณาลองใหม่อีกครั้ง"
  } finally {
    isSubmittingAvailability.value = false
  }
}

async function removeSlot(slotId: string) {
  errorMessage.value = ""
  availabilityMessage.value = ""
  deletingSlotId.value = slotId

  try {
    await deleteAvailabilitySlot(slotId)
    availabilitySlots.value = availabilitySlots.value.filter((slot) => slot.id !== slotId)
    if (editingSlotId.value === slotId) {
      cancelEditSlot()
    }
    availabilityMessage.value = "ลบเวลาว่างแล้ว"
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : "ไม่สามารถลบเวลาว่างได้ กรุณาลองใหม่อีกครั้ง"
  } finally {
    deletingSlotId.value = ""
  }
}

onMounted(async () => {
  await loadKids()
  await loadAvailability()
})
</script>

<template>
  <main class="caregiver-page">
    <nav class="top-nav" aria-label="Main navigation">
      <RouterLink class="brand" to="/" aria-label="OT@HOME home">
        <span class="logo-slot" aria-hidden="true"></span>
        <span class="brand-name">OT@HOME</span>
      </RouterLink>

      <div class="user-chip">{{ authStore.user?.full_name ?? "นักบำบัด" }}</div>
    </nav>

    <section class="dashboard-shell" aria-labelledby="caregiver-title">
      <div class="page-heading">
        <div>
          <p class="eyebrow">OT@HOME Caregiver</p>
          <h1 id="caregiver-title">เด็กที่ได้รับมอบหมาย</h1>
        </div>

        <div class="summary-strip" aria-label="ภาพรวม">
          <div class="summary-item">
            <span>เด็กที่ดูแล</span>
            <strong>{{ kids.length }}</strong>
          </div>
          <div class="summary-item">
            <span>เวลาว่าง</span>
            <strong>{{ openAvailabilityCount }}</strong>
          </div>
          <div class="summary-item">
            <span>ถูกจองแล้ว</span>
            <strong>{{ bookedAvailabilityCount }}</strong>
          </div>
        </div>
      </div>

      <p v-if="errorMessage" class="form-alert form-alert--error">{{ errorMessage }}</p>

      <section class="availability-panel" aria-label="เพิ่มเวลาว่าง">
        <div>
          <h2>เวลาที่สะดวกให้บริการ</h2>
          <p>เพิ่มช่วงเวลาที่ Case Manager สามารถใช้จับคู่เด็กกับคุณ</p>
        </div>

        <form class="availability-form" @submit.prevent="submitAvailability">
          <label>
            <span>วันที่</span>
            <input v-model="availabilityForm.available_date" type="date" required />
          </label>

          <label>
            <span>เริ่ม</span>
            <input v-model="availabilityForm.start_time" type="time" required />
          </label>

          <label>
            <span>สิ้นสุด</span>
            <input v-model="availabilityForm.end_time" type="time" required />
          </label>

          <button class="primary-action" type="submit" :disabled="isSubmittingAvailability">
            {{ isSubmittingAvailability ? "กำลังเพิ่ม..." : "เพิ่มเวลาว่าง" }}
          </button>
        </form>

        <p v-if="availabilityMessage" class="form-alert form-alert--success">{{ availabilityMessage }}</p>
      </section>

      <div class="dashboard-grid">
      <section class="table-panel" aria-label="ตารางเด็กที่ได้รับมอบหมาย">
        <div class="list-header">
          <div>
            <h2>รายชื่อเด็ก</h2>
            <p>เด็กทั้งหมดที่ Case Manager จับคู่ให้คุณ</p>
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
          ยังไม่มีเด็กที่ได้รับมอบหมาย
        </div>

        <table v-else>
          <thead>
            <tr>
              <th scope="col">ชื่อเด็ก</th>
              <th scope="col">เลขประชาชน</th>
              
            </tr>
          </thead>
          <tbody>
            <template v-for="kid in kids" :key="kid.id">
              <tr>
                <td>
                  <span class="kid-name">
                    {{ kid.full_name }}
                  </span>
                </td>
                <td>{{ kid.thai_id_masked }}</td>
                <td class="actions-cell">
                  <RouterLink
                    class="row-link-button"
                    :to="{ name: 'caregiver-kid-development', params: { kidId: kid.id } }"
                  >
                    ผลประเมิน
                  </RouterLink>
                  <button
                    type="button"
                    class="icon-toggle-button"
                    :aria-expanded="expandedKidIds.has(kid.id)"
                    @click="toggleKidDetails(kid.id)"
                  >
                    {{ expandedKidIds.has(kid.id) ? "ซ่อน" : "ดู" }}
                  </button>
                </td>
              </tr>
              <tr v-if="expandedKidIds.has(kid.id)" class="detail-row">
                <td colspan="3">
                  <span>{{ kid.address.subdistrict }}, {{ kid.address.district }}, {{ kid.address.province }}</span>
                  <span>รหัสไปรษณีย์ {{ kid.address.postal_code }}</span>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </section>

      <section class="table-panel" aria-label="ตารางเวลาว่าง">
        <div class="list-header">
          <div>
            <h2>ตารางเวลาว่าง</h2>
            <p>ช่วงเวลาที่เปิดให้ Case Manager จับคู่</p>
          </div>
          <button
            type="button"
            class="refresh-button"
            :class="{ 'is-loading': isLoadingAvailability }"
            :disabled="isLoadingAvailability"
            aria-label="รีเฟรชตารางเวลาว่าง"
            @click="loadAvailability"
          >
            <i
              class="bi bi-arrow-clockwise"
              aria-hidden="true"
            ></i>
          </button>
        </div>

        <div v-if="visibleAvailabilitySlots.length === 0" class="empty-state">
          ยังไม่มีเวลาว่าง
        </div>

        <table v-else>
          <thead>
            <tr>
              <th scope="col">วันที่</th>
              <th scope="col">เวลา</th>
              <th scope="col">สถานะ</th>
              <th scope="col">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="slot in visibleAvailabilitySlots" :key="slot.id">
              <td>
                <input
                  v-if="editingSlotId === slot.id"
                  v-model="editAvailabilityForm.available_date"
                  class="inline-input"
                  type="date"
                  required
                />
                <span v-else>{{ slot.available_date }}</span>
              </td>
              <td>
                <div v-if="editingSlotId === slot.id" class="inline-time">
                  <input
                    v-model="editAvailabilityForm.start_time"
                    class="inline-input"
                    type="time"
                    required
                  />
                  <input
                    v-model="editAvailabilityForm.end_time"
                    class="inline-input"
                    type="time"
                    required
                  />
                </div>
                <span v-else>{{ slot.start_time.slice(0, 5) }} - {{ slot.end_time.slice(0, 5) }}</span>
              </td>
              <td>{{ slot.is_booked ? `จองแล้ว: ${slot.assigned_kid_name}` : "ว่าง" }}</td>
              <td>
                <div class="row-actions">
                  <template v-if="editingSlotId === slot.id">
                    <button
                      type="button"
                      class="text-button"
                      :disabled="isSubmittingAvailability"
                      @click="submitSlotUpdate(slot.id)"
                    >
                      บันทึก
                    </button>
                    <button type="button" class="text-button" @click="cancelEditSlot">
                      ยกเลิก
                    </button>
                  </template>
                  <template v-else>
                    <button
                      type="button"
                      class="text-button"
                      :disabled="slot.is_booked"
                      @click="startEditSlot(slot)"
                    >
                      แก้ไข
                    </button>
                    <button
                      type="button"
                      class="danger-button"
                      :disabled="slot.is_booked || deletingSlotId === slot.id"
                      @click="removeSlot(slot.id)"
                    >
                      {{ deletingSlotId === slot.id ? "กำลังลบ" : "ลบ" }}
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.caregiver-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgb(96 165 250 / 0.15), transparent 24rem),
    linear-gradient(135deg, #ffffff 0%, var(--color-background) 46%, var(--color-background-soft) 100%);
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
  content: "";
}

.brand-name {
  color: var(--color-text);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0;
  white-space: nowrap;
}

.user-chip {
  max-width: 18rem;
  overflow: hidden;
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text);
  background: rgb(255 255 255 / 0.82);
  font-size: 0.92rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dashboard-shell {
  padding: clamp(1.5rem, 4vw, 2.8rem) 0 4rem;
}

.page-heading {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(22rem, 0.62fr);
  gap: 1.25rem;
  align-items: end;
  margin-bottom: 1.25rem;
}

.eyebrow {
  margin: 0 0 0.55rem;
  color: var(--color-primary);
  font-size: 0.82rem;
  font-weight: 850;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.summary-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  overflow: hidden;
  border: 1px solid rgb(219 231 245 / 0.92);
  border-radius: 0.8rem;
  background: rgb(255 255 255 / 0.84);
  box-shadow: var(--shadow-soft);
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

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
  align-items: start;
}

h1,
h2 {
  margin: 0;
  color: var(--color-text);
  letter-spacing: 0;
}

h1 {
  font-size: clamp(1.9rem, 4vw, 3.2rem);
  line-height: 1.12;
}

h2 {
  font-size: 1.15rem;
}

.availability-panel,
.table-panel {
  overflow-x: auto;
  border: 1px solid rgb(219 231 245 / 0.96);
  border-radius: var(--radius-panel);
  background: rgb(255 255 255 / 0.92);
  box-shadow: var(--shadow-soft);
}

.availability-panel {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding: 1rem;
}

.availability-panel p {
  margin: 0.25rem 0 0;
  color: var(--color-muted);
  font-size: 0.9rem;
}

.availability-form {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 0.8fr auto;
  gap: 0.85rem;
  align-items: end;
}

.availability-form label {
  display: grid;
  gap: 0.4rem;
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 800;
}

.availability-form input {
  height: 2.65rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 0 0.75rem;
  color: var(--color-text);
  background: #ffffff;
}

.primary-action {
  min-height: 2.65rem;
  border: 0;
  border-radius: 0.5rem;
  padding: 0 1rem;
  color: #ffffff;
  background: var(--color-primary);
  font-weight: 800;
  cursor: pointer;
}

.primary-action:disabled {
  cursor: wait;
  opacity: 0.72;
}

.list-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.9rem;
  margin: 0;
  padding: 1rem 1rem 0.85rem;
  border-bottom: 1px solid rgb(219 231 245 / 0.8);
}

.list-header p {
  margin: 0.25rem 0 0;
  color: var(--color-muted);
  font-size: 0.9rem;
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
  cursor: pointer;
}

.refresh-button:hover,
.refresh-button:focus-visible {
  border-color: rgb(59 130 246 / 0.42);
  background: rgb(59 130 246 / 0.08);
}

.refresh-button:disabled {
  cursor: wait;
  opacity: 0.72;
}

.refresh-button.is-loading .bi {
  animation: spin-refresh 0.8s linear infinite;
}

@keyframes spin-refresh {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  padding: 2.5rem 1rem;
  color: var(--color-muted);
  text-align: center;
}

table {
  width: 100%;
  min-width: 32rem;
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
  font-size: 0.82rem;
  font-weight: 800;
}

.table-panel:first-child th:last-child {
  color: transparent;
}

td {
  color: var(--color-text);
  font-size: 0.92rem;
  font-weight: 650;
}

.kid-name {
  color: var(--color-text);
  font-weight: 850;
}

.row-link-button {
  display: inline-flex;
  min-height: 2.1rem;
  align-items: center;
  justify-content: center;
  border: 1px solid rgb(59 130 246 / 0.28);
  border-radius: 0.45rem;
  padding: 0 0.75rem;
  color: var(--color-primary);
  background: rgb(59 130 246 / 0.08);
  font-size: 0.86rem;
  font-weight: 850;
  text-decoration: none;
  white-space: nowrap;
}

.row-link-button:hover,
.row-link-button:focus-visible {
  border-color: rgb(59 130 246 / 0.52);
  background: rgb(59 130 246 / 0.14);
}

.row-link-button + .icon-toggle-button {
  margin-left: 0.35rem;
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

.detail-row td {
  padding-top: 0.35rem;
  color: var(--color-muted);
  background: #f8fafc;
  font-weight: 500;
}

.detail-row span {
  display: block;
  line-height: 1.6;
}

.text-button {
  min-height: 2.1rem;
  border: 0;
  border-radius: 0.45rem;
  color: var(--color-primary);
  background: transparent;
  font-size: 0.86rem;
  font-weight: 800;
  cursor: pointer;
}

.text-button:disabled,
.danger-button:disabled {
  cursor: not-allowed;
  opacity: 0.42;
}

.danger-button {
  min-height: 2.1rem;
  border: 0;
  border-radius: 0.45rem;
  color: #b91c1c;
  background: transparent;
  font-size: 0.86rem;
  font-weight: 800;
  cursor: pointer;
}

.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.actions-cell {
  text-align: right;
  white-space: nowrap;
}

.inline-time {
  display: flex;
  gap: 0.4rem;
}

.inline-input {
  width: 100%;
  min-width: 7.5rem;
  height: 2.2rem;
  border: 1px solid var(--color-border);
  border-radius: 0.45rem;
  padding: 0 0.55rem;
  color: var(--color-text);
  background: #ffffff;
}

.form-alert {
  margin: 0 0 1rem;
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

@media (max-width: 900px) {
  .dashboard-grid,
  .availability-form {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .top-nav,
  .dashboard-shell {
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

  .user-chip {
    max-width: 11rem;
  }
}
</style>
