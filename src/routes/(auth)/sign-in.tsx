import { z } from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { SignIn } from '@/features/auth/sign-in'
import { isAdmin } from '@/features/auth/lib/roles'
import { useAuthStore } from '@/stores/auth-store'
import { useSchoolStore } from '@/stores/school-store'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/sign-in')({
  validateSearch: searchSchema,
  beforeLoad: () => {
    const { accessToken, user } = useAuthStore.getState().auth
    if (!accessToken) return

    // Đã đăng nhập: không cho vào lại trang sign-in qua URL
    if (isAdmin(user)) {
      throw redirect({ to: '/' })
    }

    const { selectedSchool } = useSchoolStore.getState()
    throw redirect({
      to: selectedSchool ? '/' : '/select-school',
    })
  },
  component: SignIn,
})
