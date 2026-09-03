import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import {
  punctualityTone,
  type StudentPunctualityRow,
} from '../data/schema'

type StudentPunctualitySheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: StudentPunctualityRow | null
  monthLabel: string
}

export function StudentPunctualitySheet({
  open,
  onOpenChange,
  row,
  monthLabel,
}: StudentPunctualitySheetProps) {
  const tone = row ? punctualityTone(row.rate) : 'good'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Chuyên cần học sinh</SheetTitle>
          <SheetDescription>
            {row
              ? `${row.name} · ${row.className} · ${monthLabel}`
              : 'Chi tiết chuyên cần theo tháng'}
          </SheetDescription>
        </SheetHeader>

        {row ? (
          <div className="grid gap-4 px-4 pb-4">
            <div
              className={cn(
                'rounded-md border px-4 py-3',
                tone === 'good' && 'border-emerald-500/30 bg-emerald-500/10',
                tone === 'warn' && 'border-amber-500/30 bg-amber-500/10',
                tone === 'bad' && 'border-destructive/30 bg-destructive/10',
              )}
            >
              <p className="text-3xl font-bold tabular-nums">{row.rate}%</p>
              <p className="text-sm text-muted-foreground">
                Chuyên cần tháng · (có mặt + trễ) / {row.totalSessions} buổi
              </p>
            </div>

            <dl className="grid gap-2 text-sm">
              <Row label="Có mặt" value={row.present} />
              <Row label="Đi trễ" value={row.late} />
              <Row label="Vắng" value={row.absent} />
              <Row label="Có phép" value={row.excused} />
              <Row label="Tổng buổi" value={row.totalSessions} />
            </dl>

            <Separator />

            <p className="text-sm text-muted-foreground">
              Số liệu tổng hợp từ các lần điểm danh tiết trong tháng. Đi trễ
              vẫn được tính vào chuyên cần; vắng và có phép không cộng vào tử
              số.
            </p>

            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  )
}
