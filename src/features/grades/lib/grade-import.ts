import * as XLSX from 'xlsx'

/** Cột template Excel import điểm (đúng thứ tự header). */
export const GRADE_IMPORT_HEADERS = [
  'Mã học sinh',
  'Họ và tên',
  'TX1',
  'TX2',
  'TX3',
  'GK',
  'CK',
] as const

export type GradeImportStudentSeed = {
  studentCode: string
  fullName: string
  tx1?: number | null
  tx2?: number | null
  tx3?: number | null
  gk?: number | null
  ck?: number | null
}

function scoreCell(value?: number | null): string | number {
  if (value == null || Number.isNaN(value)) return ''
  return value
}

/**
 * Tải template .xlsx import bảng điểm.
 * - Không có roster: 1 dòng mẫu.
 * - Có students: prefill mã + tên (điểm để trống hoặc điền sẵn).
 */
export function downloadGradeImportTemplate(options?: {
  students?: GradeImportStudentSeed[]
  fileName?: string
}) {
  const students = options?.students
  const dataRows: Array<Array<string | number>> =
    students && students.length > 0
      ? students.map((item) => [
          item.studentCode,
          item.fullName,
          scoreCell(item.tx1),
          scoreCell(item.tx2),
          scoreCell(item.tx3),
          scoreCell(item.gk),
          scoreCell(item.ck),
        ])
      : [['HS001', 'Nguyễn Văn An', 8, 7.5, 8, 7, 8]]

  const sheet = XLSX.utils.aoa_to_sheet([
    [...GRADE_IMPORT_HEADERS],
    ...dataRows,
  ])

  // Column widths for readability
  sheet['!cols'] = [
    { wch: 14 },
    { wch: 24 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'BangDiem')

  // Instruction sheet
  const guide = XLSX.utils.aoa_to_sheet([
    ['Hướng dẫn import bảng điểm'],
    [''],
    ['1. Không đổi tên / thứ tự các cột ở sheet BangDiem.'],
    ['2. Khớp học sinh theo cột "Mã học sinh".'],
    ['3. Điểm hợp lệ: số từ 0 đến 10 (có thể để trống).'],
    ['4. Cột: TX1, TX2, TX3 (thường xuyên), GK (giữa kỳ), CK (cuối kỳ).'],
    ['5. Họ và tên chỉ để đối chiếu — không dùng để khớp khi import.'],
    [''],
    ['Công thức tổng kết (khi đủ 5 cột):'],
    ['(TB(TX1,TX2,TX3)×1 + GK×2 + CK×3) / 6'],
  ])
  guide['!cols'] = [{ wch: 72 }]
  XLSX.utils.book_append_sheet(workbook, guide, 'HuongDan')

  const fileName = options?.fileName?.trim() || 'mau-import-bang-diem.xlsx'
  XLSX.writeFile(
    workbook,
    fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`,
  )
}
