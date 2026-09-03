import { createFileRoute, redirect } from '@tanstack/react-router'

/** Legacy path → /admin/schools */
export const Route = createFileRoute('/_authenticated/schools/')({
  beforeLoad: () => {
    throw redirect({ to: '/admin/schools' })
  },
})
