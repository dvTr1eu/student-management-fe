import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { buttonVariants } from '@/components/ui/button'
import { isAdmin } from '@/features/auth/lib/roles'
import { fetchClassPunctuality } from '@/features/attendance/api/attendance-api'
import { attendanceKeys } from '@/features/attendance/api/query-keys'
import { fetchClasses } from '@/features/classes/api/classes-api'
import { classKeys } from '@/features/classes/api/query-keys'
import { currentMonthId } from '@/features/classes/lib/class-detail-helpers'
import {
  fetchLessonMeta,
  fetchLessons,
} from '@/features/schedule/api/schedule-api'
import { scheduleKeys } from '@/features/schedule/api/query-keys'
import {
  ACADEMIC_YEARS,
  buildTeacherProfile,
  mapLesson,
} from '@/features/schedule/lib/map-schedule'
import {
  WEEKDAY_FULL,
  formatDisplayDateFull,
  getLessonScheduleStatus,
  isLessonCurrent,
  toIsoDate,
  type ScheduleLesson,
} from '@/features/schedule/data/schema'
import { getApiErrorMessage } from '@/lib/api/get-api-error-message'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { useSchoolStore } from '@/stores/school-store'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Loader2, MapPin } from 'lucide-react'
import { useMemo } from 'react'

function teacherGreetingName(name?: string) {
  if (!name?.trim()) return 'Thầy/Cô'
  if (name === 'Quản trị viên') return name
  const parts = name.trim().split(/\s+/)
  const given = parts[parts.length - 1] ?? name
  return `Thầy/Cô ${given}`
}

function formatLongDate(now: Date, iso: string) {
  const dow = now.getDay()
  const label =
    dow >= 1 && dow <= 5
      ? WEEKDAY_FULL[dow as 1 | 2 | 3 | 4 | 5]
      : dow === 0
        ? 'Chủ Nhật'
        : 'Thứ Bảy'
  return `${label}, ${formatDisplayDateFull(iso)}`
}

