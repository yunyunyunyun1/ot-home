<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import ProfileMenu from '../../components/ProfileMenu.vue'
import { ApiError } from '../../api/client'
import {
  listMyVillageVolunteerAssignedKids,
  listVillageVolunteerHomeProgramActivities,
  type HomeProgramActivityResponse,
  type KidResponse,
} from '../../api/kids'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const kids = ref<KidResponse[]>([])
const homeProgramsByKidId = ref<Record<string, HomeProgramActivityResponse[]>>({})
const loadingHomeProgramKidId = ref('')
const expandedKidIds = ref<Set<string>>(new Set())
const childSearchTerm = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const assignedTherapistCount = computed(() => {
  return kids.value.filter((kid) => kid.assigned_caregiver).length
})

const totalHomeProgramCount = computed(() => {
  return Object.values(homeProgramsByKidId.value).reduce((total, items) => total + items.length, 0)
})

const filteredKids = computed(() => {
  const normalizedSearchTerm = childSearchTerm.value.trim().toLocaleLowerCase('th-TH')
  if (!normalizedSearchTerm) {
    return kids.value
  }

  return kids.value.filter((kid) => {
    return kid.full_name.toLocaleLowerCase('th-TH').includes(normalizedSearchTerm)
  })
})

const homeProgramAspectLabels: Record<string, string> = {
  personal_social: 'ส่วนบุคคล-สังคม',
  fine_motor_adaptive: 'กล้ามเนื้อมัดเล็กและการปรับตัว',
  language: 'ภาษา',
  gross_motor: 'กล้ามเนื้อมัดใหญ่',
}

function homeProgramAspectLabel(aspect: string) {
  return homeProgramAspectLabels[aspect] ?? aspect
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function evaluationLabel(activity: HomeProgramActivityResponse) {
  return activity.evaluation_id ? 'ผูกกับผลประเมินแล้ว' : 'ยังไม่ผูกกับผลประเมิน'
}

async function loadHomePrograms(kidId: string) {
  loadingHomeProgramKidId.value = kidId
  errorMessage.value = ''

  try {
    homeProgramsByKidId.value = {
      ...homeProgramsByKidId.value,
      [kidId]: await listVillageVolunteerHomeProgramActivities(kidId),
    }
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : 'ไม่สามารถโหลดโฮมโปรแกรมได้ กรุณาลองใหม่อีกครั้ง'
  } finally {
    loadingHomeProgramKidId.value = ''
  }
}

async function toggleKidDetails(kidId: string) {
  const next = new Set(expandedKidIds.value)
  if (next.has(kidId)) {
    next.delete(kidId)
  } else {
    next.add(kidId)
    if (!homeProgramsByKidId.value[kidId]) {
      await loadHomePrograms(kidId)
    }
  }
  expandedKidIds.value = next
}

async function loadKids() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    kids.value = await listMyVillageVolunteerAssignedKids()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : 'ไม่สามารถโหลดรายชื่อเด็กได้ กรุณาลองใหม่อีกครั้ง'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadKids)
</script>

