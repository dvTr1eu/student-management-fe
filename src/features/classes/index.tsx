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
import { fetchClasses } from '@/features/classes/api/classes-api'
import { classKeys } from '@/features/classes/api/query-keys'
import { useSchoolStore } from '@/stores/school-store'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Search } from 'lucide-react'
import { useState } from 'react'
import { ClassCard } from './components/class-card'
import { mapClassItem } from './data/schema'

const ACADEMIC_YEARS = ['2025-2026', '2026-2027', '2024-2025'] as const
const GRADES = ['all', 'Khối 10', 'Khối 11', 'Khối 12'] as const

export function Classes() {
  const schoolId = useSchoolStore((s) => s.selectedSchool?.id)
  const [query, setQuery] = useState('')
  const [grade, setGrade] = useState('all')
  const [academicYear, setAcademicYear] = useState('all')

  const listParams = {
    schoolId: schoolId ?? '',
    academicYear: academicYear === 'all' ? undefined : academicYear,
    grade: grade === 'all' ? undefined : grade,
    search: query.trim() || undefined,
    status: 'Active' as const,
  }

  const classesQuery = useQuery({
    queryKey: classKeys.list(listParams),
    queryFn: () => fetchClasses(listParams),
    enabled: !!schoolId,
  })

  const classes = (classesQuery.data ?? []).map(mapClassItem)

  return (
    <>
      <Header fixed>
        <ThemeSwitch />
        <ConfigDrawer />
      </Header>
      <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
        {!schoolId ? (
          <div>
            <h2 className="text-2xl font-bold tracking-tight">LỚP HỌC</h2>
            <p className="text-muted-foreground">
              Vui lòng chọn trường trước khi xem lớp học.
            </p>
          </div>
        ) : (
          <>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">LỚP HỌC</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger className="w-44" aria-label="Chọn năm học">
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
              {GRADES.map((item) => (
                <Button
                  key={item}
                  variant={grade === item ? 'secondary' : 'ghost'}
                  onClick={() => setGrade(item)}
                >
                  {item === 'all' ? 'Tất cả' : item}
                </Button>
              ))}
              <div className="ms-auto flex items-center gap-2">
                <Search className="size-4 text-muted-foreground" />
                <Input
                  className="h-8 w-44"
                  placeholder="Tìm lớp..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
            </div>
            {classesQuery.isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : classesQuery.isError ? (
              <p className="text-sm text-destructive">
                {classesQuery.error instanceof Error
                  ? classesQuery.error.message
                  : 'Không thể tải danh sách lớp.'}
              </p>
            ) : classes.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Không có lớp nào phù hợp.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {classes.map((classItem) => (
                  <ClassCard key={classItem.id} classItem={classItem} />
                ))}
              </div>
            )}
          </>
        )}
      </Main>
    </>
  )
}