export function Dashboard() {
  const user = useAuthStore((s) => s.auth.user)
  const school = useSchoolStore((s) => s.selectedSchool)
  const schoolId = school?.id
  const admin = isAdmin(user)

  const now = useMemo(() => new Date(), [])
  const todayIso = toIsoDate(now)
  const academicYear = ACADEMIC_YEARS[0]
  const month = currentMonthId(now)

  const greeting = admin
    ? 'Admin'
    : teacherGreetingName(user?.name)

  const classesQuery = useQuery({
    queryKey: classKeys.list({
      schoolId: schoolId ?? '',
      academicYear,
      status: 'Active',
    }),
    queryFn: () =>
      fetchClasses({
        schoolId: schoolId!,
        academicYear,
        status: 'Active',
      }),
    enabled: !!schoolId,
  })

  const metaQuery = useQuery({
    queryKey: scheduleKeys.meta(schoolId ?? '', academicYear),
    queryFn: () => fetchLessonMeta(schoolId!, academicYear),
    enabled: !!schoolId && !admin,
  })

  const todayLessonsQuery = useQuery({
    queryKey: scheduleKeys.lessons({
      schoolId: schoolId ?? '',
      academicYear,
      from: todayIso,
      to: todayIso,
      scope: 'dashboard-today',
    }),
    queryFn: async () => {
      const rows = await fetchLessons({
        schoolId: schoolId!,
        academicYear,
        from: todayIso,
        to: todayIso,
      })
      return rows.map(mapLesson)
    },
    enabled: !!schoolId,
  })

  const classes = classesQuery.data ?? []
  const todayLessons = useMemo(() => {
    const rows = todayLessonsQuery.data ?? []
    return [...rows].sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [todayLessonsQuery.data])

  const activeLessons = todayLessons.filter(
    (item) => getLessonScheduleStatus(item) !== 'CANCELLED',
  )
  const pendingCount = activeLessons.filter(
    (item) => item.attendanceStatus !== 'COMPLETED',
  ).length
  const classCountToday = new Set(activeLessons.map((item) => item.classId))
    .size

  const profile = useMemo(() => {
    if (admin || !metaQuery.data) return null
    return buildTeacherProfile(metaQuery.data, classes, user?.email)
  }, [admin, metaQuery.data, classes, user?.email])

  const homeroomClass = classes.find((item) => item.isHomeroom)

  const punctualityQuery = useQuery({
    queryKey: attendanceKeys.classPunctuality(
      homeroomClass?.id ?? '',
      schoolId ?? '',
      month,
      true,
    ),
    queryFn: () =>
      fetchClassPunctuality(homeroomClass!.id, schoolId!, month),
    enabled: !!schoolId && !!homeroomClass && !admin,
    retry: false,
  })

  const attentionStudents = (punctualityQuery.data?.students ?? [])
    .filter((row) => Number(row.rate) < 80)
    .sort((a, b) => Number(a.rate) - Number(b.rate))
    .slice(0, 5)

  const roleHint = admin
    ? 'Tài khoản quản trị viên'
    : profile?.homeroomClassId
      ? `Môn ${profile.subjectName} · GVCN ${profile.homeroomClassName}`
      : profile
        ? `Môn ${profile.subjectName}`
        : null

  const studentTotal = classes.reduce(
    (sum, item) => sum + (item.studentCount ?? 0),
    0,
  )

  if (!schoolId) {
    return (
      <>
        <Header>
          <ThemeSwitch />
          <ConfigDrawer />
        </Header>
        <Main className="flex flex-1 flex-col">
          <p className="text-muted-foreground">
            Vui lòng chọn trường để xem tổng quan.
          </p>
        </Main>
      </>
    )
  }

  const loading =
    todayLessonsQuery.isLoading ||
    classesQuery.isLoading ||
    (!admin && metaQuery.isLoading)

  return (
    <>
      <Header>
        <ThemeSwitch />
        <ConfigDrawer />
      </Header>

      <Main className="flex flex-1 flex-col gap-6 sm:gap-8">
        <section className="grid gap-1 border-b pb-5">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Xin chào, {greeting}
          </h1>
          <p className="text-muted-foreground">
            {formatLongDate(now, todayIso)}
            {school?.name ? ` · ${school.name}` : ''}
          </p>
          {roleHint ? (
            <p className="text-sm text-muted-foreground">{roleHint}</p>
          ) : null}
        </section>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Đang tải tổng quan…
          </div>
        ) : todayLessonsQuery.isError ? (
          <p className="text-sm text-destructive">
            {getApiErrorMessage(
              todayLessonsQuery.error,
              'Không thể tải lịch hôm nay.',
            )}
          </p>
        ) : (
          <>
            <section className="grid gap-3">
              <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Hôm nay
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                <StatCard
                  value={activeLessons.length}
                  label="tiết"
                  to="/schedule"
                />
                <StatCard
                  value={pendingCount}
                  label="chưa điểm danh"
                  to="/attendance"
                  search={{ tab: 'lessons' }}
                  emphasize={pendingCount > 0}
                />
                <StatCard
                  value={admin ? classes.length : classCountToday}
                  label={admin ? 'lớp (trường)' : 'lớp hôm nay'}
                  to="/classes"
                />
              </div>
            </section>

            {admin ? (
              <section className="grid gap-3">
                <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Trường học
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <StatCard
                    value={classes.length}
                    label="lớp đang hoạt động"
                    to="/classes"
                  />
                  <StatCard
                    value={studentTotal}
                    label="học sinh"
                    to="/students"
                  />
                </div>
              </section>
            ) : null}

            <section className="grid gap-3">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Lịch học hôm nay
                </h2>
                <Link
                  to="/schedule"
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'sm' }),
                  )}
                >
                  Xem lịch tuần
                </Link>
              </div>

              {todayLessons.length === 0 ? (
                <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                  Không có tiết dạy hôm nay.
                </div>
              ) : (
                <ul className="divide-y rounded-lg border">
                  {todayLessons.map((lesson) => (
                    <TodayLessonRow
                      key={lesson.id}
                      lesson={lesson}
                      now={now}
                    />
                  ))}
                </ul>
              )}
            </section>

            {!admin && homeroomClass ? (
              <section className="grid gap-3">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Cần chú ý · {homeroomClass.name}
                  </h2>
                  <Link
                    to="/attendance"
                    search={{ tab: 'punctuality', classId: homeroomClass.id }}
                    className={cn(
                      buttonVariants({ variant: 'ghost', size: 'sm' }),
                    )}
                  >
                    Xem chuyên cần
                  </Link>
                </div>
                {punctualityQuery.isLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Đang tải chuyên cần…
                  </div>
                ) : punctualityQuery.isError ? (
                  <p className="text-sm text-muted-foreground">
                    {getApiErrorMessage(
                      punctualityQuery.error,
                      'Không thể tải chuyên cần lớp chủ nhiệm.',
                    )}
                  </p>
                ) : attentionStudents.length === 0 ? (
                  <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                    Không có học sinh dưới 80% chuyên cần tháng này.
                  </p>
                ) : (
                  <ul className="divide-y rounded-lg border">
                    {attentionStudents.map((student) => (
                      <li
                        key={student.studentId}
                        className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                      >
                        <span className="font-medium">{student.fullName}</span>
                        <span className="tabular-nums text-amber-600">
                          {Math.round(Number(student.rate))}%
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ) : null}

            <section className="grid gap-2">
              <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Truy cập nhanh
              </h2>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/schedule"
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                >
                  Lịch học
                </Link>
                <Link
                  to="/attendance"
                  search={{ tab: 'lessons' }}
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                >
                  Điểm danh
                </Link>
                <Link
                  to="/grades"
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                >
                  Điểm
                </Link>
                <Link
                  to="/classes"
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                >
                  Lớp học
                </Link>
              </div>
            </section>
          </>
        )}
      </Main>
    </>
  )
}

