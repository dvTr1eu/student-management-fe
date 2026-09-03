import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getApiErrorMessage } from '@/lib/api/get-api-error-message'
import { showErrorToast, showSuccessToast } from '@/lib/show-toast-message'
import { upsertPeriodDefinitions } from '../api/schedule-api'
import { scheduleKeys } from '../api/query-keys'
import { mapPeriodToApiItem } from '../lib/map-schedule'
import {
  DEFAULT_PERIODS,
  type PeriodDefinition,
  type SessionType,
} from '../data/schema'

type SchedulePeriodsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  schoolId: string
  schoolName?: string
  periods: PeriodDefinition[]
}

type Draft = {
  id: string
  session: SessionType
  period: string
  label: string
  startTime: string
  endTime: string
}

const emptyDraft = (): Draft => ({
  id: '',
  session: 'morning',
  period: '1',
  label: '',
  startTime: '07:00',
  endTime: '07:45',
})

export function SchedulePeriodsDialog({
  open,
  onOpenChange,
  schoolId,
  schoolName,
  periods,
}: SchedulePeriodsDialogProps) {
  const queryClient = useQueryClient()
  const [localPeriods, setLocalPeriods] = useState<PeriodDefinition[]>(periods)
  const [editing, setEditing] = useState<Draft | null>(null)

  useEffect(() => {
    if (open) {
      setLocalPeriods(periods)
      setEditing(null)
    }
  }, [open, periods])

  const saveMutation = useMutation({
    mutationFn: async (nextPeriods: PeriodDefinition[]) => {
      return upsertPeriodDefinitions(
        schoolId,
        nextPeriods.map(mapPeriodToApiItem),
      )
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: scheduleKeys.periods(schoolId),
      })
    },
    onError: (error) => {
      showErrorToast(getApiErrorMessage(error, 'Không thể lưu cấu hình tiết.'))
    },
  })

  function persistPeriods(nextPeriods: PeriodDefinition[], message: string) {
    setLocalPeriods(nextPeriods)
    saveMutation.mutate(nextPeriods, {
      onSuccess: () => showSuccessToast(message),
    })
  }

  function startCreate() {
    const nextPeriod =
      Math.max(
        0,
        ...localPeriods
          .filter((item) => item.session === 'morning')
          .map((item) => item.period),
      ) + 1
    setEditing({
      ...emptyDraft(),
      id: `custom-${Date.now()}`,
      period: String(Math.min(nextPeriod, 10) || 1),
      label: `Tiết ${nextPeriod || 1}`,
    })
  }

  function startEdit(period: PeriodDefinition) {
    setEditing({
      id: period.id,
      session: period.session,
      period: String(period.period),
      label: period.label,
      startTime: period.startTime,
      endTime: period.endTime,
    })
  }

  function saveDraft() {
    if (!editing) return
    const periodNum = Number(editing.period)
    if (!editing.label.trim()) {
      showErrorToast('Vui lòng nhập tên tiết.')
      return
    }
    if (!periodNum || periodNum < 1 || periodNum > 15) {
      showErrorToast('Số tiết không hợp lệ.')
      return
    }
    if (editing.startTime >= editing.endTime) {
      showErrorToast('Giờ kết thúc phải sau giờ bắt đầu.')
      return
    }

    const duplicate = localPeriods.find(
      (item) =>
        item.id !== editing.id &&
        item.session === editing.session &&
        item.period === periodNum,
    )
    if (duplicate) {
      showErrorToast('Đã có tiết này trong buổi.')
      return
    }

    const nextPeriod: PeriodDefinition = {
      id: editing.id,
      session: editing.session,
      period: periodNum,
      label: editing.label.trim(),
      startTime: editing.startTime,
      endTime: editing.endTime,
    }

    const index = localPeriods.findIndex((item) => item.id === editing.id)
    const next =
      index >= 0
        ? localPeriods.map((item) => (item.id === editing.id ? nextPeriod : item))
        : [...localPeriods, nextPeriod]

    persistPeriods(next, 'Đã lưu cấu hình tiết học.')
    setEditing(null)
  }

  function handleDelete(periodId: string) {
    if (localPeriods.length <= 1) {
      showErrorToast('Phải còn ít nhất một tiết.')
      return
    }
    persistPeriods(
      localPeriods.filter((item) => item.id !== periodId),
      'Đã xóa tiết học.',
    )
  }

  function handleReset() {
    persistPeriods(
      DEFAULT_PERIODS.map((item) => ({ ...item })),
      'Đã khôi phục mặc định.',
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cấu hình tiết học</DialogTitle>
          <DialogDescription>
            Thời gian tiết theo trường
            {schoolName ? `: ${schoolName}` : ''}. Áp dụng cho lịch tuần /
            ngày.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={saveMutation.isPending}
            onClick={startCreate}
          >
            <Plus />
            Thêm tiết
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={saveMutation.isPending}
            onClick={handleReset}
          >
            <RotateCcw />
            Mặc định
          </Button>
        </div>

        <div className="max-h-72 overflow-y-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/80 text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Buổi</th>
                <th className="px-3 py-2 font-medium">Tiết</th>
                <th className="px-3 py-2 font-medium">Thời gian</th>
                <th className="px-3 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {localPeriods.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-3 py-2">
                    {item.session === 'morning' ? 'Sáng' : 'Chiều'}
                  </td>
                  <td className="px-3 py-2">{item.label}</td>
                  <td className="px-3 py-2 tabular-nums">
                    {item.startTime} – {item.endTime}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="ghost"
                        aria-label="Sửa tiết"
                        disabled={saveMutation.isPending}
                        onClick={() => startEdit(item)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="ghost"
                        aria-label="Xóa tiết"
                        disabled={saveMutation.isPending}
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {saveMutation.isPending ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Đang lưu cấu hình...
          </p>
        ) : null}

        {editing ? (
          <div className="grid gap-3 rounded-lg border p-3">
            <p className="text-sm font-medium">
              {localPeriods.some((p) => p.id === editing.id)
                ? 'Sửa tiết'
                : 'Thêm tiết mới'}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Buổi</Label>
                <Select
                  value={editing.session}
                  onValueChange={(value) =>
                    setEditing((prev) =>
                      prev
                        ? { ...prev, session: value as SessionType }
                        : prev,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Sáng</SelectItem>
                    <SelectItem value="afternoon">Chiều</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Số tiết</Label>
                <Input
                  type="number"
                  min={1}
                  max={15}
                  value={editing.period}
                  onChange={(event) =>
                    setEditing((prev) =>
                      prev
                        ? {
                            ...prev,
                            period: event.target.value,
                            label: prev.label.startsWith('Tiết')
                              ? `Tiết ${event.target.value}`
                              : prev.label,
                          }
                        : prev,
                    )
                  }
                />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <Label>Tên hiển thị</Label>
                <Input
                  value={editing.label}
                  onChange={(event) =>
                    setEditing((prev) =>
                      prev ? { ...prev, label: event.target.value } : prev,
                    )
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Bắt đầu</Label>
                <Input
                  type="time"
                  value={editing.startTime}
                  onChange={(event) =>
                    setEditing((prev) =>
                      prev
                        ? { ...prev, startTime: event.target.value }
                        : prev,
                    )
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Kết thúc</Label>
                <Input
                  type="time"
                  value={editing.endTime}
                  onChange={(event) =>
                    setEditing((prev) =>
                      prev ? { ...prev, endTime: event.target.value } : prev,
                    )
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(null)}
              >
                Hủy
              </Button>
              <Button type="button" onClick={saveDraft}>
                Lưu tiết
              </Button>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
