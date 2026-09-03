import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { scheduleKeys } from '@/features/schedule/api/query-keys'
import {
  fetchLessonMeta,
  fetchLessons,
} from '@/features/schedule/api/schedule-api'
import {
  buildCalendarWeek,
  shiftCalendarWeek,
} from '@/features/schedule/lib/calendar-week'
import { buildSubjectFilterOptions } from '@/features/schedule/lib/map-schedule'
import { getApiErrorMessage } from '@/lib/api/get-api-error-message'
import { showErrorToast, showSuccessToast } from '@/lib/show-toast-message'
import { useAuthStore } from '@/stores/auth-store'
import { useSchoolStore } from '@/stores/school-store'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  fetchLessonAttendance,
  saveLessonAttendance,
} from './api/attendance-api'
import { attendanceKeys } from './api/query-keys'
import { AttendanceDetail } from './components/attendance-detail'
import { AttendanceHubTabs } from './components/attendance-hub-tabs'
import { AttendancePunctualityView } from './components/attendance-punctuality-view'
import { WeeklyCalendar } from './components/weekly-calendar'
import {
  type AttendanceHubTab,
  type AttendanceStatus,
  type AttendanceStudent,
  type Lesson,
} from './data/schema'
import {
  ATTENDANCE_ACADEMIC_YEARS,
  buildAttendanceLessonParams,
  buildPunctualityMonths,
  formatAcademicYearLabel,
  mapAttendanceLesson,
  mapAttendanceStudents,
  mapClassOptionsFromMeta,
  toApiAttendanceStatus,
} from './lib/map-attendance'

const route = getRouteApi('/_authenticated/attendance/')

