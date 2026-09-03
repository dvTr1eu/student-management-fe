import { ConfirmDialog } from '@/components/confirm-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { studentKeys } from '@/features/students/api/query-keys'
import { deleteStudent } from '@/features/students/api/students-api'
import { getApiErrorMessage } from '@/lib/api/get-api-error-message'
import { showErrorToast, showSuccessToast } from '@/lib/show-toast-message'
import { useSchoolStore } from '@/stores/school-store'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { type StudentDetail } from '../data/schema'

type StudentDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: StudentDetail
}

export function StudentsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: StudentDeleteDialogProps) {
  const [value, setValue] = useState('')
  const queryClient = useQueryClient()
  const schoolId = useSchoolStore((s) => s.selectedSchool?.id)
  const confirmValue = currentRow.studentCode || currentRow.email

  const mutation = useMutation({
    mutationFn: async () => {
      if (!schoolId) throw new Error('Chưa chọn trường.')
      await deleteStudent(currentRow.id, schoolId)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: studentKeys.lists() })
      setValue('')
      onOpenChange(false)
      showSuccessToast('Học sinh đã được vô hiệu hóa.')
    },
    onError: (error) => {
      showErrorToast(getApiErrorMessage(error, 'Không thể xóa học sinh.'))
    },
  })

  const handleDelete = () => {
    if (value.trim() !== confirmValue) return
    mutation.mutate()
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setValue('')
        onOpenChange(next)
      }}
      form="users-delete-form"
      disabled={value.trim() !== confirmValue || mutation.isPending}
      title={
        <span className="text-destructive">
          <AlertTriangle
            className="me-1 inline-block stroke-destructive"
            size={18}
          />{' '}
          Xóa học sinh
        </span>
      }
      desc={
        <form
          id="users-delete-form"
          onSubmit={(e) => {
            e.preventDefault()
            handleDelete()
          }}
          className="space-y-4"
        >
          <p className="mb-2">
            Bạn có chắc chắn muốn xóa học sinh{' '}
            <span className="font-bold">
              {currentRow.lastName} {currentRow.firstName}
            </span>{' '}
            (mã <span className="font-bold">{confirmValue}</span>)?
            <br />
            Học sinh sẽ bị đánh dấu không hoạt động.
          </p>

          <Label className="my-2">
            Nhập mã học sinh để xác nhận:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={confirmValue}
              autoFocus
            />
          </Label>

          <Alert variant="destructive">
            <AlertTitle>Cảnh báo!</AlertTitle>
            <AlertDescription>
              Hãy cẩn thận, hành động này sẽ ẩn học sinh khỏi danh sách đang học.
            </AlertDescription>
          </Alert>
        </form>
      }
      confirmText={
        mutation.isPending ? (
          <>
            <Loader2 className="animate-spin" /> Đang xóa
          </>
        ) : (
          'Xóa'
        )
      }
      destructive
    />
  )
}
