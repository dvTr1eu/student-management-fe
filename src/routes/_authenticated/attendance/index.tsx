import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Attendance } from '@/features/attendance'

const attendanceSearchSchema = z.object({
  classId: z.string().optional().catch(undefined),
  tab: z.enum(['lessons', 'punctuality']).optional().catch(undefined),
  month: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/_authenticated/attendance/')({
  validateSearch: attendanceSearchSchema,
  component: Attendance,
})
