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
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { scheduleKeys } from '../api/query-keys'
import {
  createLesson,
  deleteLesson,
  updateLesson,
} from '../api/schedule-api'
import {
  WEEKDAY_FULL,
  formatDisplayDateFull,
  type LessonScheduleStatus,
  type ScheduleClassOption,
  type ScheduleLesson,
  type TeacherScheduleProfile,
} from '../data/schema'
import {
  toApiLessonKind,
  toApiScheduleStatus,
  toApiSession,
} from '../lib/map-schedule'
import type { EmptySlotContext } from '../types/slot'

type ScheduleLessonFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  schoolId: string
  profile: TeacherScheduleProfile
  classes: ScheduleClassOption[]
  academicYear: string
  existingLessons: ScheduleLesson[]
  slot?: EmptySlotContext | null
  lesson?: ScheduleLesson | null
}

type FormState = {
  classId: string
  lessonKind: 'SUBJECT' | 'HOMEROOM'
  room: string
  scheduleStatus: LessonScheduleStatus
  originalRoom: string
  cancelReason: string
  makeupForDate: string
  originalDayLabel: string
}

function buildForm(
  profile: TeacherScheduleProfile,
  classes: ScheduleClassOption[],
  lesson?: ScheduleLesson | null,
): FormState {
  const defaultClass =
    classes.find((item) => item.id === profile.homeroomClassId)?.id ??
    classes[0]?.id ??
    ''

  if (lesson) {
    return {
      classId: lesson.classId,
      lessonKind: lesson.lessonKind === 'HOMEROOM' ? 'HOMEROOM' : 'SUBJECT',
      room: lesson.room,
      scheduleStatus: lesson.scheduleStatus ?? 'SCHEDULED',
      originalRoom: lesson.originalRoom ?? '',
      cancelReason: lesson.cancelReason ?? '',
      makeupForDate: lesson.makeupForDate ?? '',
      originalDayLabel: lesson.originalDayLabel ?? '',
    }
  }

  return {
    classId: defaultClass,
    lessonKind: 'SUBJECT',
    room: '',
    scheduleStatus: 'SCHEDULED',
    originalRoom: '',
    cancelReason: '',
    makeupForDate: '',
    originalDayLabel: '',
  }
}

