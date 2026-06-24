import { apiDelete, apiGet, apiPatch, apiPost } from './client'
import type { AddressPayload } from './auth'

export type KidCreatePayload = {
  thai_id: string
  full_name: string
  date_of_birth: string
  gender: string
  notable_symptoms: string | null
  address: AddressPayload
}

export type KidUpdatePayload = Omit<KidCreatePayload, 'thai_id'>

export type KidResponse = {
  id: string
  thai_id_masked: string
  full_name: string
  date_of_birth: string | null
  gender: string | null
  notable_symptoms: string | null
  assigned_caregiver: {
    id: string
    full_name: string
  } | null
  assigned_village_volunteers: {
    id: string
    full_name: string
  }[]
  address: AddressPayload & {
    id: number
  }
  created_by_case_manager_id: string
  created_at: string
  updated_at: string
}

export type CaregiverResponse = {
  id: string
  thai_id_masked: string
  full_name: string
  phone: string | null
  email: string | null
  license_id: string
  hospital_or_clinic: string
  address: AddressPayload & {
    id: number
  }
  availability_slots: CaregiverAvailabilitySlotResponse[]
}

export type VillageVolunteerResponse = {
  id: string
  thai_id_masked: string
  full_name: string
  phone: string | null
  email: string | null
  license_id: string | null
  hospital_or_clinic: string
  address: AddressPayload & {
    id: number
  }
}

export type CaregiverAvailabilitySlotPayload = {
  available_date: string
  start_time: string
  end_time: string
}

export type CaregiverAvailabilitySlotResponse = CaregiverAvailabilitySlotPayload & {
  id: string
  is_booked: boolean
  assigned_kid_name: string | null
}

export type DenverAspectResult = 'pass' | 'fail'

export type DenverEvaluationPayload = {
  evaluation_name: string
  aspect_1_result: DenverAspectResult
  aspect_2_result: DenverAspectResult
  aspect_3_result: DenverAspectResult
  aspect_4_result: DenverAspectResult
}

export type DenverEvaluationUpdatePayload = Omit<DenverEvaluationPayload, 'evaluation_name'>

export type DenverEvaluationResponse = DenverEvaluationPayload & {
  id: string
  kid_id: string
  evaluated_by_caregiver_id: string
  evaluated_by_caregiver_name: string
  therapy_session_id: string | null
  assignment_id: string | null
  availability_slot_id: string | null
  scheduled_date: string | null
  scheduled_start_time: string | null
  scheduled_end_time: string | null
  created_at: string
  updated_at: string
}

export type TherapySessionResponse = {
  id: string
  kid_id: string
  caregiver_id: string
  case_manager_id: string
  availability_slot_id: string
  status: 'scheduled' | 'completed' | 'cancelled'
  scheduled_date: string
  scheduled_start_time: string
  scheduled_end_time: string
  has_denver_evaluation: boolean
}

export type HomeProgramActivityPayload = {
  evaluation_id: string | null
  aspect: string
  title: string
  instruction: string
  frequency: string | null
  note: string | null
}

export type HomeProgramActivityResponse = HomeProgramActivityPayload & {
  id: string
  kid_id: string
  caregiver_id: string
  created_at: string
  updated_at: string
}

export type HomeProgramTemplateResponse = {
  id: string
  source: string
  age_range: string
  age_months: number
  age_years: number
  age_remainder_months: number
  aspect: string
  title: string
  instruction: string
  materials: string | null
  frequency: string | null
  note: string | null
}

export type CaseManagerContextResponse = {
  province: string
}

export function getCaseManagerContext(): Promise<CaseManagerContextResponse> {
  return apiGet<CaseManagerContextResponse>('/api/v1/case-manager/me')
}

export function createKid(payload: KidCreatePayload): Promise<KidResponse> {
  return apiPost<KidResponse, KidCreatePayload>('/api/v1/case-manager/kids', payload)
}

export function updateKid(kidId: string, payload: KidUpdatePayload): Promise<KidResponse> {
  return apiPatch<KidResponse, KidUpdatePayload>(`/api/v1/case-manager/kids/${kidId}`, payload)
}

export function deleteKid(kidId: string): Promise<void> {
  return apiDelete(`/api/v1/case-manager/kids/${kidId}`)
}

export function listKids(): Promise<KidResponse[]> {
  return apiGet<KidResponse[]>('/api/v1/case-manager/kids')
}

export function listCaregivers(): Promise<CaregiverResponse[]> {
  return apiGet<CaregiverResponse[]>('/api/v1/case-manager/caregivers')
}

export function listVillageVolunteers(): Promise<VillageVolunteerResponse[]> {
  return apiGet<VillageVolunteerResponse[]>('/api/v1/case-manager/village-volunteers')
}