<template>
  <main class="volunteer-page">
    <nav class="top-nav" aria-label="Main navigation">
      <RouterLink class="brand" to="/" aria-label="OT@HOME home">
        <span class="logo-slot" aria-hidden="true"></span>
        <span class="brand-name">OT@HOME</span>
      </RouterLink>

      <ProfileMenu />
    </nav>

    <section class="dashboard-shell" aria-labelledby="volunteer-title">
      <div class="page-heading">
        <div>
          <p class="eyebrow">OT@HOME Village Volunteer</p>
          <h1 id="volunteer-title">เด็กที่ได้รับมอบหมาย</h1>
        </div>

        <div class="summary-strip" aria-label="ภาพรวม">
          <div class="summary-item">
            <span>เด็กที่ดูแล</span>
            <strong>{{ kids.length }}</strong>
          </div>
          <div class="summary-item">
            <span>มีนักบำบัดแล้ว</span>
            <strong>{{ assignedTherapistCount }}</strong>
          </div>
          <div class="summary-item">
            <span>โฮมโปรแกรมล่าสุด</span>
            <strong>{{ totalHomeProgramCount }}</strong>
          </div>
        </div>
      </div>

      <p v-if="errorMessage" class="form-alert form-alert--error">{{ errorMessage }}</p>

      <section class="table-panel" aria-label="ตารางเด็กที่ได้รับมอบหมาย">
        <div class="list-header">
          <div>
            <h2>รายชื่อเด็ก</h2>
            <p>เปิดรายละเอียดเพื่อดูโฮมโปรแกรมล่าสุดที่นักบำบัดมอบหมายไว้</p>
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

        <div v-if="kids.length === 0" class="empty-state">ยังไม่มีเด็กที่ได้รับมอบหมาย</div>
        <div v-else-if="filteredKids.length === 0" class="empty-state">ไม่พบชื่อเด็กที่ค้นหา</div>

        <table v-else>
          <thead>
            <tr>
              <th scope="col">ชื่อเด็ก</th>
              <th scope="col">นักบำบัด</th>
              <th scope="col" class="actions-column"></th>
            </tr>
          </thead>
          <tbody>
            <template v-for="kid in filteredKids" :key="kid.id">
              <tr>
                <td>{{ kid.full_name }}</td>
                <td>
                  <span
                    class="status-pill"
                    :class="
                      kid.assigned_caregiver ? 'status-pill--success' : 'status-pill--neutral'
                    "
                  >
                    {{ kid.assigned_caregiver?.full_name ?? 'ยังไม่จับคู่' }}
                  </span>
                </td>
                <td class="actions-cell">
                  <button
                    type="button"
                    class="icon-toggle-button"
                    :aria-expanded="expandedKidIds.has(kid.id)"
                    :aria-label="
                      expandedKidIds.has(kid.id) ? 'ซ่อนรายละเอียดเด็ก' : 'ดูรายละเอียดเด็ก'
                    "
                    @click="toggleKidDetails(kid.id)"
                  >
                    {{ expandedKidIds.has(kid.id) ? 'ซ่อน' : 'ดู' }}
                  </button>
                </td>
              </tr>
              <tr v-if="expandedKidIds.has(kid.id)" class="detail-row">
                <td colspan="3">
                  <div class="detail-shell">
                    <section class="kid-info-card" aria-label="ข้อมูลเด็ก">
                      <div class="info-item">
                        <span>ชื่อ</span>
                        <strong>{{ kid.full_name }}</strong>
                      </div>
                      <div class="info-item">
                        <span>เลขประจำตัวประชาชน</span>
                        <strong>{{ kid.thai_id_masked }}</strong>
                      </div>
                      <div class="info-item info-item--wide">
                        <span>ที่อยู่</span>
                        <strong
                          >{{ kid.address.subdistrict }}, {{ kid.address.district }},
                          {{ kid.address.province }} {{ kid.address.postal_code }}</strong
                        >
                      </div>
                      <div class="info-item">
                        <span>นักบำบัด</span>
                        <strong>{{ kid.assigned_caregiver?.full_name ?? '-' }}</strong>
                      </div>
                    </section>

                    <section class="home-program-section" aria-label="โฮมโปรแกรม">
                      <div class="home-program-header">
                        <div>
                          <span class="section-kicker">Home Program</span>
                          <h3>โฮมโปรแกรมล่าสุดสำหรับครอบครัว</h3>
                        </div>
                        <button
                          type="button"
                          class="refresh-link"
                          :disabled="loadingHomeProgramKidId === kid.id"
                          @click="loadHomePrograms(kid.id)"
                        >
                          <i class="bi bi-arrow-clockwise" aria-hidden="true"></i>
                          <span>{{
                            loadingHomeProgramKidId === kid.id ? 'กำลังโหลด' : 'รีเฟรช'
                          }}</span>
                        </button>
                      </div>

                      <div
                        v-if="loadingHomeProgramKidId === kid.id"
                        class="empty-state empty-state--compact"
                      >
                        กำลังโหลดโฮมโปรแกรม...
                      </div>
                      <div
                        v-else-if="(homeProgramsByKidId[kid.id] ?? []).length === 0"
                        class="empty-state empty-state--compact"
                      >
                        ยังไม่มีโฮมโปรแกรมสำหรับเด็กคนนี้
                      </div>
                      <div v-else class="home-program-list">
                        <article
                          v-for="activity in homeProgramsByKidId[kid.id]"
                          :key="activity.id"
                          class="home-program-card"
                        >
                          <div class="program-card-head">
                            <span class="program-aspect">{{
                              homeProgramAspectLabel(activity.aspect)
                            }}</span>
                            <span class="program-date">{{
                              formatDateTime(activity.created_at)
                            }}</span>
                          </div>
                          <h4>{{ activity.title }}</h4>
                          <p>{{ activity.instruction }}</p>
                          <dl>
                            <div v-if="activity.frequency">
                              <dt>ความถี่</dt>
                              <dd>{{ activity.frequency }}</dd>
                            </div>
                            <div v-if="activity.note">
                              <dt>หมายเหตุ</dt>
                              <dd>{{ activity.note }}</dd>
                            </div>
                            <div>
                              <dt>สถานะ</dt>
                              <dd>{{ evaluationLabel(activity) }}</dd>
                            </div>
                          </dl>
                        </article>
                      </div>
                    </section>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </section>
    </section>
  </main>
