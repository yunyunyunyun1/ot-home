<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import ProfileMenu from '../../components/ProfileMenu.vue'
import { ApiError } from '../../api/client'
import kidProfileIcon from '../../assets/logos/kid-profile-icon.png'
import {
  createHomeProgramActivity,
  createDenverEvaluation,
  deleteHomeProgramActivity,
  listHomeProgramActivities,
  listHomeProgramTemplates,
  listDenverEvaluations,
  listMyAssignedKids,
  listTherapySessions,
  updateDenverEvaluation,
  updateHomeProgramActivity,
  type DenverAspectResult,
  type DenverEvaluationResponse,
  type HomeProgramActivityResponse,
  type HomeProgramTemplateResponse,
  type KidResponse,
  type TherapySessionResponse,
} from '../../api/kids'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const kids = ref<KidResponse[]>([])
const evaluations = ref<DenverEvaluationResponse[]>([])
const homeProgramActivities = ref<HomeProgramActivityResponse[]>([])
const homeProgramTemplates = ref<HomeProgramTemplateResponse[]>([])
const therapySessions = ref<TherapySessionResponse[]>([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const isSubmittingHomeProgram = ref(false)
const isEvaluationModalOpen = ref(false)
const isKidInfoModalOpen = ref(false)
const isHomeProgramModalOpen = ref(false)
const isHomeProgramDetailModalOpen = ref(false)
const selectedHomeProgramEvaluation = ref<DenverEvaluationResponse | null>(null)
const selectedHomeProgramDetailEvaluation = ref<DenverEvaluationResponse | null>(null)
const editingDenverEvaluation = ref<DenverEvaluationResponse | null>(null)
const selectedTemplateAgeRange = ref('')
const editingHomeProgramActivityId = ref('')
const deletingHomeProgramActivityId = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const form = reactive({
  aspect_1_result: 'pass' as DenverAspectResult,
  aspect_2_result: 'pass' as DenverAspectResult,
  aspect_3_result: 'pass' as DenverAspectResult,
  aspect_4_result: 'pass' as DenverAspectResult,
})

const homeProgramForm = reactive({
  aspect: 'personal_social',
  title: '',
  instruction: '',
  frequency: '',
  note: '',
})

const aspectOptions = [
  { key: 'aspect_1_result', label: 'ส่วนบุคคล-สังคม (PS)', helper: 'Personal-Social' },
  {
    key: 'aspect_2_result',
    label: 'กล้ามเนื้อมัดเล็กและการปรับตัว (FM)',
    helper: 'Fine Motor-Adaptive',
  },
  { key: 'aspect_3_result', label: 'ภาษา (L)', helper: 'Language' },
  { key: 'aspect_4_result', label: 'กล้ามเนื้อมัดใหญ่ (GM)', helper: 'Gross Motor' },
] as const

const homeProgramAspectOptions = [
  { value: 'personal_social', label: 'ส่วนบุคคล-สังคม (PS)' },
  { value: 'fine_motor_adaptive', label: 'กล้ามเนื้อมัดเล็กและการปรับตัว (FM)' },
  { value: 'receptive_language', label: 'ภาษารับรู้ (RL)' },
  { value: 'expressive_language', label: 'ภาษาสื่อสาร (EL)' },
  { value: 'gross_motor', label: 'กล้ามเนื้อมัดใหญ่ (GM)' },
] as const

const kidId = computed(() => String(route.params.kidId ?? ''))

const kid = computed(() => {
  return kids.value.find((item) => item.id === kidId.value) as KidResponse
})

const latestEvaluation = computed(() => {
  return evaluations.value.at(-1)
})

const nextSessionNumber = computed(() => {
  return evaluations.value.length + 1
})

const nextTherapySession = computed(() => {
  return therapySessions.value.find((session) => {
    return session.status === 'scheduled' && !session.has_denver_evaluation
  })
})

const latestPassCount = computed(() => {
  if (!latestEvaluation.value) {
    return '-'
  }

  const results = [
    latestEvaluation.value.aspect_1_result,
    latestEvaluation.value.aspect_2_result,
    latestEvaluation.value.aspect_3_result,
    latestEvaluation.value.aspect_4_result,
  ]
  return `${results.filter((result) => result === 'pass').length}/4`
})

const selectedHomeProgramEvaluationLabel = computed(() => {
  if (!selectedHomeProgramEvaluation.value) {
    return 'ยังไม่ได้เลือกผลประเมิน'
  }

  return `${sessionLabel(selectedHomeProgramEvaluation.value.evaluation_name)} · ${scheduleLabel(selectedHomeProgramEvaluation.value)}`
})

const selectedHomeProgramDetailLabel = computed(() => {
  if (!selectedHomeProgramDetailEvaluation.value) {
    return 'ยังไม่ได้เลือกผลประเมิน'
  }

  return `${sessionLabel(selectedHomeProgramDetailEvaluation.value.evaluation_name)} · ${scheduleLabel(selectedHomeProgramDetailEvaluation.value)}`
})

const selectedHomeProgramDetails = computed(() => {
  if (!selectedHomeProgramDetailEvaluation.value) {
    return []
  }

  return homeProgramActivities.value.filter((activity) => {
    return activity.evaluation_id === selectedHomeProgramDetailEvaluation.value?.id
  })
})

const templateAgeOptions = computed(() => {
  const optionsByMonths = new Map<number, string>()
  for (const template of homeProgramTemplates.value) {
    optionsByMonths.set(template.age_months, template.age_range)
  }
  return Array.from(optionsByMonths.entries())
    .sort(([leftMonths], [rightMonths]) => leftMonths - rightMonths)
    .map(([months, label]) => ({ months, label }))
})

const visibleHomeProgramTemplates = computed(() => {
  return homeProgramTemplates.value.filter((template) => {
    const matchesAge =
      !selectedTemplateAgeRange.value ||
      template.age_months === Number(selectedTemplateAgeRange.value)
    return matchesAge && template.aspect === homeProgramForm.aspect
  })
})

function resultLabel(result: DenverAspectResult) {
  return result === 'pass' ? 'ผ่าน' : 'ไม่ผ่าน'
}

function resultClass(result: DenverAspectResult) {
  return result === 'pass' ? 'result-pill result-pill--pass' : 'result-pill result-pill--fail'
}

function sessionLabel(evaluationName: string) {
  return evaluationName
}

function scheduleLabel(evaluation: DenverEvaluationResponse) {
  if (
    !evaluation.scheduled_date ||
    !evaluation.scheduled_start_time ||
    !evaluation.scheduled_end_time
  ) {
    return 'ยังไม่มีวันนัด'
  }

  return `${evaluation.scheduled_date} ${evaluation.scheduled_start_time.slice(0, 5)}-${evaluation.scheduled_end_time.slice(0, 5)}`
}

function therapySessionLabel(session: TherapySessionResponse | undefined) {
  if (!session) {
    return 'ยังไม่มีการนัด'
  }

  return `${session.scheduled_date} ${session.scheduled_start_time.slice(0, 5)}-${session.scheduled_end_time.slice(0, 5)}`
}

function homeProgramAspectLabel(aspect: string) {
  return homeProgramAspectOptions.find((option) => option.value === aspect)?.label ?? aspect
}

function applyHomeProgramTemplate(template: HomeProgramTemplateResponse) {
  homeProgramForm.aspect = template.aspect
  homeProgramForm.title = template.title
  homeProgramForm.instruction = template.instruction
  homeProgramForm.frequency = template.frequency ?? ''
  homeProgramForm.note = template.note ?? ''
}

function homeProgramEvaluation(activity: HomeProgramActivityResponse) {
  return evaluations.value.find((evaluation) => evaluation.id === activity.evaluation_id)
}

function homeProgramScheduleLabel(activity: HomeProgramActivityResponse) {
  const evaluation = homeProgramEvaluation(activity)
  return evaluation ? scheduleLabel(evaluation) : 'ยังไม่ได้ผูกกับผลประเมิน'
}

function homeProgramCountForEvaluation(evaluation: DenverEvaluationResponse) {
  return homeProgramActivities.value.filter((activity) => activity.evaluation_id === evaluation.id)
    .length
}

function kidDisplayName(kidItem: KidResponse | null | undefined) {
  if (!kidItem) {
    return ''
  }

  if (kidItem.gender === 'male') {
    return `ด.ช. ${kidItem.full_name}`
  }

  if (kidItem.gender === 'female') {
    return `ด.ญ. ${kidItem.full_name}`
  }

  return kidItem.full_name
}

function kidAddress(kidItem: KidResponse | null | undefined) {
  if (!kidItem) {
    return ''
  }

  return [
    kidItem.address.house_no,
    kidItem.address.village_no ? `หมู่ ${kidItem.address.village_no}` : '',
    kidItem.address.road ? `ถนน${kidItem.address.road}` : '',
    kidItem.address.subdistrict,
    kidItem.address.district,
    kidItem.address.province,
    kidItem.address.postal_code,
  ]
    .filter(Boolean)
    .join(', ')
}

function resetHomeProgramForm() {
  editingHomeProgramActivityId.value = ''
  homeProgramForm.aspect = 'personal_social'
  homeProgramForm.title = ''
  homeProgramForm.instruction = ''
  homeProgramForm.frequency = ''
  homeProgramForm.note = ''
}

function openHomeProgramModal(
  evaluation: DenverEvaluationResponse | undefined = latestEvaluation.value,
) {
  if (!evaluation) {
    errorMessage.value = 'กรุณาบันทึกผลประเมินก่อนเพิ่ม Home Program'
    return
  }

  selectedHomeProgramEvaluation.value = evaluation
  editingHomeProgramActivityId.value = ''
  resetHomeProgramForm()
  errorMessage.value = ''
  successMessage.value = ''
  isHomeProgramModalOpen.value = true
}

function closeHomeProgramModal() {
  if (!isSubmittingHomeProgram.value) {
    isHomeProgramModalOpen.value = false
  }
}

function openHomeProgramDetailModal(evaluation: DenverEvaluationResponse) {
  selectedHomeProgramDetailEvaluation.value = evaluation
  isHomeProgramDetailModalOpen.value = true
}

function closeHomeProgramDetailModal() {
  isHomeProgramDetailModalOpen.value = false
}

function startEditHomeProgramActivity(activity: HomeProgramActivityResponse) {
  const evaluation = evaluations.value.find((item) => item.id === activity.evaluation_id)
  selectedHomeProgramEvaluation.value = evaluation ?? latestEvaluation.value ?? null
  editingHomeProgramActivityId.value = activity.id
  homeProgramForm.aspect = activity.aspect
  homeProgramForm.title = activity.title
  homeProgramForm.instruction = activity.instruction
  homeProgramForm.frequency = activity.frequency ?? ''
  homeProgramForm.note = activity.note ?? ''
  errorMessage.value = ''
  successMessage.value = ''
  isHomeProgramDetailModalOpen.value = false
  isHomeProgramModalOpen.value = true
}

function openEvaluationModal() {
  if (!nextTherapySession.value) {
    errorMessage.value = 'ยังไม่มีนัดที่รอประเมิน'
    return
  }

  editingDenverEvaluation.value = null
  form.aspect_1_result = 'pass'
  form.aspect_2_result = 'pass'
  form.aspect_3_result = 'pass'
  form.aspect_4_result = 'pass'
  errorMessage.value = ''
  successMessage.value = ''
  isEvaluationModalOpen.value = true
}

function closeEvaluationModal() {
  if (!isSubmitting.value) {
    isEvaluationModalOpen.value = false
    editingDenverEvaluation.value = null
  }
}

function openEditEvaluationModal(evaluation: DenverEvaluationResponse) {
  editingDenverEvaluation.value = evaluation
  form.aspect_1_result = evaluation.aspect_1_result
  form.aspect_2_result = evaluation.aspect_2_result
  form.aspect_3_result = evaluation.aspect_3_result
  form.aspect_4_result = evaluation.aspect_4_result
  errorMessage.value = ''
  successMessage.value = ''
  isEvaluationModalOpen.value = true
}

function openKidInfoModal() {
  isKidInfoModalOpen.value = true
}

function closeKidInfoModal() {
  isKidInfoModalOpen.value = false
}

async function loadPage() {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    kids.value = await listMyAssignedKids()
    if (!kid.value) {
      errorMessage.value = 'ไม่พบข้อมูลเด็ก หรือเด็กคนนี้ไม่ได้อยู่ในรายการที่คุณรับผิดชอบ'
      return
    }
    const [
      loadedEvaluations,
      loadedSessions,
      loadedHomeProgramActivities,
      loadedHomeProgramTemplates,
    ] = await Promise.all([
      listDenverEvaluations(kidId.value),
      listTherapySessions(kidId.value),
      listHomeProgramActivities(kidId.value),
      listHomeProgramTemplates(),
    ])
    evaluations.value = loadedEvaluations
    therapySessions.value = loadedSessions
    homeProgramActivities.value = loadedHomeProgramActivities
    homeProgramTemplates.value = loadedHomeProgramTemplates
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError
        ? error.message
        : 'ไม่สามารถโหลดข้อมูลพัฒนาการได้ กรุณาลองใหม่อีกครั้ง'
  } finally {
    isLoading.value = false
  }
}

async function submitHomeProgramActivity() {
  errorMessage.value = ''
  successMessage.value = ''
  isSubmittingHomeProgram.value = true

  try {
    const payload = {
      evaluation_id: selectedHomeProgramEvaluation.value?.id ?? null,
      aspect: homeProgramForm.aspect,
      title: homeProgramForm.title,
      instruction: homeProgramForm.instruction,
      frequency: homeProgramForm.frequency || null,
      note: homeProgramForm.note || null,
    }
    const wasEditing = Boolean(editingHomeProgramActivityId.value)
    const activity = wasEditing
      ? await updateHomeProgramActivity(kidId.value, editingHomeProgramActivityId.value, payload)
      : await createHomeProgramActivity(kidId.value, payload)
    homeProgramActivities.value = wasEditing
      ? homeProgramActivities.value.map((item) => (item.id === activity.id ? activity : item))
      : [activity, ...homeProgramActivities.value]
    resetHomeProgramForm()
    successMessage.value = wasEditing ? 'แก้ไข Home Program แล้ว' : 'บันทึก Home Program แล้ว'
    isHomeProgramModalOpen.value = false
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError
        ? error.message
        : 'ไม่สามารถบันทึก Home Program ได้ กรุณาลองใหม่อีกครั้ง'
  } finally {
    isSubmittingHomeProgram.value = false
  }
}

async function removeHomeProgramActivity(activity: HomeProgramActivityResponse) {
  const shouldDelete = window.confirm(`ลบ Home Program "${activity.title}" ใช่ไหม?`)
  if (!shouldDelete) {
    return
  }

  errorMessage.value = ''
  successMessage.value = ''
  deletingHomeProgramActivityId.value = activity.id

  try {
    await deleteHomeProgramActivity(kidId.value, activity.id)
    homeProgramActivities.value = homeProgramActivities.value.filter(
      (item) => item.id !== activity.id,
    )
    successMessage.value = 'ลบ Home Program แล้ว'
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError
        ? error.message
        : 'ไม่สามารถลบ Home Program ได้ กรุณาลองใหม่อีกครั้ง'
  } finally {
    deletingHomeProgramActivityId.value = ''
  }
}

async function submitEvaluation() {
  errorMessage.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  try {
    if (editingDenverEvaluation.value) {
      const updatedEvaluation = await updateDenverEvaluation(
        kidId.value,
        editingDenverEvaluation.value.id,
        {
          aspect_1_result: form.aspect_1_result,
          aspect_2_result: form.aspect_2_result,
          aspect_3_result: form.aspect_3_result,
          aspect_4_result: form.aspect_4_result,
        },
      )
      evaluations.value = evaluations.value.map((evaluation) =>
        evaluation.id === updatedEvaluation.id ? updatedEvaluation : evaluation,
      )
      successMessage.value = 'แก้ไขผลประเมิน Denver II แล้ว'
      isEvaluationModalOpen.value = false
      editingDenverEvaluation.value = null
      return
    }

    const evaluation = await createDenverEvaluation(kidId.value, {
      evaluation_name: String(nextSessionNumber.value),
      aspect_1_result: form.aspect_1_result,
      aspect_2_result: form.aspect_2_result,
      aspect_3_result: form.aspect_3_result,
      aspect_4_result: form.aspect_4_result,
    })
    evaluations.value = [...evaluations.value, evaluation]
    therapySessions.value = therapySessions.value.map((session) => {
      if (session.id !== evaluation.therapy_session_id) {
        return session
      }
      return {
        ...session,
        status: 'completed',
        has_denver_evaluation: true,
      }
    })
    successMessage.value = 'บันทึกผลประเมิน Denver II แล้ว'
    isEvaluationModalOpen.value = false
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : 'ไม่สามารถบันทึกผลประเมินได้ กรุณาลองใหม่อีกครั้ง'
  } finally {
    isSubmitting.value = false
  }
}

function goBack() {
  router.push({ name: 'caregiver-home' })
}

onMounted(loadPage)
</script>

<template>
  <main class="development-page">
    <nav class="top-nav" aria-label="Main navigation">
      <RouterLink class="brand" to="/" aria-label="OT@HOME home">
        <span class="logo-slot" aria-hidden="true"></span>
        <span class="brand-name">OT@HOME</span>
      </RouterLink>

      <ProfileMenu />
    </nav>

    <section class="development-shell" aria-labelledby="development-title">
      <div class="page-heading">
        <div>
          <h1 id="development-title">
            {{ kid ? kidDisplayName(kid) : 'ติดตามพัฒนาการเด็ก' }}
          </h1>
        </div>

        <button
          type="button"
          class="icon-back-button"
          aria-label="กลับหน้ารายชื่อเด็ก"
          @click="goBack"
        >
          <i class="bi bi-arrow-left" aria-hidden="true"></i>
        </button>
      </div>

      <p v-if="errorMessage" class="form-alert form-alert--error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="form-alert form-alert--success">{{ successMessage }}</p>

      <div v-if="isLoading" class="surface-panel loading-panel">กำลังโหลดข้อมูลพัฒนาการ...</div>

      <template v-else-if="kid">
        <div class="summary-strip" aria-label="ภาพรวมพัฒนาการ">
          <div class="summary-item">
            <span>ผลล่าสุด</span>
            <strong>{{ latestPassCount }}</strong>
          </div>
          <div class="summary-item">
            <span>ครั้งที่ประเมิน</span>
            <strong>{{ evaluations.length }}</strong>
          </div>
          <div class="summary-item">
            <span>นัดล่าสุด</span>
            <strong>{{ latestEvaluation ? scheduleLabel(latestEvaluation) : 'รอประเมิน' }}</strong>
          </div>
        </div>

        <details v-if="kid && false" class="surface-panel kid-profile-collapsible">
          <summary>
            <span>ข้อมูลเด็ก</span>
            <i class="bi bi-chevron-down" aria-hidden="true"></i>
          </summary>
          <dl class="profile-list">
            <div>
              <dt>ชื่อ-นามสกุล</dt>
              <dd>{{ kid ? kidDisplayName(kid) : '' }}</dd>
            </div>
            <div>
              <dt>เลขประจำตัวประชาชน</dt>
              <dd>{{ kid?.thai_id_masked }}</dd>
            </div>
            <div>
              <dt>ที่อยู่</dt>
              <dd>
                {{ kid?.address.house_no ? `${kid.address.house_no} ` : '' }}
                {{ kid.address.village_no ? `หมู่ ${kid.address.village_no} ` : '' }}
                {{ kid.address.road ? `ถนน${kid.address.road} ` : '' }}
                {{ kid.address.subdistrict }}, {{ kid.address.district }},
                {{ kid.address.province }} {{ kid.address.postal_code }}
              </dd>
            </div>
          </dl>
        </details>

        <div class="content-grid">
          <section class="surface-panel" aria-labelledby="score-title">
            <div class="panel-heading">
              <div>
                <h2 id="score-title">บันทึกผลประเมิน Denver II</h2>
                <p>กดปุ่มเพื่อเปิดแบบประเมิน 4 ด้าน สำหรับนัดที่รอประเมิน</p>
              </div>
              <button
                type="button"
                class="kid-info-button"
                aria-label="ดูข้อมูลเด็ก"
                title="ข้อมูลเด็ก"
                @click="openKidInfoModal"
              >
                <i class="bi bi-person-hearts" aria-hidden="true"></i>
                <span>ข้อมูลเด็ก</span>
              </button>
            </div>

            <div class="evaluation-action-panel">
              <div class="session-preview">
                <span>ครั้งที่ประเมิน</span>
                <strong>ครั้งที่ {{ nextSessionNumber }}</strong>
              </div>

              <div class="session-preview session-preview--schedule">
                <span>สถานะ</span>
                <strong>{{ therapySessionLabel(nextTherapySession) }}</strong>
              </div>

              <button
                class="primary-action evaluate-button"
                type="button"
                :disabled="!nextTherapySession"
                @click="openEvaluationModal"
              >
                ประเมินเด็ก
              </button>
            </div>
          </section>

          <aside class="kid-info-action-panel" aria-label="ข้อมูลเด็ก">
            <button
              type="button"
              class="kid-info-button kid-info-button--standalone"
              aria-label="ดูข้อมูลเด็ก"
              title="ข้อมูลเด็ก"
              @click="openKidInfoModal"
            >
              <img :src="kidProfileIcon" alt="" aria-hidden="true" />
              <span>ข้อมูลเด็ก</span>
            </button>
          </aside>

          <aside class="surface-panel kid-profile-side-panel" aria-labelledby="kid-profile-title">
            <h2 id="kid-profile-title">ข้อมูลเด็ก</h2>
            <dl class="profile-list">
              <div>
                <dt>ชื่อ-นามสกุล</dt>
                <dd>{{ kidDisplayName(kid) }}</dd>
              </div>
              <div>
                <dt>เลขประจำตัวประชาชน</dt>
                <dd>{{ kid.thai_id_masked }}</dd>
              </div>
              <div>
                <dt>อาการสำคัญ</dt>
                <dd>{{ kid.notable_symptoms || '-' }}</dd>
              </div>
              <div>
                <dt>ที่อยู่</dt>
                <dd>
                  {{ kid.address.house_no ? `${kid.address.house_no} ` : '' }}
                  {{ kid.address.village_no ? `หมู่ ${kid.address.village_no} ` : '' }}
                  {{ kid.address.road ? `ถนน${kid.address.road} ` : '' }}
                  {{ kid.address.subdistrict }}, {{ kid.address.district }},
                  {{ kid.address.province }} {{ kid.address.postal_code }}
                </dd>
              </div>
            </dl>
          </aside>

          <section class="surface-panel evaluation-history" aria-labelledby="history-title">
            <div class="panel-heading">
              <div>
                <h2 id="history-title">ประวัติผลประเมิน</h2>
                <p>รายการผลประเมิน Denver II ที่บันทึกไว้</p>
              </div>
            </div>

            <div v-if="evaluations.length === 0" class="empty-state">
              ยังไม่มีผลประเมินของเด็กคนนี้
            </div>

            <table v-else>
              <thead>
                <tr>
                  <th scope="col">ครั้งที่ประเมิน</th>
                  <th scope="col">วันเวลานัด</th>
                  <th scope="col">นักบำบัด</th>
                  <th scope="col">ส่วนบุคคล-สังคม</th>
                  <th scope="col">กล้ามเนื้อมัดเล็ก</th>
                  <th scope="col">ภาษา</th>
                  <th scope="col">กล้ามเนื้อมัดใหญ่</th>
                  <th scope="col">แก้ไข</th>
                  <th scope="col">Home Program</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="evaluation in evaluations" :key="evaluation.id">
                  <td>{{ sessionLabel(evaluation.evaluation_name) }}</td>
                  <td>{{ scheduleLabel(evaluation) }}</td>
                  <td>{{ evaluation.evaluated_by_caregiver_name }}</td>
                  <td>
                    <span :class="resultClass(evaluation.aspect_1_result)">{{
                      resultLabel(evaluation.aspect_1_result)
                    }}</span>
                  </td>
                  <td>
                    <span :class="resultClass(evaluation.aspect_2_result)">{{
                      resultLabel(evaluation.aspect_2_result)
                    }}</span>
                  </td>
                  <td>
                    <span :class="resultClass(evaluation.aspect_3_result)">{{
                      resultLabel(evaluation.aspect_3_result)
                    }}</span>
                  </td>
                  <td>
                    <span :class="resultClass(evaluation.aspect_4_result)">{{
                      resultLabel(evaluation.aspect_4_result)
                    }}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      class="table-action-button table-action-button--icon"
                      aria-label="แก้ไขผลประเมิน"
                      title="แก้ไขผลประเมิน"
                      @click="openEditEvaluationModal(evaluation)"
                    >
                      <i class="bi bi-pencil-square" aria-hidden="true"></i>
                    </button>
                  </td>
                  <td>
                    <div class="table-action-group">
                      <button
                        type="button"
                        class="table-action-button table-action-button--icon"
                        aria-label="แก้ไขผลประเมิน"
                        title="แก้ไขผลประเมิน"
                        @click="openEditEvaluationModal(evaluation)"
                      >
                        <i class="bi bi-pencil-square" aria-hidden="true"></i>
                      </button>
                      <button
                        type="button"
                        class="table-action-button table-action-button--icon table-action-button--add"
                        aria-label="เพิ่ม Home Program"
                        title="เพิ่ม Home Program"
                        @click="openHomeProgramModal(evaluation)"
                      >
                        เพิ่ม
                      </button>
                      <button
                        type="button"
                        class="table-action-button table-action-button--detail"
                        @click="openHomeProgramDetailModal(evaluation)"
                      >
                        รายละเอียด
                        <span v-if="homeProgramCountForEvaluation(evaluation) > 0">
                          {{ homeProgramCountForEvaluation(evaluation) }}
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section class="surface-panel home-program-panel" aria-labelledby="home-program-title">
            <div class="panel-heading">
              <div>
                <h2 id="home-program-title">Home Program</h2>
                <p>กิจกรรมที่นักบำบัดมอบหมายให้เด็กฝึกต่อที่บ้าน</p>
              </div>
            </div>

            <form class="home-program-form" @submit.prevent="submitHomeProgramActivity">
              <label>
                <span>ด้านพัฒนาการ</span>
                <select v-model="homeProgramForm.aspect" required>
                  <option
                    v-for="aspect in homeProgramAspectOptions"
                    :key="aspect.value"
                    :value="aspect.value"
                  >
                    {{ aspect.label }}
                  </option>
                </select>
              </label>

              <label>
                <span>ชื่อกิจกรรม</span>
                <input
                  v-model="homeProgramForm.title"
                  type="text"
                  required
                  maxlength="160"
                  placeholder="เช่น ฝึกหยิบจับของเล่น"
                />
              </label>

              <label class="wide-field">
                <span>วิธีทำกิจกรรมที่บ้าน</span>
                <textarea
                  v-model="homeProgramForm.instruction"
                  required
                  rows="4"
                  placeholder="อธิบายขั้นตอนให้ผู้ปกครองทำตามได้"
                ></textarea>
              </label>

              <label>
                <span>ความถี่</span>
                <input
                  v-model="homeProgramForm.frequency"
                  type="text"
                  maxlength="160"
                  placeholder="เช่น วันละ 10 นาที"
                />
              </label>

              <label>
                <span>หมายเหตุ</span>
                <input v-model="homeProgramForm.note" type="text" placeholder="ถ้ามี" />
              </label>

              <button
                class="primary-action wide-field"
                type="submit"
                :disabled="isSubmittingHomeProgram"
              >
                {{ isSubmittingHomeProgram ? 'กำลังบันทึก...' : 'เพิ่ม Home Program' }}
              </button>
            </form>

            <div v-if="homeProgramActivities.length === 0" class="empty-state">
              ยังไม่มี Home Program สำหรับเด็กคนนี้
            </div>

            <div v-else class="home-program-list">
              <article
                v-for="activity in homeProgramActivities"
                :key="activity.id"
                class="home-program-card"
              >
                <div>
                  <span class="program-aspect">{{ homeProgramAspectLabel(activity.aspect) }}</span>
                  <h3>{{ activity.title }}</h3>
                </div>
                <small>วันที่ประเมิน: {{ homeProgramScheduleLabel(activity) }}</small>
                <p>{{ activity.instruction }}</p>
                <small v-if="activity.frequency">ความถี่: {{ activity.frequency }}</small>
                <small v-if="activity.note">หมายเหตุ: {{ activity.note }}</small>
              </article>
            </div>
          </section>
        </div>
      </template>
    </section>

    <div
      v-if="isKidInfoModalOpen && kid"
      class="evaluation-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kid-info-modal-title"
      @click.self="closeKidInfoModal"
    >
      <section class="evaluation-modal kid-info-modal">
        <header class="evaluation-modal-header">
          <div>
            <p class="eyebrow">Child Profile</p>
            <h2 id="kid-info-modal-title">ข้อมูลเด็ก</h2>
            <p>{{ kidDisplayName(kid) }}</p>
          </div>
          <button
            class="modal-close-button"
            type="button"
            aria-label="ปิดหน้าต่างข้อมูลเด็ก"
            @click="closeKidInfoModal"
          >
            ×
          </button>
        </header>

        <dl class="profile-list profile-list--modal">
          <div>
            <dt>ชื่อ-นามสกุล</dt>
            <dd>{{ kidDisplayName(kid) }}</dd>
          </div>
          <div>
            <dt>เลขประจำตัวประชาชน</dt>
            <dd>{{ kid.thai_id_masked }}</dd>
          </div>
          <div>
            <dt>อาการสำคัญ</dt>
            <dd>{{ kid.notable_symptoms || '-' }}</dd>
          </div>
          <div>
            <dt>วันเดือนปีเกิด</dt>
            <dd>{{ kid.date_of_birth ?? '-' }}</dd>
          </div>
          <div>
            <dt>ที่อยู่</dt>
            <dd>
              {{ kid.address.house_no ? `${kid.address.house_no} ` : '' }}
              {{ kid.address.village_no ? `หมู่ ${kid.address.village_no} ` : '' }}
              {{ kid.address.road ? `ถนน${kid.address.road} ` : '' }}
              {{ kid.address.subdistrict }}, {{ kid.address.district }}, {{ kid.address.province }}
              {{ kid.address.postal_code }}
            </dd>
          </div>
        </dl>
      </section>
    </div>

    <div
      v-if="isEvaluationModalOpen"
      class="evaluation-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evaluation-modal-title"
      @click.self="closeEvaluationModal"
    >
      <section class="evaluation-modal">
        <header class="evaluation-modal-header">
          <div>
            <p class="eyebrow">Denver II</p>
            <h2 id="evaluation-modal-title">ประเมินเด็ก</h2>
            <p>ครั้งที่ {{ nextSessionNumber }} · {{ therapySessionLabel(nextTherapySession) }}</p>
          </div>
          <button
            class="modal-close-button"
            type="button"
            aria-label="ปิดหน้าต่างประเมิน"
            @click="closeEvaluationModal"
          >
            ×
          </button>
        </header>

        <form class="evaluation-form" @submit.prevent="submitEvaluation">
          <fieldset v-for="aspect in aspectOptions" :key="aspect.key" class="aspect-field">
            <legend>
              {{ aspect.label }}
              <small>{{ aspect.helper }}</small>
            </legend>
            <label>
              <input v-model="form[aspect.key]" type="radio" value="pass" />
              <span>ผ่าน</span>
            </label>
            <label>
              <input v-model="form[aspect.key]" type="radio" value="fail" />
              <span>ไม่ผ่าน</span>
            </label>
          </fieldset>

          <div class="modal-actions">
            <button class="secondary-action" type="button" @click="closeEvaluationModal">
              ยกเลิก
            </button>
            <button
              class="primary-action"
              type="submit"
              :disabled="isSubmitting || (!editingDenverEvaluation && !nextTherapySession)"
            >
              {{ isSubmitting ? 'กำลังบันทึก...' : 'บันทึกผลประเมิน' }}
            </button>
          </div>
        </form>
      </section>
    </div>

    <div
      v-if="isHomeProgramModalOpen"
      class="evaluation-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="home-program-modal-title"
      @click.self="closeHomeProgramModal"
    >
      <section class="evaluation-modal">
        <header class="evaluation-modal-header">
          <div>
            <p class="eyebrow">Home Program</p>
            <h2 id="home-program-modal-title">
              {{ editingHomeProgramActivityId ? 'แก้ไขโฮมโปรแกรม' : 'เพิ่มโฮมโปรแกรม' }}
            </h2>
            <p>{{ selectedHomeProgramEvaluationLabel }}</p>
          </div>
          <button
            class="modal-close-button"
            type="button"
            aria-label="ปิดหน้าต่างเพิ่มโฮมโปรแกรม"
            @click="closeHomeProgramModal"
          >
            ×
          </button>
        </header>

        <form
          class="home-program-form home-program-form--modal"
          @submit.prevent="submitHomeProgramActivity"
        >
          <label class="aspect-select-field wide-field">
            <span>ด้านพัฒนาการ</span>
            <select v-model="homeProgramForm.aspect" required>
              <option
                v-for="aspect in homeProgramAspectOptions"
                :key="aspect.value"
                :value="aspect.value"
              >
                {{ aspect.label }}
              </option>
            </select>
          </label>

          <section class="template-picker wide-field" aria-label="เลือกกิจกรรมจาก CARE Program">
            <div class="template-picker-header">
              <div>
                <span>CARE Program</span>
                <h3>กิจกรรมแนะนำสำหรับ {{ homeProgramAspectLabel(homeProgramForm.aspect) }}</h3>
              </div>
              <label>
                <span>ช่วงวัย</span>
                <select v-model="selectedTemplateAgeRange">
                  <option value="">ทุกช่วงวัย</option>
                  <option
                    v-for="ageRange in templateAgeOptions"
                    :key="ageRange.months"
                    :value="String(ageRange.months)"
                  >
                    {{ ageRange.label }}
                  </option>
                </select>
              </label>
            </div>

            <div v-if="visibleHomeProgramTemplates.length === 0" class="template-empty">
              ไม่พบกิจกรรมต้นแบบในด้านนี้
            </div>
            <div v-else class="template-list">
              <article
                v-for="template in visibleHomeProgramTemplates"
                :key="template.id"
                class="template-card"
              >
                <div>
                  <span class="template-meta"
                    >{{ template.age_range }} · {{ homeProgramAspectLabel(template.aspect) }}</span
                  >
                  <h4>{{ template.title }}</h4>
                </div>
                <p>{{ template.instruction }}</p>
                <small v-if="template.materials">อุปกรณ์: {{ template.materials }}</small>
                <button
                  type="button"
                  class="secondary-action"
                  @click="applyHomeProgramTemplate(template)"
                >
                  ใช้กิจกรรมนี้
                </button>
              </article>
            </div>
          </section>

          <label>
            <span>ชื่อกิจกรรม</span>
            <input
              v-model="homeProgramForm.title"
              type="text"
              required
              maxlength="160"
              placeholder="เช่น ฝึกหยิบจับของเล่น"
            />
          </label>

          <label class="wide-field">
            <span>วิธีทำกิจกรรมที่บ้าน</span>
            <textarea
              v-model="homeProgramForm.instruction"
              required
              rows="4"
              placeholder="อธิบายขั้นตอนให้ผู้ปกครองทำตามได้"
            ></textarea>
          </label>

          <label>
            <span>ความถี่</span>
            <input
              v-model="homeProgramForm.frequency"
              type="text"
              maxlength="160"
              placeholder="เช่น วันละ 10 นาที"
            />
          </label>

          <label>
            <span>หมายเหตุ</span>
            <input v-model="homeProgramForm.note" type="text" placeholder="ถ้ามี" />
          </label>

          <div class="modal-actions">
            <button class="secondary-action" type="button" @click="closeHomeProgramModal">
              ยกเลิก
            </button>
            <button class="primary-action" type="submit" :disabled="isSubmittingHomeProgram">
              {{
                isSubmittingHomeProgram
                  ? 'กำลังบันทึก...'
                  : editingHomeProgramActivityId
                    ? 'บันทึกการแก้ไข'
                    : 'บันทึกโฮมโปรแกรม'
              }}
            </button>
          </div>
        </form>
      </section>
    </div>

    <div
      v-if="isHomeProgramDetailModalOpen"
      class="evaluation-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="home-program-detail-title"
      @click.self="closeHomeProgramDetailModal"
    >
      <section class="evaluation-modal">
        <header class="evaluation-modal-header">
          <div>
            <p class="eyebrow">Home Program</p>
            <h2 id="home-program-detail-title">รายละเอียดโฮมโปรแกรม</h2>
            <p>{{ selectedHomeProgramDetailLabel }}</p>
          </div>
          <button
            class="modal-close-button"
            type="button"
            aria-label="ปิดหน้าต่างรายละเอียดโฮมโปรแกรม"
            @click="closeHomeProgramDetailModal"
          >
            ×
          </button>
        </header>

        <div v-if="selectedHomeProgramDetails.length === 0" class="empty-state">
          ยังไม่มี Home Program สำหรับครั้งนี้
        </div>

        <div v-else class="home-program-list home-program-list--modal">
          <article
            v-for="activity in selectedHomeProgramDetails"
            :key="activity.id"
            class="home-program-card"
          >
            <div class="home-program-card-header">
              <div>
                <span class="program-aspect">{{ homeProgramAspectLabel(activity.aspect) }}</span>
                <h3>{{ activity.title }}</h3>
              </div>
              <div class="home-program-card-actions" aria-label="จัดการโฮมโปรแกรม">
                <button
                  type="button"
                  class="card-icon-button"
                  aria-label="แก้ไขโฮมโปรแกรม"
                  @click="startEditHomeProgramActivity(activity)"
                >
                  <i class="bi bi-pencil-square" aria-hidden="true"></i>
                </button>
                <button
                  type="button"
                  class="card-icon-button card-icon-button--danger"
                  aria-label="ลบโฮมโปรแกรม"
                  :disabled="deletingHomeProgramActivityId === activity.id"
                  @click="removeHomeProgramActivity(activity)"
                >
                  <i class="bi bi-x-lg" aria-hidden="true"></i>
                </button>
              </div>
            </div>
            <small>{{ selectedHomeProgramDetailLabel }}</small>
            <p>{{ activity.instruction }}</p>
            <small v-if="activity.frequency">ความถี่: {{ activity.frequency }}</small>
            <small v-if="activity.note">หมายเหตุ: {{ activity.note }}</small>
          </article>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.development-page {
  min-height: 100vh;
  background: var(--admin-bg);
}

.development-shell {
  width: min(1220px, calc(100% - 2rem));
  margin: 0 auto;
  padding: clamp(1.5rem, 4vw, 2.8rem) 0 4rem;
}

.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.eyebrow {
  margin: 0 0 0.55rem;
  color: var(--admin-primary);
  font-size: 0.82rem;
  font-weight: 850;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

h1,
h2,
p {
  margin: 0;
}

h1,
h2 {
  color: var(--admin-text);
  letter-spacing: 0;
}

h1 {
  font-size: clamp(1.9rem, 3.6vw, 3.1rem);
  line-height: 1.1;
}

h2 {
  font-size: 1.08rem;
}

.page-subtitle {
  margin-top: 0.55rem;
  color: #858796;
  font-weight: 650;
}

.user-chip {
  max-width: 18rem;
  overflow: hidden;
  padding: 0.65rem 0.9rem;
  border: 1px solid var(--admin-border);
  border-radius: 999px;
  color: #858796;
  background: #ffffff;
  font-size: 0.92rem;
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
  box-shadow: 0 0.125rem 0.35rem rgb(58 59 69 / 0.1);
}

.icon-back-button {
  display: inline-grid;
  width: 2.6rem;
  height: 2.6rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid var(--admin-border);
  border-radius: 0.35rem;
  color: var(--admin-primary);
  background: #ffffff;
  font-size: 1.05rem;
  cursor: pointer;
  box-shadow: 0 0.125rem 0.35rem rgb(58 59 69 / 0.08);
}

.icon-back-button:hover,
.icon-back-button:focus-visible {
  border-color: rgb(78 115 223 / 0.42);
  background: rgb(78 115 223 / 0.08);
}

.summary-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  overflow: hidden;
  margin-bottom: 1.25rem;
  border: 1px solid var(--admin-border);
  border-radius: 0.35rem;
  background: #ffffff;
  box-shadow: 0 0.15rem 1.75rem 0 rgb(58 59 69 / 0.12);
}

.summary-item {
  display: grid;
  gap: 0.2rem;
  min-width: 0;
  padding: 0.85rem 0.95rem;
  border-left: 1px solid var(--admin-border);
}

.summary-item:first-child {
  border-left: 0;
}

.summary-item span {
  overflow: hidden;
  color: #858796;
  font-size: 0.78rem;
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary-item strong {
  color: var(--admin-text);
  font-size: 1.35rem;
  line-height: 1.12;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.25rem;
  align-items: start;
}

.surface-panel {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--admin-border);
  border-radius: 0.35rem;
  background: #ffffff;
  box-shadow: 0 0.15rem 1.75rem 0 rgb(58 59 69 / 0.12);
}

.kid-profile-collapsible {
  margin-bottom: 1.25rem;
}

.kid-profile-collapsible summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  color: var(--admin-text);
  background: #f8f9fc;
  font-weight: 850;
  cursor: pointer;
  list-style: none;
}

