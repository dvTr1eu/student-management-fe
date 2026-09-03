import { PasswordInput } from '@/components/password-input'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { login } from '@/features/auth/api/auth-api'
import { authUserFromAccessToken } from '@/features/auth/lib/jwt'
import { isAdmin } from '@/features/auth/lib/roles'
import { getApiErrorMessage } from '@/lib/api/get-api-error-message'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { useSchoolStore } from '@/stores/school-store'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const formSchema = z.object({
  email: z.email({
    error: (iss) =>
      iss.input === '' ? 'Vui lòng nhập email.' : 'Email không hợp lệ.',
  }),
  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu.')
    .min(7, 'Mật khẩu phải có ít nhất 7 ký tự.'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.auth.setUser)
  const setAccessToken = useAuthStore((s) => s.auth.setAccessToken)
  const clearSelectedSchool = useSchoolStore((s) => s.clearSelectedSchool)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const result = await login({
        email: data.email,
        password: data.password,
      })

      const user = authUserFromAccessToken(result.accessToken)
      if (!user) {
        toast.error('Không thể xác thực phiên đăng nhập.')
        return
      }

      clearSelectedSchool()
      setUser(user)
      setAccessToken(result.accessToken)

      toast.success(`Xin chào, ${user.name ?? user.email}!`)

      const nextRedirect =
        redirectTo &&
        redirectTo !== '/select-school' &&
        redirectTo !== '/'
          ? redirectTo
          : undefined

      if (isAdmin(user)) {
        if (nextRedirect) {
          await navigate({ href: nextRedirect, replace: true })
        } else {
          await navigate({ to: '/', replace: true })
        }
        return
      }

      await navigate({
        to: '/select-school',
        search: nextRedirect ? { redirect: nextRedirect } : {},
        replace: true,
      })
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Email hoặc mật khẩu không đúng.'),
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="teacher@demo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="relative">
              <FormLabel>Mật khẩu</FormLabel>
              <FormControl>
                <PasswordInput placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="mt-2" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : <LogIn />}
          Đăng nhập
        </Button>
      </form>
    </Form>
  )
}
