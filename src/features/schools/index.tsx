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
import { Loader2, Pencil, Plus, School as SchoolIcon, Trash2 } from 'lucide-react'
import { useDeferredValue, useMemo, useState } from 'react'
import { schoolKeys } from './api/query-keys'
import { fetchSchools } from './api/schools-api'
import { SchoolsActionDialog } from './components/schools-action-dialog'
import { SchoolsDeleteDialog } from './components/schools-delete-dialog'
import { mapSchoolListItem, type SchoolRow } from './lib/map-schools'

export function Schools() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query.trim())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<SchoolRow | null>(null)
  const [deleting, setDeleting] = useState<SchoolRow | null>(null)

  const search = deferredQuery

  const listQuery = useQuery({
    queryKey: schoolKeys.list({
      search: search || undefined,
      status: 'All',
      includeTeacherCount: true,
    }),
    queryFn: async () => {
      const rows = await fetchSchools({
        search: search || undefined,
        status: 'All',
        includeTeacherCount: true,
      })
      return rows.map(mapSchoolListItem)
    },
  })

  const schools = listQuery.data ?? []

  const emptyMessage = useMemo(() => {
    if (listQuery.isLoading) return 'Đang tải…'
    if (search) return 'Không tìm thấy trường phù hợp.'
    return 'Không có trường học.'
  }, [listQuery.isLoading, search])

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
              <SchoolIcon className="size-6" />
              Quản lý trường học
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
            Thêm trường
          </Button>
        </div>

        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm theo tên, mã, địa chỉ…"
          className="max-w-sm"
          aria-label="Tìm trường"
        />

        {listQuery.isError ? (
          <p className="text-sm text-destructive">
            {getApiErrorMessage(
              listQuery.error,
              'Không thể tải danh sách trường.',
            )}
          </p>
        ) : null}

        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Tên trường</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>Giáo viên</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-end">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listQuery.isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Đang tải danh sách trường…
                    </span>
                  </TableCell>
                </TableRow>
              ) : schools.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                schools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">{school.code}</TableCell>
                    <TableCell>{school.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {school.address || '—'}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {school.teacherCount}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex rounded-md px-2 py-0.5 text-xs font-medium',
                          school.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-700'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {school.status === 'active' ? 'Hoạt động' : 'Ngưng'}
                      </span>
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="inline-flex gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label={`Sửa ${school.name}`}
                          onClick={() => {
                            setEditing(school)
                            setDialogOpen(true)
                          }}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label={`Xóa ${school.name}`}
                          onClick={() => setDeleting(school)}
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

      <SchoolsActionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        school={editing}
      />

      <SchoolsDeleteDialog
        open={Boolean(deleting)}
        school={deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
      />
    </>
  )
}
