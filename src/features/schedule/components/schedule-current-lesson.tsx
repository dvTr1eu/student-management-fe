import { Link } from '@tanstack/react-router'
import { MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ScheduleLesson } from '../data/schema'

type ScheduleCurrentLessonProps = {
  lesson: ScheduleLesson
}

export function ScheduleCurrentLesson({ lesson }: ScheduleCurrentLessonProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/40 bg-primary/5 px-4 py-3">
      <div className="grid gap-0.5">
        <p className="text-xs font-semibold tracking-wide text-primary uppercase">
          Đang diễn ra · Tiết {lesson.period}
        </p>
        <p className="text-base font-semibold">
          {lesson.subject} · {lesson.className}
        </p>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5" />
          Phòng {lesson.room} · {lesson.startTime} – {lesson.endTime}
        </p>
      </div>
      <Button
        render={
          <Link to="/attendance" search={{ classId: lesson.classId }} />
        }
      >
        Điểm danh ngay
      </Button>
    </div>
  )
}
