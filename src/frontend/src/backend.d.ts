import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AttendanceRecord {
    status: AttendanceStatus;
    studentId: bigint;
    date: string;
}
export interface UserProfile {
    name: string;
}
export interface Student {
    id: bigint;
    name: string;
    faceDescriptor: Array<number>;
}
export enum AttendanceStatus {
    present = "present",
    unknown_ = "unknown"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    authenticateFace(faceDescriptor: Array<number>, similarityThreshold: number): Promise<Student | null>;
    countPresentOnDate(date: string): Promise<bigint>;
    deleteStudent(id: bigint): Promise<void>;
    getAllAttendanceRecords(): Promise<Array<AttendanceRecord>>;
    getAllStudents(): Promise<Array<Student>>;
    getAllStudentsByName(): Promise<Array<Student>>;
    getAttendance(id: bigint, date: string): Promise<AttendanceStatus | null>;
    getAttendancePrediction(id: bigint): Promise<{
        prediction: string;
        attendanceRate: number;
    }>;
    getAttendanceRecordsOnDate(date: string): Promise<Array<AttendanceRecord>>;
    getAttendanceStats(): Promise<{
        presentToday: bigint;
        totalStudents: bigint;
    }>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getStudent(id: bigint): Promise<Student | null>;
    getStudentAttendancePercentage(id: bigint): Promise<[bigint, bigint, number]>;
    getStudentAttendanceRecords(studentId: bigint): Promise<Array<AttendanceRecord>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markAttendance(id: bigint, date: string, status: AttendanceStatus): Promise<void>;
    registerStudent(id: bigint, name: string, faceDescriptor: Array<number>): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
