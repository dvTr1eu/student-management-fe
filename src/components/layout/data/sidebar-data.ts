import {
  BookOpenText,
  CalendarDays,
  FaceSlightlyFrowning,
  LayoutDashboard,
  School,
  UserCog,
  Users,
  UserSearch,
} from 'lucide-react'
import type { SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Dao Van Trieu',
    email: 'test-dev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Trang chủ',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Quản lý giáo viên',
          url: '/admin/teachers',
          icon: UserCog,
          roles: ['admin'],
        },
        {
          title: 'Quản lý trường học',
          url: '/admin/schools',
          icon: School,
          roles: ['admin'],
        },
        {
          title: 'Quản lý lớp học',
          url: '/admin/classes',
          icon: BookOpenText,
          roles: ['admin'],
        },
        {
          title: 'Lịch học',
          url: '/schedule',
          icon: CalendarDays,
          roles: ['teacher'],
        },
        {
          title: 'Điểm danh',
          url: '/attendance',
          icon: UserSearch,
          roles: ['teacher'],
        },
        {
          title: 'Điểm',
          url: '/grades',
          icon: FaceSlightlyFrowning,
          roles: ['teacher'],
        },
        {
          title: 'Lớp học',
          url: '/classes',
          icon: BookOpenText,
          roles: ['teacher'],
        },
        {
          title: 'Học sinh',
          url: '/students',
          icon: Users,
          roles: ['teacher'],
        },
      ],
    },
  ],
}
