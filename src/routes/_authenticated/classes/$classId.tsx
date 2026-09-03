import { createFileRoute } from '@tanstack/react-router'
import { ClassDetail } from '@/features/classes/detail'

export const Route = createFileRoute('/_authenticated/classes/$classId')({
  component: ClassDetail,
})
