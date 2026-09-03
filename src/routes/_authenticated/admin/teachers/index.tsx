import { createFileRoute } from '@tanstack/react-router'
import { Teachers } from '@/features/teachers'

export const Route = createFileRoute('/_authenticated/admin/teachers/')({
  component: Teachers,
})
