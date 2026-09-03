import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Classes } from '@/features/classes'

const classesSearchSchema = z.object({
  year: z.string().optional().catch('2026 - 2027'),
  grade: z.string().optional().catch('all'),
})

export const Route = createFileRoute('/_authenticated/classes/')({
  validateSearch: classesSearchSchema,
  component: Classes,
})
