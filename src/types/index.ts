export type UserRole = "admin" | "teacher" | "student";

export type StudentStatus = "active" | "suspended" | "graduated" | "promoted";

export type ResultStatus = "draft" | "pending" | "approved" | "published";

export type PaymentStatus = "paid" | "partially_paid" | "unpaid";

export type PaymentPlan = "one_time" | "two_installments" | "three_installments" | "four_installments";

export type AnnouncementPriority = "low" | "normal" | "high";

export type Grade = "A" | "B" | "C" | "D" | "E" | "F";

export const CLASSES = ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"] as const;
export type ClassLevel = (typeof CLASSES)[number];

export const TERMS = ["First Term", "Second Term", "Third Term"] as const;
export type Term = (typeof TERMS)[number];

export const SUBJECTS = [
  "English Language",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Agricultural Science",
  "Economics",
  "Geography",
  "Civic Education",
  "Christian Religious Studies",
  "Literature in English",
  "Government",
  "Commerce",
  "Financial Accounting",
  "Further Mathematics",
  "Technical Drawing",
  "Food and Nutrition",
  "Home Economics",
  "Physical Education",
  "Computer Science",
  "Fine Arts",
  "Music",
  "French",
  "Igbo",
  "Hausa",
  "Yoruba",
  "Basic Science",
  "Basic Technology",
  "Social Studies",
  "Business Studies",
  "Home Economics",
  "Cultural and Creative Arts",
  "PHE",
] as const;
export type Subject = (typeof SUBJECTS)[number];

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
export type DayOfWeek = (typeof DAYS)[number];

export interface User {
  id: string;
  schoolId: string;
  role: UserRole;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  gender?: "male" | "female";
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  schoolId: string;
  userId: string;
  name: string;
  class: ClassLevel;
  session: string;
  term: Term;
  parentPhone: string;
  parentEmail?: string;
  gender: "male" | "female";
  address?: string;
  photoUrl?: string;
  status: StudentStatus;
  dateOfBirth?: string;
  admissionDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  id: string;
  schoolId: string;
  userId: string;
  name: string;
  subjects: Subject[];
  classes: ClassLevel[];
  classTeacher?: ClassLevel;
  phone?: string;
  email?: string;
  gender?: "male" | "female";
  address?: string;
  photoUrl?: string;
  qualification?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectResult {
  subject: Subject;
  ca: number;
  exam: number;
  total: number;
  grade: Grade;
  remark: string;
}

export interface Result {
  id: string;
  studentId: string;
  studentName: string;
  class: ClassLevel;
  term: Term;
  session: string;
  subject: Subject;
  teacherId: string;
  teacherName: string;
  ca: number;
  exam: number;
  total: number;
  grade: Grade;
  remark: string;
  status: ResultStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface ResultBatch {
  id: string;
  studentId: string;
  class: ClassLevel;
  term: Term;
  session: string;
  subjectResults: SubjectResult[];
  overallAverage: number;
  position: number;
  totalStudents: number;
  status: ResultStatus;
  submittedBy: string;
  submittedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  publishedAt?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string;
  recipientRole: UserRole;
  subject: string;
  content: string;
  read: boolean;
  replyTo?: string;
  replies?: MessageReply[];
  createdAt: string;
}

export interface MessageReply {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  pinned: boolean;
  authorId: string;
  authorName: string;
  targetRoles: UserRole[];
  createdAt: string;
  updatedAt: string;
}

export interface TimetableEntry {
  id: string;
  class: ClassLevel;
  day: DayOfWeek;
  period: number;
  subject: Subject;
  teacherId: string;
  teacherName: string;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  breakType?: "short" | "long";
}

export interface Timetable {
  id: string;
  class: ClassLevel;
  term: Term;
  session: string;
  entries: TimetableEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  class: ClassLevel;
  term: Term;
  session: string;
  feeType: string;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  paymentPlan: PaymentPlan;
  installments: Installment[];
  status: PaymentStatus;
  receiptNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Installment {
  id: string;
  amount: number;
  paid: boolean;
  paidAt?: string;
  receiptNumber?: string;
}

export interface Receipt {
  id: string;
  paymentId: string;
  studentId: string;
  studentName: string;
  class: ClassLevel;
  term: Term;
  session: string;
  amount: number;
  balance: number;
  receiptNumber: string;
  generatedAt: string;
  generatedBy: string;
}

export interface AcademicSession {
  id: string;
  year: string;
  currentTerm: Term;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt: string;
}

export interface SchoolSettings {
  id: string;
  schoolName: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  principalName?: string;
  currentSession: string;
  currentTerm: Term;
  updatedAt: string;
}

export interface GradeScale {
  grade: Grade;
  min: number;
  max: number;
  remark: string;
}

export const GRADE_SCALE: GradeScale[] = [
  { grade: "A", min: 70, max: 100, remark: "Excellent" },
  { grade: "B", min: 60, max: 69, remark: "Very Good" },
  { grade: "C", min: 50, max: 59, remark: "Good" },
  { grade: "D", min: 45, max: 49, remark: "Pass" },
  { grade: "E", min: 40, max: 44, remark: "Fair" },
  { grade: "F", min: 0, max: 39, remark: "Fail" },
];

export const getGrade = (total: number): { grade: Grade; remark: string } => {
  for (const scale of GRADE_SCALE) {
    if (total >= scale.min && total <= scale.max) {
      return { grade: scale.grade, remark: scale.remark };
    }
  }
  return { grade: "F", remark: "Fail" };
};

export const calculateGrade = (ca: number, exam: number) => {
  const total = ca + exam;
  const { grade, remark } = getGrade(total);
  return { total, grade, remark };
};
