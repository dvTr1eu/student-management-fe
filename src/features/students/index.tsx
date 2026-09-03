import { useEffect } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { fetchClassesBySchool } from '@/features/classes/api/classes-api'
import { classKeys } from '@/features/classes/api/query-keys'
import { fetchStudents } from '@/features/students/api/students-api'
import { studentKeys } from '@/features/students/api/query-keys'
import { mapListItem } from '@/features/students/data/schema'
import { useSchoolStore } from '@/stores/school-store'
import { StudentsDialogs } from './components/students-dialog'
import { StudentsPrimaryButtons } from './components/students-primary-buttons'
import { StudentsProvider, useStudents } from './components/students-provider'
import { StudentsTable } from './components/students-table'

const route = getRouteApi('/_authenticated/students/')

function StudentsContent() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const schoolId = useSchoolStore((s) => s.selectedSchool?.id)
  const { selectedClassId, setSelectedClassId } = useStudents()

  useEffect(() => {
    setSelectedClassId('')
  }, [schoolId, setSelectedClassId])

  const page = search.page ?? 1
  const pageSize = search.pageSize ?? 10
  const searchText = search.firstName?.trim() || undefined
  const sortDir = search.sortDir ?? 'asc'

  const classesQuery = useQuery({
    queryKey: classKeys.bySchool(schoolId ?? ''),
    queryFn: () => fetchClassesBySchool(schoolId!),
    enabled: !!schoolId,
  })

  const listParams = {
    schoolId: schoolId ?? '',
    classId: selectedClassId,
    search: searchText,
    sortBy: 'name' as const,
    sortDir,
    page,
    pageSize,
  }

  const studentsQuery = useQuery({
    queryKey: studentKeys.list(listParams),
    queryFn: () => fetchStudents(listParams),
    enabled: !!schoolId && !!selectedClassId,
  })

  const rows = (studentsQuery.data?.items ?? []).map(mapListItem)
  const totalCount = studentsQuery.data?.totalCount ?? 0
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize))

  if (!schoolId) {
    return (
      <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            DANH SÁCH HỌC SINH
          </h2>
          <p className="text-muted-foreground">
            Vui lòng chọn trường trước khi quản lý học sinh.
          </p>
        </div>
      </Main>
    )
  }

  return (
    <>
      <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              DANH SÁCH HỌC SINH
            </h2>
            <p className="text-muted-foreground">
              Quản lý thông tin học sinh của bạn ở đây.
            </p>
          </div>
          <StudentsPrimaryButtons />
        </div>
        <StudentsTable
          data={rows}
          classes={classesQuery.data ?? []}
          classesLoading={classesQuery.isLoading}
          listLoading={studentsQuery.isLoading || studentsQuery.isFetching}
          listError={studentsQuery.isError}
          pageCount={pageCount}
          totalCount={totalCount}
          search={search}
          navigate={navigate}
        />
      </Main>
      <StudentsDialogs classes={classesQuery.data ?? []} />
    </>
  )
}

export function Students() {
  return (
    <StudentsProvider>
      <Header fixed>
        <ThemeSwitch />
        <ConfigDrawer />
      </Header>
      <StudentsContent />
    </StudentsProvider>
  )
}
