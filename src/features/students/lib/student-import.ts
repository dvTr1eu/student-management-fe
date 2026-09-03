import * as XLSX from "xlsx";

/** Cột template Excel (đúng thứ tự header, không có STT). */
export const STUDENT_IMPORT_HEADERS = [
  "Mã học sinh",
  "Họ và tên đệm",
  "Tên",
  "Email",
  "Số điện thoại",
  "Địa chỉ",
  "Họ tên bố",
  "Nghề nghiệp bố",
  "SĐT bố",
  "Họ tên mẹ",
  "Nghề nghiệp mẹ",
  "SĐT mẹ",
] as const;

export type StudentImportRowInput = {
  rowNumber: number;
  studentCode: string;
  lastName: string;
  firstName: string;
  email: string;
  phoneNumber: string;
  address: string;
  fatherName: string;
  fatherOccupation: string;
  fatherPhoneNumber: string;
  motherName: string;
  motherOccupation: string;
  motherPhoneNumber: string;
};

export type StudentImportPreviewRow = StudentImportRowInput & {
  status: "valid" | "warning" | "error";
  message: string;
};

function cellText(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function isValidEmail(email: string): boolean {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  if (!phone) return true;
  return /^[0-9+\-\s()]{8,20}$/.test(phone);
}

function normalizeHeader(value: unknown): string {
  return cellText(value).replace(/\s+/g, " ");
}

function mapSheetRow(row: unknown[], rowNumber: number): StudentImportRowInput {
  return {
    rowNumber,
    studentCode: cellText(row[0]),
    lastName: cellText(row[1]),
    firstName: cellText(row[2]),
    email: cellText(row[3]),
    phoneNumber: cellText(row[4]),
    address: cellText(row[5]),
    fatherName: cellText(row[6]),
    fatherOccupation: cellText(row[7]),
    fatherPhoneNumber: cellText(row[8]),
    motherName: cellText(row[9]),
    motherOccupation: cellText(row[10]),
    motherPhoneNumber: cellText(row[11]),
  };
}

/** Validate cơ bản phía FE trước khi POST. */
export function validateImportRow(
  row: StudentImportRowInput,
  seenCodes: Set<string>,
): StudentImportPreviewRow {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!row.studentCode) errors.push("Thiếu mã học sinh");
  if (!row.lastName) errors.push("Thiếu họ và tên đệm");
  if (!row.firstName) errors.push("Thiếu tên");
  if (!isValidEmail(row.email)) errors.push("Email không hợp lệ");
  if (!isValidPhone(row.phoneNumber)) errors.push("SĐT không hợp lệ");
  if (!isValidPhone(row.fatherPhoneNumber)) errors.push("SĐT bố không hợp lệ");
  if (!isValidPhone(row.motherPhoneNumber)) errors.push("SĐT mẹ không hợp lệ");

  const codeKey = row.studentCode.toLowerCase();
  if (row.studentCode && seenCodes.has(codeKey)) {
    errors.push("Trùng mã học sinh trong file");
  } else if (row.studentCode) {
    seenCodes.add(codeKey);
  }

  if (!row.phoneNumber) warnings.push("Thiếu SĐT");
  if (!row.email) warnings.push("Thiếu email");

  if (errors.length > 0) {
    return { ...row, status: "error", message: errors.join("; ") };
  }
  if (warnings.length > 0) {
    return { ...row, status: "warning", message: warnings.join("; ") };
  }
  return { ...row, status: "valid", message: "Hợp lệ" };
}

export async function parseStudentImportFile(
  file: File,
): Promise<StudentImportPreviewRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("File Excel không có sheet nào.");

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error("Không đọc được sheet Excel.");

  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
  });

  if (rows.length < 2) {
    throw new Error("File không có dữ liệu học sinh.");
  }

  const header = (rows[0] ?? []).map(normalizeHeader);
  const expected = [...STUDENT_IMPORT_HEADERS];
  const headerOk = expected.every((name, index) => header[index] === name);
  if (!headerOk) {
    throw new Error(`Header không đúng template. Cần: ${expected.join(" | ")}`);
  }

  const seenCodes = new Set<string>();
  const preview: StudentImportPreviewRow[] = [];

  for (let i = 1; i < rows.length; i += 1) {
    const raw = rows[i] ?? [];
    const isEmpty = raw.every((cell) => cellText(cell) === "");
    if (isEmpty) continue;

    const mapped = mapSheetRow(raw, i + 1);
    preview.push(validateImportRow(mapped, seenCodes));
  }

  if (preview.length === 0) {
    throw new Error("Không tìm thấy dòng học sinh nào trong file.");
  }

  return preview;
}

/** Tải template .xlsx đúng cột yêu cầu (+ 1 dòng mẫu) — fallback local. */
export function downloadStudentImportTemplate() {
  const sample = [
    "01",
    "Nguyễn Văn",
    "A",
    "example@example.com",
    "0123456789",
    "Hà Nội",
    "Nguyễn Văn B",
    "Tự do",
    "0123456789",
    "Nguyễn Thị C",
    "Công nhân",
    "0123456789",
  ];

  const sheet = XLSX.utils.aoa_to_sheet([[...STUDENT_IMPORT_HEADERS], sample]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "HocSinh");
  XLSX.writeFile(workbook, "mau-import-hoc-sinh.xlsx");
}
