import { Search, UserCheck } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type AttendanceStatus, type AttendanceStudent } from '../data/schema'
import { AttendanceStatusBadge } from './attendance-status'

/** Values aligned with BE: Unmarked | Present | Absent | Late | Excused */
const statuses: AttendanceStatus[] = [
  'UNMARKED',
  'PRESENT',
  'ABSENT',
  'LATE',
  'EXCUSED',
]

export function AttendanceStudentList({
  students,
  onChange,
}: {
  students: AttendanceStudent[]
  onChange: (studentId: string, status: AttendanceStatus) => void
}) {
  const [query, setQuery] = useState('')
  const filteredStudents = students.filter((student) =>
    `${student.name} ${student.code}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  )

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          variant="secondary"
          className="w-full sm:w-fit"
          onClick={() =>
            students.forEach((student) => onChange(student.id, 'PRESENT'))
          }
        >
          <UserCheck />
          Tất cả có mặt
        </Button>
        <div className="relative flex-1">
          <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Tìm theo tên hoặc mã học sinh..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>
      <div className="overflow-hidden rounded-md border">
        <div className="grid grid-cols-[1fr_auto] border-b bg-muted/30 px-4 py-2 text-xs font-medium text-muted-foreground sm:grid-cols-[1fr_220px]">
          <span>Học sinh</span>
          <span className="text-right">Trạng thái</span>
        </div>
        <div className="divide-y">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 sm:grid-cols-[1fr_220px]"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{student.name}</p>
                <p className="text-xs text-muted-foreground">
                  {student.code}
                  {student.reason && ` · ${student.reason}`}
                </p>
              </div>
              <Select
                value={student.status}
                onValueChange={(value) =>
                  onChange(student.id, value as AttendanceStatus)
                }
              >
                <SelectTrigger
                  className="h-8 w-48 shrink-0 justify-between text-xs sm:w-52"
                  aria-label={`Trạng thái của ${student.name}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="min-w-52">
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      <AttendanceStatusBadge status={status} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
          {!filteredStudents.length && (
            <p className="p-8 text-center text-sm text-muted-foreground">
              Không tìm thấy học sinh.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
