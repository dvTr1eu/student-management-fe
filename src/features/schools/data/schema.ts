export type SchoolStatus = 'active' | 'inactive'

export type ManagedSchool = {
  id: string
  name: string
  code: string
  address: string
  status: SchoolStatus
}

export const initialSchools: ManagedSchool[] = [
  {
    id: 'school-1',
    name: 'THPT Phúc Thịnh',
    code: 'THPT-PT',
    address: 'Hà Nội',
    status: 'active',
  },
  {
    id: 'school-2',
    name: 'Cao đẳng Long Biên',
    code: 'CD-LB',
    address: 'Long Biên, Hà Nội',
    status: 'active',
  },
  {
    id: 'school-3',
    name: 'Trung cấp Bách Khoa',
    code: 'TC-BK',
    address: 'Hai Bà Trưng, Hà Nội',
    status: 'active',
  },
]
