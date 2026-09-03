import { createFileRoute, redirect } from '@tanstack/react-router'

/** Legacy path → /admin/teachers */
export const Route = createFileRoute('/_authenticated/teachers/')({
  beforeLoad: () => {
    throw redirect({ to: '/admin/teachers' })
  },
})
