import { AxiosError } from 'axios'
import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/lib/api/types'

export type TeacherClassRefDto = {
  id: string
  name: string
}

export type TeacherSchoolAssignmentDto = {
  schoolId: string
  schoolName: string
  taughtClasses: TeacherClassRefDto[]
  homeroomClass?: TeacherClassRefDto | null
}

export type TeacherListItemDto = {
  id: string
  accountNo: string
  name: string
  email: string
  phone?: string | null
  subjectId?: string | null
  subjectName?: string | null
  status: string
  schools: TeacherSchoolAssignmentDto[]
  /** @deprecated flat fields — prefer `schools` for display */
  schoolIds?: string[]
  schoolNames?: string[]
  taughtClassIds?: string[]
  taughtClassNames?: string[]
  homeroomClassId?: string | null
  homeroomClassName?: string | null
}

export type TeacherOptionDto = {
  id: string
  accountNo: string
  name: string
}

export type SubjectListItemDto = {
  id: string
  name: string
}

export type TeacherMetaClassDto = {
  id: string
  name: string
}

export type TeacherMetaDto = {
  subjects: SubjectListItemDto[]
  classesBySchool: Record<string, TeacherMetaClassDto[]>
}

export type TeacherListParams = {
  search?: string
  status?: 'Active' | 'Inactive' | 'All'
  schoolId?: string
}

export type UpsertTeacherRequest = {
  name: string
  email: string
  password?: string
  phone?: string | null
  subjectId: string
  schoolIds: string[]
  taughtClassIds: string[]
  homeroomClassId?: string | null
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

/** GET /api/Teachers */
export async function fetchTeachers(
  params: TeacherListParams = {},
): Promise<TeacherListItemDto[]> {
  try {
    const { data } = await apiClient.get<ApiResponse<TeacherListItemDto[]>>(
      '/api/Teachers',
      {
        params: {
          search: params.search || undefined,
          status: params.status ?? 'All',
          schoolId: params.schoolId || undefined,
        },
      },
    )
    return assertSuccess(data, 'Không thể tải danh sách giáo viên.') ?? []
  } catch (error) {
    throw toApiError(error, 'Không thể tải danh sách giáo viên.')
  }
}

/** GET /api/Teachers/{id} */
export async function fetchTeacherById(
  id: string,
): Promise<TeacherListItemDto> {
  try {
    const { data } = await apiClient.get<ApiResponse<TeacherListItemDto>>(
      `/api/Teachers/${id}`,
    )
    return assertSuccess(data, 'Không tìm thấy giáo viên.')
  } catch (error) {
    throw toApiError(error, 'Không tìm thấy giáo viên.')
  }
}

/** GET /api/Teachers/options */
export async function fetchTeacherOptions(params: {
  schoolId: string
  status?: 'Active' | 'Inactive' | 'All'
  search?: string
}): Promise<TeacherOptionDto[]> {
  try {
    const { data } = await apiClient.get<ApiResponse<TeacherOptionDto[]>>(
      '/api/Teachers/options',
      {
        params: {
          schoolId: params.schoolId,
          status: params.status ?? 'Active',
          search: params.search || undefined,
        },
      },
    )
    return assertSuccess(data, 'Không thể tải danh sách giáo viên.') ?? []
  } catch (error) {
    throw toApiError(error, 'Không thể tải danh sách giáo viên.')
  }
}

/** GET /api/Teachers/meta?schoolIds=a,b */
export async function fetchTeacherMeta(
  schoolIds: string[],
): Promise<TeacherMetaDto> {
  try {
    const { data } = await apiClient.get<ApiResponse<TeacherMetaDto>>(
      '/api/Teachers/meta',
      {
        params: {
          schoolIds: schoolIds.length > 0 ? schoolIds.join(',') : undefined,
        },
      },
    )
    return (
      assertSuccess(data, 'Không thể tải meta giáo viên.') ?? {
        subjects: [],
        classesBySchool: {},
      }
    )
  } catch (error) {
    throw toApiError(error, 'Không thể tải meta giáo viên.')
  }
}

/** POST /api/Teachers */
export async function createTeacher(
  request: UpsertTeacherRequest,
): Promise<TeacherListItemDto> {
  try {
    const { data } = await apiClient.post<ApiResponse<TeacherListItemDto>>(
      '/api/Teachers',
      {
        ...request,
        password: request.password,
        homeroomClassId: request.homeroomClassId || null,
      },
    )
    return assertSuccess(data, 'Không thể thêm giáo viên.')
  } catch (error) {
    throw toApiError(error, 'Không thể thêm giáo viên.')
  }
}

/** PUT /api/Teachers/{id} */
export async function updateTeacher(
  id: string,
  request: UpsertTeacherRequest,
): Promise<TeacherListItemDto> {
  try {
    const { data } = await apiClient.put<ApiResponse<TeacherListItemDto>>(
      `/api/Teachers/${id}`,
      {
        name: request.name,
        email: request.email,
        password: request.password || undefined,
        phone: request.phone,
        subjectId: request.subjectId,
        schoolIds: request.schoolIds,
        taughtClassIds: request.taughtClassIds,
        // Keep existing homeroom (assigned only from Classes screen)
        homeroomClassId: request.homeroomClassId ?? null,
        status: request.status,
      },
    )
    return assertSuccess(data, 'Không thể cập nhật giáo viên.')
  } catch (error) {
    throw toApiError(error, 'Không thể cập nhật giáo viên.')
  }
}

/** DELETE /api/Teachers/{id} — soft Inactive */
export async function deleteTeacher(id: string): Promise<void> {
  try {
    const { data } = await apiClient.delete<ApiResponse<boolean>>(
      `/api/Teachers/${id}`,
    )
    assertSuccess(data, 'Không thể xóa giáo viên.')
  } catch (error) {
    throw toApiError(error, 'Không thể xóa giáo viên.')
  }
}

/** GET /api/Subjects */
export async function fetchSubjects(): Promise<SubjectListItemDto[]> {
  try {
    const { data } = await apiClient.get<ApiResponse<SubjectListItemDto[]>>(
      '/api/Subjects',
    )
    return assertSuccess(data, 'Không thể tải danh sách môn.') ?? []
  } catch (error) {
    throw toApiError(error, 'Không thể tải danh sách môn.')
  }
}
