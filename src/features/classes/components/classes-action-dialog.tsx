import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createClass,
  updateClass,
} from '@/features/classes/api/classes-api'
import { classKeys } from '@/features/classes/api/query-keys'
import { fetchTeacherOptions } from '@/features/teachers/api/teachers-api'
import { teacherKeys } from '@/features/teachers/api/query-keys'
import { getApiErrorMessage } from '@/lib/api/get-api-error-message'
import { showErrorToast, showSuccessToast } from '@/lib/show-toast-message'
import { useSchoolStore } from '@/stores/school-store'
import { type Class } from '../data/schema'

const GRADES = ['Khối 10', 'Khối 11', 'Khối 12'] as const
const NONE_TEACHER = '__none__'

const formSchema = z.object({
  name: z.string().min(1, 'Tên lớp là bắt buộc.'),
  grade: z.string().min(1, 'Vui lòng chọn khối.'),
  academicYear: z.string().min(1, 'Năm học là bắt buộc.'),
  homeroomTeacherId: z.string().optional(),
})

type ClassForm = z.infer<typeof formSchema>

type ClassesActionDialogProps = {
  currentRow?: Class | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Admin passes explicit school; teacher screen falls back to selected school. */
  schoolId?: string
}

export function ClassesActionDialog({
  currentRow,
  open,
  onOpenChange,
  schoolId: schoolIdProp,
}: ClassesActionDialogProps) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()
  const selectedSchoolId = useSchoolStore((s) => s.selectedSchool?.id)
  const schoolId = schoolIdProp || selectedSchoolId

  const teachersQuery = useQuery({
    queryKey: teacherKeys.options({
      schoolId: schoolId ?? '',
      status: 'Active',
    }),
    queryFn: () =>
      fetchTeacherOptions({
        schoolId: schoolId!,
        status: 'Active',
      }),
    enabled: open && Boolean(schoolId),
  })

  const teacherOptions = teachersQuery.data ?? []

  const form = useForm<ClassForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      grade: 'Khối 10',
      academicYear: '2025-2026',
      homeroomTeacherId: '',
    },
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      currentRow
        ? {
            name: currentRow.name,
            grade: currentRow.grade,
            academicYear: currentRow.academicYear,
            homeroomTeacherId: currentRow.homeroomTeacherId || '',
          }
        : {
            name: '',
            grade: 'Khối 10',
            academicYear: '2025-2026',
            homeroomTeacherId: '',
          },
    )
  }, [open, currentRow, form])

  const mutation = useMutation({
    mutationFn: async (values: ClassForm) => {
      if (!schoolId) throw new Error('Chưa chọn trường.')
      const raw = values.homeroomTeacherId?.trim()
      const homeroomTeacherId =
        !raw || raw === NONE_TEACHER ? null : raw
      if (isEdit && currentRow) {
        return updateClass(currentRow.id, schoolId, {
          name: values.name.trim(),
          grade: values.grade,
          academicYear: values.academicYear.trim(),
          homeroomTeacherId,
        })
      }
      return createClass({
        schoolId,
        name: values.name.trim(),
        grade: values.grade,
        academicYear: values.academicYear.trim(),
        homeroomTeacherId,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: classKeys.all })
      await queryClient.invalidateQueries({ queryKey: teacherKeys.all })
      onOpenChange(false)
      showSuccessToast(isEdit ? 'Đã cập nhật lớp.' : 'Đã tạo lớp.')
    },
    onError: (error) => {
      showErrorToast(
        getApiErrorMessage(
          error,
          isEdit ? 'Không thể cập nhật lớp.' : 'Không thể tạo lớp.',
        ),
      )
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!mutation.isPending) onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Chỉnh sửa lớp' : 'Tạo lớp'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Cập nhật thông tin lớp và giáo viên chủ nhiệm.'
              : 'Nhập thông tin lớp mới. Tên lớp phải duy nhất trong năm học.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="grid gap-4"
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên lớp</FormLabel>
                  <FormControl>
                    <Input placeholder="10A1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Khối</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn khối" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GRADES.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="academicYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Năm học</FormLabel>
                  <FormControl>
                    <Input placeholder="2025-2026" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="homeroomTeacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giáo viên chủ nhiệm</FormLabel>
                  <Select
                    value={field.value || NONE_TEACHER}
                    onValueChange={(value) =>
                      field.onChange(value === NONE_TEACHER ? '' : value)
                    }
                    disabled={!schoolId || teachersQuery.isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn GVCN (tuỳ chọn)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NONE_TEACHER}>Chưa gán</SelectItem>
                      {teacherOptions.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} · {item.accountNo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={mutation.isPending}
                onClick={() => onOpenChange(false)}
              >
                Huỷ
              </Button>
              <Button type="submit" disabled={mutation.isPending || !schoolId}>
                {mutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" /> Đang lưu
                  </>
                ) : isEdit ? (
                  'Lưu'
                ) : (
                  'Tạo lớp'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
