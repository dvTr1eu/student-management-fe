import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Check, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { fetchStudentsByClass } from '@/features/students/api/students-api'
import { studentKeys } from '@/features/students/api/query-keys'
import { mapListItem } from '@/features/students/data/schema'
import { useSchoolStore } from '@/stores/school-store'
import { type Class } from '../data/schema'

type ClassStudentsPanelProps = {
  classItem: Class
}

export function ClassStudentsPanel({ classItem }: ClassStudentsPanelProps) {
  const schoolId = useSchoolStore((s) => s.selectedSchool?.id)
  const [search, setSearch] = useState('')

  const query = useQuery({
    queryKey: studentKeys.list({
      schoolId: schoolId ?? '',
      classId: classItem.id,
      search: search.trim() || undefined,
      page: 1,
      pageSize: 100,
      source: 'class-panel',
    }),
    queryFn: () =>
      fetchStudentsByClass(classItem.id, {
        schoolId: schoolId!,
        search: search.trim() || undefined,
        page: 1,
        pageSize: 100,
      }),
    enabled: !!schoolId && !!classItem.id,
  })

  const classStudents = useMemo(
    () => (query.data?.items ?? []).map(mapListItem),
    [query.data],
  )

  return (
    <Card className="rounded-md">
      <CardHeader>
        <CardTitle className="text-base">
          {query.data?.totalCount ?? classItem.studentCount} học sinh
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <Input
            placeholder="Tìm học sinh..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="p-3">Học sinh</th>
                <th className="p-3">Email</th>
                <th className="p-3">Số điện thoại</th>
                <th className="p-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {query.isLoading ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center">
                    <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                  </td>
                </tr>
              ) : classStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-6 text-center text-muted-foreground"
                  >
                    Không có học sinh nào.
                  </td>
                </tr>
              ) : (
                classStudents.map((student) => (
                  <tr key={student.id} className="border-b last:border-0">
                    <td className="p-3">
                      {student.lastName} {student.firstName}
                    </td>
                    <td className="p-3">{student.email || '—'}</td>
                    <td className="p-3">{student.phoneNumber || '—'}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <Check className="size-4" />
                        {student.status === 'Active' ? 'Đang học' : student.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
