import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar'
import { useLayout } from '@/context/layout-provider'
import { MOCK_ACCOUNTS } from '@/features/auth/data/mock-accounts'
import { getUserRoles, isAdmin } from '@/features/auth/lib/roles'
import { useTeacherStore } from '@/features/teachers/stores/teacher-store'
import { useAuthStore } from '@/stores/auth-store'
import { useSchoolStore } from '@/stores/school-store'
import { School as SchoolIcon } from 'lucide-react'
import { useMemo } from 'react'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import type { NavGroup as NavGroupType, NavItem } from './types'

function canSeeItem(
  item: NavItem,
  roles: ReturnType<typeof getUserRoles>,
): boolean {
  if (!item.roles || item.roles.length === 0) return true
  return item.roles.some((role) => roles.includes(role))
}

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const selectedSchool = useSchoolStore((s) => s.selectedSchool)
  const user = useAuthStore((s) => s.auth.user)
  const teachers = useTeacherStore((s) => s.teachers)
  const roles = getUserRoles(user)

  const displayUser = useMemo(() => {
    const email = user?.email ?? sidebarData.user.email
    const admin = MOCK_ACCOUNTS.find(
      (item) =>
        item.role === 'admin' &&
        item.email.toLowerCase() === email.toLowerCase(),
    )
    const teacher = teachers.find(
      (item) => item.email.toLowerCase() === email.toLowerCase(),
    )
    const name =
      user?.name ??
      admin?.name ??
      teacher?.name ??
      (isAdmin(user) ? 'Admin' : 'Người dùng')
    return {
      name,
      email,
      avatar: sidebarData.user.avatar,
    }
  }, [user, teachers])

  const navGroups = useMemo((): NavGroupType[] => {
    return sidebarData.navGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => canSeeItem(item, roles)),
      }))
      .filter((group) => group.items.length > 0)
  }, [roles])

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="pointer-events-none">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <SchoolIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-semibold">
                  {isAdmin(user)
                    ? 'Hệ thống quản trị'
                    : (selectedSchool?.name ?? 'Chưa chọn trường')}
                </span>
                {isAdmin(user) ? (
                  <span className="truncate text-xs text-muted-foreground">
                    Quản trị viên
                  </span>
                ) : null}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={displayUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
