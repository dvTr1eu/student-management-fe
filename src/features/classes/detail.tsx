import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { fetchClassById } from '@/features/classes/api/classes-api'
import { classKeys } from '@/features/classes/api/query-keys'
import { useSchoolStore } from '@/stores/school-store'
import { ClassOverview } from './components/class-overview'
import { ClassStudentsPanel } from './components/class-students-panel'
import { ClassSummaryPanel } from './components/class-summary-panel'
import { ClassWorkspaceHeader } from './components/class-workspace-header'
import { type WorkspaceTab } from './components/class-detail-types'
import { mapClassItem } from './data/schema'

const route = getRouteApi('/_authenticated/classes/$classId')

export function ClassDetail() {
  const { classId } = route.useParams()
  const schoolId = useSchoolStore((s) => s.selectedSchool?.id)
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview')

  const detailQuery = useQuery({
    queryKey: classKeys.detail(classId, schoolId ?? ''),
    queryFn: () => fetchClassById(classId, schoolId!),
    enabled: !!schoolId && !!classId,
  })

  const classItem = detailQuery.data
    ? mapClassItem(detailQuery.data)
    : null

  return (
    <>
      <Header fixed>
        <ThemeSwitch />
        <ConfigDrawer />
      </Header>
      {!schoolId ? (
        <Main>
          <p className="text-muted-foreground">
            Vui lòng chọn trường trước khi xem lớp học.
          </p>
        </Main>
      ) : detailQuery.isLoading ? (
        <Main className="flex flex-1 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </Main>
      ) : detailQuery.isError || !classItem ? (
        <Main>
          <p className="text-destructive">
            {detailQuery.error instanceof Error
              ? detailQuery.error.message
              : 'Không tìm thấy lớp học.'}
          </p>
        </Main>
      ) : (
        <Main className="flex flex-1 flex-col gap-5 sm:gap-6">
          <ClassWorkspaceHeader
            classItem={classItem}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          {activeTab === 'overview' && <ClassOverview classItem={classItem} />}
          {activeTab === 'students' && (
            <ClassStudentsPanel classItem={classItem} />
          )}
          {activeTab !== 'overview' && activeTab !== 'students' && (
            <ClassSummaryPanel type={activeTab} classItem={classItem} />
          )}
        </Main>
      )}
    </>
  )
}
