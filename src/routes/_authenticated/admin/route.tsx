import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { isAdmin } from '@/features/auth/lib/roles'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Admin-only area: /admin/*
 * Parent `/_authenticated` already requires login.
 * This layout additionally requires role `admin`.
 */
export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: () => {
    const { accessToken, user } = useAuthStore.getState().auth
    if (!accessToken) {
      throw redirect({ to: '/sign-in' })
    }
    if (!isAdmin(user)) {
      throw redirect({ to: '/' })
    }
  },
  component: AdminLayout,
})

function AdminLayout() {
  return <Outlet />
}