.kid-profile-collapsible summary::-webkit-details-marker {
  display: none;
}

.kid-profile-collapsible summary i {
  color: #858796;
  transition: transform 0.18s ease;
}

.kid-profile-collapsible[open] summary i {
  transform: rotate(180deg);
}

.kid-profile-side-panel {
  display: none;
}

.loading-panel,
.empty-state {
  padding: 2.5rem 1rem;
  color: #858796;
  text-align: center;
}

.panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--admin-border);
  background: #f8f9fc;
}

.panel-heading p {
  margin-top: 0.25rem;
  color: #858796;
  font-size: 0.9rem;
  line-height: 1.5;
}

.panel-heading > .kid-info-button {
  display: none;
}

.kid-info-action-panel {
  display: grid;
  min-height: 100%;
  align-items: stretch;
  border-radius: 0.5rem;
}

.kid-info-button {
  display: inline-flex;
  min-height: 2.65rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid rgb(78 115 223 / 0.22);
  border-radius: 999px;
  padding: 0 0.9rem;
  color: var(--admin-primary);
  background: rgb(78 115 223 / 0.08);
  font-weight: 850;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 0.125rem 0.35rem rgb(58 59 69 / 0.08);
}

.kid-info-button--standalone {
  min-height: 100%;
  width: 100%;
  flex-direction: column;
  border-radius: 0.5rem;
  padding: 1.25rem;
  border-color: rgb(78 115 223 / 0.2);
  color: var(--admin-text);
  font-size: 1rem;
  background:
    radial-gradient(circle at top left, rgb(78 115 223 / 0.1), transparent 10rem),
    linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.kid-info-button--standalone img {
  width: 5.25rem;
  height: 5.25rem;
  object-fit: contain;
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 0.4rem 1rem rgb(78 115 223 / 0.16);
}

.kid-info-button--standalone span {
  color: inherit;
  font-size: 1.05rem;
  font-weight: 900;
}

.kid-info-button i {
  font-size: 1.1rem;
}

.kid-info-button:hover,
.kid-info-button:focus-visible {
  border-color: rgb(78 115 223 / 0.42);
  background: rgb(78 115 223 / 0.14);
  outline: none;
}

.evaluation-action-panel {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.evaluate-button {
  min-height: 3rem;
  grid-column: 1 / -1;
  justify-self: start;
  padding-inline: 1.5rem;
}

.evaluation-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.home-program-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--admin-border);
}

