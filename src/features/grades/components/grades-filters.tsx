import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { GradeClass, GradeSubject } from '../data/schema'
import {
  formatAcademicYearLabel,
  GRADES_SEMESTERS,
} from '../lib/map-grades'

const ALL_SUBJECTS = 'all'

type GradesFiltersProps = {
  year: string
  academicYears: string[]
  semester: string
  classId: string
  subjectId: string
  classes: GradeClass[]
  subjects: GradeSubject[]
  onYearChange: (value: string) => void
  onSemesterChange: (value: string) => void
  onClassChange: (value: string) => void
  onSubjectChange: (value: string) => void
}

export function GradesFilters({
  year,
  academicYears,
  semester,
  classId,
  subjectId,
  classes,
  subjects,
  onYearChange,
  onSemesterChange,
  onClassChange,
  onSubjectChange,
}: GradesFiltersProps) {
  const selectedClass = classes.find((item) => item.id === classId)
  const availableSubjects = getAvailableSubjects(selectedClass, subjects)

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <FilterField label="Năm học">
        <Select value={year} onValueChange={onYearChange}>
          <SelectTrigger className="w-full" aria-label="Chọn năm học">
            <SelectValue placeholder="Chọn năm học" />
          </SelectTrigger>
          <SelectContent>
            {academicYears.map((item) => (
              <SelectItem key={item} value={item}>
                {formatAcademicYearLabel(item)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Học kỳ">
        <Select value={semester} onValueChange={onSemesterChange}>
          <SelectTrigger className="w-full" aria-label="Chọn học kỳ">
            <SelectValue placeholder="Chọn học kỳ" />
          </SelectTrigger>
          <SelectContent>
            {GRADES_SEMESTERS.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Lớp">
        <Select
          value={classId || undefined}
          onValueChange={(value) => {
            onClassChange(value)
            const nextClass = classes.find((item) => item.id === value)
            if (!nextClass) return
            const nextSubjects = getAvailableSubjects(nextClass, subjects)
            if (nextClass.isHomeroom) {
              onSubjectChange(ALL_SUBJECTS)
            } else if (!nextSubjects.some((s) => s.id === subjectId)) {
              onSubjectChange(nextSubjects[0]?.id ?? '')
            }
          }}
        >
          <SelectTrigger className="w-full" aria-label="Chọn lớp">
            <SelectValue placeholder="Chọn lớp" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
                {item.isHomeroom ? ' · GVCN' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Môn">
        <Select
          value={subjectId || undefined}
          onValueChange={onSubjectChange}
          disabled={!classId}
        >
          <SelectTrigger className="w-full" aria-label="Chọn môn">
            <SelectValue placeholder="Chọn môn" />
          </SelectTrigger>
          <SelectContent>
            {selectedClass?.isHomeroom ? (
              <SelectItem value={ALL_SUBJECTS}>Tất cả môn</SelectItem>
            ) : null}
            {availableSubjects.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>
    </div>
  )
}

export { ALL_SUBJECTS }

function FilterField({
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

function getAvailableSubjects(
  gradeClass: GradeClass | undefined,
  subjects: GradeSubject[],
) {
  if (!gradeClass) return []
  return subjects.filter((subject) =>
    gradeClass.subjectIds.includes(subject.id),
  )
}