export function ScheduleLessonFormDialog({
  open,
  onOpenChange,
  mode,
  schoolId,
  profile,
  classes,
  academicYear,
  existingLessons,
  slot,
  lesson,
}: ScheduleLessonFormDialogProps) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<FormState>(() =>
    buildForm(profile, classes, lesson),
  )

  useEffect(() => {
    if (open) setForm(buildForm(profile, classes, lesson))
  }, [open, profile, classes, lesson])

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.classId) throw new Error('Vui lòng chọn lớp.')
      if (!form.room.trim()) throw new Error('Vui lòng nhập phòng.')
      if (form.scheduleStatus === 'CHANGED' && !form.originalRoom.trim()) {
        throw new Error('Nhập phòng cũ khi đánh dấu lịch thay đổi.')
      }
      if (form.scheduleStatus === 'CANCELLED' && !form.cancelReason.trim()) {
        throw new Error('Nhập lý do hủy tiết.')
      }
      if (form.scheduleStatus === 'MAKEUP' && !form.makeupForDate.trim()) {
        throw new Error('Nhập ngày tiết gốc (YYYY-MM-DD) cho dạy bù.')
      }
      if (
        form.lessonKind === 'HOMEROOM' &&
        form.classId !== profile.homeroomClassId
      ) {
        throw new Error('Sinh hoạt lớp chỉ áp dụng lớp chủ nhiệm.')
      }

      const subjectId =
        form.lessonKind === 'HOMEROOM' ? 'homeroom' : profile.subjectId
      if (!subjectId) throw new Error('Không xác định được môn học.')

      if (mode === 'create') {
        if (!slot) throw new Error('Thiếu thông tin ô lịch.')
        const occupied = existingLessons.some(
          (item) =>
            item.date === slot.date &&
            item.session === slot.session &&
            item.period === slot.period,
        )
        if (occupied) throw new Error('Ô lịch này đã có tiết.')

        return createLesson({
          schoolId,
          classId: form.classId,
          subjectId,
          academicYear,
          lessonDate: slot.date,
          session: toApiSession(slot.session),
          periodNumber: slot.period,
          room: form.room.trim(),
          lessonKind: toApiLessonKind(form.lessonKind),
        })
      }

      if (!lesson) throw new Error('Không tìm thấy tiết học.')

      return updateLesson(lesson.id, schoolId, {
        room: form.room.trim(),
        scheduleStatus: toApiScheduleStatus(form.scheduleStatus),
        originalRoom:
          form.scheduleStatus === 'CHANGED'
            ? form.originalRoom.trim()
            : null,
        cancelReason:
          form.scheduleStatus === 'CANCELLED'
            ? form.cancelReason.trim()
            : null,
        makeupForDate:
          form.scheduleStatus === 'MAKEUP'
            ? form.makeupForDate.trim()
            : null,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: scheduleKeys.all })
      onOpenChange(false)
      showSuccessToast(
        mode === 'create' ? 'Đã thêm lịch học.' : 'Đã cập nhật lịch học.',
      )
    },
    onError: (error) => {
      showErrorToast(
        getApiErrorMessage(
          error,
          mode === 'create'
            ? 'Không thể tạo tiết học.'
            : 'Không thể cập nhật tiết học.',
        ),
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!lesson) throw new Error('Không tìm thấy tiết học.')
      await deleteLesson(lesson.id, schoolId)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: scheduleKeys.all })
      onOpenChange(false)
      showSuccessToast('Đã xóa lịch học.')
    },
    onError: (error) => {
      showErrorToast(getApiErrorMessage(error, 'Không thể xóa tiết học.'))
    },
  })

  const canHomeroom = Boolean(profile.homeroomClassId)
  const subjectClasses = classes.filter((item) =>
    profile.taughtClassIds.includes(item.id),
  )
  const classOptions =
    form.lessonKind === 'HOMEROOM'
      ? classes.filter((item) => item.id === profile.homeroomClassId)
      : subjectClasses

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const titleContext =
    mode === 'create' && slot
      ? `${WEEKDAY_FULL[slot.dayOfWeek]} · ${formatDisplayDateFull(slot.date)} · Tiết ${slot.period}`
      : lesson
        ? `${lesson.subject} · ${lesson.className}`
        : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Thêm lịch học' : 'Sửa lịch học'}
          </DialogTitle>
          <DialogDescription>{titleContext}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          {canHomeroom ? (
            <div className="grid gap-1.5">
              <Label>Loại tiết</Label>
              <Select
                value={form.lessonKind}
                onValueChange={(value) => {
                  const kind = value as 'SUBJECT' | 'HOMEROOM'
                  patch('lessonKind', kind)
                  if (kind === 'HOMEROOM' && profile.homeroomClassId) {
                    patch('classId', profile.homeroomClassId)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUBJECT">{profile.subjectName}</SelectItem>
                  <SelectItem value="HOMEROOM">Sinh hoạt lớp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="grid gap-1.5">
            <Label>Lớp</Label>
            <Select
              value={form.classId}
              onValueChange={(value) => patch('classId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn lớp" />
              </SelectTrigger>
              <SelectContent>
                {classOptions.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label>Phòng</Label>
            <Input
              value={form.room}
              onChange={(event) => patch('room', event.target.value)}
              placeholder="A203"
            />
          </div>

          {mode === 'edit' ? (
            <div className="grid gap-1.5">
              <Label>Trạng thái lịch</Label>
              <Select
                value={form.scheduleStatus}
                onValueChange={(value) =>
                  patch('scheduleStatus', value as LessonScheduleStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCHEDULED">Bình thường</SelectItem>
                  <SelectItem value="CHANGED">Lịch thay đổi</SelectItem>
                  <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                  <SelectItem value="MAKEUP">Dạy bù</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {form.scheduleStatus === 'CHANGED' ? (
            <>
              <div className="grid gap-1.5">
                <Label>Phòng cũ</Label>
                <Input
                  value={form.originalRoom}
                  onChange={(event) => patch('originalRoom', event.target.value)}
                  placeholder="A203"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Ghi chú (tuỳ chọn)</Label>
                <Input
                  value={form.originalDayLabel}
                  onChange={(event) =>
                    patch('originalDayLabel', event.target.value)
                  }
                  placeholder="VD: từ Thứ Năm"
                />
              </div>
            </>
          ) : null}

          {form.scheduleStatus === 'CANCELLED' ? (
            <div className="grid gap-1.5">
              <Label>Lý do hủy</Label>
              <Input
                value={form.cancelReason}
                onChange={(event) => patch('cancelReason', event.target.value)}
                placeholder="Nghỉ lễ / hoạt động toàn trường"
              />
            </div>
          ) : null}

          {form.scheduleStatus === 'MAKEUP' ? (
            <>
              <div className="grid gap-1.5">
                <Label>Ngày tiết gốc (YYYY-MM-DD)</Label>
                <Input
                  value={form.makeupForDate}
                  onChange={(event) =>
                    patch('makeupForDate', event.target.value)
                  }
                  placeholder="2026-08-20"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Thứ gốc (tuỳ chọn)</Label>
                <Input
                  value={form.originalDayLabel}
                  onChange={(event) =>
                    patch('originalDayLabel', event.target.value)
                  }
                  placeholder="Thứ Năm"
                />
              </div>
            </>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          {mode === 'edit' ? (
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending || saveMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" /> Đang xóa
                </>
              ) : (
                'Xóa lịch'
              )}
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={saveMutation.isPending || deleteMutation.isPending}
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              disabled={saveMutation.isPending || deleteMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" /> Đang lưu
                </>
              ) : mode === 'create' ? (
                'Thêm'
              ) : (
                'Lưu'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
