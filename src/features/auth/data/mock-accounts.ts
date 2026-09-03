export type MockAccountRole = "teacher" | "admin";

export type MockAccount = {
  accountNo: string;
  email: string;
  password: string;
  name: string;
  role: MockAccountRole;
  /** School ids assigned to this teacher. Empty for admin = all schools. */
  schoolIds: string[];
};

/** Tài khoản admin cố định (mock). Giáo viên quản lý qua /admin/teachers. */
export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    accountNo: "AD001",
    email: "admin@demo.com",
    password: "Admin@123",
    name: "Quản trị viên",
    role: "admin",
    schoolIds: [],
  },
];
