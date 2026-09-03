import { Check, Eye, Pencil, TriangleAlert } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { SubjectClassOverview } from '../data/schema'

type GradesClassOverviewProps = {
  items: SubjectClassOverview[]
  onSelectSubject: (subjectId: string) => void
}

export function GradesClassOverview({
  items,
  onSelectSubject,
}: GradesClassOverviewProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Môn</TableHead>
            <TableHead className="text-center">ĐTB</TableHead>
            <TableHead className="text-center">Đủ điểm</TableHead>
            <TableHead className="text-center">Trạng thái</TableHead>
            <TableHead className="text-center">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.subjectId}
              className="cursor-pointer"
              onClick={() => onSelectSubject(item.subjectId)}
            >
              <TableCell className="font-medium hover:underline">
                {item.subjectName}
              </TableCell>
              <TableCell className="text-center tabular-nums">
                {item.average == null ? '—' : item.average.toFixed(1)}
              </TableCell>
              <TableCell className="text-center tabular-nums">
                {item.completeCount}/{item.totalCount}
              </TableCell>
              <TableCell className="text-center">
                {item.status === 'complete' ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <Check className="size-4" />
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-600">
                    <TriangleAlert className="size-4" />
                  </span>
                )}
              </TableCell>
              <TableCell className="text-center">
                {item.canEdit ? (
                  <span className="inline-flex items-center justify-center gap-1 text-xs text-foreground">
                    <Pencil className="size-3.5" />
                    Nhập điểm
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Eye className="size-3.5" />
                    Chỉ xem
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
