import { ArrowLeft } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { type Class } from '../data/schema'
import { type WorkspaceTab } from './class-detail-types'

type ClassWorkspaceHeaderProps = {
  classItem: Class
  activeTab: WorkspaceTab
  onTabChange: (tab: WorkspaceTab) => void
}

const tabs: Array<{ value: WorkspaceTab; label: string }> = [
  { value: 'overview', label: 'Tổng quan' },
  { value: 'students', label: 'Học sinh' },
  { value: 'grades', label: 'Điểm' },
  { value: 'schedule', label: 'Lịch học' },
]

export function ClassWorkspaceHeader({
  classItem,
  activeTab,
  onTabChange,
}: ClassWorkspaceHeaderProps) {
  const navigate = useNavigate()

  return (
    <>
      <Button
        variant="ghost"
        className="w-fit"
        onClick={() => navigate({ to: '/classes' })}
      >
        <ArrowLeft />
        Lớp học
      </Button>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{classItem.name}</h2>
        <p className="text-muted-foreground">
          {classItem.grade} · {classItem.subject} · {classItem.studentCount} học
          sinh
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          GVCN: {classItem.homeroomTeacher}
        </p>
      </div>
      <div className="flex gap-1 overflow-x-auto border-b" role="tablist">
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            role="tab"
            aria-selected={activeTab === tab.value}
            variant={activeTab === tab.value ? 'secondary' : 'ghost'}
            className="shrink-0 rounded-b-none"
            onClick={() => onTabChange(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </>
  )
}
