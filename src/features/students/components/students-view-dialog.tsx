import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { punctualityMonths } from '@/features/attendance/lib/punctuality-months'
import { punctualityTone } from '@/features/attendance/data/schema'
import { fetchStudentPunctuality } from '@/features/students/api/students-api'
import { studentKeys } from '@/features/students/api/query-keys'
import { cn } from '@/lib/utils'
import { useSchoolStore } from '@/stores/school-store'
import { type StudentDetail } from '../data/schema'

type StudentsViewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: StudentDetail
}

const sections: Array<{
  title: string
  fields: Array<{ key: keyof StudentDetail; label: string }>
}> = [
  {
    title: 'THÔNG TIN HỌC SINH',
    fields: [
      { key: 'studentCode', label: 'Mã học sinh' },
      { key: 'lastName', label: 'Họ tên đệm' },
      { key: 'firstName', label: 'Tên' },
      { key: 'class', label: 'Lớp' },
      { key: 'email', label: 'Email' },
      { key: 'phoneNumber', label: 'Số điện thoại' },
      { key: 'address', label: 'Địa chỉ học sinh' },
    ],
  },
  {
    title: 'THÔNG TIN BỐ',
    fields: [
      { key: 'fatherName', label: 'Họ tên bố' },
      { key: 'fatherOccupation', label: 'Nghề nghiệp bố' },
      { key: 'fatherPhoneNumber', label: 'Số điện thoại bố' },
    ],
  },
  {
    title: 'THÔNG TIN MẸ',
    fields: [
      { key: 'motherName', label: 'Họ tên mẹ' },
      { key: 'motherOccupation', label: 'Nghề nghiệp mẹ' },
      { key: 'motherPhoneNumber', label: 'Số điện thoại mẹ' },
    ],
  },
]

export function StudentsViewDialog({
  open,
  onOpenChange,
  currentRow,
}: StudentsViewDialogProps) {
  const schoolId = useSchoolStore((s) => s.selectedSchool?.id)
  const month = punctualityMonths[0]!

  const punctualityQuery = useQuery({
    queryKey: studentKeys.punctuality(
      currentRow.id,
      schoolId ?? '',
      month.id,
    ),
    queryFn: () =>
      fetchStudentPunctuality(currentRow.id, schoolId!, month.id),
    enabled: open && !!schoolId,
  })

  const punctuality = punctualityQuery.data
  const tone =
    punctuality && punctuality.total > 0
      ? punctualityTone(Number(punctuality.rate))
      : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <div className="max-h-[70vh] overflow-y-auto py-1">
          {sections.map(({ title, fields }, sectionIndex) => (
            <section key={title} className="space-y-3">
              {sectionIndex > 0 && <Separator className="my-2 h-0.5" />}
              <h3 className="text-sm font-semibold">{title}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {fields.map(({ key, label }) => (
                  <div
                    key={key}
                    className={key === 'address' ? 'sm:col-span-2' : ''}
                  >
                    <label className="mb-1.5 block text-sm font-medium">
                      {label}
                    </label>
                    <Input
                      readOnly
                      value={String(currentRow[key] ?? '')}
                      className="bg-muted/50"
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}

          <Separator className="my-2 h-0.5" />
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">CHUYÊN CẦN</h3>
            {punctualityQuery.isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : punctuality && tone ? (
              <div className="grid gap-3 rounded-md border p-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="text-xs text-muted-foreground">{month.label}</p>
                  <p
                    className={cn(
                      'text-2xl font-semibold tabular-nums',
                      tone === 'good' && 'text-emerald-700',
                      tone === 'warn' && 'text-amber-700',
                      tone === 'bad' && 'text-destructive',
                    )}
                  >
                    {Number(punctuality.rate)}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Có mặt {punctuality.present} · Trễ {punctuality.late} · Vắng{' '}
                    {punctuality.absent} · Phép {punctuality.excused} /{' '}
                    {punctuality.total} buổi
                  </p>
                </div>
                <Link
                  to="/attendance"
                  search={{
                    tab: 'punctuality',
                    classId: currentRow.classId,
                    month: month.id,
                  }}
                  className={cn(buttonVariants({ variant: 'outline' }))}
                  onClick={() => onOpenChange(false)}
                >
                  Xem chuyên cần lớp
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Chưa có dữ liệu chuyên cần cho học sinh này.
              </p>
            )}
          </section>
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