</template>

<style scoped>
.volunteer-page {
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
  min-height: 4.75rem;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-primary);
  text-decoration: none;
}

.logo-slot {
  display: inline-grid;
  width: 2.9rem;
  height: 2.9rem;
  place-items: center;
  border-radius: 0.8rem;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  box-shadow: 0 14px 28px rgb(59 130 246 / 0.24);
}

.logo-slot::before {
  width: 1.05rem;
  height: 1.05rem;
  border: 0.28rem solid #ffffff;
  border-top-color: rgb(255 255 255 / 0.46);
  border-radius: 50%;
  content: '';
}

.brand-name {
  font-size: 1.15rem;
  font-weight: 900;
}

.user-chip {
  max-width: 18rem;
  overflow: hidden;
  border: 1px solid rgb(219 231 245 / 0.9);
  border-radius: 999px;
  padding: 0.45rem 0.8rem;
  color: var(--color-text);
  background: rgb(255 255 255 / 0.82);
  font-size: 0.88rem;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dashboard-shell {
  padding: 1.25rem 0 3rem;
}

.page-heading {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(26rem, 0.7fr);
  gap: 1.25rem;
  align-items: end;
}

.eyebrow {
  margin: 0 0 0.55rem;
  color: var(--color-primary);
  font-size: 0.82rem;
  font-weight: 850;
}

h1,
h2,
h3,
h4 {
  margin: 0;
  color: var(--color-text);
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
  padding: 0.85rem 0.95rem;
  border-left: 1px solid var(--color-border);
}

.summary-item:first-child {
  border-left: 0;
}

.summary-item span {
  color: var(--color-muted);
  font-size: 0.78rem;
  font-weight: 750;
}

.summary-item strong {
  color: var(--color-text);
  font-size: 1.45rem;
  line-height: 1;
}

.form-alert {
  margin: 1rem 0 0;
  border-radius: 0.7rem;
  padding: 0.8rem 0.95rem;
  font-size: 0.9rem;
  font-weight: 750;
}

.form-alert--error {
  border: 1px solid rgb(248 113 113 / 0.42);
  color: #991b1b;
  background: rgb(254 242 242 / 0.88);
}

.table-panel {
  overflow-x: auto;
  margin-top: 1.25rem;
  border: 1px solid rgb(219 231 245 / 0.96);
  border-radius: var(--radius-panel);
  background: rgb(255 255 255 / 0.92);
  box-shadow: var(--shadow-soft);
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
}

.refresh-button,
.refresh-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  color: var(--color-primary);
  background: #ffffff;
  cursor: pointer;
}

.refresh-button {
  width: 2.4rem;
  height: 2.4rem;
  flex: 0 0 auto;
  border-radius: 0.5rem;
  padding: 0;
}

.refresh-link {
  gap: 0.35rem;
  min-height: 2rem;
  border-radius: 999px;
  padding: 0 0.75rem;
  font-size: 0.78rem;
  font-weight: 850;
}

.refresh-button.is-loading .bi,
.refresh-link:disabled .bi {
  animation: spin-refresh 0.8s linear infinite;
}

@keyframes spin-refresh {
  to {
    transform: rotate(360deg);
  }
}

