import { Check, Clock3, CircleDashed, CircleX, FileCheck2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type AttendanceStatus } from "../data/schema";

const statusConfig: Record<
  AttendanceStatus,
  { label: string; icon: typeof Check; className: string }
> = {
  UNMARKED: {
    label: "Chưa điểm danh",
    icon: CircleDashed,
    className:
      "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300",
  },
  PRESENT: {
    label: "Có mặt",
    icon: Check,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  },
  ABSENT: {
    label: "Vắng",
    icon: CircleX,
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
  },
  LATE: {
    label: "Đi trễ",
    icon: Clock3,
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  },
  EXCUSED: {
    label: "Có phép",
    icon: FileCheck2,
    className:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300",
  },
};

export function AttendanceStatusBadge({
  status,
}: {
  status: AttendanceStatus;
}) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <Badge
      variant="outline"
      className={cn('gap-1 whitespace-nowrap', config.className)}
    >
      <Icon className="size-3.5 shrink-0" />
      {config.label}
    </Badge>
  );
}
