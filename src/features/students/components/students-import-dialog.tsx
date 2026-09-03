import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { studentKeys } from '@/features/students/api/query-keys'
import {
  downloadStudentImportTemplateFromApi,
  importStudents,
  type ImportStudentError,
} from '@/features/students/api/students-api'
import {
  downloadStudentImportTemplate,
  parseStudentImportFile,
  type StudentImportPreviewRow,
} from '@/features/students/lib/student-import'
import { getApiErrorMessage } from '@/lib/api/get-api-error-message'
import { showErrorToast, showSuccessToast } from '@/lib/show-toast-message'
import { cn } from '@/lib/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, FileSpreadsheet, Loader2, TriangleAlert, X } from 'lucide-react'
import { useRef, useState } from 'react'

type ImportStep = 1 | 2 | 3 | 4

const ERROR_CODE_LABEL: Record<string, string> = {
  DuplicateEmail: 'Trùng email',
  DuplicatePhone: 'Trùng SĐT',
  DuplicateStudentCode: 'Trùng mã học sinh',
  MissingFields: 'Thiếu thông tin',
}

function errorCodeLabel(code?: string) {
  if (!code) return 'Lỗi'
  return ERROR_CODE_LABEL[code] ?? code
}

type StudentsImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  schoolId: string
  schoolName: string
  targetClassId: string
  targetClassName: string
}