.home-program-panel > .home-program-form {
  display: none;
}

.home-program-form--modal {
  display: grid;
  border-bottom: 0;
}

.aspect-select-field {
  border: 1px solid rgb(78 115 223 / 0.18);
  border-radius: 0.65rem;
  padding: 0.85rem 0.9rem;
  background: #ffffff;
}

.template-picker {
  display: grid;
  gap: 0.75rem;
  border: 1px solid rgb(78 115 223 / 0.18);
  border-radius: 0.65rem;
  padding: 0.85rem 0.9rem;
  background: #f8fbff;
}

.template-picker-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
}

.template-picker-header > div > span,
.template-meta {
  color: var(--admin-primary);
  font-size: 0.74rem;
  font-weight: 900;
}

.template-picker-header h3 {
  margin: 0.15rem 0 0;
  color: var(--admin-text);
  font-size: 1rem;
}

.template-picker-header label {
  width: min(13rem, 100%);
}

.template-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
  max-height: 15rem;
  overflow: auto;
  padding-right: 0.2rem;
}

.template-card {
  display: grid;
  gap: 0.55rem;
  align-content: start;
  border: 1px solid #dce8ff;
  border-left: 4px solid var(--admin-primary);
  border-radius: 0.55rem;
  padding: 0.8rem;
  background: #ffffff;
}

