import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { useSearch } from '@tanstack/react-router'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' }) as { redirect?: string }

  return (
    <AuthLayout>
      <Card className='max-w-sm gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight text-center'>Đăng nhập</CardTitle>
        </CardHeader>
        <CardContent>
          <UserAuthForm redirectTo={redirect} />
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="w-full rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            <p className="mb-1 font-medium text-foreground">Tài khoản demo</p>
            <p>GV: teacher@demo.com / Teacher@123</p>
            <p>GV: teacher2@demo.com / Teacher@123</p>
            <p>Admin: admin@demo.com / Admin@123</p>
          </div>
          <p className="px-2 text-center text-sm text-muted-foreground">
            Bằng cách đăng nhập, bạn đồng ý với các điều khoản của chúng tôi{' '}
            <a
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Điều khoản dịch vụ
            </a>{' '}
            và{' '}
            <a
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Chính sách bảo mật
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
