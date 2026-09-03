import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { deleteClass } from '@/features/classes/api/classes-api'
import { classKeys } from '@/features/classes/api/query-keys'
import { getApiErrorMessage } from '@/lib/api/get-api-error-message'
import { showErrorToast, showSuccessToast } from '@/lib/show-toast-message'
import { useSchoolStore } from '@/stores/school-store'
import { type Class } from '../data/schema'

type ClassesDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Class
  /** Admin passes explicit school; teacher screen falls back to selected school. */
  schoolId?: string
  /** Where to go after delete (default /classes). Pass null to stay. */
  redirectTo?: '/classes' | '/admin/classes' | null
}

export function ClassesDeleteDialog({
  open,
  onOpenChange,
  currentRow,
  schoolId: schoolIdProp,
  redirectTo = '/classes',
}: ClassesDeleteDialogProps) {
  const [value, setValue] = useState('')
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const selectedSchoolId = useSchoolStore((s) => s.selectedSchool?.id)
  const schoolId = schoolIdProp || selectedSchoolId

  const mutation = useMutation({
    mutationFn: async () => {
      if (!schoolId) throw new Error('Chưa chọn trường.')
      await deleteClass(currentRow.id, schoolId)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: classKeys.all })
      setValue('')
      onOpenChange(false)
      showSuccessToast('Lớp đã được vô hiệu hóa.')
      if (redirectTo) {
        void navigate({ to: redirectTo })
      }
    },
    onError: (error) => {
      showErrorToast(getApiErrorMessage(error, 'Không thể xóa lớp.'))
    },
  })

  const handleDelete = () => {
    if (value.trim() !== currentRow.name) return
    mutation.mutate()
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setValue('')
        onOpenChange(next)
      }}
      form="classes-delete-form"
      disabled={value.trim() !== currentRow.name || mutation.isPending}
      title={
        <span className="text-destructive">
          <AlertTriangle
            className="me-1 inline-block stroke-destructive"
            size={18}
          />{' '}
          Xóa lớp
        </span>
      }
      desc={
        <form
          id="classes-delete-form"
          onSubmit={(e) => {
            e.preventDefault()
            handleDelete()
          }}
          className="space-y-4"
        >
          <p className="mb-2">
            Bạn có chắc chắn muốn xóa lớp{' '}
            <span className="font-bold">{currentRow.name}</span>?
            <br />
            Lớp sẽ bị đánh dấu không hoạt động. Không thể xóa nếu còn học sinh
            đang học hoặc còn tiết học.
          </p>

          <Label className="my-2">
            Nhập tên lớp để xác nhận:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={currentRow.name}
              autoFocus
            />
          </Label>

          <Alert variant="destructive">
            <AlertTitle>Cảnh báo!</AlertTitle>
            <AlertDescription>
              Không thể xóa nếu lớp còn học sinh đang học hoặc còn tiết trên lịch.
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