table {
  width: 100%;
  min-width: 42rem;
  border-collapse: collapse;
  table-layout: fixed;
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

td {
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 650;
}

th:nth-child(1),
td:nth-child(1) {
  width: 42%;
}

th:nth-child(2),
td:nth-child(2) {
  width: 38%;
  text-align: center;
}

th:nth-child(3),
td:nth-child(3) {
  width: 20%;
  text-align: right;
}

.actions-column {
  color: transparent;
}

.actions-cell {
  text-align: right;
  white-space: nowrap;
}

.status-pill {
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

.detail-row td {
  padding: 0;
  color: var(--color-muted);
  background: #f7fbff;
  font-weight: 500;
}

.detail-shell {
  display: grid;
  gap: 1rem;
  padding: 1rem;
}

.kid-info-card {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
  border: 1px solid rgb(219 231 245 / 0.92);
  border-radius: 0.85rem;
  padding: 0.85rem;
  background: #ffffff;
  box-shadow: 0 10px 24px rgb(31 41 55 / 0.05);
}

.info-item {
  display: grid;
  gap: 0.18rem;
  min-width: 0;
}

.info-item--wide {
  grid-column: span 2;
}

.info-item span {
  color: var(--color-muted);
  font-size: 0.74rem;
  font-weight: 850;
}

.info-item strong {
  overflow-wrap: anywhere;
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 850;
  line-height: 1.45;
}

.detail-row strong {
  color: var(--color-text);
  font-weight: 850;
}

.home-program-section {
  border: 1px solid rgb(219 231 245 / 0.92);
  border-radius: 0.85rem;
  padding: 0.9rem;
  background: #ffffff;
  box-shadow: 0 10px 24px rgb(31 41 55 / 0.05);
}

.home-program-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
}

.home-program-header h3 {
  margin-top: 0.12rem;
  font-size: 1rem;
  line-height: 1.25;
}

.section-kicker {
  color: var(--color-primary);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.02em;
}

.home-program-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.home-program-card {
  border: 1px solid rgb(219 231 245 / 0.92);
  border-left: 4px solid var(--color-primary);
  border-radius: 0.75rem;
  padding: 0.85rem 0.9rem;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
}

.home-program-card h4 {
  margin-top: 0.5rem;
  font-size: 1rem;
  line-height: 1.3;
}

.program-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.program-date {
  color: var(--color-muted);
  font-size: 0.74rem;
  font-weight: 750;
  white-space: nowrap;
}

.program-aspect {
  display: inline-flex;
  border-radius: 999px;
  padding: 0.15rem 0.55rem;
  color: #1d4ed8;
  background: rgb(59 130 246 / 0.1);
  font-size: 0.74rem;
  font-weight: 850;
}

.home-program-card p {
  margin: 0.65rem 0 0;
  color: var(--color-text);
  font-size: 0.9rem;
  line-height: 1.55;
}

.home-program-card dl {
  display: grid;
  gap: 0.35rem;
  margin: 0.75rem 0 0;
}

.home-program-card dl div {
  display: grid;
  grid-template-columns: 4.75rem minmax(0, 1fr);
  gap: 0.55rem;
}

.home-program-card dt {
  color: var(--color-muted);
  font-weight: 850;
}

.home-program-card dd {
  margin: 0;
  color: var(--color-text);
}

.empty-state {
  padding: 2.5rem 1rem;
  color: var(--color-muted);
  text-align: center;
}

.empty-state--compact {
  padding: 1rem;
  border: 1px dashed rgb(148 163 184 / 0.42);
  border-radius: 0.7rem;
  background: rgb(248 251 255 / 0.72);
}

@media (max-width: 980px) {
  .page-heading,
  .kid-info-card,
  .home-program-list {
    grid-template-columns: 1fr;
  }

  .info-item--wide {
    grid-column: auto;
  }
}

@media (max-width: 680px) {
  .top-nav,
  .dashboard-shell {
    width: min(100% - 1.25rem, 1220px);
  }

  .summary-strip {
    grid-template-columns: 1fr;
  }

  .summary-item {
    border-left: 0;
    border-top: 1px solid var(--color-border);
  }

  .summary-item:first-child {
    border-top: 0;
  }
}
</style>