.template-card h4,
.template-card p {
  margin: 0;
}

.template-card h4 {
  color: var(--admin-text);
  font-size: 0.94rem;
  line-height: 1.35;
}

.template-card p {
  color: #5a5c69;
  font-size: 0.84rem;
  line-height: 1.55;
}

.template-card small {
  color: #858796;
  font-weight: 750;
}

.template-card .secondary-action {
  min-height: 2.15rem;
  justify-self: start;
  padding-inline: 0.75rem;
}

.template-empty {
  border: 1px dashed #c8d5ef;
  border-radius: 0.5rem;
  padding: 1rem;
  color: #858796;
  background: #ffffff;
  text-align: center;
}

.evaluation-form label,
.home-program-form label,
.aspect-field label {
  display: grid;
  gap: 0.42rem;
  color: var(--admin-text);
  font-weight: 750;
}

.evaluation-form input[type='text'],
.evaluation-form input:not([type]),
.home-program-form input,
.home-program-form select,
.home-program-form textarea {
  width: 100%;
  border: 1px solid #d1d3e2;
  border-radius: 0.35rem;
  color: #6e707e;
  background: #ffffff;
}

.evaluation-form input[type='text'],
.evaluation-form input:not([type]),
.home-program-form input,
.home-program-form select {
  height: 2.65rem;
  padding: 0 0.8rem;
}

