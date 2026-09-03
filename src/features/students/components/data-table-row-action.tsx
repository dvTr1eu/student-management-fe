import { useQueryClient } from '@tanstack/react-query'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Loader2, Trash2, UserPen, UserSearch } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { fetchStudentById } from '@/features/students/api/students-api'
import { mapDetail, type StudentListItem } from '../data/schema'
import { getApiErrorMessage } from '@/lib/api/get-api-error-message'
import { showErrorToast } from '@/lib/show-toast-message'
import { useSchoolStore } from '@/stores/school-store'
import { useStudents } from './students-provider'

type DataTableRowActionsProps = {
  row: Row<StudentListItem>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useStudents()
  const schoolId = useSchoolStore((s) => s.selectedSchool?.id)
  const [loadingAction, setLoadingAction] = useState<
    'view' | 'edit' | 'delete' | null
  >(null)
  const queryClient = useQueryClient()

  const openStudentDetail = async (action: 'view' | 'edit' | 'delete') => {
    if (!schoolId) {
      showErrorToast('Chưa chọn trường.')
      return
    }

    setLoadingAction(action)
    try {
      const detail = await queryClient.fetchQuery({
        queryKey: ['students', 'detail', row.original.id, schoolId],
        queryFn: () => fetchStudentById(row.original.id, schoolId),
      })
      setCurrentRow(mapDetail(detail))
      setOpen(action)
    } catch (error) {
      showErrorToast(
        getApiErrorMessage(error, 'Không thể tải thông tin học sinh.'),
      )
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          disabled={loadingAction !== null}
        >
          {loadingAction ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <DotsHorizontalIcon className="h-4 w-4" />
          )}
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => void openStudentDetail('view')}>
          Xem
          <DropdownMenuShortcut>
            <UserSearch size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void openStudentDetail('edit')}>
          Chỉnh sửa
          <DropdownMenuShortcut>
            <UserPen size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => void openStudentDetail('delete')}
          className="text-red-500!"
        >
          Xóa
          <DropdownMenuShortcut>
            <Trash2 size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
