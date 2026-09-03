import { AxiosError } from 'axios'
import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/lib/api/types'

export type AcademicWeekDto = {
  id: string
  schoolId: string
  academicYear: string
  weekNumber: number
  label: string
  startDate: string
  endDate: string
  dates: string[]
}

export type PeriodDefinitionDto = {
  id: string
  schoolId: string
  session: string
  periodNumber: number
  label: string
  startTime: string
  endTime: string
}

export type LessonDto = {
  id: string
  weekId: string
  schoolId: string
  academicYear: string
  date: string
  dayOfWeek: number
  dayLabel: string
  session: string
  periodNumber: number
  startTime: string
  endTime: string
  room?: string | null
  teacherId: string
  teacherName: string
  classId: string
  className: string
  subjectId: string
  subjectName: string
  lessonKind: string
  scheduleStatus: string
  originalRoom?: string | null
  originalDate?: string | null
  cancelReason?: string | null
  makeupForDate?: string | null
  makeupForLessonId?: string | null
  attendanceStatus: string
  presentCount: number
  absentCount: number
  lateCount: number
  excusedCount?: number
  totalStudents: number
}

export type LessonMetaDto = {
  classes: Array<{
    id: string
    name: string
    grade: string
    academicYear: string
  }>
  subjects: Array<{ id: string; name: string }>
}

export type LessonListParams = {
  schoolId: string
  weekId?: string
  academicYear?: string
  from?: string
  to?: string
  classId?: string
  subjectId?: string
  teacherId?: string
  lessonKind?: string
  attendanceStatus?: string
  scheduleStatus?: string
}

export type CreateLessonRequest = {
  schoolId: string
  classId: string
  subjectId: string
  academicYear: string
  lessonDate: string
  session: string
  periodNumber: number
  room?: string | null
  lessonKind?: string
  teacherId?: string | null
}

export type UpdateLessonRequest = {
  room?: string | null
  scheduleStatus?: string | null
  originalRoom?: string | null
  originalDate?: string | null
  cancelReason?: string | null
  makeupForDate?: string | null
  makeupForLessonId?: string | null
  lessonDate?: string | null
  session?: string | null
  periodNumber?: number | null
}

export type PeriodDefinitionItemRequest = {
  session: string
  periodNumber: number
  label: string
  startTime: string
  endTime: string
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

export async function fetchAcademicWeeks(
  schoolId: string,
  academicYear: string,
): Promise<AcademicWeekDto[]> {
  try {
    const { data } = await apiClient.get<ApiResponse<AcademicWeekDto[]>>(
      '/api/AcademicWeeks',
      { params: { schoolId, academicYear } },
    )
    return assertSuccess(data, 'Không thể tải danh sách tuần học.') ?? []
  } catch (error) {
    throw toApiError(error, 'Không thể tải danh sách tuần học.')
  }
}

export async function fetchCurrentAcademicWeek(
  schoolId: string,
  academicYear: string,
): Promise<AcademicWeekDto> {
  try {
    const { data } = await apiClient.get<ApiResponse<AcademicWeekDto>>(
      '/api/AcademicWeeks/current',
      { params: { schoolId, academicYear } },
    )
    return assertSuccess(data, 'Không thể tải tuần hiện tại.')
  } catch (error) {
    throw toApiError(error, 'Không thể tải tuần hiện tại.')
  }
}

export async function fetchPeriodDefinitions(
  schoolId: string,
): Promise<PeriodDefinitionDto[]> {
  try {
    const { data } = await apiClient.get<ApiResponse<PeriodDefinitionDto[]>>(
      '/api/PeriodDefinitions',
      { params: { schoolId } },
    )
    return assertSuccess(data, 'Không thể tải cấu hình tiết.') ?? []
  } catch (error) {
    throw toApiError(error, 'Không thể tải cấu hình tiết.')
  }
}

export async function upsertPeriodDefinitions(
  schoolId: string,
  items: PeriodDefinitionItemRequest[],
): Promise<PeriodDefinitionDto[]> {
  try {
    const { data } = await apiClient.put<ApiResponse<PeriodDefinitionDto[]>>(
      '/api/PeriodDefinitions',
      { items },
      { params: { schoolId } },
    )
    return assertSuccess(data, 'Không thể lưu cấu hình tiết.') ?? []
  } catch (error) {
    throw toApiError(error, 'Không thể lưu cấu hình tiết.')
  }
}

export async function fetchLessonMeta(
  schoolId: string,
  academicYear?: string,
): Promise<LessonMetaDto> {
  try {
    const { data } = await apiClient.get<ApiResponse<LessonMetaDto>>(
      '/api/Lessons/meta',
      { params: { schoolId, academicYear: academicYear || undefined } },
    )
    return assertSuccess(data, 'Không thể tải thông tin lịch.') ?? {
      classes: [],
      subjects: [],
    }
  } catch (error) {
    throw toApiError(error, 'Không thể tải thông tin lịch.')
  }
}

export async function fetchLessons(
  params: LessonListParams,
): Promise<LessonDto[]> {
  try {
    const { data } = await apiClient.get<ApiResponse<LessonDto[]>>(
      '/api/Lessons',
      {
        params: {
          schoolId: params.schoolId,
          weekId: params.weekId || undefined,
          academicYear: params.academicYear || undefined,
          from: params.from || undefined,
          to: params.to || undefined,
          classId: params.classId || undefined,
          subjectId: params.subjectId || undefined,
          teacherId: params.teacherId || undefined,
          lessonKind: params.lessonKind || undefined,
          attendanceStatus: params.attendanceStatus || undefined,
          scheduleStatus: params.scheduleStatus || undefined,
        },
      },
    )
    return assertSuccess(data, 'Không thể tải lịch học.') ?? []
  } catch (error) {
    throw toApiError(error, 'Không thể tải lịch học.')
  }
}

export async function fetchLessonById(
  id: string,
  schoolId: string,
): Promise<LessonDto> {
  try {
    const { data } = await apiClient.get<ApiResponse<LessonDto>>(
      `/api/Lessons/${id}`,
      { params: { schoolId } },
    )
    return assertSuccess(data, 'Không thể tải tiết học.')
  } catch (error) {
    throw toApiError(error, 'Không thể tải tiết học.')
  }
}

export async function createLesson(
  request: CreateLessonRequest,
): Promise<LessonDto> {
  try {
    const { data } = await apiClient.post<ApiResponse<LessonDto>>(
      '/api/Lessons',
      request,
    )
    return assertSuccess(data, 'Không thể tạo tiết học.')
  } catch (error) {
    throw toApiError(error, 'Không thể tạo tiết học.')
  }
}

export async function updateLesson(
  id: string,
  schoolId: string,
  request: UpdateLessonRequest,
): Promise<LessonDto> {
  try {
    const { data } = await apiClient.put<ApiResponse<LessonDto>>(
      `/api/Lessons/${id}`,
      request,
      { params: { schoolId } },
    )
    return assertSuccess(data, 'Không thể cập nhật tiết học.')
  } catch (error) {
    throw toApiError(error, 'Không thể cập nhật tiết học.')
  }
}

export async function deleteLesson(
  id: string,
  schoolId: string,
): Promise<void> {
  try {
    const { data } = await apiClient.delete<ApiResponse<boolean>>(
      `/api/Lessons/${id}`,
      { params: { schoolId } },
    )
    assertSuccess(data, 'Không thể xóa tiết học.')
  } catch (error) {
    throw toApiError(error, 'Không thể xóa tiết học.')
  }
}
