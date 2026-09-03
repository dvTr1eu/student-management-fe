import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  WEEKDAY_FULL,
  formatDisplayDateFull,
  getPeriodDef,
  type AcademicWeek,
  type DayOfWeek,
  type PeriodDefinition,
  type SessionType,
} from '../data/schema'
import { dayOfWeekFromIso } from '../lib/calendar-week'
import type { EmptySlotContext } from '../types/slot'

type ScheduleAddLessonDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  week: AcademicWeek
  academicYear: string
  periods: PeriodDefinition[]
  defaultDayOfWeek?: DayOfWeek
  onConfirm: (slot: EmptySlotContext) => void
}

export function getDefaultDayOfWeek(
  week: AcademicWeek,
  todayIso: string,
): DayOfWeek {
  const index = week.dates.indexOf(todayIso)
  if (index >= 0) return (index + 1) as DayOfWeek
  return dayOfWeekFromIso(todayIso)
}

export function ScheduleAddLessonDialog({
  open,
  onOpenChange,
  week,
  academicYear,
  periods,
  defaultDayOfWeek = 1,
  onConfirm,
}: ScheduleAddLessonDialogProps) {
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(defaultDayOfWeek)
  const [session, setSession] = useState<SessionType>('morning')
  const [period, setPeriod] = useState('1')

  useEffect(() => {
    if (open) {
      setDayOfWeek(defaultDayOfWeek)
      setSession('morning')
      setPeriod('1')
    }
  }, [open, defaultDayOfWeek])

  const sessionPeriods = periods.filter((item) => item.session === session)
  const date = week.dates[dayOfWeek - 1]!
  const periodNum = Number(period)
  const periodDef = getPeriodDef(periods, session, periodNum)

  function handleContinue() {
    if (!periodDef || !date) return
    onConfirm({
      weekId: week.id,
      academicYear,
      date,
      dayOfWeek,
      dayLabel: WEEKDAY_FULL[dayOfWeek],
      session,
      period: periodNum,
      startTime: periodDef.startTime,
      endTime: periodDef.endTime,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm tiết học</DialogTitle>
          <DialogDescription>
            Chọn ngày và tiết trong tuần {week.label} ({week.startDate} –{' '}
            {week.endDate}).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Ngày</Label>
            <Select
              value={String(dayOfWeek)}
              onValueChange={(value) =>
                setDayOfWeek(Number(value) as DayOfWeek)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {week.dates.map((iso, index) => {
                  const dow = (index + 1) as DayOfWeek
                  return (
                    <SelectItem key={iso} value={String(dow)}>
                      {WEEKDAY_FULL[dow]} · {formatDisplayDateFull(iso)}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label>Buổi</Label>
            <Select
              value={session}
              onValueChange={(value) => {
                setSession(value as SessionType)
                setPeriod('1')
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Sáng</SelectItem>
                <SelectItem value="afternoon">Chiều</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label>Tiết</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sessionPeriods.map((item) => (
                  <SelectItem key={item.id} value={String(item.period)}>
                    {item.label} ({item.startTime} – {item.endTime})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button type="button" onClick={handleContinue} disabled={!periodDef}>
            <Plus />
            Tiếp tục
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
