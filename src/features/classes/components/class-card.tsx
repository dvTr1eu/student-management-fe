import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import {
  BookOpenText,
  CalendarDays,
  Users,
} from 'lucide-react'
import { type Class } from '../data/schema'

type ClassCardProps = {
  classItem: Class
}

export function ClassCard({ classItem }: ClassCardProps) {
  return (
    <Card className="rounded-md">
      <CardHeader className="gap-1 border-b pb-4">
        <CardTitle className="text-base">{classItem.name}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {classItem.grade} · Năm học {classItem.academicYear}
          {classItem.isHomeroom ? ' · Lớp chủ nhiệm của bạn' : ''}
        </p>
      </CardHeader>
      <CardContent className="grid gap-4 pt-4">
        <div className="grid gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            {classItem.studentCount} học sinh
          </div>
          <div className="flex items-center gap-2">
            <BookOpenText className="size-4 text-muted-foreground" />
            {classItem.subject}
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-muted-foreground" />
            {classItem.weeklyPeriods} tiết / tuần
          </div>
          <div className="flex items-center gap-2">
            GVCN: {classItem.homeroomTeacher}
          </div>
        </div>
        <Link
          to="/classes/$classId"
          params={{ classId: classItem.id }}
          className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
        >
          Xem lớp
        </Link>
      </CardContent>
    </Card>
  )
}
