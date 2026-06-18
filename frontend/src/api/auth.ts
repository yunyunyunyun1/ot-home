import { apiPatch, apiPost } from './client'

export type AddressPayload = {
  house_no?: string | null
  village_no?: string | null
  road?: string | null
  subdistrict: string
  district: string
  province: string
  postal_code: string
  country: string
  note?: string | null
}

export type CaregiverRegisterPayload = {
  thai_id: string
  password: string
  full_name: string
  date_of_birth: string
  gender: string
  phone?: string | null
  email?: string | null
  license_id: string
  hospital_or_clinic: string
  address: AddressPayload
}

export type VillageVolunteerRegisterPayload = {
  thai_id: string
  password: string
  full_name: string
  date_of_birth: string
  gender: string
  phone?: string | null
  email?: string | null
  hospital_or_clinic: string
  address: AddressPayload
}

export type UserResponse = {
  id: string
  thai_id_masked: string
  role: string
  full_name: string
  date_of_birth: string | null
  gender: string | null
  phone: string | null
  email: string | null
  profile_image_data: string | null
  is_active: boolean
  created_at: string
}

export type LoginPayload = {
  thai_id: string
  password: string
}

export type TokenResponse = {
  access_token: string
  token_type: string
  user: UserResponse
}

export type AccountUpdatePayload = {
  full_name: string
  date_of_birth?: string | null
  gender?: string | null
  current_password?: string | null
  new_password?: string | null
  profile_image_data?: string | null
}

export function registerCaregiver(payload: CaregiverRegisterPayload): Promise<UserResponse> {
  return apiPost<UserResponse, CaregiverRegisterPayload>('/api/v1/auth/register/caregiver', payload)
}

export function registerVillageVolunteer(
  payload: VillageVolunteerRegisterPayload,
): Promise<UserResponse> {
  return apiPost<UserResponse, VillageVolunteerRegisterPayload>(
    '/api/v1/auth/register/village-volunteer',
    payload,
  )
}

export function login(payload: LoginPayload): Promise<TokenResponse> {
  return apiPost<TokenResponse, LoginPayload>('/api/v1/auth/login', payload)
}

export function updateAccount(payload: AccountUpdatePayload): Promise<UserResponse> {
  return apiPatch<UserResponse, AccountUpdatePayload>('/api/v1/auth/me', payload)
}
