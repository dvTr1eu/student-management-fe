import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type { StudentDetail } from '../data/schema'

type StudentsDialogType =
  | 'add'
  | 'edit'
  | 'view'
  | 'delete'
  | 'import'
  | 'export'

type StudentsContextType = {
  open: StudentsDialogType | null
  setOpen: (str: StudentsDialogType | null) => void
  currentRow: StudentDetail | null
  setCurrentRow: React.Dispatch<React.SetStateAction<StudentDetail | null>>
  /** Active class tab; empty until classes are loaded */
  selectedClassId: string
  setSelectedClassId: (classId: string) => void
}

const StudentsContext = React.createContext<StudentsContextType | null>(null)

export function StudentsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<StudentsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<StudentDetail | null>(null)
  const [selectedClassId, setSelectedClassId] = useState('')

  return (
    <StudentsContext
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        selectedClassId,
        setSelectedClassId,
      }}
    >
      {children}
    </StudentsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStudents = () => {
  const studentsContext = React.useContext(StudentsContext)

  if (!studentsContext) {
    throw new Error('useStudents has to be used within <StudentsContext>')
  }

  return studentsContext
}
