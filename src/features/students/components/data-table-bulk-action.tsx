import { useState } from "react";
import { type Table } from "@tanstack/react-table";
import { Trash2, Mail } from "lucide-react";
import { toast } from "sonner";
import { sleep } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataTableBulkActions as BulkActionsToolbar } from "@/components/data-table";
import { type Student } from "../data/schema";
import { StudentsMultiDeleteDialog } from "./student-multi-delete-dialog";

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>;
};

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleBulkInvite = () => {
    const selectedStudents = selectedRows.map((row) => row.original as Student);
    toast.promise(sleep(2000), {
      loading: "Đang gửi...",
      success: () => {
        table.resetRowSelection();
        return `Đã gửi email cho ${selectedStudents.length} học sinh`;
      },
      error: "Error sending emails to students",
    });
    table.resetRowSelection();
  };

  return (
    <>
      <BulkActionsToolbar table={table} entityName="student">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={handleBulkInvite}
              className="size-8"
            >
              <Mail />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Gửi email thông báo</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
              className="size-8"
            >
              <Trash2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Xóa học sinh đã chọn</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <StudentsMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  );
}
