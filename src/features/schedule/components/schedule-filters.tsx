import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatAcademicYearLabel } from '../lib/map-schedule'
import type {
  ScheduleClassOption,
  ScheduleSubjectOption,
} from '../data/schema'

type ScheduleFiltersProps = {
  year: string
  academicYears: string[]
  classId: string
  kindFilter: string
  statusFilter: 'all' | 'pending'
  classes: ScheduleClassOption[]
  kindOptions: ScheduleSubjectOption[]
  onYearChange: (value: string) => void
  onClassChange: (value: string) => void
  onKindFilterChange: (value: string) => void
  onStatusFilterChange: (value: 'all' | 'pending') => void
}

export function ScheduleFilters({
  year,
  academicYears,
  classId,
  kindFilter,
  statusFilter,
  classes,
  kindOptions,
  onYearChange,
  onClassChange,
  onKindFilterChange,
  onStatusFilterChange,
}: ScheduleFiltersProps) {
  const showKindFilter = kindOptions.length > 1

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Năm học">
        <Select value={year} onValueChange={onYearChange}>
          <SelectTrigger className="w-full" aria-label="Chọn năm học">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {academicYears.map((item) => (
              <SelectItem key={item} value={item}>
                {formatAcademicYearLabel(item)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Lớp">
        <Select value={classId} onValueChange={onClassChange}>
          <SelectTrigger className="w-full" aria-label="Lọc theo lớp">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả lớp của tôi</SelectItem>
            {classes.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {showKindFilter ? (
        <Field label="Loại lịch">
          <Select value={kindFilter} onValueChange={onKindFilterChange}>
            <SelectTrigger className="w-full" aria-label="Lọc loại lịch">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {kindOptions.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      ) : null}

      <Field label="Trạng thái">
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            onStatusFilterChange(value as 'all' | 'pending')
          }
        >
          <SelectTrigger className="w-full" aria-label="Lọc trạng thái điểm danh">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="pending">Chưa điểm danh</SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}