function StatCard({
  value,
  label,
  to,
  search,
  emphasize,
}: {
  value: number
  label: string
  to: '/schedule' | '/attendance' | '/classes' | '/students'
  search?: { tab?: 'lessons' | 'punctuality'; classId?: string }
  emphasize?: boolean
}) {
  return (
    <Link
      to={to}
      search={search}
      className={cn(
        'rounded-lg border bg-background px-4 py-4 transition-colors hover:bg-muted/40',
        emphasize && 'border-amber-500/40 bg-amber-500/5',
      )}
    >
      <p className="text-3xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </Link>
  )
}

function TodayLessonRow({
  lesson,
  now,
}: {
  lesson: ScheduleLesson
  now: Date
}) {
  const cancelled = getLessonScheduleStatus(lesson) === 'CANCELLED'
  const current = isLessonCurrent(lesson, now)
  const pending = !cancelled && lesson.attendanceStatus !== 'COMPLETED'
  const isHomeroom = lesson.lessonKind === 'HOMEROOM'

  return (
    <li
      className={cn(
        'flex flex-wrap items-start justify-between gap-3 px-4 py-3.5',
        current && 'bg-primary/5',
        cancelled && 'opacity-70',
      )}
    >
      <div className="flex min-w-0 gap-4">
        <div className="w-14 shrink-0 pt-0.5">
          <p className="text-sm font-semibold tabular-nums">{lesson.startTime}</p>
          <p className="text-[11px] text-muted-foreground tabular-nums">
            {lesson.endTime}
          </p>
        </div>
        <div className="min-w-0 grid gap-0.5">
          {current ? (
            <p className="text-[10px] font-semibold tracking-wide text-primary uppercase">
              Đang diễn ra
            </p>
          ) : null}
          <p
            className={cn(
              'font-semibold',
              cancelled && 'text-muted-foreground line-through',
              isHomeroom && !cancelled && 'text-violet-700',
            )}
          >
            {lesson.subject} · {lesson.className}
            {isHomeroom ? ' · GVCN' : ''}
          </p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            {lesson.room ? `Phòng ${lesson.room}` : 'Chưa có phòng'}
            {cancelled && lesson.cancelReason
              ? ` · ${lesson.cancelReason}`
              : ''}
          </p>
        </div>
      </div>

      {!cancelled ? (
        <Link
          to="/attendance"
          search={{ tab: 'lessons', classId: lesson.classId }}
          className={cn(
            buttonVariants({
              size: 'sm',
              variant: pending ? (current ? 'default' : 'outline') : 'ghost',
            }),
          )}
        >
          {pending ? 'Điểm danh' : 'Đã điểm danh'}
        </Link>
      ) : (
        <span className="text-xs font-medium text-destructive">Đã hủy</span>
      )}
    </li>
  )
}
