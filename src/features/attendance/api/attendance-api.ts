import { AxiosError } from 'axios'
import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/lib/api/types'

export type LessonAttendanceStudentDto = {
  studentId: string
  studentCode: string
  fullName: string
  status?: string | null
  reason?: string | null
  note?: string | null
}

export type LessonAttendanceDto = {
  lessonId: string
  classId: string
  className: string
  lessonDate: string
  subjectName: string
  attendanceStatus: string
  presentCount: number
  absentCount: number
  lateCount: number
  excusedCount: number
  totalStudents: number
  students: LessonAttendanceStudentDto[]
}

export type SaveAttendanceRecord = {
  studentId: string
  status: string
  reason?: string | null
  note?: string | null
}

export type ClassPunctualitySummaryDto = {
  avgRate: number
  totalStudents: number
  excellent: number
  atRisk: number
}

export type ClassPunctualityStudentDto = {
  studentId: string
  studentCode: string
  fullName: string
  totalSessions: number
  present: number
  late: number
  absent: number
  excused: number
  rate: number
}

export type ClassPunctualityDto = {
  classId: string
  className: string
  month: string
  summary: ClassPunctualitySummaryDto
  students: ClassPunctualityStudentDto[]
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

/** GET /api/Lessons/{id}/attendance */
export async function fetchLessonAttendance(
  lessonId: string,
  schoolId: string,
): Promise<LessonAttendanceDto> {
  try {
    const { data } = await apiClient.get<ApiResponse<LessonAttendanceDto>>(
      `/api/Lessons/${lessonId}/attendance`,
      { params: { schoolId } },
    )
    return assertSuccess(data, 'Không thể tải danh sách điểm danh.')
  } catch (error) {
    throw toApiError(error, 'Không thể tải danh sách điểm danh.')
  }
}

/** PUT /api/Lessons/{id}/attendance */
export async function saveLessonAttendance(
  lessonId: string,
  schoolId: string,
  records: SaveAttendanceRecord[],
): Promise<LessonAttendanceDto> {
  try {
    const { data } = await apiClient.put<ApiResponse<LessonAttendanceDto>>(
      `/api/Lessons/${lessonId}/attendance`,
      { records },
      { params: { schoolId } },
    )
    return assertSuccess(data, 'Không thể lưu điểm danh.')
  } catch (error) {
    throw toApiError(error, 'Không thể lưu điểm danh.')
  }
}

/** GET /api/Classes/{id}/punctuality */
export async function fetchClassPunctuality(
  classId: string,
  schoolId: string,
  month: string,
  teacherScope = true,
): Promise<ClassPunctualityDto> {
  try {
    const { data } = await apiClient.get<ApiResponse<ClassPunctualityDto>>(
      `/api/Classes/${classId}/punctuality`,
      { params: { schoolId, month, teacherScope } },
    )
    return assertSuccess(data, 'Không thể tải chuyên cần lớp.')
  } catch (error) {
    throw toApiError(error, 'Không thể tải chuyên cần lớp.')
  }
}
