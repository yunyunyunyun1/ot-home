<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'

import ProfileMenu from '../../components/ProfileMenu.vue'
import { ApiError } from '../../api/client'
import {
  createVillageVolunteerHomeProgramFollowUp,
  listMyVillageVolunteerAssignedKids,
  listVillageVolunteerHomeProgramActivities,
  listVillageVolunteerHomeProgramFollowUps,
  type HomeProgramActivityResponse,
  type HomeProgramFollowUpResponse,
  type KidResponse,
} from '../../api/kids'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const kids = ref<KidResponse[]>([])
const homeProgramsByKidId = ref<Record<string, HomeProgramActivityResponse[]>>({})
const followUpsByActivityId = ref<Record<string, HomeProgramFollowUpResponse[]>>({})
const loadingHomeProgramKidId = ref('')
const loadingFollowUpActivityId = ref('')
const expandedKidIds = ref<Set<string>>(new Set())
const childSearchTerm = ref('')
const followUpKid = ref<KidResponse | null>(null)
const followUpActivity = ref<HomeProgramActivityResponse | null>(null)
const isLoading = ref(false)
const isSubmittingFollowUp = ref(false)
const errorMessage = ref('')
const followUpErrorMessage = ref('')
const followUpForm = reactive({
  performed_at: '',
  was_able: true,
  duration: '',
  note: '',
  image_data: '',
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

function toDateTimeLocalValue(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

const maxFollowUpDateTime = computed(() => toDateTimeLocalValue())

function evaluationLabel(activity: HomeProgramActivityResponse) {
  return activity.evaluation_id ? 'ผูกกับผลประเมินแล้ว' : 'ยังไม่ผูกกับผลประเมิน'
}

function latestFollowUp(activityId: string) {
  return followUpsByActivityId.value[activityId]?.[0]
}

function childHomePrograms(kidId: string) {
  return homeProgramsByKidId.value[kidId] ?? []
}

function trackedHomeProgramCount(kidId: string) {
  return childHomePrograms(kidId).filter((activity) => latestFollowUp(activity.id)).length
}

function pendingHomeProgramCount(kidId: string) {
  return childHomePrograms(kidId).filter((activity) => !latestFollowUp(activity.id)).length
}

function resetFollowUpForm() {
  followUpForm.performed_at = toDateTimeLocalValue()
  followUpForm.was_able = true
  followUpForm.duration = ''
  followUpForm.note = ''
  followUpForm.image_data = ''
  followUpErrorMessage.value = ''
}

async function loadHomePrograms(kidId: string) {
  loadingHomeProgramKidId.value = kidId
  errorMessage.value = ''

  try {
    const activities = await listVillageVolunteerHomeProgramActivities(kidId)
    homeProgramsByKidId.value = {
      ...homeProgramsByKidId.value,
      [kidId]: activities,
    }
    const followUpEntries = await Promise.all(
      activities.map(async (activity) => {
        const followUps = await listVillageVolunteerHomeProgramFollowUps(kidId, activity.id)
        return [activity.id, followUps] as const
      }),
    )
    followUpsByActivityId.value = {
      ...followUpsByActivityId.value,
      ...Object.fromEntries(followUpEntries),
    }
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : 'ไม่สามารถโหลดโฮมโปรแกรมได้ กรุณาลองใหม่อีกครั้ง'
  } finally {
    loadingHomeProgramKidId.value = ''
  }
}

async function loadFollowUps(kidId: string, activityId: string) {
  loadingFollowUpActivityId.value = activityId
  followUpErrorMessage.value = ''

  try {
    followUpsByActivityId.value = {
      ...followUpsByActivityId.value,
      [activityId]: await listVillageVolunteerHomeProgramFollowUps(kidId, activityId),
    }
  } catch (error) {
    followUpErrorMessage.value =
      error instanceof ApiError
        ? error.message
        : 'ไม่สามารถโหลดประวัติการติดตามได้ กรุณาลองใหม่อีกครั้ง'
  } finally {
    loadingFollowUpActivityId.value = ''
  }
}

async function openFollowUpModal(kid: KidResponse, activity: HomeProgramActivityResponse) {
  followUpKid.value = kid
  followUpActivity.value = activity
  resetFollowUpForm()
  await loadFollowUps(kid.id, activity.id)
}

function closeFollowUpModal() {
  if (isSubmittingFollowUp.value) {
    return
  }

  followUpKid.value = null
  followUpActivity.value = null
  followUpErrorMessage.value = ''
}

function handleFollowUpImage(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) {
    followUpForm.image_data = ''
    return
  }

  if (!file.type.startsWith('image/')) {
    followUpErrorMessage.value = 'กรุณาเลือกไฟล์รูปภาพเท่านั้น'
    followUpForm.image_data = ''
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    followUpForm.image_data = typeof reader.result === 'string' ? reader.result : ''
  }
  reader.readAsDataURL(file)
}

async function submitFollowUp() {
  if (!followUpKid.value || !followUpActivity.value) {
    return
  }

  const performedAt = new Date(followUpForm.performed_at)
  if (Number.isNaN(performedAt.getTime())) {
    followUpErrorMessage.value = 'กรุณาเลือกวันที่ติดตาม'
    return
  }

  if (performedAt > new Date()) {
    followUpErrorMessage.value = 'วันที่ติดตามต้องไม่เกินเวลาปัจจุบัน'
    return
  }

  isSubmittingFollowUp.value = true
  followUpErrorMessage.value = ''

  try {
    const followUp = await createVillageVolunteerHomeProgramFollowUp(
      followUpKid.value.id,
      followUpActivity.value.id,
      {
        performed_at: performedAt.toISOString(),
        was_able: followUpForm.was_able,
        duration: followUpForm.duration.trim() || null,
        note: followUpForm.note.trim() || null,
        image_data: followUpForm.image_data || null,
      },
    )
    followUpsByActivityId.value = {
      ...followUpsByActivityId.value,
      [followUpActivity.value.id]: [
        followUp,
        ...(followUpsByActivityId.value[followUpActivity.value.id] ?? []),
      ],
    }
    closeFollowUpModal()
  } catch (error) {
    followUpErrorMessage.value =
      error instanceof ApiError ? error.message : 'ไม่สามารถบันทึกผลติดตามได้ กรุณาลองใหม่อีกครั้ง'
  } finally {
    isSubmittingFollowUp.value = false
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
          <h1 id="volunteer-title">{{ authStore.user?.full_name ?? 'ผู้ดูแลเด็ก' }}</h1>
        </div>
      </div>

      <p v-if="errorMessage" class="form-alert form-alert--error">{{ errorMessage }}</p>

      <section class="table-panel desktop-volunteer-panel" aria-label="ตารางเด็กที่ได้รับมอบหมาย">
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
                        <span>อาการสำคัญ</span>
                        <strong>{{ kid.notable_symptoms || '-' }}</strong>
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
                          <div class="follow-up-summary">
                            <span v-if="latestFollowUp(activity.id)" class="follow-up-pill">
                              ล่าสุด:
                              {{
                                latestFollowUp(activity.id)?.was_able
                                  ? 'เด็กทำได้'
                                  : 'เด็กยังทำไม่ได้'
                              }}
                            </span>
                            <span v-else class="follow-up-pill follow-up-pill--empty">
                              ยังไม่มีการติดตาม
                            </span>
                            <button
                              type="button"
                              class="follow-up-button"
                              @click="openFollowUpModal(kid, activity)"
                            >
                              <i class="bi bi-clipboard-check" aria-hidden="true"></i>
                              <span>บันทึกการติดตาม</span>
                            </button>
                          </div>
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

      <section class="mobile-volunteer-panel" aria-label="รายการเด็กสำหรับมือถือ">
        <div class="mobile-toolbar">
          <label class="search-field">
            <i class="bi bi-search" aria-hidden="true"></i>
            <input v-model="childSearchTerm" type="search" placeholder="ค้นหาชื่อเด็ก" />
          </label>

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

        <div v-if="kids.length === 0" class="empty-state">ยังไม่มีเด็กที่ได้รับมอบหมาย</div>
        <div v-else-if="filteredKids.length === 0" class="empty-state">ไม่พบชื่อเด็กที่ค้นหา</div>

        <div v-else class="mobile-child-list">
          <article v-for="kid in filteredKids" :key="kid.id" class="mobile-child-card">
            <button
              type="button"
              class="mobile-child-summary"
              :aria-expanded="expandedKidIds.has(kid.id)"
              @click="toggleKidDetails(kid.id)"
            >
              <span class="mobile-child-avatar" aria-hidden="true">
                <i class="bi bi-person-hearts"></i>
              </span>
              <span class="mobile-child-main">
                <strong>{{ kid.full_name }}</strong>
                <small>{{ kid.assigned_caregiver?.full_name ?? 'ยังไม่จับคู่นักบำบัด' }}</small>
              </span>
              <span class="mobile-child-count">{{ childHomePrograms(kid.id).length || '-' }}</span>
            </button>

            <div v-if="expandedKidIds.has(kid.id)" class="mobile-child-detail">
              <div class="mobile-kid-facts">
                <div>
                  <span>อาการสำคัญ</span>
                  <strong>{{ kid.notable_symptoms || '-' }}</strong>
                </div>
                <div>
                  <span>ที่อยู่</span>
                  <strong
                    >{{ kid.address.subdistrict }}, {{ kid.address.district }},
                    {{ kid.address.province }}</strong
                  >
                </div>
              </div>

              <div class="mobile-program-overview">
                <span class="status-pill status-pill--success">
                  ติดตามแล้ว {{ trackedHomeProgramCount(kid.id) }}
                </span>
                <span class="status-pill status-pill--neutral">
                  รอติดตาม {{ pendingHomeProgramCount(kid.id) }}
                </span>
                <button
                  type="button"
                  class="refresh-link"
                  :disabled="loadingHomeProgramKidId === kid.id"
                  @click="loadHomePrograms(kid.id)"
                >
                  <i class="bi bi-arrow-clockwise" aria-hidden="true"></i>
                  <span>{{ loadingHomeProgramKidId === kid.id ? 'กำลังโหลด' : 'รีเฟรช' }}</span>
                </button>
              </div>

              <div
                v-if="loadingHomeProgramKidId === kid.id"
                class="empty-state empty-state--compact"
              >
                กำลังโหลดโฮมโปรแกรม...
              </div>
              <div
                v-else-if="childHomePrograms(kid.id).length === 0"
                class="empty-state empty-state--compact"
              >
                ยังไม่มี Home Program สำหรับเด็กคนนี้
              </div>
              <div v-else class="mobile-program-list">
                <article
                  v-for="activity in childHomePrograms(kid.id)"
                  :key="activity.id"
                  class="mobile-program-card"
                >
                  <div class="program-card-head">
                    <span class="program-aspect">{{
                      homeProgramAspectLabel(activity.aspect)
                    }}</span>
                    <span class="program-date">{{ formatDateTime(activity.created_at) }}</span>
                  </div>
                  <h3>{{ activity.title }}</h3>
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
                  </dl>
                  <div class="follow-up-summary">
                    <span v-if="latestFollowUp(activity.id)" class="follow-up-pill">
                      ล่าสุด:
                      {{ latestFollowUp(activity.id)?.was_able ? 'เด็กทำได้' : 'เด็กยังทำไม่ได้' }}
                    </span>
                    <span v-else class="follow-up-pill follow-up-pill--empty">
                      ยังไม่มีการติดตาม
                    </span>
                    <button
                      type="button"
                      class="follow-up-button"
                      @click="openFollowUpModal(kid, activity)"
                    >
                      <i class="bi bi-clipboard-check" aria-hidden="true"></i>
                      <span>บันทึกการติดตาม</span>
                    </button>
                  </div>
                </article>
              </div>
            </div>
          </article>
        </div>
      </section>
    </section>

    <div
      v-if="followUpKid && followUpActivity"
      class="follow-up-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="follow-up-title"
      @click.self="closeFollowUpModal"
    >
      <section class="follow-up-modal">
        <header class="follow-up-modal-header">
          <div>
            <p class="section-kicker">Home Program Follow-up</p>
            <h2 id="follow-up-title">บันทึกการติดตาม</h2>
            <p>{{ followUpKid.full_name }} · {{ followUpActivity.title }}</p>
          </div>
          <button
            type="button"
            class="modal-close-button"
            aria-label="ปิดหน้าต่างติดตาม"
            @click="closeFollowUpModal"
          >
            <i class="bi bi-x-lg" aria-hidden="true"></i>
          </button>
        </header>

        <form class="follow-up-form" @submit.prevent="submitFollowUp">
          <label>
            <span>วันที่ติดตาม</span>
            <input
              v-model="followUpForm.performed_at"
              type="datetime-local"
              :max="maxFollowUpDateTime"
              required
            />
          </label>

          <fieldset class="result-fieldset">
            <legend>ทำได้หรือไม่</legend>
            <label>
              <input v-model="followUpForm.was_able" type="radio" :value="true" />
              <span>ทำได้</span>
            </label>
            <label>
              <input v-model="followUpForm.was_able" type="radio" :value="false" />
              <span>ยังทำไม่ได้</span>
            </label>
          </fieldset>

          <label>
            <span>ระยะเวลาที่ทำได้</span>
            <input
              v-model="followUpForm.duration"
              maxlength="120"
              placeholder="เช่น 10 นาที หรือ 3 รอบ"
            />
          </label>

          <label>
            <span>หมายเหตุ</span>
            <textarea
              v-model="followUpForm.note"
              rows="4"
              placeholder="บันทึกข้อสังเกตเพิ่มเติม"
            ></textarea>
          </label>

          <label>
            <span>รูปภาพประกอบ (ถ้ามี)</span>
            <input accept="image/*" type="file" @change="handleFollowUpImage" />
          </label>

          <img
            v-if="followUpForm.image_data"
            class="follow-up-preview"
            :src="followUpForm.image_data"
            alt="ตัวอย่างรูปภาพประกอบ"
          />

          <p v-if="followUpErrorMessage" class="form-alert form-alert--error">
            {{ followUpErrorMessage }}
          </p>

          <div class="follow-up-actions">
            <button type="button" class="secondary-action" @click="closeFollowUpModal">
              ยกเลิก
            </button>
            <button type="submit" class="primary-action" :disabled="isSubmittingFollowUp">
              {{ isSubmittingFollowUp ? 'กำลังบันทึก...' : 'บันทึกผลติดตาม' }}
            </button>
          </div>
        </form>

        <section class="follow-up-history" aria-label="ประวัติการติดตาม">
          <h3>ประวัติการติดตาม</h3>
          <div v-if="loadingFollowUpActivityId === followUpActivity.id" class="empty-state">
            กำลังโหลดประวัติ...
          </div>
          <div
            v-else-if="(followUpsByActivityId[followUpActivity.id] ?? []).length === 0"
            class="empty-state empty-state--compact"
          >
            ยังไม่มีประวัติการติดตาม
          </div>
          <div v-else class="follow-up-history-list">
            <article
              v-for="followUp in followUpsByActivityId[followUpActivity.id]"
              :key="followUp.id"
              class="follow-up-history-card"
            >
              <div>
                <strong>{{ followUp.was_able ? 'ทำได้' : 'ยังทำไม่ได้' }}</strong>
                <span>{{ formatDateTime(followUp.performed_at) }}</span>
              </div>
              <p v-if="followUp.duration">ระยะเวลา: {{ followUp.duration }}</p>
              <p v-if="followUp.note">{{ followUp.note }}</p>
              <img v-if="followUp.image_data" :src="followUp.image_data" alt="รูปภาพประกอบ" />
            </article>
          </div>
        </section>
      </section>
    </div>
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

.mobile-volunteer-panel {
  display: none;
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

.follow-up-summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  border-top: 1px solid rgb(219 231 245 / 0.82);
  margin-top: 0.85rem;
  padding-top: 0.75rem;
}

.follow-up-pill {
  display: inline-flex;
  min-height: 1.8rem;
  align-items: center;
  border-radius: 999px;
  padding: 0.18rem 0.62rem;
  color: #166534;
  background: #dcfce7;
  font-size: 0.78rem;
  font-weight: 850;
}

.follow-up-pill--empty {
  color: #475569;
  background: #eef2f7;
}

.follow-up-button {
  display: inline-flex;
  min-height: 2.2rem;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border: 1px solid rgb(59 130 246 / 0.34);
  border-radius: 0.55rem;
  padding: 0 0.75rem;
  color: var(--color-primary);
  background: #eff6ff;
  font-weight: 850;
  cursor: pointer;
}

.follow-up-button:hover,
.follow-up-button:focus-visible {
  outline: none;
  transform: translateY(-1px);
  box-shadow: 0 0.35rem 0.8rem rgb(31 41 55 / 0.12);
}

.mobile-toolbar {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.mobile-toolbar .search-field {
  flex: 1 1 auto;
  margin: 0;
}

.mobile-child-list {
  display: grid;
  gap: 0.85rem;
  margin-top: 0.9rem;
}

.mobile-child-card {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background: var(--color-surface);
  box-shadow: var(--shadow-soft);
}

.mobile-child-summary {
  display: grid;
  width: 100%;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.75rem;
  border: 0;
  padding: 0.9rem;
  color: var(--color-text);
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.mobile-child-avatar {
  display: inline-grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border-radius: 0.9rem;
  color: var(--color-primary);
  background: rgb(59 130 246 / 0.12);
  font-size: 1.25rem;
}

.mobile-child-main {
  display: grid;
  min-width: 0;
  gap: 0.2rem;
}

.mobile-child-main strong,
.mobile-kid-facts strong,
.mobile-program-card h3,
.mobile-program-card p,
.mobile-program-card dd {
  color: var(--color-text);
}

.mobile-child-main strong {
  overflow: hidden;
  font-size: 1.05rem;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-child-main small {
  overflow: hidden;
  color: var(--color-muted);
  font-size: 0.82rem;
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-child-count {
  display: inline-grid;
  min-width: 2rem;
  height: 2rem;
  place-items: center;
  border-radius: 999px;
  color: var(--color-primary);
  background: rgb(59 130 246 / 0.1);
  font-weight: 900;
}

.mobile-child-detail {
  display: grid;
  gap: 0.85rem;
  border-top: 1px solid var(--color-border);
  padding: 0.9rem;
}

.mobile-kid-facts {
  display: grid;
  gap: 0.6rem;
}

.mobile-kid-facts div {
  display: grid;
  gap: 0.15rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 0.65rem;
  background: var(--app-surface-soft, #fbfdff);
}

.mobile-kid-facts span {
  color: var(--color-muted);
  font-size: 0.75rem;
  font-weight: 850;
}

.mobile-kid-facts strong {
  line-height: 1.5;
}

.mobile-program-overview {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
}

.mobile-program-list {
  display: grid;
  gap: 0.75rem;
}

.mobile-program-card {
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-primary);
  border-radius: 0.85rem;
  padding: 0.85rem;
  background: var(--color-surface);
}

.mobile-program-card h3 {
  margin: 0.55rem 0 0;
  font-size: 1rem;
  line-height: 1.3;
}

.mobile-program-card p {
  margin: 0.55rem 0 0;
  line-height: 1.6;
}

.mobile-program-card dl {
  display: grid;
  gap: 0.35rem;
  margin: 0.65rem 0 0;
}

.mobile-program-card dl div {
  display: grid;
  grid-template-columns: 4.25rem minmax(0, 1fr);
  gap: 0.45rem;
}

.mobile-program-card dt {
  color: var(--color-muted);
  font-weight: 850;
}

.mobile-program-card dd {
  margin: 0;
}

.follow-up-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1050;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(15 23 42 / 0.52);
  backdrop-filter: blur(6px);
}

.follow-up-modal {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(18rem, 0.72fr);
  width: min(58rem, 100%);
  max-height: min(44rem, calc(100vh - 2rem));
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background: var(--color-surface);
  box-shadow: 0 28px 70px rgb(15 23 42 / 0.28);
}

.follow-up-modal-header {
  grid-column: 1 / -1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--color-border);
  padding: 1rem 1.1rem;
  background:
    linear-gradient(135deg, rgb(59 130 246 / 0.08), transparent 52%), var(--color-surface);
}

.follow-up-modal-header p:not(.section-kicker) {
  margin: 0.25rem 0 0;
  color: var(--color-muted);
  line-height: 1.45;
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
  background: var(--color-surface);
  cursor: pointer;
}

.follow-up-form {
  display: grid;
  gap: 0.85rem;
  overflow: auto;
  padding: 1rem;
}

.follow-up-form label,
.result-fieldset {
  display: grid;
  gap: 0.35rem;
  margin: 0;
}

.follow-up-form label > span,
.result-fieldset legend {
  color: var(--color-text);
  font-size: 0.84rem;
  font-weight: 850;
}

.follow-up-form input,
.follow-up-form textarea {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 0.55rem;
  padding: 0.68rem 0.75rem;
  color: var(--color-text);
  background: var(--app-input-bg, #ffffff);
}

.result-fieldset {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border: 1px solid var(--color-border);
  border-radius: 0.7rem;
  padding: 0.75rem;
}

.result-fieldset legend {
  grid-column: 1 / -1;
}

.result-fieldset label {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.follow-up-preview,
.follow-up-history-card img {
  width: 100%;
  max-height: 13rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  object-fit: cover;
}

.follow-up-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
}

.primary-action,
.secondary-action {
  min-height: 2.5rem;
  border-radius: 0.55rem;
  padding: 0 0.95rem;
  font-weight: 850;
  cursor: pointer;
}

.primary-action {
  border: 1px solid var(--color-primary);
  color: #ffffff;
  background: var(--color-primary);
}

.secondary-action {
  border: 1px solid var(--color-border);
  color: var(--color-text);
  background: var(--color-surface);
}

.follow-up-history {
  display: grid;
  align-content: start;
  gap: 0.75rem;
  overflow: auto;
  border-left: 1px solid var(--color-border);
  padding: 1rem;
  background: var(--app-surface-soft, #fbfdff);
}

.follow-up-history-list {
  display: grid;
  gap: 0.65rem;
}

.follow-up-history-card {
  display: grid;
  gap: 0.45rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 0.75rem;
  background: var(--color-surface);
}

.follow-up-history-card div {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}

.follow-up-history-card strong {
  color: var(--color-text);
}

.follow-up-history-card span,
.follow-up-history-card p {
  margin: 0;
  color: var(--color-muted);
  line-height: 1.5;
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
  .home-program-list,
  .follow-up-modal {
    grid-template-columns: 1fr;
  }

  .info-item--wide {
    grid-column: auto;
  }

  .follow-up-history {
    border-top: 1px solid var(--color-border);
    border-left: 0;
  }
}

@media (max-width: 760px) {
  .dashboard-shell {
    padding: 0.75rem 0 2rem;
  }

  .page-heading {
    grid-template-columns: 1fr;
  }

  .desktop-volunteer-panel {
    display: none;
  }

  .mobile-volunteer-panel {
    display: block;
    margin-top: 1rem;
  }

  .follow-up-modal-overlay {
    align-items: end;
    place-items: end center;
    padding: 0;
  }

  .follow-up-modal {
    width: 100%;
    max-height: 92vh;
    border-radius: 1.1rem 1.1rem 0 0;
  }

  .follow-up-modal-header {
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .follow-up-form,
  .follow-up-history {
    max-height: none;
  }

  .follow-up-actions {
    position: sticky;
    bottom: 0;
    padding-top: 0.65rem;
    background: var(--color-surface);
  }

  .follow-up-actions .primary-action,
  .follow-up-actions .secondary-action {
    flex: 1;
  }
}

@media (max-width: 680px) {
  .top-nav,
  .dashboard-shell {
    width: min(100% - 1.25rem, 1220px);
  }
}
</style>
