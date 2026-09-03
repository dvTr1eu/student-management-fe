import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
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
import { fetchActiveSchools } from '@/features/schools/api/schools-api'
import { schoolKeys } from '@/features/schools/api/query-keys'
import { getApiErrorMessage } from '@/lib/api/get-api-error-message'
import { showErrorToast, showSuccessToast } from '@/lib/show-toast-message'
import {
  createTeacher,
  fetchTeacherMeta,
  fetchSubjects,
  updateTeacher,
} from '../api/teachers-api'
import { subjectKeys, teacherKeys } from '../api/query-keys'
import { toApiTeacherStatus } from '../lib/map-teachers'
import type { TeacherRow } from '../lib/map-teachers'
import { TeacherSchoolClassPicker } from './teacher-school-class-picker'

const formSchema = z.object({
  name: z.string().min(1, 'Họ tên bắt buộc.'),
  email: z.email('Email không hợp lệ.'),
  password: z.string(),
  phone: z.string().min(1, 'Số điện thoại bắt buộc.'),
  subjectId: z.string().min(1, 'Chọn bộ môn.'),
  schoolIds: z.array(z.string()).min(1, 'Chọn ít nhất một trường.'),
  taughtClassIds: z.array(z.string()).min(1, 'Chọn ít nhất một lớp dạy.'),
  status: z.enum(['active', 'inactive']),
})

type FormValues = z.infer<typeof formSchema>

type TeachersActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  teacher: TeacherRow | null
}

function toDefaults(teacher: TeacherRow | null): FormValues {
  if (!teacher) {
    return {
      name: '',
      email: '',
      password: '',
      phone: '',
      subjectId: '',
      schoolIds: [],
      taughtClassIds: [],
      status: 'active',
    }
  }
  return {
    name: teacher.name,
    email: teacher.email,
    password: '',
    phone: teacher.phone,
    subjectId: teacher.subjectId,
    schoolIds: [...teacher.schoolIds],
    taughtClassIds: [...teacher.taughtClassIds],
    status: teacher.status,
  }
}

export function TeachersActionDialog({
  open,
  onOpenChange,
  teacher,
}: TeachersActionDialogProps) {
  const isEdit = Boolean(teacher)
  const queryClient = useQueryClient()

  const schoolsQuery = useQuery({
    queryKey: schoolKeys.active(),
    queryFn: fetchActiveSchools,
    enabled: open,
  })
  const subjectsQuery = useQuery({
    queryKey: subjectKeys.list(),
    queryFn: fetchSubjects,
    enabled: open,
  })

  const activeSchools = schoolsQuery.data ?? []
  const subjects = subjectsQuery.data ?? []
  const allSchoolIds = useMemo(
    () => activeSchools.map((school) => school.id),
    [activeSchools],
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: toDefaults(teacher),
  })

  const schoolIds = useWatch({ control: form.control, name: 'schoolIds' })
  const taughtClassIds = useWatch({
    control: form.control,
    name: 'taughtClassIds',
  })

  const metaQuery = useQuery({
    queryKey: teacherKeys.meta(allSchoolIds),
    queryFn: () => fetchTeacherMeta(allSchoolIds),
    enabled: open && allSchoolIds.length > 0,
  })

  const classesBySchool = metaQuery.data?.classesBySchool ?? {}

  const allowedClassIds = useMemo(() => {
    const ids = new Set<string>()
    for (const schoolId of schoolIds ?? []) {
      for (const item of classesBySchool[schoolId] ?? []) {
        ids.add(item.id)
      }
    }
    return ids
  }, [classesBySchool, schoolIds])

  useEffect(() => {
    if (!open) return
    form.reset(toDefaults(teacher))
  }, [open, teacher, form])

  // Drop taught classes that no longer belong to selected schools
  useEffect(() => {
    if (!open || !metaQuery.isSuccess) return
    const current = form.getValues('taughtClassIds')
    const next = current.filter((id) => allowedClassIds.has(id))
    if (next.length !== current.length) {
      form.setValue('taughtClassIds', next)
    }
  }, [allowedClassIds, form, open, metaQuery.isSuccess])

  const saveMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const password = values.password.trim()
      if (!isEdit && password.length < 7) {
        throw new Error('Mật khẩu tối thiểu 7 ký tự.')
      }
      if (isEdit && password.length > 0 && password.length < 7) {
        throw new Error('Mật khẩu tối thiểu 7 ký tự.')
      }

      const payload = {
        name: values.name.trim(),
        email: values.email.trim(),
        password: password || undefined,
        phone: values.phone.trim(),
        subjectId: values.subjectId,
        schoolIds: values.schoolIds,
        taughtClassIds: values.taughtClassIds,
        // Preserve homeroom assigned from Classes screen
        homeroomClassId: isEdit ? (teacher?.homeroomClassId ?? null) : null,
        status: toApiTeacherStatus(values.status),
      }

      if (isEdit && teacher) {
        return updateTeacher(teacher.id, payload)
      }
      if (!payload.password) {
        throw new Error('Mật khẩu bắt buộc khi tạo giáo viên.')
      }
      return createTeacher({ ...payload, password: payload.password })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: teacherKeys.all })
      showSuccessToast(
        isEdit ? 'Đã cập nhật giáo viên.' : 'Đã thêm giáo viên.',
      )
      onOpenChange(false)
    },
    onError: (error) => {
      showErrorToast(
        getApiErrorMessage(
          error,
          isEdit ? 'Không thể cập nhật giáo viên.' : 'Không thể thêm giáo viên.',
        ),
      )
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Sửa giáo viên' : 'Thêm giáo viên'}
          </DialogTitle>
          <DialogDescription>
            Tài khoản đăng nhập, bộ môn, trường và lớp dạy. Giáo viên chủ nhiệm
            chỉ gán ở màn Quản lý lớp học.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
            className="grid max-h-[70vh] gap-3 overflow-y-auto px-1"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Nguyễn Văn A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email đăng nhập</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="gv@school.edu"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {isEdit ? 'Mật khẩu (để trống = giữ)' : 'Mật khẩu'}
                    </FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input placeholder="09…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bộ môn</FormLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                      disabled={subjectsQuery.isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn môn" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjects.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormItem>
              <FormLabel>Trường & lớp dạy</FormLabel>
              <TeacherSchoolClassPicker
                key={teacher?.id ?? 'new'}
                schools={activeSchools}
                classesBySchool={classesBySchool}
                schoolIds={schoolIds ?? []}
                taughtClassIds={taughtClassIds ?? []}
                isLoading={
                  schoolsQuery.isLoading ||
                  (allSchoolIds.length > 0 && metaQuery.isLoading)
                }
                onSchoolIdsChange={(ids) =>
                  form.setValue('schoolIds', ids, { shouldValidate: true })
                }
                onTaughtClassIdsChange={(ids) =>
                  form.setValue('taughtClassIds', ids, { shouldValidate: true })
                }
              />
              {form.formState.errors.schoolIds ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.schoolIds.message}
                </p>
              ) : form.formState.errors.taughtClassIds ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.taughtClassIds.message}
                </p>
              ) : null}
            </FormItem>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="inactive">Ngưng</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={saveMutation.isPending}
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Đang lưu…
                  </>
                ) : isEdit ? (
                  'Lưu'
                ) : (
                  'Thêm'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