.home-program-form textarea {
  min-height: 7rem;
  resize: vertical;
  padding: 0.75rem 0.8rem;
  line-height: 1.65;
}

.aspect-field {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin: 0;
  padding: 0.9rem;
  border: 1px solid var(--admin-border);
  border-radius: 0.35rem;
}

.aspect-field legend {
  width: 100%;
  margin: 0;
  color: var(--admin-text);
  font-size: 0.92rem;
  font-weight: 850;
}

.aspect-field legend small {
  display: block;
  margin-top: 0.15rem;
  color: #858796;
  font-size: 0.78rem;
  font-weight: 700;
}

.aspect-field label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
}

.aspect-field input {
  width: 1rem;
  height: 1rem;
}

.wide-field {
  grid-column: 1 / -1;
}

.session-preview {
  display: grid;
  gap: 0.35rem;
  min-height: 4.15rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--admin-border);
  border-radius: 0.35rem;
  background: #ffffff;
}

.session-preview span {
  color: #858796;
  font-size: 0.78rem;
  font-weight: 800;
}

.session-preview strong {
  color: var(--admin-text);
  font-size: 1.45rem;
  line-height: 1.15;
}

.evaluation-modal-overlay {
  position: fixed;
  z-index: 5000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(31 41 55 / 0.48);
  backdrop-filter: blur(4px);
}

