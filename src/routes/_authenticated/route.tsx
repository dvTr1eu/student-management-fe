import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { isAdmin } from '@/features/auth/lib/roles'
import { useAuthStore } from '@/stores/auth-store'
import { useSchoolStore } from '@/stores/school-store'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    const { accessToken, user } = useAuthStore.getState().auth
    if (!accessToken) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.href },
      })
    }

    // Admin không cần chọn trường
    if (isAdmin(user)) return

    const { selectedSchool } = useSchoolStore.getState()
    if (!selectedSchool) {
      throw redirect({
        to: '/select-school',
        search: {
          redirect:
            location.pathname === '/' ? undefined : location.href,
        },
      })
    }
  },
  component: AuthenticatedLayout,
})
