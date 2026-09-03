import { AxiosError } from 'axios'
import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/lib/api/types'

export type GradeMetaClassDto = {
  id: string
  name: string
  isHomeroom: boolean
  subjectIds: string[]
  taughtSubjectIds: string[]
}

export type GradeMetaSubjectDto = {
  id: string
  name: string
}

export type GradeMetaDto = {
  classes: GradeMetaClassDto[]
  subjects: GradeMetaSubjectDto[]
}

export type GradeOverviewItemDto = {
  subjectId: string
  subjectName: string
  average: number | null
  completeCount: number
  totalCount: number
  status: string
  canEdit: boolean
}

export type GradeStudentScoresDto = {
  tx1: number | null
  tx2: number | null
  tx3: number | null
  gk: number | null
  ck: number | null
}

export type GradeStudentRowDto = {
  studentId: string
  studentCode: string
  fullName: string
  isLocked: boolean
  scores: GradeStudentScoresDto
  finalScore: number | null
  status: string
}

export type GradeBookSummaryDto = {
  totalStudents: number
  completeCount: number
  missingCount: number
  emptyCount: number
  average: number | null
  max: number | null
  min: number | null
}

export type GradeBookDto = {
  classId: string
  className: string
  subjectId: string
  subjectName: string
  academicYear: string
  semester: number
  canEdit: boolean
  summary: GradeBookSummaryDto
  students: GradeStudentRowDto[]
}

export type GradeImportRowErrorDto = {
  rowNumber: number
  errorCode: string
  message: string
}

export type GradeImportResultDto = {
  updatedCount: number
  skippedCount: number
  errors: GradeImportRowErrorDto[]
}

export type PatchGradeScoresRequest = {
  academicYear: string
  semester: number
  classId: string
  subjectId: string
  studentId?: string
  column?: string
  value?: number | null
  updates?: Array<{
    studentId: string
    column: string
    value: number | null
  }>
}

export type GradesContextParams = {
  schoolId: string
  academicYear: string
  semester: number
  classId: string
  subjectId: string
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

async function toBlobApiError(error: unknown, fallback: string): Promise<Error> {
  if (error instanceof AxiosError && error.response?.data instanceof Blob) {
    try {
      const text = await error.response.data.text()
      const json = JSON.parse(text) as ApiResponse<unknown>
      if (typeof json.message === 'string' && json.message.length > 0) {
        return new Error(json.message)
      }
    } catch {
      // ignore parse failure
    }
  }
  return toApiError(error, fallback)
}

function parseContentDispositionFileName(header: unknown): string | null {
  if (typeof header !== 'string' || header.length === 0) return null

  const utfMatch = /filename\*=UTF-8''([^;]+)/i.exec(header)
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1].replace(/["']/g, ''))
    } catch {
      return utfMatch[1]
    }
  }

  const asciiMatch = /filename="?([^";]+)"?/i.exec(header)
  return asciiMatch?.[1] ?? null
}

function triggerBlobDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

/** GET /api/Grades/meta */
export async function fetchGradesMeta(
  schoolId: string,
  academicYear: string,
): Promise<GradeMetaDto> {
  try {
    const { data } = await apiClient.get<ApiResponse<GradeMetaDto>>(
      '/api/Grades/meta',
      { params: { schoolId, academicYear } },
    )
    return (
      assertSuccess(data, 'Không thể tải danh sách lớp/môn.') ?? {
        classes: [],
        subjects: [],
      }
    )
  } catch (error) {
    throw toApiError(error, 'Không thể tải danh sách lớp/môn.')
  }
}

/** GET /api/Grades/overview */
export async function fetchGradesOverview(params: {
  schoolId: string
  academicYear: string
  semester: number
  classId: string
}): Promise<GradeOverviewItemDto[]> {
  try {
    const { data } = await apiClient.get<ApiResponse<GradeOverviewItemDto[]>>(
      '/api/Grades/overview',
      { params },
    )
    return assertSuccess(data, 'Không thể tải tổng quan điểm lớp.') ?? []
  } catch (error) {
    throw toApiError(error, 'Không thể tải tổng quan điểm lớp.')
  }
}

/** GET /api/Grades/book */
export async function fetchGradeBook(
  params: GradesContextParams,
): Promise<GradeBookDto> {
  try {
    const { data } = await apiClient.get<ApiResponse<GradeBookDto>>(
      '/api/Grades/book',
      { params },
    )
    return assertSuccess(data, 'Không thể tải bảng điểm.')
  } catch (error) {
    throw toApiError(error, 'Không thể tải bảng điểm.')
  }
}

/** PATCH /api/Grades/scores */
export async function patchGradeScores(
  schoolId: string,
  request: PatchGradeScoresRequest,
): Promise<GradeStudentRowDto[]> {
  try {
    const { data } = await apiClient.patch<
      ApiResponse<GradeStudentRowDto[]>
    >('/api/Grades/scores', request, { params: { schoolId } })
    return assertSuccess(data, 'Không thể lưu điểm.') ?? []
  } catch (error) {
    throw toApiError(error, 'Không thể lưu điểm.')
  }
}

/** GET /api/Grades/import/template */
export async function downloadGradeImportTemplateFromApi(
  params: GradesContextParams,
): Promise<void> {
  try {
    const response = await apiClient.get<Blob>('/api/Grades/import/template', {
      params,
      responseType: 'blob',
    })
    const fileName =
      parseContentDispositionFileName(response.headers['content-disposition']) ??
      'Mau_Import_BangDiem.xlsx'
    triggerBlobDownload(response.data, fileName)
  } catch (error) {
    throw await toBlobApiError(error, 'Không thể tải template điểm.')
  }
}

/** POST /api/Grades/import */
export async function importGradeScores(
  params: GradesContextParams,
  file: File,
): Promise<GradeImportResultDto> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await apiClient.post<ApiResponse<GradeImportResultDto>>(
      '/api/Grades/import',
      formData,
      { params },
    )
    return (
      assertSuccess(data, 'Import điểm thất bại.') ?? {
        updatedCount: 0,
        skippedCount: 0,
        errors: [],
      }
    )
  } catch (error) {
    throw toApiError(error, 'Import điểm thất bại.')
  }
}

/** GET /api/Grades/export */
export async function exportGradeBook(
  params: GradesContextParams,
): Promise<void> {
  try {
    const response = await apiClient.get<Blob>('/api/Grades/export', {
      params,
      responseType: 'blob',
    })
    const fileName =
      parseContentDispositionFileName(response.headers['content-disposition']) ??
      'BangDiem.xlsx'
    triggerBlobDownload(response.data, fileName)
  } catch (error) {
    throw await toBlobApiError(error, 'Export điểm thất bại.')
  }
}
