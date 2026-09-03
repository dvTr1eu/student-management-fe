import { toast } from "sonner";

export function showSuccessToast(message: string) {
  toast.success("Thành công", {
    description: message,
    duration: 5000,
    position: "top-center",
    className:
      "border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100",
  });
}

export function showErrorToast(message: string) {
  toast.error("Lỗi", {
    description: message,
    duration: 5000,
    position: "top-center",
    className:
      "border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100",
  });
}
