import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAuthStore } from "@/stores/auth-store";
import { useSchoolStore } from "@/stores/school-store";
import { useNavigate } from "@tanstack/react-router";

interface SignOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const navigate = useNavigate();
  const { auth } = useAuthStore();
  const clearSelectedSchool = useSchoolStore((s) => s.clearSelectedSchool);

  const handleSignOut = () => {
    auth.reset();
    clearSelectedSchool();
    navigate({
      to: "/sign-in",
      replace: true,
    });
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Đăng xuất"
      desc="Bạn có chắc chắn muốn đăng xuất? Bạn sẽ cần đăng nhập lại để truy cập tài khoản của bạn."
      confirmText="Đăng xuất"
      destructive
      handleConfirm={handleSignOut}
      className="sm:max-w-sm"
    />
  );
}
