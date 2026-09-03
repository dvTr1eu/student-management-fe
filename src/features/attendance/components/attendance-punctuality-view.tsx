import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useSchoolStore } from '@/stores/school-store'
import { fetchClassPunctuality } from '../api/attendance-api'
import { attendanceKeys } from '../api/query-keys'
import {
  buildPunctualityMonths,
  mapClassPunctuality,
} from '../lib/map-attendance'
import {
  punctualityTone,
  type AttendanceClassOption,
  type StudentPunctualityRow,
} from '../data/schema'
import { StudentPunctualitySheet } from './student-punctuality-sheet'

type AttendancePunctualityViewProps = {
  classes: AttendanceClassOption[]
  classId: string
  monthId: string
  onClassChange: (classId: string) => void
  onMonthChange: (monthId: string) => void
}

export function AttendancePunctualityView({
  classes,
  classId,
  monthId,
  onClassChange,
  onMonthChange,
}: AttendancePunctualityViewProps) {
  const schoolId = useSchoolStore((s) => s.selectedSchool?.id)
  const [query, setQuery] = useState('')
  const [riskOnly, setRiskOnly] = useState(false)
  const [selected, setSelected] = useState<StudentPunctualityRow | null>(null)

  const months = useMemo(() => buildPunctualityMonths(), [])

  const punctualityQuery = useQuery({
    queryKey: attendanceKeys.classPunctuality(
      classId,
      schoolId ?? '',
      monthId,
      true,
    ),
    queryFn: async () => {
      const dto = await fetchClassPunctuality(classId, schoolId!, monthId, true)
      return mapClassPunctuality(dto)
    },
    enabled: !!schoolId && !!classId && !!monthId,
  })

  const rows = punctualityQuery.data?.rows ?? []
  const summary = punctualityQuery.data?.summary ?? {
    avgRate: 0,
    totalStudents: 0,
    excellent: 0,
    atRisk: 0,
  }
  const monthLabel =
    months.find((item) => item.id === monthId)?.label ?? monthId

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((row) => {
      if (riskOnly && row.rate >= 80) return false
      if (!q) return true
      return (
        row.name.toLowerCase().includes(q) ||
        row.code.toLowerCase().includes(q)
      )
    })
  }, [rows, query, riskOnly])

  return (
    <div className="grid gap-4">
      <div className="grid gap-2 rounded-md border bg-muted/20 p-3 sm:grid-cols-[1fr_200px_200px] sm:items-center">
        <div className="flex gap-1 overflow-x-auto">
          {classes.map((item) => (
            <Button
              key={item.id}
              type="button"
              className="shrink-0"
              variant={classId === item.id ? 'secondary' : 'ghost'}
              onClick={() => onClassChange(item.id)}
            >
              {item.name}
            </Button>
          ))}
        </div>
        <Select value={monthId} onValueChange={onMonthChange}>
          <SelectTrigger aria-label="Chọn tháng">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.id} value={month.id}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm học sinh…"
          aria-label="Tìm học sinh"
        />
      </div>

      {punctualityQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : punctualityQuery.isError ? (
        <p className="text-sm text-destructive">
          {punctualityQuery.error instanceof Error
            ? punctualityQuery.error.message
            : 'Không thể tải chuyên cần.'}
        </p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-4">
            <SummaryCard label="TB chuyên cần" value={`${summary.avgRate}%`} />
            <SummaryCard
              label="Học sinh"
              value={String(summary.totalStudents)}
            />
            <SummaryCard
              label="≥ 95%"
              value={String(summary.excellent)}
              tone="good"
            />
            <button
              type="button"
              onClick={() => setRiskOnly((prev) => !prev)}
              className={cn(
                'rounded-md border p-3 text-start transition-colors',
                riskOnly
                  ? 'border-destructive/40 bg-destructive/10'
                  : 'bg-background hover:bg-muted/40',
              )}
            >
              <p className="text-2xl font-semibold tabular-nums text-destructive">
                {summary.atRisk}
              </p>
              <p className="text-xs text-muted-foreground">
                Dưới 80%{riskOnly ? ' · đang lọc' : ' · bấm để lọc'}
              </p>
            </button>
          </div>

          <p className="text-sm text-muted-foreground">
            {monthLabel} · Tổng hợp từ điểm danh tiết môn của bạn (và SHL nếu
            bạn là GVCN). % = (có mặt + đi trễ) / tổng buổi.
          </p>

          <div className="overflow-x-auto rounded-md border">
            <table className="w-full min-w-180 text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Học sinh</th>
                  <th className="px-3 py-2 font-medium">Mã</th>
                  <th className="px-3 py-2 font-medium">Có mặt</th>
                  <th className="px-3 py-2 font-medium">Trễ</th>
                  <th className="px-3 py-2 font-medium">Vắng</th>
                  <th className="px-3 py-2 font-medium">Phép</th>
                  <th className="px-3 py-2 font-medium">Tổng buổi</th>
                  <th className="px-3 py-2 font-medium">Chuyên cần</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-3 py-8 text-center text-muted-foreground"
                    >
                      Không có học sinh phù hợp.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => {
                    const tone = punctualityTone(row.rate)
                    return (
                      <tr
                        key={row.studentId}
                        className="cursor-pointer border-b last:border-0 hover:bg-muted/30"
                        onClick={() => setSelected(row)}
                      >
                        <td className="px-3 py-2.5 font-medium">{row.name}</td>
                        <td className="px-3 py-2.5 text-muted-foreground">
                          {row.code}
                        </td>
                        <td className="px-3 py-2.5 tabular-nums">
                          {row.present}
                        </td>
                        <td className="px-3 py-2.5 tabular-nums">{row.late}</td>
                        <td className="px-3 py-2.5 tabular-nums">
                          {row.absent}
                        </td>
                        <td className="px-3 py-2.5 tabular-nums">
                          {row.excused}
                        </td>
                        <td className="px-3 py-2.5 tabular-nums">
                          {row.totalSessions}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={cn(
                              'inline-flex rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums',
                              tone === 'good' &&
                                'bg-emerald-500/15 text-emerald-700',
                              tone === 'warn' &&
                                'bg-amber-500/15 text-amber-700',
                              tone === 'bad' &&
                                'bg-destructive/15 text-destructive',
                            )}
                          >
                            {row.rate}%
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <StudentPunctualitySheet
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
        row={selected}
        monthLabel={monthLabel}
      />
    </div>
  )
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'good'
}) {
  return (
    <div className="rounded-md border bg-background p-3">
      <p
        className={cn(
          'text-2xl font-semibold tabular-nums',
          tone === 'good' && 'text-emerald-700',
        )}
      >
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
