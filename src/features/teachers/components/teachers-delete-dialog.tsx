import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getApiErrorMessage } from '@/lib/api/get-api-error-message'
import { showErrorToast, showSuccessToast } from '@/lib/show-toast-message'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { teacherKeys } from '../api/query-keys'
import { deleteTeacher } from '../api/teachers-api'
import type { TeacherRow } from '../lib/map-teachers'

type TeachersDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  teacher: TeacherRow | null
}

export function TeachersDeleteDialog({
  open,
  onOpenChange,
  teacher,
}: TeachersDeleteDialogProps) {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!teacher) throw new Error('Thiếu giáo viên.')
      await deleteTeacher(teacher.id)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: teacherKeys.all })
      showSuccessToast(
        `Đã vô hiệu hóa giáo viên ${teacher?.name ?? ''}.`,
      )
      onOpenChange(false)
    },
    onError: (error) => {
      showErrorToast(getApiErrorMessage(error, 'Không thể xóa giáo viên.'))
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>ở 
          <DialogTitle>Vô hiệu hóa giáo viên</DialogTitle>
          <DialogDescription>
            Vô hiệu <strong>{teacher?.name}</strong> ({teacher?.email})? Tài
            khoản sẽ không đăng nhập được. Nếu đang GVCN lớp
            Active hoặc còn tiết dạy, hệ thống sẽ từ chối.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={deleteMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Đang xử lý…
              </>
            ) : (
              'Vô hiệu hóa'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
