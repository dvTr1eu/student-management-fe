import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { fetchClasses } from '@/features/classes/api/classes-api'
import { classKeys } from '@/features/classes/api/query-keys'
import { ClassesActionDialog } from '@/features/classes/components/classes-action-dialog'
import { ClassesDeleteDialog } from '@/features/classes/components/classes-delete-dialog'
import { mapClassItem, type Class } from '@/features/classes/data/schema'
import { schoolKeys } from '@/features/schools/api/query-keys'
import { fetchSchools } from '@/features/schools/api/schools-api'
import { getApiErrorMessage } from '@/lib/api/get-api-error-message'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import {
  BookOpenText,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { useDeferredValue, useEffect, useMemo, useState } from 'react'

const ACADEMIC_YEARS = ['2025-2026', '2026-2027', '2024-2025'] as const
const GRADES = ['all', 'Khối 10', 'Khối 11', 'Khối 12'] as const

export function AdminClasses() {
  const [schoolId, setSchoolId] = useState('')
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query.trim())
  const [grade, setGrade] = useState('all')
  const [academicYear, setAcademicYear] = useState('all')
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'All'>('Active')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Class | null>(null)
  const [deleting, setDeleting] = useState<Class | null>(null)

  const schoolsQuery = useQuery({
    queryKey: schoolKeys.list({ status: 'Active', includeTeacherCount: false }),
    queryFn: () =>
      fetchSchools({ status: 'Active', includeTeacherCount: false }),
  })

  const schools = useMemo(() => schoolsQuery.data ?? [], [schoolsQuery.data])

  useEffect(() => {
    if (!schoolId && schools.length > 0) {
      setSchoolId(schools[0]!.id)
    }
  }, [schoolId, schools])

  const listParams = {
    schoolId,
    academicYear: academicYear === 'all' ? undefined : academicYear,
    grade: grade === 'all' ? undefined : grade,
    search: deferredQuery || undefined,
    status,
  }

  const classesQuery = useQuery({
    queryKey: classKeys.list(listParams),
    queryFn: async () => {
      const rows = await fetchClasses(listParams)
      return rows.map(mapClassItem)
    },
    enabled: Boolean(schoolId),
  })

  const classes = classesQuery.data ?? []
  const selectedSchoolName =
    schools.find((item) => item.id === schoolId)?.name ?? ''

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
              <BookOpenText className="size-6" />
              Quản lý lớp học
            </h1>
          </div>
          <Button
            type="button"
            disabled={!schoolId}
            onClick={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
          >
            <Plus />
            Thêm lớp
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={schoolId || undefined}
            onValueChange={setSchoolId}
            disabled={schoolsQuery.isLoading || schools.length === 0}
          >
            <SelectTrigger className="w-[220px]" aria-label="Chọn trường">
              <SelectValue placeholder="Chọn trường" />
            </SelectTrigger>
            <SelectContent>
              {schools.map((school) => (
                <SelectItem key={school.id} value={school.id}>
                  {school.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={academicYear} onValueChange={setAcademicYear}>
            <SelectTrigger className="w-44" aria-label="Năm học">
              <SelectValue placeholder="Năm học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả năm học</SelectItem>
              {ACADEMIC_YEARS.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={status}
            onValueChange={(value) =>
              setStatus(value as 'Active' | 'Inactive' | 'All')
            }
          >
            <SelectTrigger className="w-40" aria-label="Trạng thái">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Đang hoạt động</SelectItem>
              <SelectItem value="Inactive">Ngưng</SelectItem>
              <SelectItem value="All">Tất cả</SelectItem>
            </SelectContent>
          </Select>

          {GRADES.map((item) => (
            <Button
              key={item}
              type="button"
              size="sm"
              variant={grade === item ? 'secondary' : 'ghost'}
              onClick={() => setGrade(item)}
            >
              {item === 'all' ? 'Tất cả khối' : item}
            </Button>
          ))}

          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm lớp…"
            className="ms-auto max-w-xs"
            aria-label="Tìm lớp"
          />
        </div>

        {schoolsQuery.isError ? (
          <p className="text-sm text-destructive">
            {getApiErrorMessage(
              schoolsQuery.error,
              'Không thể tải danh sách trường.',
            )}
          </p>
        ) : null}

        {!schoolsQuery.isLoading && schools.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Chưa có trường đang hoạt động. Hãy thêm trường trước.
          </p>
        ) : null}

        {schoolId ? (
          <p className="text-xs text-muted-foreground">
            Đang xem lớp của <span className="font-medium">{selectedSchoolName}</span>
          </p>
        ) : null}

        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên lớp</TableHead>
                <TableHead>Khối</TableHead>
                <TableHead>Năm học</TableHead>
                <TableHead>GVCN</TableHead>
                <TableHead>Học sinh</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-end">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!schoolId ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Chọn trường để xem lớp.
                  </TableCell>
                </TableRow>
              ) : classesQuery.isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Đang tải lớp…
                    </span>
                  </TableCell>
                </TableRow>
              ) : classesQuery.isError ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-destructive"
                  >
                    {getApiErrorMessage(
                      classesQuery.error,
                      'Không thể tải danh sách lớp.',
                    )}
                  </TableCell>
                </TableRow>
              ) : classes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Không có lớp phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.grade}</TableCell>
                    <TableCell>{item.academicYear}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.homeroomTeacher || '—'}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {item.studentCount}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex rounded-md px-2 py-0.5 text-xs font-medium',
                          item.status.toLowerCase() === 'active'
                            ? 'bg-emerald-500/15 text-emerald-700'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {item.status.toLowerCase() === 'active'
                          ? 'Hoạt động'
                          : 'Ngưng'}
                      </span>
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="inline-flex gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label={`Sửa ${item.name}`}
                          onClick={() => {
                            setEditing(item)
                            setDialogOpen(true)
                          }}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label={`Xóa ${item.name}`}
                          disabled={item.status.toLowerCase() !== 'active'}
                          onClick={() => setDeleting(item)}
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

      <ClassesActionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        currentRow={editing}
        schoolId={schoolId}
      />

      {deleting ? (
        <ClassesDeleteDialog
          open={Boolean(deleting)}
          onOpenChange={(open) => {
            if (!open) setDeleting(null)
          }}
          currentRow={deleting}
          schoolId={schoolId}
          redirectTo={null}
        />
      ) : null}
    </>
  )
}
