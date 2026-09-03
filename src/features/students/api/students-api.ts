import { AxiosError } from 'axios'
import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/lib/api/types'

export type GuardianInput = {
  fullName?: string | null
  occupation?: string | null
  phoneNumber?: string | null
}

export type GuardianDto = {
  relation: string
  fullName?: string | null
  occupation?: string | null
  phoneNumber?: string | null
}

export type StudentListItemDto = {
  id: string
  studentCode: string
  firstName: string
  lastName: string
  email?: string | null
  phoneNumber?: string | null
  classId: string
  className: string
  status: string
}

export type StudentDetailDto = {
  id: string
  schoolId: string
  studentCode: string
  firstName: string
  lastName: string
  email?: string | null
  phoneNumber?: string | null
  address?: string | null
  classId: string
  className: string
  status: string
  guardians: GuardianDto[]
}

export type PagedResult<T> = {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
}

export type StudentListParams = {
  schoolId: string
  classId?: string
  search?: string
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  status?: 'Active' | 'Inactive' | 'All'
  page?: number
  pageSize?: number
}

export type CreateStudentRequest = {
  schoolId: string
  classId: string
  studentCode: string
  firstName: string
  lastName: string
  email?: string | null
  phoneNumber?: string | null
  address?: string | null
  father?: GuardianInput | null
  mother?: GuardianInput | null
}

export type UpdateStudentRequest = {
  classId: string
  studentCode: string
  firstName: string
  lastName: string
  email?: string | null
  phoneNumber?: string | null
  address?: string | null
  father?: GuardianInput | null
  mother?: GuardianInput | null
}

export type StudentPunctualityDto = {
  studentId: string
  month: string
  present: number
  absent: number
  late: number
  excused: number
  total: number
  rate: number
}

export type ImportStudentExisting = {
  studentCode: string
  fullName: string
  className: string
}

export type ImportStudentError = {
  rowNumber: number
  errorCode?: string
  message: string
  conflictField?: string | null
  conflictValue?: string | null
  existingStudent?: ImportStudentExisting | null
}

export type ImportStudentsResult = {
  createdCount: number
  skippedCount: number
  errors?: ImportStudentError[]
}

export type ImportStudentsFormRequest = {
  file: File
  schoolId: string
  classId: string
}

function assertSuccess<T>(data: ApiResponse<T>, fallback: string): T {
  if (!data.isSuccess) {
    throw new Error(data.message || fallback)
  }
  return data.data
}

export async function fetchStudents(
  params: StudentListParams,
): Promise<PagedResult<StudentListItemDto>> {
  const { data } = await apiClient.get<
    ApiResponse<PagedResult<StudentListItemDto>>
  >('/api/Students', {
    params: {
      schoolId: params.schoolId,
      classId: params.classId || undefined,
      search: params.search || undefined,
      sortBy: params.sortBy ?? 'name',
      sortDir: params.sortDir ?? 'asc',
      status: params.status ?? 'Active',
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
    },
  })

  return assertSuccess(data, 'Không thể tải danh sách học sinh.')
}

export async function fetchStudentsByClass(
  classId: string,
  params: Omit<StudentListParams, 'classId'>,
): Promise<PagedResult<StudentListItemDto>> {
  const { data } = await apiClient.get<
    ApiResponse<PagedResult<StudentListItemDto>>
  >(`/api/Classes/${classId}/students`, {
    params: {
      schoolId: params.schoolId,
      search: params.search || undefined,
      sortBy: params.sortBy ?? 'name',
      sortDir: params.sortDir ?? 'asc',
      status: params.status ?? 'Active',
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
    },
  })

  return assertSuccess(data, 'Không thể tải danh sách học sinh theo lớp.')
}

export async function fetchStudentById(
  id: string,
  schoolId: string,
): Promise<StudentDetailDto> {
  const { data } = await apiClient.get<ApiResponse<StudentDetailDto>>(
    `/api/Students/${id}`,
    { params: { schoolId } },
  )

  return assertSuccess(data, 'Không thể tải thông tin học sinh.')
}

export async function createStudent(
  request: CreateStudentRequest,
): Promise<StudentDetailDto> {
  const { data } = await apiClient.post<ApiResponse<StudentDetailDto>>(
    '/api/Students',
    request,
  )

  return assertSuccess(data, 'Không thể thêm học sinh.')
}

