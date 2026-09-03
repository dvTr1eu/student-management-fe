import type { TeacherSchoolAssignment } from '../lib/map-teachers'

type TeacherSchoolAssignmentsCellProps = {
  schools: TeacherSchoolAssignment[]
}

export function TeacherSchoolAssignmentsCell({
  schools,
}: TeacherSchoolAssignmentsCellProps) {
  if (schools.length === 0) {
    return <span className="text-sm text-muted-foreground">—</span>
  }

  return (
    <div className="grid min-w-56 gap-2.5">
      {schools.map((school) => {
        const taughtLabel =
          school.taughtClasses.length > 0
            ? school.taughtClasses.map((item) => item.name).join(', ')
            : '—'

        return (
          <div key={school.schoolId} className="text-sm leading-snug">
            <p className="font-medium">{school.schoolName}</p>
            <p className="text-muted-foreground">
              Lớp dạy: {taughtLabel}
            </p>
            <p className="text-muted-foreground">
              GVCN: {school.homeroomClass?.name?.trim() || '—'}
            </p>
          </div>
        )
      })}
    </div>
  )
}
