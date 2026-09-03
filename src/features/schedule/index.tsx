import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { fetchClassesBySchool } from '@/features/classes/api/classes-api'
import { classKeys } from '@/features/classes/api/query-keys'
import { useAuthStore } from '@/stores/auth-store'
import { useSchoolStore } from '@/stores/school-store'
import { useQuery } from '@tanstack/react-query'
import { Plus, Settings2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { scheduleKeys } from './api/query-keys'
import {
  fetchAcademicWeeks,
  fetchLessonMeta,
  fetchLessons,
  fetchPeriodDefinitions,
} from './api/schedule-api'
import {
  ScheduleAddLessonDialog,
  getDefaultDayOfWeek,
} from './components/schedule-add-lesson-dialog'
import { ScheduleCurrentLesson } from './components/schedule-current-lesson'
import { ScheduleDayView } from './components/schedule-day-view'
import { ScheduleFilters } from './components/schedule-filters'
import { ScheduleLessonFormDialog } from './components/schedule-lesson-form-dialog'
import { ScheduleLessonSheet } from './components/schedule-lesson-sheet'
import { SchedulePeriodsDialog } from './components/schedule-periods-dialog'
import { ScheduleTodaySummary } from './components/schedule-today-summary'
import { ScheduleViewToggle } from './components/schedule-view-toggle'
import { ScheduleWeekNav } from './components/schedule-week-nav'
import { ScheduleWeekView } from './components/schedule-week-view'
import {
  WEEKDAY_FULL,
  formatDisplayDateFull,
  getDayOfWeek,
  isLessonCurrent,
  toIsoDate,
  type DayOfWeek,
  type ScheduleLesson,
  type ScheduleViewMode,
} from './data/schema'
import {
  buildCalendarWeek,
  findBeWeekForDate,
  shiftCalendarWeek,
} from './lib/calendar-week'
import {
  ACADEMIC_YEARS,
  buildClassOptions,
  buildLessonListParams,
  buildSubjectFilterOptions,
  buildTeacherProfile,
  mapAcademicWeek,
  mapLesson,
  resolvePeriods,
} from './lib/map-schedule'
import type { EmptySlotContext } from './types/slot'

export function Schedule() {
  const user = useAuthStore((s) => s.auth.user)
  const school = useSchoolStore((s) => s.selectedSchool)
  const schoolId = school?.id

  const now = new Date()
  const todayIso = toIsoDate(now)
  const todayDow = getDayOfWeek(todayIso)

  const [academicYear, setAcademicYear] = useState<string>(ACADEMIC_YEARS[0])
  /** Anchor date for calendar week (Mon–Fri computed client-side). */
  const [calendarAnchor, setCalendarAnchor] = useState(() => new Date())
  const [viewMode, setViewMode] = useState<ScheduleViewMode>('week')
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(todayDow ?? 2)
  const [classId, setClassId] = useState('all')
  const [kindFilter, setKindFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending'>('all')
  const [selectedLesson, setSelectedLesson] = useState<ScheduleLesson | null>(
    null,
  )
  const [periodsOpen, setPeriodsOpen] = useState(false)
  const [addLessonOpen, setAddLessonOpen] = useState(false)
  const [createSlot, setCreateSlot] = useState<EmptySlotContext | null>(null)
  const [editLesson, setEditLesson] = useState<ScheduleLesson | null>(null)

  useEffect(() => {
    if (schoolId) setCalendarAnchor(new Date())
  }, [schoolId, academicYear])

  const weeksQuery = useQuery({
    queryKey: scheduleKeys.weeks(schoolId ?? '', academicYear),
    queryFn: async () => {
      const rows = await fetchAcademicWeeks(schoolId!, academicYear)
      return rows.map(mapAcademicWeek)
    },
    enabled: !!schoolId,
  })

  const metaQuery = useQuery({
    queryKey: scheduleKeys.meta(schoolId ?? '', academicYear),
    queryFn: () => fetchLessonMeta(schoolId!, academicYear),
    enabled: !!schoolId,
  })

  const classesQuery = useQuery({
    queryKey: classKeys.bySchool(schoolId ?? ''),
    queryFn: () => fetchClassesBySchool(schoolId!),
    enabled: !!schoolId,
  })

  const periodsQuery = useQuery({
    queryKey: scheduleKeys.periods(schoolId ?? ''),
    queryFn: () => fetchPeriodDefinitions(schoolId!),
    enabled: !!schoolId,
  })

  const beWeeks = weeksQuery.data ?? []
  const periods = useMemo(
    () => resolvePeriods(periodsQuery.data),
    [periodsQuery.data],
  )

  const displayWeek = useMemo(() => {
    const calendarWeek = buildCalendarWeek(calendarAnchor)
    const beMatch = findBeWeekForDate(beWeeks, calendarWeek.dates[0]!)
    return beMatch ?? calendarWeek
  }, [calendarAnchor, beWeeks])

  const profile = useMemo(() => {
    if (!metaQuery.data) {
      return {
        email: user?.email ?? '',
        subjectId: '',
        subjectName: 'Môn học',
        taughtClassIds: [] as string[],
      }
    }
    return buildTeacherProfile(
      metaQuery.data,
      classesQuery.data ?? [],
      user?.email,
    )
  }, [metaQuery.data, classesQuery.data, user?.email])

  const teacherClasses = useMemo(
    () => buildClassOptions(metaQuery.data ?? { classes: [], subjects: [] }),
    [metaQuery.data],
  )

  const kindOptions = useMemo(
    () =>
      buildSubjectFilterOptions(
        metaQuery.data ?? { classes: [], subjects: [] },
      ),
    [metaQuery.data],
  )

  const lessonParams = schoolId
    ? buildLessonListParams({
        schoolId,
        week: displayWeek,
        academicYear,
        classId,
        kindFilter,
        statusFilter,
      })
    : null

  const lessonsQuery = useQuery({
    queryKey: scheduleKeys.lessons(lessonParams ?? {}),
    queryFn: async () => {
      const rows = await fetchLessons(lessonParams!)
      return rows.map(mapLesson)
    },
    enabled: !!lessonParams,
  })

  const todayLessonParams = schoolId
    ? {
        schoolId,
        from: todayIso,
        to: todayIso,
        academicYear,
        ...(classId !== 'all' ? { classId } : {}),
        ...(kindFilter === 'homeroom'
          ? { lessonKind: 'Homeroom' }
          : kindFilter !== 'all'
            ? { subjectId: kindFilter }
            : {}),
      }
    : null

  const todayLessonsQuery = useQuery({
    queryKey: scheduleKeys.lessons(todayLessonParams ?? {}),
    queryFn: async () => {
      const rows = await fetchLessons(todayLessonParams!)
      return rows.map(mapLesson)
    },
    enabled: !!todayLessonParams,
  })

  const lessons = lessonsQuery.data ?? []
  const todayLessons = (todayLessonsQuery.data ?? []).filter(
    (item) => item.scheduleStatus !== 'CANCELLED',
  )

  const currentLesson = todayLessons.find((item) => isLessonCurrent(item, now))
  const pendingToday = todayLessons.filter(
    (item) => item.attendanceStatus !== 'COMPLETED',
  ).length

  const sheetLesson = selectedLesson
    ? (lessons.find((item) => item.id === selectedLesson.id) ?? selectedLesson)
    : null

  const roleHint = profile.homeroomClassId
    ? `Môn ${profile.subjectName} · GVCN ${profile.homeroomClassName}`
    : `Môn ${profile.subjectName}`

  function goToday() {
    setCalendarAnchor(new Date())
    if (todayDow) {
      setDayOfWeek(todayDow)
      setViewMode('day')
    }
    setStatusFilter('all')
  }

  function goPrevWeek() {
    setCalendarAnchor((prev) => shiftCalendarWeek(prev, -1))
  }

  function goNextWeek() {
    setCalendarAnchor((prev) => shiftCalendarWeek(prev, 1))
  }

  function openEdit(lesson: ScheduleLesson) {
    setEditLesson(lesson)
  }

  function openCreateFlow(slot: EmptySlotContext) {
    setCreateSlot(slot)
  }

  if (!schoolId) {
    return (
      <>
        <Header fixed>
          <ThemeSwitch />
          <ConfigDrawer />
        </Header>
        <Main className="flex flex-1 flex-col gap-4 sm:gap-6" fluid>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Lịch học</h1>
            <p className="text-muted-foreground">
              Vui lòng chọn trường trước khi xem lịch giảng dạy.
            </p>
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header fixed>
        <ThemeSwitch />
        <ConfigDrawer />
      </Header>

      <Main className="flex flex-1 flex-col gap-4 sm:gap-6" fluid>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Lịch học</h1>
            <p className="text-muted-foreground">
              Lịch giảng dạy của bạn
              {school?.name ? ` tại ${school.name}` : ''}
              {' · '}
              {roleHint}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => setAddLessonOpen(true)}
            >
              <Plus />
              Thêm tiết học
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPeriodsOpen(true)}
            >
              <Settings2 />
              Cấu hình tiết
            </Button>
            <ScheduleViewToggle value={viewMode} onChange={setViewMode} />
          </div>
        </div>

        <ScheduleFilters
          year={academicYear}
          academicYears={[...ACADEMIC_YEARS]}
          classId={classId}
          kindFilter={kindFilter}
          statusFilter={statusFilter}
          classes={teacherClasses}
          kindOptions={kindOptions}
          onYearChange={setAcademicYear}
          onClassChange={setClassId}
          onKindFilterChange={setKindFilter}
          onStatusFilterChange={setStatusFilter}
        />

        <ScheduleWeekNav
          week={displayWeek}
          canPrev
          canNext
          onPrev={goPrevWeek}
          onNext={goNextWeek}
          onToday={goToday}
        />
        {todayDow ? (
          <ScheduleTodaySummary
            title={`Hôm nay · ${WEEKDAY_FULL[todayDow]} ${formatDisplayDateFull(todayIso)}`}
            cards={[
              {
                id: 'lessons',
                value: todayLessons.length,
                label: 'Tiết học',
              },
              {
                id: 'current',
                value: currentLesson ? 1 : 0,
                label: 'Đang dạy',
              },
              {
                id: 'pending',
                value: pendingToday,
                label: 'Chưa điểm danh',
                active: statusFilter === 'pending',
                onClick: () => {
                  goToday()
                  setStatusFilter((prev) =>
                    prev === 'pending' ? 'all' : 'pending',
                  )
                },
              },
            ]}
          />
        ) : null}

        {currentLesson ? (
          <ScheduleCurrentLesson lesson={currentLesson} />
        ) : null}

        {lessonsQuery.isLoading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Đang tải lịch học...
          </p>
        ) : lessonsQuery.isError ? (
          <p className="text-sm text-destructive">
            {lessonsQuery.error instanceof Error
              ? lessonsQuery.error.message
              : 'Không thể tải lịch học.'}
          </p>
        ) : viewMode === 'week' ? (
          <ScheduleWeekView
            week={displayWeek}
            academicYear={academicYear}
            lessons={lessons}
            periods={periods}
            now={now}
            onOpenDetail={setSelectedLesson}
            onEditLesson={openEdit}
            onEmptyClick={openCreateFlow}
          />
        ) : (
          <ScheduleDayView
            week={displayWeek}
            academicYear={academicYear}
            dayOfWeek={dayOfWeek}
            lessons={lessons}
            periods={periods}
            now={now}
            onDayChange={setDayOfWeek}
            onOpenDetail={setSelectedLesson}
            onEditLesson={openEdit}
            onEmptyClick={openCreateFlow}
          />
        )}
      </Main>

      <ScheduleAddLessonDialog
        open={addLessonOpen}
        onOpenChange={setAddLessonOpen}
        week={displayWeek}
        academicYear={academicYear}
        periods={periods}
        defaultDayOfWeek={getDefaultDayOfWeek(displayWeek, todayIso)}
        onConfirm={openCreateFlow}
      />

      <ScheduleLessonSheet
        open={Boolean(sheetLesson)}
        onOpenChange={(open) => {
          if (!open) setSelectedLesson(null)
        }}
        lesson={sheetLesson}
        onEdit={(lesson) => {
          setSelectedLesson(null)
          openEdit(lesson)
        }}
      />

      <ScheduleLessonFormDialog
        open={Boolean(createSlot)}
        onOpenChange={(open) => {
          if (!open) setCreateSlot(null)
        }}
        mode="create"
        schoolId={schoolId}
        profile={profile}
        classes={teacherClasses}
        slot={createSlot}
        academicYear={academicYear}
        existingLessons={lessons}
      />

      <ScheduleLessonFormDialog
        open={Boolean(editLesson)}
        onOpenChange={(open) => {
          if (!open) setEditLesson(null)
        }}
        mode="edit"
        schoolId={schoolId}
        profile={profile}
        classes={teacherClasses}
        lesson={editLesson}
        academicYear={academicYear}
        existingLessons={lessons}
      />

      <SchedulePeriodsDialog
        open={periodsOpen}
        onOpenChange={setPeriodsOpen}
        schoolId={schoolId}
        schoolName={school?.name}
        periods={periods}
      />
    </>
  )
}