export async function updateStudent(
  id: string,
  schoolId: string,
  request: UpdateStudentRequest,
): Promise<StudentDetailDto> {
  const { data } = await apiClient.put<ApiResponse<StudentDetailDto>>(
    `/api/Students/${id}`,
    request,
    { params: { schoolId } },
  )

  return assertSuccess(data, 'Không thể cập nhật học sinh.')
}

export async function deleteStudent(
  id: string,
  schoolId: string,
): Promise<void> {
  const { data } = await apiClient.delete<ApiResponse<boolean>>(
    `/api/Students/${id}`,
    { params: { schoolId } },
  )

  assertSuccess(data, 'Không thể xóa học sinh.')
}

export type BulkDeleteStudentsRequest = {
  schoolId: string
  studentIds: string[]
}

export type BulkDeleteStudentsResult = {
  deletedCount: number
  notFoundCount?: number
  notFoundIds?: string[]
}

/** POST /api/Students/bulk-delete */
export async function bulkDeleteStudents(
  request: BulkDeleteStudentsRequest,
): Promise<BulkDeleteStudentsResult> {
  const { data } = await apiClient.post<ApiResponse<BulkDeleteStudentsResult>>(
    '/api/Students/bulk-delete',
    {
      schoolId: request.schoolId,
      studentIds: request.studentIds,
    },
  )

  return assertSuccess(data, 'Không thể xóa học sinh.')
}

export async function fetchStudentPunctuality(
  id: string,
  schoolId: string,
  month: string,
): Promise<StudentPunctualityDto> {
  const { data } = await apiClient.get<ApiResponse<StudentPunctualityDto>>(
    `/api/Students/${id}/punctuality`,
    { params: { schoolId, month } },
  )

  return assertSuccess(data, 'Không thể tải dữ liệu chuyên cần.')
}

/**
 * POST /api/Students/import
 * multipart/form-data: file + schoolId + classId
 */
export async function importStudents(
  request: ImportStudentsFormRequest,
): Promise<ImportStudentsResult> {
  const formData = new FormData()
  formData.append('file', request.file)
  formData.append('schoolId', request.schoolId)
  formData.append('classId', request.classId)

  const { data } = await apiClient.post<ApiResponse<ImportStudentsResult>>(
    '/api/Students/import',
    formData,
  )
  return assertSuccess(data, 'Import học sinh thất bại.')
}

/** GET /api/Students/import/template */
export async function downloadStudentImportTemplateFromApi(): Promise<void> {
  const { data } = await apiClient.get<Blob>('/api/Students/import/template', {
    responseType: 'blob',
  })
  triggerBlobDownload(data, 'Mau_Import_HocSinh.xlsx')
}

export type ExportStudentsParams = {
  schoolId: string
  classId?: string
  format?: 'xlsx' | 'csv'
  status?: 'Active' | 'Inactive' | 'All'
}

/**
 * GET /api/Students/export
 * Success: file stream. Error: JSON ResponseBase.
 */
export async function exportStudents(
  params: ExportStudentsParams,
): Promise<void> {
  try {
    const response = await apiClient.get<Blob>('/api/Students/export', {
      params: {
        schoolId: params.schoolId,
        classId: params.classId || undefined,
        format: params.format ?? 'xlsx',
        status: params.status ?? 'Active',
      },
      responseType: 'blob',
    })

    const ext = params.format === 'csv' ? 'csv' : 'xlsx'
    const fallbackName = `HocSinh_TatCa_${formatDateStamp()}.${ext}`
    const fileName =
      parseContentDispositionFileName(response.headers['content-disposition']) ??
      fallbackName

    triggerBlobDownload(response.data, fileName)
  } catch (error) {
    throw await toApiError(error, 'Export học sinh thất bại.')
  }
}

function formatDateStamp() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}${m}${d}`
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

async function toApiError(error: unknown, fallback: string): Promise<Error> {
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

  if (error instanceof AxiosError) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.length > 0) {
      return new Error(message)
    }
  }

  if (error instanceof Error && error.message.length > 0) return error
  return new Error(fallback)
}

