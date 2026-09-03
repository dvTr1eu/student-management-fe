import { BookOpen } from 'lucide-react'

export function GradesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-16 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
        <BookOpen className="size-5 text-muted-foreground" />
      </div>
      <h3 className="text-base font-medium">Chưa chọn lớp</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Chọn lớp và môn để bắt đầu quản lý điểm.
      </p>
    </div>
  )
}
