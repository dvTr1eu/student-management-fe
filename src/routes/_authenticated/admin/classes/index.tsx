import { createFileRoute } from '@tanstack/react-router'
import { AdminClasses } from '@/features/admin-classes'

export const Route = createFileRoute('/_authenticated/admin/classes/')({
  component: AdminClasses,
})