export function StudentsImportDialog({
  open,
  onOpenChange,
  schoolId,
  schoolName,
  targetClassId,
  targetClassName,
}: StudentsImportDialogProps) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<ImportStep>(1)
  const [file, setFile] = useState<File | null>(null)
  const [previewRows, setPreviewRows] = useState<StudentImportPreviewRow[]>([])
  const [parsing, setParsing] = useState(false)
  const [downloadingTemplate, setDownloadingTemplate] = useState(false)
  const [createdCount, setCreatedCount] = useState(0)
  const [skippedCount, setSkippedCount] = useState(0)
  const [serverErrors, setServerErrors] = useState<ImportStudentError[]>([])

  const validCount = previewRows.filter((r) => r.status === 'valid').length
  const warningCount = previewRows.filter((r) => r.status === 'warning').length
  const errorCount = previewRows.filter((r) => r.status === 'error').length
  const importableCount = validCount + warningCount

  const importMutation = useMutation({
    mutationFn: importStudents,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: studentKeys.lists() })
      const created = result?.createdCount ?? 0
      const skipped = result?.skippedCount ?? 0
      const errors = result?.errors ?? []

      setCreatedCount(created)
      setSkippedCount(skipped)
      setServerErrors(errors)
      setStep(4)

      if (created > 0 && errors.length === 0) {
        showSuccessToast(
          `Đã import ${created} học sinh vào lớp ${targetClassName}.`,
        )
      } else if (created > 0) {
        showSuccessToast(
          `Đã import ${created} học sinh · bỏ qua ${skipped} dòng.`,
        )
      } else {
        showErrorToast(
          `Không import được học sinh nào. ${skipped} dòng bị bỏ qua.`,
        )
      }
    },
    onError: (error) => {
      showErrorToast(getApiErrorMessage(error, 'Import học sinh thất bại.'))
    },
  })

  function reset() {
    setStep(1)
    setFile(null)
    setPreviewRows([])
    setParsing(false)
    setDownloadingTemplate(false)
    setCreatedCount(0)
    setSkippedCount(0)
    setServerErrors([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

  async function handleDownloadTemplate() {
    setDownloadingTemplate(true)
    try {
      await downloadStudentImportTemplateFromApi()
      showSuccessToast('Đã tải template Excel.')
    } catch {
      downloadStudentImportTemplate()
      showSuccessToast('Đã tải template Excel (local).')
    } finally {
      setDownloadingTemplate(false)
    }
  }

  async function handleFileSelected(nextFile: File | undefined) {
    if (!nextFile) return

    const ext = nextFile.name.split('.').pop()?.toLowerCase()
    if (ext !== 'xlsx' && ext !== 'xlsm') {
      showErrorToast('Chỉ hỗ trợ file .xlsx hoặc .xlsm.')
      return
    }

    setParsing(true)
    try {
      const rows = await parseStudentImportFile(nextFile)
      setFile(nextFile)
      setPreviewRows(rows)
      setStep(2)
    } catch (error) {
      setFile(null)
      setPreviewRows([])
      showErrorToast(getApiErrorMessage(error, 'Không đọc được file Excel.'))
    } finally {
      setParsing(false)
    }
  }

  function handleContinue() {
    if (step === 1) return
    if (step === 2) {
      if (importableCount === 0) {
        showErrorToast('Không có dòng hợp lệ để import.')
        return
      }
      setStep(3)
      return
    }
    if (step === 4) {
      handleOpenChange(false)
      return
    }

    if (!file) {
      showErrorToast('Chưa chọn file Excel.')
      return
    }
    if (!schoolId || !targetClassId) {
      showErrorToast('Thiếu thông tin trường hoặc lớp.')
      return
    }

    void importMutation.mutateAsync({
      file,
      schoolId,
      classId: targetClassId,
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Import học sinh</DialogTitle>
          <DialogDescription>
            Tải template, điền dữ liệu rồi import vào lớp đã chọn.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm sm:grid-cols-2">
          <p>
            <span className="text-muted-foreground">Trường: </span>
            <span className="font-medium">{schoolName || '—'}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Lớp: </span>
            <span className="font-medium">{targetClassName || '—'}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          {[1, 2, 3, 4].map((item) => (
            <span
              key={item}
              className={cn(
                'rounded-full px-2.5 py-0.5',
                step === item
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {item === 1
                ? '① Tải file'
                : item === 2
                  ? '② Kiểm tra'
                  : item === 3
                    ? '③ Xác nhận'
                    : '④ Kết quả'}
            </span>
          ))}
        </div>

        {step === 1 ? (
          <div className="grid gap-3 rounded-lg border border-dashed px-4 py-10 text-center">
            <FileSpreadsheet className="mx-auto size-8 text-muted-foreground" />
            <p className="text-sm font-medium">Chọn file Excel (.xlsx)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xlsm"
              className="hidden"
              onChange={(e) =>
                void handleFileSelected(e.target.files?.[0] ?? undefined)
              }
            />
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={parsing}
                onClick={() => fileInputRef.current?.click()}
              >
                {parsing ? <Loader2 className="animate-spin" /> : null}
                Chọn file
              </Button>
              <Button
                type="button"
                variant="link"
                className="h-auto px-0"
                disabled={downloadingTemplate}
                onClick={() => void handleDownloadTemplate()}
              >
                {downloadingTemplate ? (
                  <Loader2 className="animate-spin" />
                ) : null}
                Tải template Excel
              </Button>
            </div>
            {file ? (
              <p className="text-sm text-muted-foreground">
                Đã chọn: {file.name}
              </p>
            ) : null}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-3">
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <Check className="size-4" /> {validCount} dòng hợp lệ
              </span>
              <span className="inline-flex items-center gap-1 text-amber-600">
                <TriangleAlert className="size-4" /> {warningCount} cảnh báo
              </span>
              <span className="inline-flex items-center gap-1 text-destructive">
                <X className="size-4" /> {errorCount} lỗi
              </span>
            </div>
            <div className="max-h-[40vh] overflow-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã HS</TableHead>
                    <TableHead>Họ đệm</TableHead>
                    <TableHead>Tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>SĐT</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.map((row) => (
                    <TableRow key={`${row.rowNumber}-${row.studentCode}`}>
                      <TableCell>{row.studentCode || '—'}</TableCell>
                      <TableCell>{row.lastName || '—'}</TableCell>
                      <TableCell>{row.firstName || '—'}</TableCell>
                      <TableCell className="max-w-40 truncate">
                        {row.email || '—'}
                      </TableCell>
                      <TableCell>{row.phoneNumber || '—'}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 text-sm',
                            row.status === 'valid' && 'text-emerald-600',
                            row.status === 'warning' && 'text-amber-600',
                            row.status === 'error' && 'text-destructive',
                          )}
                        >
                          {row.status === 'valid' ? (
                            <Check className="size-3.5" />
                          ) : row.status === 'warning' ? (
                            <TriangleAlert className="size-3.5" />
                          ) : (
                            <X className="size-3.5" />
                          )}
                          {row.message}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="rounded-lg border bg-muted/30 px-4 py-6 text-sm">
            <p>
              Sẵn sàng gửi file <strong>{file?.name}</strong> để import vào lớp{' '}
              <strong>{targetClassName}</strong> thuộc trường{' '}
              <strong>{schoolName}</strong>.
            </p>
            <p className="mt-1 text-muted-foreground">
              Preview: {importableCount} dòng có thể import
              {errorCount > 0 ? ` · ${errorCount} dòng lỗi (cảnh báo)` : ''}.
            </p>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="grid gap-3">
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <Check className="size-4" /> {createdCount} đã tạo
              </span>
              <span className="inline-flex items-center gap-1 text-amber-600">
                <TriangleAlert className="size-4" /> {skippedCount} bỏ qua
              </span>
              <span className="inline-flex items-center gap-1 text-destructive">
                <X className="size-4" /> {serverErrors.length} lỗi
              </span>
            </div>

            {serverErrors.length === 0 ? (
              <p className="rounded-lg border bg-muted/30 px-4 py-6 text-sm">
                Import hoàn tất, không có dòng lỗi.
              </p>
            ) : (
              <div className="max-h-[40vh] overflow-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dòng</TableHead>
                      <TableHead>Loại lỗi</TableHead>
                      <TableHead>Giá trị</TableHead>
                      <TableHead>Học sinh trùng</TableHead>
                      <TableHead>Chi tiết</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serverErrors.map((item) => (
                      <TableRow
                        key={`${item.rowNumber}-${item.errorCode}-${item.conflictValue}`}
                      >
                        <TableCell>{item.rowNumber}</TableCell>
                        <TableCell className="text-destructive">
                          {errorCodeLabel(item.errorCode)}
                        </TableCell>
                        <TableCell>{item.conflictValue || '—'}</TableCell>
                        <TableCell>
                          {item.existingStudent
                            ? `${item.existingStudent.studentCode} — ${item.existingStudent.fullName} (${item.existingStudent.className})`
                            : '—'}
                        </TableCell>
                        <TableCell className="max-w-72 text-muted-foreground">
                          {item.message}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        ) : null}

        <DialogFooter>
          {step === 4 ? (
            <Button type="button" onClick={() => handleOpenChange(false)}>
              Đóng
            </Button>
          ) : step > 1 ? (
            <Button
              type="button"
              variant="outline"
              disabled={importMutation.isPending}
              onClick={() => setStep((s) => (s - 1) as ImportStep)}
            >
              Quay lại
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Hủy
            </Button>
          )}
          {step !== 4 ? (
            <Button
              type="button"
              disabled={
                step === 1 ||
                parsing ||
                importMutation.isPending ||
                (step === 2 && importableCount === 0) ||
                (step === 3 && (!file || !schoolId || !targetClassId))
              }
              onClick={handleContinue}
            >
              {importMutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : null}
              {step === 3
                ? 'Import Excel'
                : step === 2
                  ? 'Tiếp tục'
                  : 'Chọn file để tiếp tục'}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