export function assignKidToCaregiver(
  kidId: string,
  caregiverId: string,
  availabilitySlotId: string,
): Promise<KidResponse> {
  return apiPost<
    KidResponse,
    { kid_id: string; caregiver_id: string; availability_slot_id: string }
  >('/api/v1/case-manager/assignments', {
    kid_id: kidId,
    caregiver_id: caregiverId,
    availability_slot_id: availabilitySlotId,
  })
}

export function assignKidToVillageVolunteer(
  kidId: string,
  villageVolunteerId: string,
): Promise<KidResponse> {
  return apiPost<KidResponse, { kid_id: string; village_volunteer_id: string }>(
    '/api/v1/case-manager/village-volunteer-assignments',
    {
      kid_id: kidId,
      village_volunteer_id: villageVolunteerId,
    },
  )
}

export function listMyAssignedKids(): Promise<KidResponse[]> {
  return apiGet<KidResponse[]>('/api/v1/caregiver/kids')
}

export function listHomeProgramTemplates(): Promise<HomeProgramTemplateResponse[]> {
  return apiGet<HomeProgramTemplateResponse[]>('/api/v1/caregiver/home-program-templates')
}

export function listMyVillageVolunteerAssignedKids(): Promise<KidResponse[]> {
  return apiGet<KidResponse[]>('/api/v1/village-volunteer/kids')
}

export function listVillageVolunteerHomeProgramActivities(
  kidId: string,
): Promise<HomeProgramActivityResponse[]> {
  return apiGet<HomeProgramActivityResponse[]>(
    `/api/v1/village-volunteer/kids/${kidId}/home-programs`,
  )
}

export function listMyAvailabilitySlots(): Promise<CaregiverAvailabilitySlotResponse[]> {
  return apiGet<CaregiverAvailabilitySlotResponse[]>('/api/v1/caregiver/availability')
}

export function createAvailabilitySlot(
  payload: CaregiverAvailabilitySlotPayload,
): Promise<CaregiverAvailabilitySlotResponse> {
  return apiPost<CaregiverAvailabilitySlotResponse, CaregiverAvailabilitySlotPayload>(
    '/api/v1/caregiver/availability',
    payload,
  )
}

export function updateAvailabilitySlot(
  slotId: string,
  payload: CaregiverAvailabilitySlotPayload,
): Promise<CaregiverAvailabilitySlotResponse> {
  return apiPatch<CaregiverAvailabilitySlotResponse, CaregiverAvailabilitySlotPayload>(
    `/api/v1/caregiver/availability/${slotId}`,
    payload,
  )
}

export function deleteAvailabilitySlot(slotId: string): Promise<void> {
  return apiDelete(`/api/v1/caregiver/availability/${slotId}`)
}

export function listDenverEvaluations(kidId: string): Promise<DenverEvaluationResponse[]> {
  return apiGet<DenverEvaluationResponse[]>(`/api/v1/caregiver/kids/${kidId}/denver-evaluations`)
}

export function listTherapySessions(kidId: string): Promise<TherapySessionResponse[]> {
  return apiGet<TherapySessionResponse[]>(`/api/v1/caregiver/kids/${kidId}/therapy-sessions`)
}

export function createDenverEvaluation(
  kidId: string,
  payload: DenverEvaluationPayload,
): Promise<DenverEvaluationResponse> {
  return apiPost<DenverEvaluationResponse, DenverEvaluationPayload>(
    `/api/v1/caregiver/kids/${kidId}/denver-evaluations`,
    payload,
  )
}

export function updateDenverEvaluation(
  kidId: string,
  evaluationId: string,
  payload: DenverEvaluationUpdatePayload,
): Promise<DenverEvaluationResponse> {
  return apiPatch<DenverEvaluationResponse, DenverEvaluationUpdatePayload>(
    `/api/v1/caregiver/kids/${kidId}/denver-evaluations/${evaluationId}`,
    payload,
  )
}

export function listHomeProgramActivities(kidId: string): Promise<HomeProgramActivityResponse[]> {
  return apiGet<HomeProgramActivityResponse[]>(`/api/v1/caregiver/kids/${kidId}/home-programs`)
}

export function createHomeProgramActivity(
  kidId: string,
  payload: HomeProgramActivityPayload,
): Promise<HomeProgramActivityResponse> {
  return apiPost<HomeProgramActivityResponse, HomeProgramActivityPayload>(
    `/api/v1/caregiver/kids/${kidId}/home-programs`,
    payload,
  )
}

export function updateHomeProgramActivity(
  kidId: string,
  activityId: string,
  payload: HomeProgramActivityPayload,
): Promise<HomeProgramActivityResponse> {
  return apiPatch<HomeProgramActivityResponse, HomeProgramActivityPayload>(
    `/api/v1/caregiver/kids/${kidId}/home-programs/${activityId}`,
    payload,
  )
}

export function deleteHomeProgramActivity(kidId: string, activityId: string): Promise<void> {
  return apiDelete(`/api/v1/caregiver/kids/${kidId}/home-programs/${activityId}`)
}
