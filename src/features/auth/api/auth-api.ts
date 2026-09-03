import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/lib/api/types'
import type { School } from '@/stores/school-store'

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponseData = {
  accessToken: string
  refreshToken: string
  emailAddress: string
  sessionId: string
  role: 'teacher' | 'admin'
  isExist: boolean
}

export type TeacherSchoolDto = {
  id: string
  name: string
}

export async function login(request: LoginRequest): Promise<LoginResponseData> {
  const { data } = await apiClient.post<ApiResponse<LoginResponseData>>(
    '/api/Auth/login',
    {
      email: request.email,
      password: request.password,
    },
  )

  if (!data.isSuccess || !data.data?.accessToken) {
    throw new Error(data.message || 'Đăng nhập thất bại.')
  }

  return data.data
}

export async function fetchMySchools(): Promise<School[]> {
  const { data } = await apiClient.get<ApiResponse<TeacherSchoolDto[]>>(
    '/api/Auth/my-schools',
  )

  if (!data.isSuccess) {
    throw new Error(data.message || 'Không thể tải danh sách trường.')
  }

  return (data.data ?? []).map((school) => ({
    id: school.id,
    name: school.name,
  }))
}
