import { isAdmin } from '@/features/auth/lib/roles'
import { SelectSchool } from '@/features/select-school'
import { useAuthStore } from '@/stores/auth-store'
import { useSchoolStore } from '@/stores/school-store'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/select-school')({
  validateSearch: searchSchema,
  beforeLoad: ({ location }) => {
    const { accessToken, user } = useAuthStore.getState().auth
    if (!accessToken) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.href },
      })
    }

    if (isAdmin(user)) {
      throw redirect({ to: '/' })
    }

    const { selectedSchool } = useSchoolStore.getState()
    if (selectedSchool) {
      throw redirect({ to: '/' })
    }
  },
  component: SelectSchool,
})
