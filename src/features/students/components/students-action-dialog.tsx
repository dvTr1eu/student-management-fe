import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import { Separator } from '@/components/ui/separator'
import type { ClassListItem } from '@/features/classes/api/classes-api'
import { createStudent, updateStudent } from '@/features/students/api/students-api'
import { studentKeys } from '@/features/students/api/query-keys'
import { getApiErrorMessage } from '@/lib/api/get-api-error-message'
import { showErrorToast, showSuccessToast } from '@/lib/show-toast-message'
import { useSchoolStore } from '@/stores/school-store'
import { type StudentDetail } from '../data/schema'
import { useStudents } from './students-provider'
import { pickDefaultStudentClassId } from '../lib/pick-default-class'

const formSchema = z.object({
  studentCode: z.string().min(1, 'Mã học sinh là bắt buộc.'),
  classId: z.string().min(1, 'Vui lòng chọn lớp.'),
  firstName: z.string().min(1, 'Tên là bắt buộc.'),
  lastName: z.string().min(1, 'Họ tên đệm là bắt buộc.'),
  email: z.union([z.literal(''), z.email('Email không hợp lệ.')]),
  phoneNumber: z.string().optional(),
  fatherName: z.string().optional(),
  fatherOccupation: z.string().optional(),
  fatherPhoneNumber: z.string().optional(),
  motherName: z.string().optional(),
  motherOccupation: z.string().optional(),
  motherPhoneNumber: z.string().optional(),
  address: z.string().optional(),
})

type StudentForm = z.infer<typeof formSchema>

type StudentActionDialogProps = {
  currentRow?: StudentDetail
  open: boolean
  onOpenChange: (open: boolean) => void
  classes: ClassListItem[]
}

const sections: Array<{
  title: string
  fields: Array<{ name: keyof StudentForm; label: string }>
}> = [
  {
    title: 'THÔNG TIN HỌC SINH',
    fields: [
      { name: 'studentCode', label: 'Mã học sinh' },
      { name: 'lastName', label: 'Họ tên đệm' },
      { name: 'firstName', label: 'Tên' },
      { name: 'email', label: 'Email' },
      { name: 'phoneNumber', label: 'Số điện thoại' },
      { name: 'address', label: 'Địa chỉ học sinh' },
    ],
  },
  {
    title: 'THÔNG TIN BỐ',
    fields: [
      { name: 'fatherName', label: 'Họ tên bố' },
      { name: 'fatherOccupation', label: 'Nghề nghiệp bố' },
      { name: 'fatherPhoneNumber', label: 'Số điện thoại bố' },
    ],
  },
  {
    title: 'THÔNG TIN MẸ',
    fields: [
      { name: 'motherName', label: 'Họ tên mẹ' },
      { name: 'motherOccupation', label: 'Nghề nghiệp mẹ' },
      { name: 'motherPhoneNumber', label: 'Số điện thoại mẹ' },
    ],
  },
]

function toGuardian(fullName?: string, occupation?: string, phoneNumber?: string) {
  if (!fullName && !occupation && !phoneNumber) return null
  return {
    fullName: fullName || null,
    occupation: occupation || null,
    phoneNumber: phoneNumber || null,
  }
}

export function StudentsActionDialog({
  currentRow,
  open,
  onOpenChange,
  classes,
}: StudentActionDialogProps) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()
  const schoolId = useSchoolStore((s) => s.selectedSchool?.id)
  const { selectedClassId } = useStudents()

  const defaultClassId =
    currentRow?.classId ||
    selectedClassId ||
    pickDefaultStudentClassId(classes)

  const form = useForm<StudentForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentCode: currentRow?.studentCode ?? '',
      classId: defaultClassId,
      firstName: currentRow?.firstName ?? '',
      lastName: currentRow?.lastName ?? '',
      email: currentRow?.email ?? '',
      phoneNumber: currentRow?.phoneNumber ?? '',
      fatherName: currentRow?.fatherName ?? '',
      fatherOccupation: currentRow?.fatherOccupation ?? '',
      fatherPhoneNumber: currentRow?.fatherPhoneNumber ?? '',
      motherName: currentRow?.motherName ?? '',
      motherOccupation: currentRow?.motherOccupation ?? '',
      motherPhoneNumber: currentRow?.motherPhoneNumber ?? '',
      address: currentRow?.address ?? '',
    },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      studentCode: currentRow?.studentCode ?? '',
      classId:
        currentRow?.classId ||
        selectedClassId ||
        pickDefaultStudentClassId(classes),
      firstName: currentRow?.firstName ?? '',
      lastName: currentRow?.lastName ?? '',
      email: currentRow?.email ?? '',
      phoneNumber: currentRow?.phoneNumber ?? '',
      fatherName: currentRow?.fatherName ?? '',
      fatherOccupation: currentRow?.fatherOccupation ?? '',
      fatherPhoneNumber: currentRow?.fatherPhoneNumber ?? '',
      motherName: currentRow?.motherName ?? '',
      motherOccupation: currentRow?.motherOccupation ?? '',
      motherPhoneNumber: currentRow?.motherPhoneNumber ?? '',
      address: currentRow?.address ?? '',
    })
  }, [open, currentRow, selectedClassId, classes, form])

  const mutation = useMutation({
    mutationFn: async (values: StudentForm) => {
      if (!schoolId) throw new Error('Chưa chọn trường.')

      const father = toGuardian(
        values.fatherName,
        values.fatherOccupation,
        values.fatherPhoneNumber,
      )
      const mother = toGuardian(
        values.motherName,
        values.motherOccupation,
        values.motherPhoneNumber,
      )

      if (isEdit && currentRow) {
        return updateStudent(currentRow.id, schoolId, {
          classId: values.classId,
          studentCode: values.studentCode,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email || null,
          phoneNumber: values.phoneNumber || null,
          address: values.address || null,
          father,
          mother,
        })
      }

      return createStudent({
        schoolId,
        classId: values.classId,
        studentCode: values.studentCode,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email || null,
        phoneNumber: values.phoneNumber || null,
        address: values.address || null,
        father,
        mother,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: studentKeys.lists() })
      form.reset()
      onOpenChange(false)
      showSuccessToast(
        isEdit
          ? 'Đã cập nhật thông tin học sinh.'
          : 'Đã thêm học sinh mới.',
      )
    },
    onError: (error) => {
      showErrorToast(getApiErrorMessage(error, 'Không thể lưu học sinh.'))
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset()
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="text-start">
          <DialogTitle>
            {isEdit ? 'Cập nhật thông tin học sinh' : 'Thêm học sinh'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Cập nhật thông tin học sinh.'
              : 'Nhập thông tin học sinh mới.'}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto px-1">
          <Form {...form}>
            <form
              id="student-form"
              onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
              className="space-y-3 py-1"
            >
              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lớp</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={classes.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn lớp" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.map((item) => (
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

              {sections.map(({ title, fields }, sectionIndex) => (
                <section key={title} className="space-y-3">
                  {sectionIndex > 0 && <Separator className="my-5" />}
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {fields.map(({ name, label }) => (
                      <FormField
                        key={name}
                        control={form.control}
                        name={name}
                        render={({ field }) => (
                          <FormItem
                            className={
                              name === 'address' ? 'sm:col-span-2' : ''
                            }
                          >
                            <FormLabel>{label}</FormLabel>
                            <FormControl>
                              <Input autoComplete="off" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            form="student-form"
            disabled={mutation.isPending || !schoolId}
          >
            {mutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : null}
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
