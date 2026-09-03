import { useEffect, useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import type { ClassListItem } from '@/features/classes/api/classes-api'
import { pickDefaultStudentClassId } from '../lib/pick-default-class'
import { type StudentListItem } from '../data/schema'
import { DataTableBulkActions } from './data-table-bulk-action'
import { studentsColumns as columns } from './students-column'
import { NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import { useStudents } from './students-provider'

type DataTableProps = {
  data: StudentListItem[]
  classes: ClassListItem[]
  classesLoading: boolean
  listLoading: boolean
  listError: boolean
  pageCount: number
  totalCount: number
  search: Record<string, unknown>
  navigate: NavigateFn
}

export function StudentsTable({
  data,
  classes,
  classesLoading,
  listLoading,
  listError,
  pageCount,
  totalCount,
  search,
  navigate,
}: DataTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const { selectedClassId, setSelectedClassId } = useStudents()

  const sortDir =
    (search['sortDir'] as 'asc' | 'desc' | undefined) ?? 'asc'
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'firstName', desc: sortDir === 'desc' },
  ])

  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: false },
    columnFilters: [
      { columnId: 'firstName', searchKey: 'firstName', type: 'string' },
    ],
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    pageCount,
    rowCount: totalCount,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      setSorting(next)
      const firstNameSort = next.find((s) => s.id === 'firstName')
      const dir = firstNameSort?.desc ? 'desc' : 'asc'
      void navigate({
        search: (prev) => ({
          ...prev,
          sortDir: dir,
          page: 1,
        }),
      })
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  })

  useEffect(() => {
    ensurePageInRange(pageCount)
  }, [pageCount, ensurePageInRange])

  useEffect(() => {
    if (classesLoading || classes.length === 0) return
    const isValid = classes.some((item) => item.id === selectedClassId)
    if (!selectedClassId || !isValid) {
      setSelectedClassId(pickDefaultStudentClassId(classes))
    }
  }, [classes, classesLoading, selectedClassId, setSelectedClassId])

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId)
    setRowSelection({})
    onPaginationChange((current) => ({ ...current, pageIndex: 0 }))
  }

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4',
      )}
    >
      <div
        aria-label="Lọc theo lớp"
        className="flex gap-1 overflow-x-auto border-b pb-1"
        role="tablist"
      >
        {classesLoading ? (
          <span className="flex items-center px-2 text-sm text-muted-foreground">
            <Loader2 className="me-1 size-4 animate-spin" />
            Đang tải lớp…
          </span>
        ) : classes.length === 0 ? (
          <span className="px-2 text-sm text-muted-foreground">
            Chưa có lớp được phân công.
          </span>
        ) : (
          classes.map((item) => (
            <Button
              key={item.id}
              aria-selected={selectedClassId === item.id}
              className="shrink-0"
              role="tab"
              variant={selectedClassId === item.id ? 'secondary' : 'ghost'}
              onClick={() => handleClassChange(item.id)}
            >
              {item.name}
              {item.isHomeroom ? ' · GVCN' : ''}
            </Button>
          ))
        )}
      </div>
      <DataTableToolbar
        table={table}
        searchPlaceholder="Lọc theo tên..."
        searchKey="firstName"
      />
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="group/row">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        (
                          header.column.columnDef.meta as
                            | { className?: string; thClassName?: string }
                            | undefined
                        )?.className,
                        (
                          header.column.columnDef.meta as
                            | { className?: string; thClassName?: string }
                            | undefined
                        )?.thClassName,
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {listLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : listError ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-destructive"
                >
                  Không thể tải danh sách học sinh.
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="group/row"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        (
                          cell.column.columnDef.meta as
                            | { className?: string; tdClassName?: string }
                            | undefined
                        )?.className,
                        (
                          cell.column.columnDef.meta as
                            | { className?: string; tdClassName?: string }
                            | undefined
                        )?.tdClassName,
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Không có học sinh nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className="mt-auto" />
      <DataTableBulkActions table={table} />
    </div>
  )
}