.evaluation-modal {
  width: min(46rem, 100%);
  max-height: min(90vh, 48rem);
  overflow: auto;
  border: 1px solid var(--admin-border);
  border-radius: 0.5rem;
  background: #ffffff;
  box-shadow: 0 1.5rem 4rem rgb(31 41 55 / 0.28);
}

.evaluation-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--admin-border);
  background: #f8f9fc;
}

.evaluation-modal-header p:not(.eyebrow) {
  margin-top: 0.3rem;
  color: #858796;
  font-weight: 700;
}

.modal-close-button {
  display: inline-grid;
  width: 2.3rem;
  height: 2.3rem;
  place-items: center;
  border: 1px solid var(--admin-border);
  border-radius: 999px;
  color: #858796;
  background: #ffffff;
  font-size: 1.35rem;
  line-height: 1;
  cursor: pointer;
}

.modal-close-button:hover {
  color: var(--admin-primary);
}

.modal-actions {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.25rem;
}

.profile-list {
  display: grid;
  gap: 1rem;
  margin: 0;
  padding: 1rem;
}

.profile-list--modal {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.profile-list--modal div:last-child {
  grid-column: 1 / -1;
}

.profile-list div {
  display: grid;
  gap: 0.25rem;
}

.profile-list dt {
  color: #858796;
  font-size: 0.78rem;
  font-weight: 800;
}

.profile-list dd {
  margin: 0;
  color: var(--admin-text);
  font-weight: 700;
  line-height: 1.65;
}

.evaluation-history {
  grid-column: 1 / -1;
  overflow-x: auto;
}

.home-program-panel {
  display: none;
  grid-column: 1 / -1;
}

.home-program-list {
  display: grid;
  gap: 0.85rem;
  padding: 1rem;
}

.home-program-list--modal {
  max-height: 28rem;
  overflow: auto;
}

.home-program-card {
  display: grid;
  gap: 0.65rem;
  border: 1px solid rgb(209 211 226 / 0.85);
  border-left: 0.25rem solid var(--admin-primary);
  border-radius: 0.35rem;
  padding: 0.9rem 1rem;
  background: #ffffff;
}

.home-program-card h3,
.home-program-card p {
  margin: 0;
}

.home-program-card h3 {
  color: var(--admin-text);
  font-size: 1rem;
}

.home-program-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.home-program-card-actions {
  display: inline-flex;
  flex: 0 0 auto;
  gap: 0.4rem;
}

.card-icon-button {
  display: inline-grid;
  width: 2.1rem;
  height: 2.1rem;
  place-items: center;
  border: 1px solid #b7cdfd;
  border-radius: 0.35rem;
  color: var(--admin-primary);
  background: #f3f7ff;
  font-size: 0.95rem;
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease;
}

.card-icon-button:hover:not(:disabled) {
  border-color: var(--admin-primary);
  color: #ffffff;
  background: var(--admin-primary);
}

.card-icon-button:disabled {
  cursor: wait;
  opacity: 0.55;
}

.card-icon-button--danger {
  border-color: #f5b7b1;
  color: #e74a3b;
  background: #fff5f5;
}

.card-icon-button--danger:hover:not(:disabled) {
  border-color: #e74a3b;
  color: #ffffff;
  background: #e74a3b;
}

.home-program-card p {
  color: #6e707e;
  line-height: 1.7;
}

.home-program-card small {
  color: #858796;
  font-weight: 700;
}

.program-aspect {
  display: inline-flex;
  width: fit-content;
  margin-bottom: 0.35rem;
  border-radius: 999px;
  padding: 0.25rem 0.55rem;
  color: #1d4ed8;
  background: #eff6ff;
  font-size: 0.78rem;
  font-weight: 850;
}

table {
  width: 100%;
  min-width: 48rem;
  border-collapse: collapse;
}

th,
td {
  padding: 0.8rem 0.9rem;
  border-bottom: 1px solid var(--admin-border);
  text-align: left;
}

th {
  color: #858796;
  background: #f8f9fc;
  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

td {
  color: var(--admin-text);
  font-weight: 650;
}

.result-pill {
  display: inline-flex;
  min-height: 1.8rem;
  align-items: center;
  border-radius: 999px;
  padding: 0.2rem 0.7rem;
  font-size: 0.82rem;
  font-weight: 850;
}

.result-pill--pass {
  color: #0f8057;
  background: rgb(28 200 138 / 0.14);
}

.result-pill--fail {
  color: #be2617;
  background: rgb(231 74 59 / 0.14);
}

.table-action-group {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.4rem;
  align-items: center;
  justify-content: flex-start;
  min-width: 11.5rem;
}

.table-action-button {
  display: inline-flex;
  min-height: 2rem;
  align-items: center;
  justify-content: center;
  border: 1px solid rgb(78 115 223 / 0.28);
  border-radius: 0.35rem;
  padding: 0 0.65rem;
  color: var(--admin-primary);
  background: rgb(78 115 223 / 0.08);
  font-size: 0.82rem;
  font-weight: 850;
  cursor: pointer;
  white-space: nowrap;
}

.table-action-button:first-child {
  width: 3.6rem;
}

.table-action-button--detail {
  width: 7.5rem;
}

.table-action-button--icon {
  width: 2.1rem;
  padding: 0;
}

.table-action-button--add {
  font-size: 0;
}

.table-action-button--add::before {
  content: '+';
  font-size: 1.25rem;
  line-height: 1;
}

.table-action-group .table-action-button--icon:not(.table-action-button--add) {
  display: none;
}

.table-action-button:hover,
.table-action-button:focus-visible {
  border-color: rgb(78 115 223 / 0.5);
  background: rgb(78 115 223 / 0.14);
}

.table-action-button--detail {
  border-color: rgb(28 200 138 / 0.32);
  color: #12845c;
  background: rgb(28 200 138 / 0.1);
}

.table-action-button--detail:hover,
.table-action-button--detail:focus-visible {
  border-color: rgb(28 200 138 / 0.55);
  background: rgb(28 200 138 / 0.16);
}

.table-action-button span {
  display: inline-flex;
  min-width: 1.25rem;
  height: 1.25rem;
  margin-left: 0.35rem;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: #ffffff;
  background: #12845c;
  font-size: 0.72rem;
  line-height: 1;
}

:global(:root[data-theme='dark']) .development-page .summary-strip,
:global(:root[data-theme='dark']) .development-page .surface-panel,
:global(:root[data-theme='dark']) .development-page .evaluation-modal,
:global(:root[data-theme='dark']) .development-page .template-card,
:global(:root[data-theme='dark']) .development-page .home-program-card,
:global(:root[data-theme='dark']) .development-page .aspect-select-field,
:global(:root[data-theme='dark']) .development-page .template-picker {
  border-color: var(--admin-border) !important;
  background: var(--app-surface) !important;
}

:global(:root[data-theme='dark']) .development-page .summary-item,
:global(:root[data-theme='dark']) .development-page th,
:global(:root[data-theme='dark']) .development-page td,
:global(:root[data-theme='dark']) .development-page .panel-heading,
:global(:root[data-theme='dark']) .development-page .kid-profile-collapsible summary,
:global(:root[data-theme='dark']) .development-page .evaluation-modal-header,
:global(:root[data-theme='dark']) .development-page .home-program-form,
:global(:root[data-theme='dark']) .development-page .aspect-field {
  border-color: var(--admin-border) !important;
}

:global(:root[data-theme='dark']) .development-page th,
:global(:root[data-theme='dark']) .development-page .panel-heading,
:global(:root[data-theme='dark']) .development-page .kid-profile-collapsible summary,
:global(:root[data-theme='dark']) .development-page .evaluation-modal-header {
  background: var(--app-surface-soft) !important;
}

:global(:root[data-theme='dark']) .development-page .session-preview {
  border-color: rgb(122 167 255 / 0.32) !important;
  background: var(--app-surface-soft) !important;
}

:global(:root[data-theme='dark']) .development-page .session-preview span,
:global(:root[data-theme='dark']) .development-page .summary-item span,
:global(:root[data-theme='dark']) .development-page .panel-heading p,
:global(:root[data-theme='dark']) .development-page .profile-list dt,
:global(:root[data-theme='dark']) .development-page .loading-panel,
:global(:root[data-theme='dark']) .development-page .empty-state,
:global(:root[data-theme='dark']) .development-page .template-card small,
:global(:root[data-theme='dark']) .development-page .template-card p,
:global(:root[data-theme='dark']) .development-page .home-program-card p,
:global(:root[data-theme='dark']) .development-page .home-program-card small,
:global(:root[data-theme='dark']) .development-page .evaluation-modal-header p:not(.eyebrow),
:global(:root[data-theme='dark']) .development-page .kid-profile-collapsible summary i {
  color: var(--color-muted) !important;
}

:global(:root[data-theme='dark']) .development-page h1,
:global(:root[data-theme='dark']) .development-page h2,
:global(:root[data-theme='dark']) .development-page td,
:global(:root[data-theme='dark']) .development-page .summary-item strong,
:global(:root[data-theme='dark']) .development-page .session-preview strong,
:global(:root[data-theme='dark']) .development-page .profile-list dd,
:global(:root[data-theme='dark']) .development-page .profile-list dt + dd,
:global(:root[data-theme='dark']) .development-page .template-card h4,
:global(:root[data-theme='dark']) .development-page .template-picker-header h3,
:global(:root[data-theme='dark']) .development-page .home-program-card h3,
:global(:root[data-theme='dark']) .development-page .aspect-field legend,
:global(:root[data-theme='dark']) .development-page .evaluation-form label,
:global(:root[data-theme='dark']) .development-page .home-program-form label,
:global(:root[data-theme='dark']) .development-page .aspect-field label {
  color: var(--color-text) !important;
}

:global(:root[data-theme='dark']) .development-page .evaluation-form input[type='text'],
:global(:root[data-theme='dark']) .development-page .evaluation-form input:not([type]),
:global(:root[data-theme='dark']) .development-page .home-program-form input,
:global(:root[data-theme='dark']) .development-page .home-program-form select,
:global(:root[data-theme='dark']) .development-page .home-program-form textarea,
:global(:root[data-theme='dark']) .development-page .modal-close-button,
:global(:root[data-theme='dark']) .development-page .icon-back-button {
  border-color: var(--admin-border) !important;
  color: var(--color-text) !important;
  background: var(--app-input-bg) !important;
}

:global(:root[data-theme='dark']) .development-page .program-aspect {
  color: #bfdbfe !important;
  background: rgb(59 130 246 / 0.18) !important;
}

:global(:root[data-theme='dark']) .development-page .table-action-button {
  border-color: rgb(122 167 255 / 0.28) !important;
  color: #bfdbfe !important;
  background: rgb(122 167 255 / 0.12) !important;
}

:global(:root[data-theme='dark']) .development-page .table-action-button--detail {
  border-color: rgb(52 211 153 / 0.3) !important;
  color: #a7f3d0 !important;
  background: rgb(52 211 153 / 0.12) !important;
}

:global(:root[data-theme='dark']) .development-page .primary-action:disabled {
  border-color: rgb(122 167 255 / 0.24) !important;
  color: #c7d2fe !important;
  background: rgb(78 115 223 / 0.28) !important;
  opacity: 0.76 !important;
}

:global(:root[data-theme='dark']) .development-page .kid-info-button {
  border-color: rgb(122 167 255 / 0.28) !important;
  color: #bfdbfe !important;
  background: rgb(122 167 255 / 0.12) !important;
}

:global(:root[data-theme='dark']) .development-page .kid-info-button--standalone {
  border-color: rgb(122 167 255 / 0.26) !important;
  color: var(--color-text) !important;
  background:
    radial-gradient(circle at top left, rgb(122 167 255 / 0.14), transparent 10rem),
    linear-gradient(180deg, #172237 0%, #111c2d 100%) !important;
}

:global(:root[data-theme='dark']) .development-page .kid-info-button--standalone img {
  background: rgb(255 255 255 / 0.92) !important;
  box-shadow: 0 0.45rem 1rem rgb(0 0 0 / 0.26) !important;
}

@media (max-width: 880px) {
  .page-heading,
  .content-grid,
  .evaluation-action-panel,
  .evaluation-form,
  .home-program-form {
    grid-template-columns: 1fr;
  }

  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .panel-heading {
    flex-direction: column;
  }

  .kid-info-button--standalone {
    width: 100%;
  }

  .profile-list--modal {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .development-shell {
    width: min(100% - 1.25rem, 1220px);
  }

  .summary-strip {
    grid-template-columns: 1fr;
  }

  .summary-item {
    border-top: 1px solid var(--admin-border);
    border-left: 0;
  }

  .summary-item:first-child {
    border-top: 0;
  }
}
</style>
