import { Check, TriangleAlert } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  computeFinalScore,
  getRowStatus,
  type GradeStudentRow,
} from '../data/schema'

type GradesSummaryTabProps = {
  rows: GradeStudentRow[]
  contextLabel: string
}

export function GradesSummaryTab({ rows, contextLabel }: GradesSummaryTabProps) {
  return (
    <div className="grid gap-3">
      <p className="text-sm text-muted-foreground">{contextLabel}</p>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Học sinh</TableHead>
              <TableHead className="text-center">Tổng kết</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const finalScore =
                row.finalScore !== undefined
                  ? row.finalScore
                  : computeFinalScore(row.scores)
              const status = row.status ?? getRowStatus(row.scores)
              return (
                <TableRow key={row.studentId}>
                  <TableCell className="font-medium">{row.fullName}</TableCell>
                  <TableCell className="text-center tabular-nums">
                    {finalScore == null ? '—' : finalScore.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-center">
                    {status === 'complete' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <Check className="size-3.5" /> Hoàn thành
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600">
                        <TriangleAlert className="size-3.5" /> Thiếu điểm
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
