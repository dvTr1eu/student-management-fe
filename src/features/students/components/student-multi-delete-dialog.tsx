import { ConfirmDialog } from '@/components/confirm-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { studentKeys } from '@/features/students/api/query-keys'
import { bulkDeleteStudents } from '@/features/students/api/students-api'
import { getApiErrorMessage } from '@/lib/api/get-api-error-message'
import { showErrorToast, showSuccessToast } from '@/lib/show-toast-message'
import { useSchoolStore } from '@/stores/school-store'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useState } from 'react'
import type { StudentListItem } from '../data/schema'

type StudentsMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

const CONFIRM_WORD = 'DELETE'

export function StudentsMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: StudentsMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState('')
  const queryClient = useQueryClient()
  const schoolId = useSchoolStore((s) => s.selectedSchool?.id)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const mutation = useMutation({
    mutationFn: async () => {
      if (!schoolId) throw new Error('Chưa chọn trường.')
      const studentIds = selectedRows.map(
        (row) => (row.original as StudentListItem).id,
      )
      return bulkDeleteStudents({ schoolId, studentIds })
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: studentKeys.lists() })
      const count = result?.deletedCount ?? selectedRows.length
      setValue('')
      table.resetRowSelection()
      onOpenChange(false)
      showSuccessToast(`Đã vô hiệu hóa ${count} học sinh.`)
    },
    onError: (error) => {
      showErrorToast(getApiErrorMessage(error, 'Không thể xóa học sinh.'))
    },
  })

  const handleDelete = () => {
    if (value.trim() !== CONFIRM_WORD) {
      showErrorToast(`Vui lòng nhập "${CONFIRM_WORD}" để xác nhận.`)
      return
    }
    mutation.mutate()
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setValue('')
        onOpenChange(next)
      }}
      form="users-multi-delete-form"
      disabled={value.trim() !== CONFIRM_WORD || mutation.isPending}
      title={
        <span className="text-destructive">
          <AlertTriangle
            className="me-1 inline-block stroke-destructive"
            size={18}
          />{' '}
          Xóa {selectedRows.length} học sinh
        </span>
      }
      desc={
        <form
          id="users-multi-delete-form"
          onSubmit={(e) => {
            e.preventDefault()
            handleDelete()
          }}
          className="space-y-4"
        >
          <p className="mb-2">
            Bạn có chắc chắn muốn xóa các học sinh đã chọn?
            <br />
            Học sinh sẽ bị đánh dấu không hoạt động.
          </p>

          <Label className="my-4 flex flex-col items-start gap-1.5">
            <span>Xác nhận bằng cách nhập &quot;{CONFIRM_WORD}&quot;:</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Type "${CONFIRM_WORD}" to confirm.`}
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
