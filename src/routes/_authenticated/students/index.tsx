import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Students } from '@/features/students'

const studentsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  firstName: z.string().optional().catch(''),
  sortDir: z.enum(['asc', 'desc']).optional().catch('asc'),
})

export const Route = createFileRoute('/_authenticated/students/')({
  validateSearch: studentsSearchSchema,
  component: Students,
})
