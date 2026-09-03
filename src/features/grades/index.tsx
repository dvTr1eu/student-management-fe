import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/lib/api/get-api-error-message'
import { showErrorToast, showSuccessToast } from '@/lib/show-toast-message'
import { useSchoolStore } from '@/stores/school-store'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Download, Loader2, Upload } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  exportGradeBook,
  fetchGradeBook,
  fetchGradesMeta,
  fetchGradesOverview,
  patchGradeScores,
  type GradeBookDto,
} from './api/grades-api'
import { gradesKeys } from './api/query-keys'
import { GradesClassOverview } from './components/grades-class-overview'
import { GradesContextBar } from './components/grades-context-bar'
import { GradesEmptyState } from './components/grades-empty-state'
import { ALL_SUBJECTS, GradesFilters } from './components/grades-filters'
import { GradesImportDialog } from './components/grades-import-dialog'
import { GradesStatsTab } from './components/grades-stats-tab'
import { GradesStudentSheet } from './components/grades-student-sheet'
import { GradesSummaryCards } from './components/grades-summary-cards'
import { GradesSummaryTab } from './components/grades-summary-tab'
import { GradesTable } from './components/grades-table'
import { GradesTabs } from './components/grades-tabs'
import {
  canEditSubject,
  computeFinalScore,
  getRowStatus,
  isScoreComplete,
  SCORE_COLUMNS,
  type GradeStudentRow,
  type GradeTab,
  type ScoreColumn,
  type StudentScores,
} from './data/schema'
import {
  GRADES_ACADEMIC_YEARS,
  GRADES_SEMESTERS,
  formatAcademicYearLabel,
  mapGradeBookRows,
  mapGradesMeta,
  mapOverviewItem,
  normalizeAcademicYear,
  parseSemester,
  toSemesterNumber,
} from './lib/map-grades'

const route = getRouteApi('/_authenticated/grades/')

