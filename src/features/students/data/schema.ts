import type {
  GuardianDto,
  StudentDetailDto,
  StudentListItemDto,
} from '../api/students-api'

/** List row shape used by the students table. */
export type StudentListItem = {
  id: string
  studentCode: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  classId: string
  class: string
  status: string
}

/** Detail / form shape (flattened guardians for UI). */
export type StudentDetail = StudentListItem & {
  schoolId: string
  address: string
  fatherName: string
  fatherOccupation: string
  fatherPhoneNumber: string
  motherName: string
  motherOccupation: string
  motherPhoneNumber: string
}

export type Student = StudentDetail

function guardianByRelation(guardians: GuardianDto[], relation: string) {
  return guardians.find(
    (g) => g.relation.toLowerCase() === relation.toLowerCase(),
  )
}

export function mapListItem(dto: StudentListItemDto): StudentListItem {
  return {
    id: dto.id,
    studentCode: dto.studentCode,
    firstName: dto.firstName,
    lastName: dto.lastName,
    email: dto.email ?? '',
    phoneNumber: dto.phoneNumber ?? '',
    classId: dto.classId,
    class: dto.className,
    status: dto.status,
  }
}

export function mapDetail(dto: StudentDetailDto): StudentDetail {
  const father = guardianByRelation(dto.guardians ?? [], 'Father')
  const mother = guardianByRelation(dto.guardians ?? [], 'Mother')

  return {
    id: dto.id,
    schoolId: dto.schoolId,
    studentCode: dto.studentCode,
    firstName: dto.firstName,
    lastName: dto.lastName,
    email: dto.email ?? '',
    phoneNumber: dto.phoneNumber ?? '',
    classId: dto.classId,
    class: dto.className,
    status: dto.status,
    address: dto.address ?? '',
    fatherName: father?.fullName ?? '',
    fatherOccupation: father?.occupation ?? '',
    fatherPhoneNumber: father?.phoneNumber ?? '',
    motherName: mother?.fullName ?? '',
    motherOccupation: mother?.occupation ?? '',
    motherPhoneNumber: mother?.phoneNumber ?? '',
  }
}