export function Attendance() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.auth.user)
  const school = useSchoolStore((s) => s.selectedSchool)
  const schoolId = school?.id

  const punctualityMonths = useMemo(() => buildPunctualityMonths(), [])

  const initialTab: AttendanceHubTab =
    search.tab === 'punctuality' ? 'punctuality' : 'lessons'
  const initialMonth =
    punctualityMonths.find((item) => item.id === search.month)?.id ??
    punctualityMonths[0]!.id

  const [tab, setTab] = useState<AttendanceHubTab>(initialTab)
  const [academicYear, setAcademicYear] = useState<string>(
    ATTENDANCE_ACADEMIC_YEARS[0],
  )
  const [classId, setClassId] = useState(search.classId ?? 'all')
  const [kindFilter, setKindFilter] = useState('all')
  const [monthId, setMonthId] = useState(initialMonth)
  const [calendarAnchor, setCalendarAnchor] = useState(() => new Date())
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [students, setStudents] = useState<AttendanceStudent[]>([])

  const displayWeek = useMemo(
    () => buildCalendarWeek(calendarAnchor),
    [calendarAnchor],
  )

  useEffect(() => {
    if (schoolId) setCalendarAnchor(new Date())
  }, [schoolId, academicYear])

  useEffect(() => {
    if (search.tab === 'punctuality' || search.tab === 'lessons') {
      setTab(search.tab)
    }
    if (search.classId) setClassId(search.classId)
    if (search.month) {
      const matched = punctualityMonths.find((item) => item.id === search.month)
      if (matched) setMonthId(matched.id)
    }
  }, [search.tab, search.classId, search.month, punctualityMonths])

  const metaQuery = useQuery({
    queryKey: scheduleKeys.meta(schoolId ?? '', academicYear),
    queryFn: () => fetchLessonMeta(schoolId!, academicYear),
    enabled: !!schoolId,
  })

  const teacherClasses = useMemo(
    () => mapClassOptionsFromMeta(metaQuery.data?.classes ?? []),
    [metaQuery.data],
  )

  const kindOptions = useMemo(
    () =>
      buildSubjectFilterOptions(
        metaQuery.data ?? { classes: [], subjects: [] },
      ),
    [metaQuery.data],
  )

  useEffect(() => {
    if (classId === 'all') return
    if (
      teacherClasses.length > 0 &&
      !teacherClasses.some((item) => item.id === classId)
    ) {
      setClassId(teacherClasses[0]?.id ?? 'all')
    }
  }, [teacherClasses, classId])

  const lessonParams = schoolId
    ? buildAttendanceLessonParams({
        schoolId,
        academicYear,
        from: displayWeek.dates[0]!,
        to: displayWeek.dates[4]!,
        classId,
        kindFilter,
      })
    : null

  const lessonsQuery = useQuery({
    queryKey: attendanceKeys.lessons(lessonParams ?? {}),
    queryFn: async () => {
      const rows = await fetchLessons(lessonParams!)
      return rows.map(mapAttendanceLesson)
    },
    enabled: !!lessonParams && tab === 'lessons',
  })

  const visibleLessons = lessonsQuery.data ?? []

  const attendanceQuery = useQuery({
    queryKey: attendanceKeys.lessonAttendance(
      selectedLesson?.id ?? '',
      schoolId ?? '',
    ),
    queryFn: () => fetchLessonAttendance(selectedLesson!.id, schoolId!),
    enabled: !!schoolId && !!selectedLesson,
  })

  useEffect(() => {
    if (!attendanceQuery.data) return
    setStudents(mapAttendanceStudents(attendanceQuery.data))
  }, [attendanceQuery.data])

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!schoolId || !selectedLesson) {
        throw new Error('Chưa chọn trường hoặc tiết học.')
      }
      return saveLessonAttendance(
        selectedLesson.id,
        schoolId,
        students.map((student) => ({
          studentId: student.id,
          status: toApiAttendanceStatus(student.status),
          reason:
            student.status === 'ABSENT' || student.status === 'EXCUSED'
              ? student.reason || 'Không phép'
              : null,
          note: student.note || null,
        })),
      )
    },
    onSuccess: async (dto) => {
      setStudents(mapAttendanceStudents(dto))
      await queryClient.invalidateQueries({ queryKey: attendanceKeys.all })
      showSuccessToast(
        `Đã lưu điểm danh ${selectedLesson?.className} · ${selectedLesson?.subject}.`,
      )
    },
    onError: (error) => {
      showErrorToast(getApiErrorMessage(error, 'Không thể lưu điểm danh.'))
    },
  })

  const primarySubject =
    metaQuery.data?.subjects.find((item) => item.id !== 'homeroom') ??
    metaQuery.data?.subjects[0]
  const hasHomeroom = Boolean(
    metaQuery.data?.subjects.some((item) => item.id === 'homeroom'),
  )
  const roleHint = primarySubject
    ? hasHomeroom
      ? `Môn ${primarySubject.name} · có lớp GVCN`
      : `Môn ${primarySubject.name}`
    : user?.email ?? ''

  function syncSearch(next: {
    tab?: AttendanceHubTab
    classId?: string
    month?: string
  }) {
    void navigate({
      search: (prev) => ({
        ...prev,
        tab: next.tab ?? tab,
        classId: next.classId ?? classId,
        month: next.month ?? monthId,
      }),
      replace: true,
    })
  }

  function changeTab(value: AttendanceHubTab) {
    setTab(value)
    setSelectedLesson(null)
    syncSearch({ tab: value })
  }

  function changeClass(id: string) {
    setClassId(id)
    setSelectedLesson(null)
    syncSearch({ classId: id })
  }

  function changeMonth(id: string) {
    setMonthId(id)
    syncSearch({ month: id })
  }

  function goToday() {
    setCalendarAnchor(new Date())
    setSelectedLesson(null)
  }

  function goPrevWeek() {
    setCalendarAnchor((prev) => shiftCalendarWeek(prev, -1))
    setSelectedLesson(null)
  }

  function goNextWeek() {
    setCalendarAnchor((prev) => shiftCalendarWeek(prev, 1))
    setSelectedLesson(null)
  }

  const updateStudent = (studentId: string, status: AttendanceStatus) => {
    setStudents((current) =>
      current.map((student) =>
        student.id === studentId
          ? {
              ...student,
              status,
              reason:
                status === 'ABSENT' || status === 'EXCUSED'
                  ? (student.reason ?? 'Không phép')
                  : undefined,
            }
          : student,
      ),
    )
  }

  if (!schoolId) {
    return (
      <>
        <Header fixed>
          <ThemeSwitch />
          <ConfigDrawer />
        </Header>
        <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Điểm danh</h1>
            <p className="text-muted-foreground">
              Vui lòng chọn trường trước khi điểm danh.
            </p>
          </div>
        </Main>
      </>
    )
  }

  const inLessonDetail = tab === 'lessons' && selectedLesson
  const selectedClassOption =
    classId === 'all'
      ? teacherClasses[0]
      : (teacherClasses.find((item) => item.id === classId) ??
        teacherClasses[0])

  return (
    <>
      <Header fixed>
        <ThemeSwitch />
        <ConfigDrawer />
      </Header>
      <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
        {inLessonDetail ? (
          <AttendanceDetail
            lesson={selectedLesson}
            students={students}
            isLoading={attendanceQuery.isLoading}
            isSaving={saveMutation.isPending}
            onBack={() => setSelectedLesson(null)}
            onChange={updateStudent}
            onSave={() => saveMutation.mutate()}
          />
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Điểm danh</h1>
                <p className="text-muted-foreground">
                  {tab === 'lessons'
                    ? `Điểm danh tiết · ${roleHint}`
                    : `Chuyên cần theo học sinh · ${roleHint}`}
                </p>
              </div>
              <AttendanceHubTabs value={tab} onChange={changeTab} />
            </div>

            {tab === 'lessons' ? (
              <>
                {/* <div className="flex flex-wrap justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={visibleLessons.length === 0}
                    onClick={() =>
                      setSelectedLesson(
                        visibleLessons.find(
                          (lesson) => lesson.status !== 'COMPLETED',
                        ) ?? visibleLessons[0]!,
                      )
                    }
                  >
                    Tiết cần điểm danh
                  </Button>
                </div> */}
                <div className="grid gap-2 rounded-md border bg-muted/20 p-3 lg:grid-cols-[160px_1fr_220px] lg:items-center">
                  <Select value={academicYear} onValueChange={setAcademicYear}>
                    <SelectTrigger aria-label="Chọn năm học">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ATTENDANCE_ACADEMIC_YEARS.map((year) => (
                        <SelectItem key={year} value={year}>
                          {formatAcademicYearLabel(year)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-1 overflow-x-auto border-y py-2 lg:border-y-0 lg:py-0">
                    <Button
                      type="button"
                      className="shrink-0"
                      variant={classId === 'all' ? 'secondary' : 'ghost'}
                      onClick={() => changeClass('all')}
                    >
                      Tất cả
                    </Button>
                    {teacherClasses.map((item) => (
                      <Button
                        key={item.id}
                        type="button"
                        className="shrink-0"
                        variant={classId === item.id ? 'secondary' : 'ghost'}
                        onClick={() => changeClass(item.id)}
                      >
                        {item.name}
                      </Button>
                    ))}
                  </div>
                  <Select value={kindFilter} onValueChange={setKindFilter}>
                    <SelectTrigger aria-label="Lọc loại tiết">
                      <SelectValue placeholder="Loại tiết" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả tiết của bạn</SelectItem>
                      {kindOptions.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {lessonsQuery.isLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  </div>
                ) : lessonsQuery.isError ? (
                  <p className="text-sm text-destructive">
                    {lessonsQuery.error instanceof Error
                      ? lessonsQuery.error.message
                      : 'Không thể tải lịch điểm danh.'}
                  </p>
                ) : (
                  <WeeklyCalendar
                    week={displayWeek}
                    lessons={visibleLessons}
                    onPrev={goPrevWeek}
                    onNext={goNextWeek}
                    onToday={goToday}
                    onSelectLesson={setSelectedLesson}
                  />
                )}
              </>
            ) : selectedClassOption ? (
              <AttendancePunctualityView
                classes={teacherClasses}
                classId={
                  classId === 'all' ? selectedClassOption.id : classId
                }
                monthId={monthId}
                onClassChange={changeClass}
                onMonthChange={changeMonth}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Chưa có lớp được gán để xem chuyên cần.
              </p>
            )}
          </>
        )}
      </Main>
    </>
  )
}
