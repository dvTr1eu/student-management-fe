import { StudentsActionDialog } from './students-action-dialog'
import { StudentsDeleteDialog } from './students-delete-dialog'
import { StudentsExportDialog } from './students-export-dialog'
import { StudentsImportDialog } from './students-import-dialog'
import { StudentsViewDialog } from './students-view-dialog'
import type { ClassListItem } from '@/features/classes/api/classes-api'
import { useSchoolStore } from '@/stores/school-store'
import { useStudents } from './students-provider'

type StudentsDialogsProps = {
  classes: ClassListItem[]
}

export function StudentsDialogs({ classes }: StudentsDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow, selectedClassId } =
    useStudents()
  const selectedSchool = useSchoolStore((s) => s.selectedSchool)

  const selectedClassName =
    classes.find((c) => c.id === selectedClassId)?.name ?? selectedClassId

  function closeDialog(next: boolean) {
    if (!next) {
      setOpen(null)
      setTimeout(() => setCurrentRow(null), 200)
    }
  }

  return (
    <>
      <StudentsActionDialog
        key="student-add"
        open={open === 'add'}
        onOpenChange={(next) => {
          if (!next) setOpen(null)
        }}
        classes={classes}
      />

      <StudentsImportDialog
        open={open === 'import'}
        schoolId={selectedSchool?.id ?? ''}
        schoolName={selectedSchool?.name ?? ''}
        targetClassId={selectedClassId}
        targetClassName={selectedClassName}
        onOpenChange={(next) => {
          if (!next) setOpen(null)
        }}
      />

      <StudentsExportDialog
        open={open === 'export'}
        schoolId={selectedSchool?.id ?? ''}
        schoolName={selectedSchool?.name ?? ''}
        classes={classes}
        defaultClassId={selectedClassId}
        onOpenChange={(next) => {
          if (!next) setOpen(null)
        }}
      />

      {currentRow ? (
        <>
          <StudentsActionDialog
            key={`student-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={closeDialog}
            currentRow={currentRow}
            classes={classes}
          />

          <StudentsViewDialog
            key={`student-view-${currentRow.id}`}
            open={open === 'view'}
            onOpenChange={closeDialog}
            currentRow={currentRow}
          />

          <StudentsDeleteDialog
            key={`student-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={closeDialog}
            currentRow={currentRow}
          />
        </>
      ) : null}
    </>
  )
}
