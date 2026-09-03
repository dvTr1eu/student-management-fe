import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import {
  SCORE_COLUMNS,
  computeFinalScore,
  type GradeStudentRow,
} from '../data/schema'

type GradesStudentSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: GradeStudentRow | null
  className: string
  subjectName: string
}

export function GradesStudentSheet({
  open,
  onOpenChange,
  student,
  className,
  subjectName,
}: GradesStudentSheetProps) {
  const finalScore = student ? computeFinalScore(student.scores) : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{student?.fullName ?? 'Học sinh'}</SheetTitle>
          <SheetDescription>{className}</SheetDescription>
        </SheetHeader>

        {student ? (
          <div className="grid gap-4 px-4 pb-4">
            <div>
              <p className="text-xs text-muted-foreground">Mã HS</p>
              <p className="font-medium">{student.studentCode}</p>
            </div>

            <Separator />

            <div>
              <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {subjectName}
              </p>
              <dl className="grid gap-2">
                {SCORE_COLUMNS.map((col) => (
                  <div
                    key={col.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <dt className="text-muted-foreground">{col.label}</dt>
                    <dd className="tabular-nums">
                      {student.scores[col.id] == null
                        ? '—'
                        : student.scores[col.id]!.toFixed(1)}
                    </dd>
                  </div>
                ))}
                <div className="mt-1 flex items-center justify-between border-t pt-2 text-sm font-medium">
                  <dt>Tổng kết</dt>
                  <dd className="tabular-nums">
                    {finalScore == null ? '—' : finalScore.toFixed(1)}
                  </dd>
                </div>
              </dl>
            </div>

            <Button variant="outline" className="w-fit" disabled>
              Xem lịch sử
            </Button>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
