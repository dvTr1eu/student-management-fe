import { AxiosError } from 'axios'
import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/lib/api/types'

export type ClassListItem = {
  id: string
  schoolId: string
  name: string
  grade: string
  academicYear: string
  status: string
  studentCount: number
  isHomeroom: boolean
  homeroomTeacherId?: string | null
  homeroomTeacherName?: string | null
  weeklyPeriods: number
  primarySubjectName?: string | null
}

export type ClassListParams = {
  schoolId: string
  academicYear?: string
  grade?: string
  search?: string
  status?: 'Active' | 'Inactive' | 'All'
}

export type CreateClassRequest = {
  schoolId: string
  name: string
  grade: string
  academicYear: string
  homeroomTeacherId?: string | null
}

export type UpdateClassRequest = {
  name: string
  grade: string
  academicYear: string
  homeroomTeacherId?: string | null
  status?: string | null
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

/** GET /api/Classes */
export async function fetchClasses(
  params: ClassListParams,
): Promise<ClassListItem[]> {
  try {
    const { data } = await apiClient.get<ApiResponse<ClassListItem[]>>(
      '/api/Classes',
      {
        params: {
          schoolId: params.schoolId,
          academicYear: params.academicYear || undefined,
          grade: params.grade || undefined,
          search: params.search || undefined,
          status: params.status ?? 'Active',
        },
      },
    )
    return assertSuccess(data, 'Không thể tải danh sách lớp.') ?? []
  } catch (error) {
    throw toApiError(error, 'Không thể tải danh sách lớp.')
  }
}

/** Backward-compatible helper used by Students screen. */
export async function fetchClassesBySchool(
  schoolId: string,
): Promise<ClassListItem[]> {
  return fetchClasses({ schoolId })
}

/** GET /api/Classes/{id} */
export async function fetchClassById(
  id: string,
  schoolId: string,
): Promise<ClassListItem> {
  try {
    const { data } = await apiClient.get<ApiResponse<ClassListItem>>(
      `/api/Classes/${id}`,
      { params: { schoolId } },
    )
    return assertSuccess(data, 'Không thể tải thông tin lớp.')
  } catch (error) {
    throw toApiError(error, 'Không thể tải thông tin lớp.')
  }
}

/** POST /api/Classes */
export async function createClass(
  request: CreateClassRequest,
): Promise<ClassListItem> {
  try {
    const { data } = await apiClient.post<ApiResponse<ClassListItem>>(
      '/api/Classes',
      {
        schoolId: request.schoolId,
        name: request.name,
        grade: request.grade,
        academicYear: request.academicYear,
        homeroomTeacherId: request.homeroomTeacherId || null,
      },
    )
    return assertSuccess(data, 'Không thể tạo lớp.')
  } catch (error) {
    throw toApiError(error, 'Không thể tạo lớp.')
  }
}

/** PUT /api/Classes/{id} */
export async function updateClass(
  id: string,
  schoolId: string,
  request: UpdateClassRequest,
): Promise<ClassListItem> {
  try {
    const { data } = await apiClient.put<ApiResponse<ClassListItem>>(
      `/api/Classes/${id}`,
      {
        name: request.name,
        grade: request.grade,
        academicYear: request.academicYear,
        homeroomTeacherId: request.homeroomTeacherId || null,
        status: request.status || null,
      },
      { params: { schoolId } },
    )
    return assertSuccess(data, 'Không thể cập nhật lớp.')
  } catch (error) {
    throw toApiError(error, 'Không thể cập nhật lớp.')
  }
}

/** DELETE /api/Classes/{id} — soft delete */
export async function deleteClass(
  id: string,
  schoolId: string,
): Promise<void> {
  try {
    const { data } = await apiClient.delete<ApiResponse<boolean>>(
      `/api/Classes/${id}`,
      { params: { schoolId } },
    )
    assertSuccess(data, 'Không thể xóa lớp.')
  } catch (error) {
    throw toApiError(error, 'Không thể xóa lớp.')
  }
}
