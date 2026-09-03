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
import { getApiErrorMessage } from '@/lib/api/get-api-error-message'
import { showErrorToast, showSuccessToast } from '@/lib/show-toast-message'
import { cn } from '@/lib/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, FileSpreadsheet, Loader2, TriangleAlert, X } from 'lucide-react'
import { useRef, useState } from 'react'
import {
  downloadGradeImportTemplateFromApi,
  importGradeScores,
  type GradeImportRowErrorDto,
  type GradesContextParams,
} from '../api/grades-api'
import { gradesKeys } from '../api/query-keys'
import {
  downloadGradeImportTemplate,
  type GradeImportStudentSeed,
} from '../lib/grade-import'

type ImportStep = 1 | 2 | 3

type GradesImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  contextLabel: string
  context: GradesContextParams | null
  students?: GradeImportStudentSeed[]
  templateFileName?: string
}

export function GradesImportDialog({
  open,
  onOpenChange,
  contextLabel,
  context,
  students,
  templateFileName,
}: GradesImportDialogProps) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<ImportStep>(1)
  const [file, setFile] = useState<File | null>(null)
  const [downloadingTemplate, setDownloadingTemplate] = useState(false)
  const [updatedCount, setUpdatedCount] = useState(0)
  const [skippedCount, setSkippedCount] = useState(0)
  const [serverErrors, setServerErrors] = useState<GradeImportRowErrorDto[]>([])

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!context || !file) {
        throw new Error('Thiếu ngữ cảnh hoặc file import.')
      }
      return importGradeScores(context, file)
    },
    onSuccess: async (result) => {
      if (context) {
        await queryClient.invalidateQueries({
          queryKey: gradesKeys.book(context),
        })
        await queryClient.invalidateQueries({
          queryKey: gradesKeys.overview({
            schoolId: context.schoolId,
            academicYear: context.academicYear,
            semester: context.semester,
            classId: context.classId,
          }),
        })
      }

      const updated = result?.updatedCount ?? 0
      const skipped = result?.skippedCount ?? 0
      const errors = result?.errors ?? []
      setUpdatedCount(updated)
      setSkippedCount(skipped)
      setServerErrors(errors)
      setStep(3)

      if (updated > 0 && errors.length === 0) {
        showSuccessToast(`Đã cập nhật ${updated} học sinh.`)
      } else if (updated > 0) {
        showSuccessToast(
          `Đã cập nhật ${updated} học sinh · bỏ qua ${skipped} dòng.`,
        )
      } else {
        showErrorToast(
          `Không cập nhật được điểm nào. ${skipped} dòng bị bỏ qua.`,
        )
      }
    },
    onError: (error) => {
      showErrorToast(getApiErrorMessage(error, 'Import điểm thất bại.'))
    },
  })

  function reset() {
    setStep(1)
    setFile(null)
    setDownloadingTemplate(false)
    setUpdatedCount(0)
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
      if (context) {
        await downloadGradeImportTemplateFromApi(context)
      } else {
        downloadGradeImportTemplate({
          students,
          fileName: templateFileName,
        })
      }
      showSuccessToast('Đã tải template Excel bảng điểm.')
    } catch {
      downloadGradeImportTemplate({
        students,
        fileName: templateFileName,
      })
      showSuccessToast('Đã tải template Excel (local).')
    } finally {
      setDownloadingTemplate(false)
    }
  }

  function handleFileSelected(nextFile: File | undefined) {
    if (!nextFile) return
    const ext = nextFile.name.split('.').pop()?.toLowerCase()
    if (ext !== 'xlsx' && ext !== 'xlsm') {
      showErrorToast('Chỉ hỗ trợ file .xlsx hoặc .xlsm.')
      return
    }
    setFile(nextFile)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import bảng điểm</DialogTitle>
          <DialogDescription>{contextLabel}</DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 text-sm">
          {[1, 2, 3].map((item) => (
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
                  ? '② Xác nhận'
                  : '③ Kết quả'}
            </span>
          ))}
        </div>

        {step === 1 ? (
          <div className="grid gap-3 rounded-lg border border-dashed px-4 py-10 text-center">
            <FileSpreadsheet className="mx-auto size-8 text-muted-foreground" />
            <p className="text-sm font-medium">Chọn file Excel bảng điểm</p>
            <p className="text-xs text-muted-foreground">
              Cột: Mã học sinh · Họ và tên · TX1 · TX2 · TX3 · GK · CK
            </p>
            <div className="flex justify-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xlsm"
                className="hidden"
                onChange={(event) =>
                  handleFileSelected(event.target.files?.[0])
                }
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Chọn file
              </Button>
              <Button
                type="button"
                variant="link"
                disabled={downloadingTemplate}
                onClick={() => void handleDownloadTemplate()}
              >
                {downloadingTemplate ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Đang tải…
                  </>
                ) : (
                  'Tải template'
                )}
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
          <div className="rounded-lg border bg-muted/30 px-4 py-6 text-sm">
            <p>
              Sẵn sàng import file <strong>{file?.name}</strong>.
            </p>
            <p className="mt-1 text-muted-foreground">
              Hệ thống sẽ khớp theo mã học sinh và ghi đè điểm các cột có giá
              trị. Ô trống = xóa điểm cột đó.
            </p>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-3">
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <Check className="size-4" /> {updatedCount} đã cập nhật
              </span>
              <span className="inline-flex items-center gap-1 text-amber-600">
                <TriangleAlert className="size-4" /> {skippedCount} bỏ qua
              </span>
              <span className="inline-flex items-center gap-1 text-destructive">
                <X className="size-4" /> {serverErrors.length} lỗi
              </span>
            </div>
            {serverErrors.length > 0 ? (
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dòng</TableHead>
                      <TableHead>Mã lỗi</TableHead>
                      <TableHead>Chi tiết</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serverErrors.map((error, index) => (
                      <TableRow key={`${error.rowNumber}-${index}`}>
                        <TableCell>{error.rowNumber}</TableCell>
                        <TableCell>{error.errorCode}</TableCell>
                        <TableCell>{error.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Import hoàn tất, không có lỗi dòng.
              </p>
            )}
          </div>
        ) : null}

        <DialogFooter>
          {step === 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Hủy
            </Button>
          ) : step === 2 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              disabled={importMutation.isPending}
            >
              Quay lại
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Đóng
            </Button>
          )}

          {step === 1 ? (
            <Button
              type="button"
              disabled={!file}
              onClick={() => setStep(2)}
            >
              Tiếp tục
            </Button>
          ) : null}

          {step === 2 ? (
            <Button
              type="button"
              disabled={!file || !context || importMutation.isPending}
              onClick={() => importMutation.mutate()}
            >
              {importMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Đang import…
                </>
              ) : (
                'Import'
              )}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
