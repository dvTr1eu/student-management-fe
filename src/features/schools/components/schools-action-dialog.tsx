import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import { getApiErrorMessage } from '@/lib/api/get-api-error-message'
import { showErrorToast, showSuccessToast } from '@/lib/show-toast-message'
import { createSchool, updateSchool } from '../api/schools-api'
import { schoolKeys } from '../api/query-keys'
import { toApiSchoolStatus } from '../lib/map-schools'
import type { ManagedSchool } from '../data/schema'

const formSchema = z.object({
  name: z.string().min(1, 'Tên trường bắt buộc.'),
  code: z.string().min(1, 'Mã trường bắt buộc.'),
  address: z.string().min(1, 'Địa chỉ bắt buộc.'),
  status: z.enum(['active', 'inactive']),
})

type FormValues = z.infer<typeof formSchema>

type SchoolsActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  school: ManagedSchool | null
}

function toDefaults(school: ManagedSchool | null): FormValues {
  if (!school) {
    return {
      name: '',
      code: '',
      address: '',
      status: 'active',
    }
  }
  return {
    name: school.name,
    code: school.code,
    address: school.address,
    status: school.status,
  }
}

export function SchoolsActionDialog({
  open,
  onOpenChange,
  school,
}: SchoolsActionDialogProps) {
  const isEdit = Boolean(school)
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: toDefaults(school),
  })

  useEffect(() => {
    if (open) form.reset(toDefaults(school))
  }, [open, school, form])

  const saveMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        name: values.name.trim(),
        code: values.code.trim().toUpperCase(),
        address: values.address.trim(),
        status: toApiSchoolStatus(values.status),
      }
      if (isEdit && school) {
        return updateSchool(school.id, payload)
      }
      return createSchool(payload)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: schoolKeys.all })
      showSuccessToast(
        isEdit ? 'Đã cập nhật trường học.' : 'Đã thêm trường học.',
      )
      onOpenChange(false)
    },
    onError: (error) => {
      showErrorToast(
        getApiErrorMessage(
          error,
          isEdit ? 'Không thể cập nhật trường.' : 'Không thể thêm trường.',
        ),
      )
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Sửa trường học' : 'Thêm trường học'}
          </DialogTitle>
          <DialogDescription>
            Thông tin trường dùng khi gán giáo viên và chọn trường đăng nhập.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
            className="grid gap-3"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên trường</FormLabel>
                  <FormControl>
                    <Input placeholder="THPT …" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã trường</FormLabel>
                  <FormControl>
                    <Input placeholder="THPT-PT" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ</FormLabel>
                  <FormControl>
                    <Input placeholder="Quận / thành phố" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
