import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
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
import { deleteSchool } from '../api/schools-api'
import { schoolKeys } from '../api/query-keys'
import type { SchoolRow } from '../lib/map-schools'

type SchoolsDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  school: SchoolRow | null
}

export function SchoolsDeleteDialog({
  open,
  onOpenChange,
  school,
}: SchoolsDeleteDialogProps) {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!school) throw new Error('Thiếu trường cần xóa.')
      await deleteSchool(school.id)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: schoolKeys.all })
      showSuccessToast(`Đã xóa trường ${school?.name ?? ''}.`)
      onOpenChange(false)
    },
    onError: (error) => {
      showErrorToast(getApiErrorMessage(error, 'Không thể xóa trường.'))
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xóa trường học</DialogTitle>
          <DialogDescription>
            Xóa <strong>{school?.name}</strong>
            {school && school.teacherCount > 0
              ? ` · đang gắn ${school.teacherCount} giáo viên`
              : ''}
            ? Nếu còn lớp/học sinh/tiết/điểm, hãy chuyển trạng thái Ngưng thay vì
            xóa.
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
                Đang xóa…
              </>
            ) : (
              'Xóa'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
