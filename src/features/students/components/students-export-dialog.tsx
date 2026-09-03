import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ClassListItem } from '@/features/classes/api/classes-api'
import { exportStudents } from '@/features/students/api/students-api'
import { STUDENT_IMPORT_HEADERS } from '@/features/students/lib/student-import'
import { getApiErrorMessage } from '@/lib/api/get-api-error-message'
import { cn } from '@/lib/utils'
import { showErrorToast, showSuccessToast } from '@/lib/show-toast-message'

type ExportStep = 1 | 2

type StudentsExportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  schoolId: string
  schoolName: string
  classes: ClassListItem[]
  defaultClassId?: string
}

export function StudentsExportDialog({
  open,
  onOpenChange,
  schoolId,
  schoolName,
  classes,
  defaultClassId = 'all',
}: StudentsExportDialogProps) {
  const [step, setStep] = useState<ExportStep>(1)
  const [scope, setScope] = useState(defaultClassId)
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx')

  const exportMutation = useMutation({
    mutationFn: exportStudents,
    onSuccess: () => {
      showSuccessToast('Đã xuất danh sách học sinh.')
      handleOpenChange(false)
    },
    onError: (error) => {
      showErrorToast(getApiErrorMessage(error, 'Export học sinh thất bại.'))
    },
  })

  function reset() {
    setStep(1)
    setScope(defaultClassId)
    setFormat('xlsx')
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

  function handleContinue() {
    if (step === 1) {
      setStep(2)
      return
    }
    if (!schoolId) {
      showErrorToast('Chưa chọn trường.')
      return
    }

    void exportMutation.mutateAsync({
      schoolId,
      classId: scope === 'all' ? undefined : scope,
      format,
      status: 'Active',
    })
  }

  const scopeLabel =
    scope === 'all'
      ? 'Tất cả học sinh'
      : (classes.find((c) => c.id === scope)?.name ?? scope)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setScope(defaultClassId)
        handleOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xuất danh sách học sinh</DialogTitle>
          <DialogDescription>
            File dùng cùng 12 cột với template import.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
          <p>
            <span className="text-muted-foreground">Trường: </span>
            <span className="font-medium">{schoolName || '—'}</span>
          </p>
        </div>

        <div className="flex gap-2 text-sm">
          {[1, 2].map((item) => (
            <span
              key={item}
              className={cn(
                'rounded-full px-2.5 py-0.5',
                step === item
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {item === 1 ? '① Tuỳ chọn' : '② Xác nhận'}
            </span>
          ))}
        </div>

        {step === 1 ? (
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>Phạm vi xuất</Label>
              <Select value={scope} onValueChange={setScope}>
                <SelectTrigger aria-label="Phạm vi xuất">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả học sinh</SelectItem>
                  {classes.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      Lớp {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Định dạng</Label>
              <Select
                value={format}
                onValueChange={(value) => setFormat(value as 'xlsx' | 'csv')}
              >
                <SelectTrigger aria-label="Định dạng file">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              Cột xuất: {STUDENT_IMPORT_HEADERS.join(' · ')}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-3 rounded-lg border bg-muted/30 px-4 py-6 text-sm">
            <div className="flex items-start gap-3">
              <FileSpreadsheet className="mt-0.5 size-5 text-muted-foreground" />
              <div className="grid gap-1">
                <p>
                  Xuất <strong>{scopeLabel}</strong> của{' '}
                  <strong>{schoolName}</strong>
                </p>
                <p className="text-muted-foreground">
                  Định dạng {format === 'xlsx' ? 'Excel (.xlsx)' : 'CSV (.csv)'}{' '}
                  · trạng thái đang học
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              disabled={exportMutation.isPending}
              onClick={() => setStep(1)}
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
          <Button
            type="button"
            disabled={exportMutation.isPending || (step === 2 && !schoolId)}
            onClick={handleContinue}
          >
            {exportMutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : step === 2 ? (
              <Download />
            ) : null}
            {step === 2 ? 'Xuất file' : 'Tiếp tục'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
