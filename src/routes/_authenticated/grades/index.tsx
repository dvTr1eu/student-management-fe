import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Grades } from '@/features/grades'

const gradesSearchSchema = z.object({
  year: z.string().optional().catch(undefined),
  semester: z.string().optional().catch(undefined),
  classId: z.string().optional().catch(undefined),
  subjectId: z.string().optional().catch(undefined),
  tab: z.enum(['scores', 'summary', 'stats']).optional().catch(undefined),
})

export const Route = createFileRoute('/_authenticated/grades/')({
  validateSearch: gradesSearchSchema,
  component: Grades,
})
