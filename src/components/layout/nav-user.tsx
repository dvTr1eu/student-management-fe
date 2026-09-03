import { SignOutDialog } from "@/components/sign-out-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import useDialogState from "@/hooks/use-dialog-state";
import { isAdmin } from "@/features/auth/lib/roles";
import { useAuthStore } from "@/stores/auth-store";
import { useSchoolStore } from "@/stores/school-store";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronsUpDown, LogOut, RefreshCw, Settings } from "lucide-react";

type NavUserProps = {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
};

export function NavUser({ user }: NavUserProps) {
  const navigate = useNavigate();
  const { isMobile } = useSidebar();
  const [open, setOpen] = useDialogState();
  const authUser = useAuthStore((s) => s.auth.user);
  const clearSelectedSchool = useSchoolStore((s) => s.clearSelectedSchool);
  const admin = isAdmin(authUser);

  function handleChangeSchool() {
    clearSelectedSchool();
    void navigate({ to: "/select-school", replace: true });
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">SN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ms-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuItem asChild>
                <Link to="/">
                  <Settings />
                  Cài đặt
                </Link>
              </DropdownMenuItem>
              {!admin ? (
                <DropdownMenuItem onClick={handleChangeSchool}>
                  <RefreshCw />
                  Đổi trường
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setOpen(true)}
              >
                <LogOut />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  );
}