export function Grades() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const queryClient = useQueryClient()
  const school = useSchoolStore((s) => s.selectedSchool)
  const schoolId = school?.id

  const [year, setYear] = useState(() => normalizeAcademicYear(search.year))
  const [semester, setSemester] = useState(() => parseSemester(search.semester))
  const [classId, setClassId] = useState(search.classId ?? '')
  const [subjectId, setSubjectId] = useState(search.subjectId ?? '')
  const [tab, setTab] = useState<GradeTab>(search.tab ?? 'scores')
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  )
  const [importOpen, setImportOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [draftRows, setDraftRows] = useState<GradeStudentRow[]>([])
  const [dirty, setDirty] = useState(false)

  const semesterNumber = toSemesterNumber(semester)
  const isAllSubjects = subjectId === ALL_SUBJECTS
  const hasContext = Boolean(classId && subjectId)

  const metaQuery = useQuery({
    queryKey: gradesKeys.meta(schoolId ?? '', year),
    queryFn: async () => mapGradesMeta(await fetchGradesMeta(schoolId!, year)),
    enabled: !!schoolId,
  })

  const classes = metaQuery.data?.classes ?? []
  const subjects = metaQuery.data?.subjects ?? []
  const selectedClass = classes.find((item) => item.id === classId)
  const selectedSubject = subjects.find((item) => item.id === subjectId)

  const bookParams = useMemo(
    () =>
      schoolId && classId && subjectId && !isAllSubjects
        ? {
            schoolId,
            academicYear: year,
            semester: semesterNumber,
            classId,
            subjectId,
          }
        : null,
    [schoolId, year, semesterNumber, classId, subjectId, isAllSubjects],
  )

  const bookQuery = useQuery({
    queryKey: bookParams
      ? gradesKeys.book(bookParams)
      : [...gradesKeys.all, 'book', 'idle'],
    queryFn: () => fetchGradeBook(bookParams!),
    enabled: !!bookParams,
  })

  const overviewQuery = useQuery({
    queryKey: gradesKeys.overview({
      schoolId: schoolId ?? '',
      academicYear: year,
      semester: semesterNumber,
      classId,
    }),
    queryFn: async () => {
      const items = await fetchGradesOverview({
        schoolId: schoolId!,
        academicYear: year,
        semester: semesterNumber,
        classId,
      })
      return items.map(mapOverviewItem)
    },
    enabled: !!schoolId && !!classId && isAllSubjects,
  })

  const serverRows = useMemo(
    () => (bookQuery.data ? mapGradeBookRows(bookQuery.data) : []),
    [bookQuery.data],
  )
  const rows = draftRows
  const overview = overviewQuery.data ?? []
  const canEdit =
    bookQuery.data?.canEdit ?? canEditSubject(selectedClass, subjectId)
  const canImport = Boolean(
    schoolId && classId && subjectId && !isAllSubjects && canEdit,
  )

  // Reset local draft when server book changes (context switch / refetch / save)
  useEffect(() => {
    setDraftRows(serverRows)
    setDirty(false)
  }, [serverRows])

  // Sync URL deep-link classId (id or name)
  useEffect(() => {
    if (!search.classId || classes.length === 0) return
    const byId = classes.find((item) => item.id === search.classId)
    const byName = classes.find((item) => item.name === search.classId)
    const matched = byId ?? byName
    if (!matched) return

    setClassId(matched.id)
    if (!search.subjectId) {
      if (matched.isHomeroom) {
        setSubjectId(ALL_SUBJECTS)
      } else {
        setSubjectId(matched.subjectIds[0] ?? matched.taughtSubjectIds[0] ?? '')
      }
    }
  }, [search.classId, search.subjectId, classes])

  useEffect(() => {
    if (search.year) setYear(normalizeAcademicYear(search.year))
    if (search.semester) setSemester(parseSemester(search.semester))
    if (search.subjectId) setSubjectId(search.subjectId)
    if (search.tab) setTab(search.tab)
  }, [search.year, search.semester, search.subjectId, search.tab])

  useEffect(() => {
    const nextSearch = {
      year,
      semester,
      classId: classId || undefined,
      subjectId: subjectId || undefined,
      tab,
    }
    const same =
      search.year === nextSearch.year &&
      search.semester === nextSearch.semester &&
      (search.classId ?? undefined) === nextSearch.classId &&
      (search.subjectId ?? undefined) === nextSearch.subjectId &&
      (search.tab ?? 'scores') === nextSearch.tab
    if (same) return

    void navigate({ search: nextSearch, replace: true })
  }, [year, semester, classId, subjectId, tab, navigate, search])

  // Reset invalid subject when meta/class changes
  useEffect(() => {
    if (!classId || !selectedClass || !subjectId) return
    if (subjectId === ALL_SUBJECTS) {
      if (!selectedClass.isHomeroom) {
        setSubjectId(
          selectedClass.taughtSubjectIds[0] ??
            selectedClass.subjectIds[0] ??
            '',
        )
      }
      return
    }
    if (!selectedClass.subjectIds.includes(subjectId)) {
      setSubjectId(
        selectedClass.isHomeroom
          ? ALL_SUBJECTS
          : (selectedClass.taughtSubjectIds[0] ??
              selectedClass.subjectIds[0] ??
              ''),
      )
    }
  }, [classId, selectedClass, subjectId])

  const patchMutation = useMutation({
    mutationFn: async (
      updates: Array<{
        studentId: string
        column: ScoreColumn
        value: number | null
      }>,
    ) => {
      if (!bookParams) throw new Error('Thiếu ngữ cảnh bảng điểm.')
      return patchGradeScores(bookParams.schoolId, {
        academicYear: bookParams.academicYear,
        semester: bookParams.semester,
        classId: bookParams.classId,
        subjectId: bookParams.subjectId,
        updates,
      })
    },
    onSuccess: (updatedRows) => {
      if (!bookParams) return
      queryClient.setQueryData<GradeBookDto>(
        gradesKeys.book(bookParams),
        (current) => {
          if (!current) return current
          const byId = new Map(
            updatedRows.map((row) => [row.studentId, row] as const),
          )
          const students = current.students.map(
            (row) => byId.get(row.studentId) ?? row,
          )
          const completeCount = students.filter(
            (row) => row.status === 'complete',
          ).length
          const emptyCount = students.filter(
            (row) => row.status === 'empty',
          ).length
          const missingCount = students.length - completeCount - emptyCount
          return {
            ...current,
            students,
            summary: {
              ...current.summary,
              totalStudents: students.length,
              completeCount,
              missingCount,
              emptyCount,
            },
          }
        },
      )
      setDirty(false)
      showSuccessToast('Đã cập nhật điểm.')
    },
    onError: (error) => {
      showErrorToast(getApiErrorMessage(error, 'Không thể lưu điểm.'))
    },
  })

  function handleScoreChange(
    studentId: string,
    column: ScoreColumn,
    value: number | null,
  ) {
    if (!canEdit) return
    setDraftRows((prev) =>
      prev.map((row) => {
        if (row.studentId !== studentId) return row
        const scores: StudentScores = { ...row.scores, [column]: value }
        return {
          ...row,
          scores,
          finalScore: computeFinalScore(scores),
          status: getRowStatus(scores),
        }
      }),
    )
    setDirty(true)
  }

  function handleCancelEdits() {
    setDraftRows(serverRows)
    setDirty(false)
  }

  function handleSaveEdits() {
    const updates = buildScoreUpdates(serverRows, draftRows)
    if (updates.length === 0) {
      setDirty(false)
      return
    }
    patchMutation.mutate(updates)
  }
  const summaryCards = useMemo(() => {
    if (isAllSubjects) {
      const totalStudents = overview[0]?.totalCount ?? 0
      const subjectCount = overview.length
      const missingSubjects = overview.filter(
        (item) => item.status === 'missing',
      ).length
      return [
        { value: totalStudents, label: 'Học sinh' },
        { value: subjectCount, label: 'Môn học' },
        { value: missingSubjects, label: 'Môn thiếu điểm' },
      ]
    }

    // Prefer live draft counts while editing
    if (dirty || !bookQuery.data?.summary) {
      const total = rows.length
      const complete = rows.filter((row) =>
        row.status ? row.status === 'complete' : isScoreComplete(row.scores),
      ).length
      return [
        { value: total, label: 'Học sinh' },
        { value: complete, label: 'Đủ điểm' },
        { value: total - complete, label: 'Thiếu điểm' },
      ]
    }

    const summary = bookQuery.data.summary
    return [
      { value: summary.totalStudents, label: 'Học sinh' },
      { value: summary.completeCount, label: 'Đủ điểm' },
      { value: summary.missingCount, label: 'Thiếu điểm' },
    ]
  }, [rows, overview, isAllSubjects, bookQuery.data?.summary, dirty])

  const contextLabel = [
    formatAcademicYearLabel(year),
    GRADES_SEMESTERS.find((item) => item.id === semester)?.label,
    selectedClass?.name ?? bookQuery.data?.className,
    isAllSubjects
      ? 'Tất cả môn'
      : (selectedSubject?.name ?? bookQuery.data?.subjectName),
  ]
    .filter(Boolean)
    .join(' · ')

  async function handleExport() {
    if (!bookParams) return
    setExporting(true)
    try {
      await exportGradeBook(bookParams)
      showSuccessToast('Đã xuất Excel bảng điểm.')
    } catch (error) {
      showErrorToast(getApiErrorMessage(error, 'Export điểm thất bại.'))
    } finally {
      setExporting(false)
    }
  }

  const selectedStudent =
    rows.find((row) => row.studentId === selectedStudentId) ?? null

  const isLoadingContent =
    (hasContext && !isAllSubjects && bookQuery.isLoading) ||
    (hasContext && isAllSubjects && overviewQuery.isLoading)

  if (!schoolId) {
    return (
      <>
        <Header fixed>
          <ThemeSwitch />
          <ConfigDrawer />
        </Header>
        <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ĐIỂM</h1>
            <p className="text-muted-foreground">
              Vui lòng chọn trường để xem và nhập điểm.
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

      <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ĐIỂM</h1>
            <p className="text-muted-foreground">
              Quản lý và theo dõi kết quả học tập của học sinh
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!canImport}
              onClick={() => setImportOpen(true)}
            >
              <Upload />
              Import Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasContext || isAllSubjects || exporting}
              onClick={() => void handleExport()}
            >
              {exporting ? <Loader2 className="animate-spin" /> : <Download />}
              Xuất Excel
            </Button>
          </div>
        </div>

        <GradesFilters
          year={year}
          academicYears={[...GRADES_ACADEMIC_YEARS]}
          semester={semester}
          classId={classId}
          subjectId={subjectId}
          classes={classes}
          subjects={subjects}
          onYearChange={setYear}
          onSemesterChange={(value) => setSemester(parseSemester(value))}
          onClassChange={(value) => {
            setClassId(value)
            setTab('scores')
          }}
          onSubjectChange={(value) => {
            setSubjectId(value)
            setTab('scores')
          }}
        />

        {metaQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Đang tải lớp / môn…
          </div>
        ) : metaQuery.isError ? (
          <p className="text-sm text-destructive">
            {getApiErrorMessage(metaQuery.error, 'Không thể tải lớp/môn.')}
          </p>
        ) : !hasContext ? (
          <GradesEmptyState />
        ) : (
          <>
            <GradesContextBar
              year={year}
              semester={semester}
              classId={classId}
              subjectId={subjectId}
              classes={classes}
              subjects={subjects}
            />

            <GradesSummaryCards cards={summaryCards} />

            {!isAllSubjects ? (
              <GradesTabs value={tab} onChange={setTab} />
            ) : null}

            {isLoadingContent ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Đang tải bảng điểm…
              </div>
            ) : isAllSubjects ? (
              overviewQuery.isError ? (
                <p className="text-sm text-destructive">
                  {getApiErrorMessage(
                    overviewQuery.error,
                    'Không thể tải tổng quan lớp.',
                  )}
                </p>
              ) : (
                <div className="grid gap-3">
                  <p className="text-sm text-muted-foreground">
                    {selectedClass?.name} ·{' '}
                    {
                      GRADES_SEMESTERS.find((item) => item.id === semester)
                        ?.label
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    GVCN: chỉ nhập điểm môn đang dạy; các môn còn lại chỉ xem.
                  </p>
                  <GradesClassOverview
                    items={overview}
                    onSelectSubject={setSubjectId}
                  />
                </div>
              )
            ) : bookQuery.isError ? (
              <p className="text-sm text-destructive">
                {getApiErrorMessage(bookQuery.error, 'Không thể tải bảng điểm.')}
              </p>
            ) : tab === 'scores' ? (
              <div className="grid gap-3">
                {!canEdit ? (
                  <p className="rounded-md border border-dashed bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                    Bạn chỉ có quyền xem điểm môn này (không phải môn đang dạy).
                  </p>
                ) : null}
                <GradesTable
                  rows={rows}
                  readOnly={!canEdit}
                  dirty={dirty}
                  saving={patchMutation.isPending}
                  onScoreChange={handleScoreChange}
                  onSave={handleSaveEdits}
                  onCancel={handleCancelEdits}
                  onSelectStudent={setSelectedStudentId}
                />
              </div>
            ) : tab === 'summary' ? (
              <GradesSummaryTab rows={rows} contextLabel={contextLabel} />
            ) : (
              <GradesStatsTab rows={rows} />
            )}
          </>
        )}
      </Main>

      <GradesStudentSheet
        open={Boolean(selectedStudent)}
        onOpenChange={(open) => {
          if (!open) setSelectedStudentId(null)
        }}
        student={selectedStudent}
        className={selectedClass?.name ?? bookQuery.data?.className ?? ''}
        subjectName={
          selectedSubject?.name ?? bookQuery.data?.subjectName ?? ''
        }
      />

      <GradesImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        contextLabel={contextLabel}
        context={bookParams}
        students={rows.map((row) => ({
          studentCode: row.studentCode,
          fullName: row.fullName,
          tx1: row.scores.tx1,
          tx2: row.scores.tx2,
          tx3: row.scores.tx3,
          gk: row.scores.gk,
          ck: row.scores.ck,
        }))}
        templateFileName={`bang-diem-${selectedSubject?.id ?? 'mon'}-${selectedClass?.name ?? 'lop'}.xlsx`}
      />
    </>
  )
}

function buildScoreUpdates(
  serverRows: GradeStudentRow[],
  draftRows: GradeStudentRow[],
): Array<{ studentId: string; column: ScoreColumn; value: number | null }> {
  const serverById = new Map(serverRows.map((row) => [row.studentId, row]))
  const updates: Array<{
    studentId: string
    column: ScoreColumn
    value: number | null
  }> = []

  for (const draft of draftRows) {
    const server = serverById.get(draft.studentId)
    if (!server) continue
    for (const col of SCORE_COLUMNS) {
      const next = draft.scores[col.id]
      const prev = server.scores[col.id]
      if (next !== prev) {
        updates.push({
          studentId: draft.studentId,
          column: col.id,
          value: next,
        })
      }
    }
  }

  return updates
}
