import { Download, Upload, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStudents } from './students-provider'

export function StudentsPrimaryButtons() {
  const { setOpen, selectedClassId } = useStudents()
  const canImport = Boolean(selectedClassId)

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        className="space-x-1"
        disabled={!canImport}
        title={
          canImport
            ? 'Import học sinh vào lớp đang chọn'
            : 'Chọn một lớp để import'
        }
        onClick={() => setOpen('import')}
      >
        <Upload size={18} />
        <span>Import Excel</span>
      </Button>
      <Button
        type="button"
        variant="outline"
        className="space-x-1"
        onClick={() => setOpen('export')}
      >
        <Download size={18} />
        <span>Xuất Excel</span>
      </Button>
      <Button
        type="button"
        className="space-x-1"
        onClick={() => setOpen('add')}
      >
        <span>Thêm mới học sinh</span> <UserPlus size={18} />
      </Button>
    </div>
  )
}
