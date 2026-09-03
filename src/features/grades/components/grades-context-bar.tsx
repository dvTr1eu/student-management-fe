import type { GradeClass, GradeSubject } from '../data/schema'
import {
  formatAcademicYearLabel,
  GRADES_SEMESTERS,
} from '../lib/map-grades'
import { ALL_SUBJECTS } from './grades-filters'

type GradesContextBarProps = {
  year: string
  semester: string
  classId: string
  subjectId: string
  classes: GradeClass[]
  subjects: GradeSubject[]
}

export function GradesContextBar({
  year,
  semester,
  classId,
  subjectId,
  classes,
  subjects,
}: GradesContextBarProps) {
  const className = classes.find((item) => item.id === classId)?.name
  const semesterLabel = GRADES_SEMESTERS.find(
    (item) => item.id === semester,
  )?.label
  const subjectLabel =
    subjectId === ALL_SUBJECTS
      ? 'Tất cả môn'
      : subjects.find((item) => item.id === subjectId)?.name

  if (!className || !subjectLabel) return null

  return (
    <p className="text-sm text-muted-foreground">
      <span className="text-foreground">{formatAcademicYearLabel(year)}</span>
      <span className="mx-1.5">›</span>
      <span className="text-foreground">{semesterLabel}</span>
      <span className="mx-1.5">›</span>
      <span className="text-foreground">{className}</span>
      <span className="mx-1.5">›</span>
      <span className="font-medium text-foreground">{subjectLabel}</span>
    </p>
  )
}
