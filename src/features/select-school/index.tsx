import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { fetchMySchools } from '@/features/auth/api/auth-api'
import { AuthLayout } from '@/features/auth/auth-layout'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { useSchoolStore, type School } from '@/stores/school-store'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Check, Loader2, RefreshCw, School as SchoolIcon } from 'lucide-react'
import { useState } from 'react'

export function SelectSchool() {
  const navigate = useNavigate()
  const { redirect } = useSearch({ from: '/select-school' })
  const user = useAuthStore((s) => s.auth.user)
  const resetAuth = useAuthStore((s) => s.auth.reset)
  const setSelectedSchool = useSchoolStore((s) => s.setSelectedSchool)
  const clearSelectedSchool = useSchoolStore((s) => s.clearSelectedSchool)

  const {
    data: schools = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['auth', 'my-schools'],
    queryFn: fetchMySchools,
  })
  const [pendingSchool, setPendingSchool] = useState<School | null>(null)

  const hasSchools = schools.length > 0
  const showContinue = hasSchools && !isError

  function handleConfirm() {
    if (!pendingSchool) return
    setSelectedSchool(pendingSchool)
    if (redirect && redirect !== '/select-school') {
      void navigate({ href: redirect, replace: true })
    } else {
      void navigate({ to: '/', replace: true })
    }
  }

  function handleSwitchAccount() {
    resetAuth()
    clearSelectedSchool()
    void navigate({ to: '/sign-in', replace: true })
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-md gap-4">
        <CardHeader>
          <CardTitle className="text-center text-lg tracking-tight">
            Chọn trường
          </CardTitle>
          <CardDescription className="text-center">
            Chọn trường bạn đang giảng dạy để tiếp tục.
          </CardDescription>
          {user?.email ? (
            <p className="text-center text-xs text-muted-foreground">
              Đang đăng nhập:{' '}
              <span className="font-medium text-foreground">{user.email}</span>
            </p>
          ) : null}
        </CardHeader>
        <CardContent className="grid gap-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="grid gap-3 py-2">
              <p className="text-center text-sm text-destructive">
                Không thể tải danh sách trường. Vui lòng thử lại.
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isFetching}
                onClick={() => void refetch()}
              >
                {isFetching ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <RefreshCw />
                )}
                Thử lại
              </Button>
            </div>
          ) : !hasSchools ? (
            <p className="py-2 text-center text-sm text-muted-foreground">
              Bạn chưa được gán trường nào. Vui lòng liên hệ quản trị viên hoặc
              đăng nhập bằng tài khoản khác.
            </p>
          ) : null}

          {hasSchools ? (
            <ul className="grid gap-2">
              {schools.map((school) => {
                const selected = pendingSchool?.id === school.id
                return (
                  <li key={school.id}>
                    <button
                      type="button"
                      onClick={() => setPendingSchool(school)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-start transition-colors',
                        selected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50',
                      )}
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                        <SchoolIcon className="size-4" />
                      </div>
                      <div className="grid min-w-0 flex-1 leading-tight">
                        <span className="truncate font-medium">
                          {school.name}
                        </span>
                      </div>
                      {selected ? (
                        <Check className="size-4 shrink-0 text-primary" />
                      ) : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : null}

          {showContinue ? (
            <Button
              type="button"
              className="mt-1 w-full"
              disabled={!pendingSchool}
              onClick={handleConfirm}
            >
              Tiếp tục
            </Button>
          ) : null}

          <Button
            type="button"
            variant="link"
            className="h-auto w-full py-1 text-muted-foreground"
            onClick={handleSwitchAccount}
          >
            Đăng nhập bằng tài khoản khác
          </Button>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
