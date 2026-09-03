import { AxiosError } from 'axios'
import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/lib/api/types'

export type SchoolListItemDto = {
  id: string
  name: string
  code: string
  address: string
  status: string
  teacherCount: number
}

export type SchoolListParams = {
  search?: string
  status?: 'Active' | 'Inactive' | 'All'
  includeTeacherCount?: boolean
}

export type UpsertSchoolRequest = {
  name: string
  code: string
  address: string
  status: 'Active' | 'Inactive'
}

function assertSuccess<T>(data: ApiResponse<T>, fallback: string): T {
  if (!data.isSuccess) {
    throw new Error(data.message || fallback)
  }
  return data.data
}

function toApiError(error: unknown, fallback: string): Error {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.length > 0) {
      return new Error(message)
    }
  }
  if (error instanceof Error && error.message.length > 0) return error
  return new Error(fallback)
}

/** GET /api/Schools */
export async function fetchSchools(
  params: SchoolListParams = {},
): Promise<SchoolListItemDto[]> {
  try {
    const { data } = await apiClient.get<ApiResponse<SchoolListItemDto[]>>(
      '/api/Schools',
      {
        params: {
          search: params.search || undefined,
          status: params.status ?? 'All',
          includeTeacherCount: params.includeTeacherCount ?? true,
        },
      },
    )
    return assertSuccess(data, 'Không thể tải danh sách trường.') ?? []
  } catch (error) {
    throw toApiError(error, 'Không thể tải danh sách trường.')
  }
}

/** GET /api/Schools/{id} */
export async function fetchSchoolById(id: string): Promise<SchoolListItemDto> {
  try {
    const { data } = await apiClient.get<ApiResponse<SchoolListItemDto>>(
      `/api/Schools/${id}`,
    )
    return assertSuccess(data, 'Không tìm thấy trường.')
  } catch (error) {
    throw toApiError(error, 'Không tìm thấy trường.')
  }
}

/** GET /api/Schools/active */
export async function fetchActiveSchools(): Promise<SchoolListItemDto[]> {
  try {
    const { data } = await apiClient.get<ApiResponse<SchoolListItemDto[]>>(
      '/api/Schools/active',
    )
    return assertSuccess(data, 'Không thể tải trường đang hoạt động.') ?? []
  } catch (error) {
    throw toApiError(error, 'Không thể tải trường đang hoạt động.')
  }
}

/** POST /api/Schools */
export async function createSchool(
  request: UpsertSchoolRequest,
): Promise<SchoolListItemDto> {
  try {
    const { data } = await apiClient.post<ApiResponse<SchoolListItemDto>>(
      '/api/Schools',
      request,
    )
    return assertSuccess(data, 'Không thể thêm trường.')
  } catch (error) {
    throw toApiError(error, 'Không thể thêm trường.')
  }
}

/** PUT /api/Schools/{id} */
export async function updateSchool(
  id: string,
  request: UpsertSchoolRequest,
): Promise<SchoolListItemDto> {
  try {
    const { data } = await apiClient.put<ApiResponse<SchoolListItemDto>>(
      `/api/Schools/${id}`,
      request,
    )
    return assertSuccess(data, 'Không thể cập nhật trường.')
  } catch (error) {
    throw toApiError(error, 'Không thể cập nhật trường.')
  }
}

/** DELETE /api/Schools/{id} */
export async function deleteSchool(id: string): Promise<void> {
  try {
    const { data } = await apiClient.delete<ApiResponse<boolean>>(
      `/api/Schools/${id}`,
    )
    assertSuccess(data, 'Không thể xóa trường.')
  } catch (error) {
    throw toApiError(error, 'Không thể xóa trường.')
  }
}
