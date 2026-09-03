import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, TriangleAlert } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  SCORE_COLUMNS,
  computeFinalScore,
  getRowStatus,
  type GradeStudentRow,
  type ScoreColumn,
  type StatusFilter,
} from '../data/schema'
import { GradesScoreCell } from './grades-score-cell'
import { GradesToolbar } from './grades-toolbar'

type SortKey = 'name' | 'code' | 'final'
type SortDir = 'asc' | 'desc'

type GradesTableProps = {
  rows: GradeStudentRow[]
  readOnly?: boolean
  dirty?: boolean
  saving?: boolean
  onScoreChange: (
    studentId: string,
    column: ScoreColumn,
    value: number | null,
  ) => void
  onSave: () => void
  onCancel: () => void
  onSelectStudent: (studentId: string) => void
}

export function GradesTable({
  rows,
  readOnly = false,
  dirty = false,
  saving = false,
  onScoreChange,
  onSave,
  onCancel,
  onSelectStudent,
}: GradesTableProps) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [editingCell, setEditingCell] = useState<{
    studentId: string
    column: ScoreColumn
  } | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let next = rows.filter((row) => {
      const matchQuery =
        !q ||
        row.fullName.toLowerCase().includes(q) ||
        row.studentCode.toLowerCase().includes(q)
      if (!matchQuery) return false
      const status = row.status ?? getRowStatus(row.scores)
      if (statusFilter === 'all') return true
      return status === statusFilter
    })

    next = [...next].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') cmp = a.fullName.localeCompare(b.fullName, 'vi')
      if (sortKey === 'code')
        cmp = a.studentCode.localeCompare(b.studentCode, 'vi')
      if (sortKey === 'final') {
        const fa = computeFinalScore(a.scores)
        const fb = computeFinalScore(b.scores)
        cmp = (fa ?? -1) - (fb ?? -1)
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return next
  }, [rows, query, statusFilter, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function moveEdit(
    studentId: string,
    column: ScoreColumn,
    direction: 'down' | 'next',
  ) {
    const rowIndex = filtered.findIndex((row) => row.studentId === studentId)
    const colIndex = SCORE_COLUMNS.findIndex((col) => col.id === column)
    if (rowIndex < 0 || colIndex < 0) return

    if (direction === 'down') {
      const nextRow = filtered[rowIndex + 1]
      if (nextRow) {
        setEditingCell({ studentId: nextRow.studentId, column })
      } else {
        setEditingCell(null)
      }
      return
    }

    const nextCol = SCORE_COLUMNS[colIndex + 1]
    if (nextCol) {
      setEditingCell({ studentId, column: nextCol.id })
      return
    }
    const nextRow = filtered[rowIndex + 1]
    if (nextRow) {
      setEditingCell({
        studentId: nextRow.studentId,
        column: SCORE_COLUMNS[0]!.id,
      })
    } else {
      setEditingCell(null)
    }
  }

  return (
    <div className="grid gap-3">
      <GradesToolbar
        query={query}
        onQueryChange={setQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        canEdit={!readOnly}
        dirty={dirty}
        saving={saving}
        onSave={onSave}
        onCancel={onCancel}
      />

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky start-0 z-10 min-w-[180px] bg-background">
                <SortButton
                  label="Học sinh"
                  active={sortKey === 'name'}
                  dir={sortDir}
                  onClick={() => toggleSort('name')}
                />
              </TableHead>
              <TableHead className="min-w-[90px]">
                <SortButton
                  label="Mã HS"
                  active={sortKey === 'code'}
                  dir={sortDir}
                  onClick={() => toggleSort('code')}
                />
              </TableHead>
              {SCORE_COLUMNS.map((col) => (
                <TableHead key={col.id} className="min-w-[72px] text-center">
                  {col.label}
                </TableHead>
              ))}
              <TableHead className="min-w-[100px] text-center">
                <SortButton
                  label="Tổng kết"
                  active={sortKey === 'final'}
                  dir={sortDir}
                  onClick={() => toggleSort('final')}
                />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={SCORE_COLUMNS.length + 3}
                  className="h-24 text-center text-muted-foreground"
                >
                  Không tìm thấy học sinh.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => {
                // FE preview while editing; same formula as BE
                const finalScore = computeFinalScore(row.scores)
                const status = getRowStatus(row.scores)
                return (
                  <TableRow key={row.studentId}>
                    <TableCell className="sticky start-0 z-10 bg-background font-medium">
                      <button
                        type="button"
                        className="text-start hover:underline"
                        onClick={() => onSelectStudent(row.studentId)}
                      >
                        {row.fullName}
                      </button>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.studentCode}
                    </TableCell>
                    {SCORE_COLUMNS.map((col) => {
                      const isEditing =
                        editingCell?.studentId === row.studentId &&
                        editingCell.column === col.id
                      return (
                        <TableCell key={col.id} className="text-center">
                          <GradesScoreCell
                            key={`${row.studentId}-${col.id}-${isEditing}`}
                            value={row.scores[col.id]}
                            locked={readOnly || row.locked}
                            autoEdit={isEditing}
                            onEditStart={() =>
                              setEditingCell({
                                studentId: row.studentId,
                                column: col.id,
                              })
                            }
                            onEditEnd={() => setEditingCell(null)}
                            onSave={(value) =>
                              onScoreChange(row.studentId, col.id, value)
                            }
                            onMoveDown={() =>
                              moveEdit(row.studentId, col.id, 'down')
                            }
                            onMoveNext={() =>
                              moveEdit(row.studentId, col.id, 'next')
                            }
                          />
                        </TableCell>
                      )
                    })}
                    <TableCell className="text-center tabular-nums">
                      {status === 'complete' && finalScore != null ? (
                        <span>{finalScore.toFixed(1)}</span>
                      ) : status === 'empty' ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <span className="inline-flex items-center justify-center gap-1 text-amber-600">
                          <TriangleAlert className="size-3.5" />
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function SortButton({
  label,
  active,
  dir,
  onClick,
}: {
  label: string
  active: boolean
  dir: SortDir
  onClick: () => void
}) {
  const Icon = !active ? ArrowUpDown : dir === 'asc' ? ArrowUp : ArrowDown
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 hover:text-foreground',
        active ? 'text-foreground' : 'text-muted-foreground',
      )}
    >
      {label}
      <Icon className="size-3.5" />
    </button>
  )
}
