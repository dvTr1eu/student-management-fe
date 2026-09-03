import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getApiErrorMessage } from '@/lib/api/get-api-error-message'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Pencil, Plus, Trash2, UserCog } from 'lucide-react'
import { useDeferredValue, useMemo, useState } from 'react'
import { teacherKeys } from './api/query-keys'
import { fetchTeachers } from './api/teachers-api'
import { TeachersActionDialog } from './components/teachers-action-dialog'
import { TeachersDeleteDialog } from './components/teachers-delete-dialog'
import { TeacherSchoolAssignmentsCell } from './components/teacher-school-assignments-cell'
import { mapTeacherListItem, type TeacherRow } from './lib/map-teachers'

export function Teachers() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query.trim())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TeacherRow | null>(null)
  const [deleting, setDeleting] = useState<TeacherRow | null>(null)

  const listQuery = useQuery({
    queryKey: teacherKeys.list({
      search: deferredQuery || undefined,
      status: 'All',
    }),
    queryFn: async () => {
      const rows = await fetchTeachers({
        search: deferredQuery || undefined,
        status: 'All',
      })
      return rows.map(mapTeacherListItem)
    },
  })

  const teachers = listQuery.data ?? []

  const emptyMessage = useMemo(() => {
    if (listQuery.isLoading) return 'Đang tải…'
    if (deferredQuery) return 'Không tìm thấy giáo viên phù hợp.'
    return 'Không có giáo viên.'
  }, [listQuery.isLoading, deferredQuery])

  return (
    <>
      <Header>
        <ThemeSwitch />
        <ConfigDrawer />
      </Header>

      <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <UserCog className="size-6" />
              Quản lý giáo viên
            </h1>
          </div>
          <Button
            type="button"
            onClick={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
          >
            <Plus />
            Thêm giáo viên
          </Button>
        </div>

        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm theo tên, email, môn, mã…"
          className="max-w-sm"
          aria-label="Tìm giáo viên"
        />

        {listQuery.isError ? (
          <p className="text-sm text-destructive">
            {getApiErrorMessage(
              listQuery.error,
              'Không thể tải danh sách giáo viên.',
            )}
          </p>
        ) : null}

        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Email đăng nhập</TableHead>
                <TableHead>Bộ môn</TableHead>
                <TableHead>Phân công theo trường</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-end">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listQuery.isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Đang tải…
                    </span>
                  </TableCell>
                </TableRow>
              ) : teachers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">
                      {teacher.accountNo}
                    </TableCell>
                    <TableCell>{teacher.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {teacher.email}
                    </TableCell>
                    <TableCell>{teacher.subjectName}</TableCell>
                    <TableCell className="align-top">
                      <TeacherSchoolAssignmentsCell schools={teacher.schools} />
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex rounded-md px-2 py-0.5 text-xs font-medium',
                          teacher.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-700'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {teacher.status === 'active' ? 'Hoạt động' : 'Ngưng'}
                      </span>
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="inline-flex gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label={`Sửa ${teacher.name}`}
                          onClick={() => {
                            setEditing(teacher)
                            setDialogOpen(true)
                          }}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          disabled={teacher.status === 'inactive'}
                          aria-label={`Vô hiệu ${teacher.name}`}
                          onClick={() => setDeleting(teacher)}
                        >
                          <Trash2 className="text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Main>

      <TeachersActionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        teacher={editing}
      />

      <TeachersDeleteDialog
        open={Boolean(deleting)}
        teacher={deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
      />
    </>
  )
}
