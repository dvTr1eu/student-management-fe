import { useMemo } from 'react'
import { computeFinalScore, type GradeStudentRow } from '../data/schema'
import { GradesSummaryCards } from './grades-summary-cards'

type GradesStatsTabProps = {
  rows: GradeStudentRow[]
}

export function GradesStatsTab({ rows }: GradesStatsTabProps) {
  const stats = useMemo(() => {
    const finals = rows
      .map((row) => computeFinalScore(row.scores))
      .filter((v): v is number => v != null)

    if (finals.length === 0) {
      return { avg: null as number | null, max: null as number | null, min: null as number | null }
    }

    return {
      avg: Math.round((finals.reduce((s, v) => s + v, 0) / finals.length) * 100) / 100,
      max: Math.max(...finals),
      min: Math.min(...finals),
    }
  }, [rows])

  return (
    <div className="grid gap-4">
      <GradesSummaryCards
        cards={[
          {
            value: stats.avg == null ? '—' : stats.avg.toFixed(2),
            label: 'Điểm TB',
          },
          {
            value: stats.max == null ? '—' : stats.max.toFixed(1),
            label: 'Cao nhất',
          },
          {
            value: stats.min == null ? '—' : stats.min.toFixed(1),
            label: 'Thấp nhất',
          },
        ]}
      />
      <p className="text-sm text-muted-foreground">
        Biểu đồ phân bố điểm sẽ được bổ sung ở giai đoạn sau.
      </p>
    </div>
  )
}
