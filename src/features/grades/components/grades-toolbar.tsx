import { Loader2, RotateCcw, Save, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { StatusFilter } from '../data/schema'

type GradesToolbarProps = {
  query: string
  onQueryChange: (value: string) => void
  statusFilter: StatusFilter
  onStatusFilterChange: (value: StatusFilter) => void
  canEdit?: boolean
  dirty?: boolean
  saving?: boolean
  onSave?: () => void
  onCancel?: () => void
}

export function GradesToolbar({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  canEdit = false,
  dirty = false,
  saving = false,
  onSave,
  onCancel,
}: GradesToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[220px] flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Tìm theo tên hoặc mã học sinh..."
          className="ps-8"
        />
      </div>
      <Select
        value={statusFilter}
        onValueChange={(value) => onStatusFilterChange(value as StatusFilter)}
      >
        <SelectTrigger className="w-[150px]" aria-label="Lọc trạng thái">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="complete">Đủ điểm</SelectItem>
          <SelectItem value="missing">Thiếu điểm</SelectItem>
          <SelectItem value="empty">Chưa nhập</SelectItem>
        </SelectContent>
      </Select>
      {canEdit ? (
        <>
          <Button
            variant="outline"
            size="sm"
            disabled={!dirty || saving}
            onClick={onCancel}
          >
            <RotateCcw />
            Hủy
          </Button>
          <Button
            size="sm"
            disabled={!dirty || saving}
            onClick={onSave}
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save />}
            Cập nhật
          </Button>
        </>
      ) : null}
    </div>
  )
}
