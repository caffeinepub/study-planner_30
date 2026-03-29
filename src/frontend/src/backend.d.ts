import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface StudySession {
    id: bigint;
    date: string;
    createdAt: bigint;
    durationMinutes: bigint;
    subjectId: bigint;
    notes: string;
}
export interface Subject {
    id: bigint;
    name: string;
    createdAt: bigint;
    colorHex: string;
}
export interface ScheduleEntry {
    id: bigint;
    startTime: string;
    endTime: string;
    dayOfWeek: bigint;
    entryLabel: string;
    subjectId: bigint;
}
export interface Goal {
    id: bigint;
    title: string;
    createdAt: bigint;
    completedHours: number;
    deadline?: string;
    subjectId: bigint;
    targetHours: number;
}
export interface backendInterface {
    addGoal(subjectId: bigint, title: string, targetHours: number, deadline: string | null): Promise<bigint>;
    addScheduleEntry(subjectId: bigint, dayOfWeek: bigint, startTime: string, endTime: string, entryLabel: string): Promise<bigint>;
    addSession(subjectId: bigint, durationMinutes: bigint, date: string, notes: string): Promise<bigint>;
    addSubject(name: string, colorHex: string): Promise<bigint>;
    deleteGoal(goalId: bigint): Promise<void>;
    deleteScheduleEntry(entryId: bigint): Promise<void>;
    deleteSession(sessionId: bigint): Promise<void>;
    deleteSubject(subjectId: bigint): Promise<void>;
    getGoals(): Promise<Array<Goal>>;
    getScheduleEntries(): Promise<Array<ScheduleEntry>>;
    getSessions(): Promise<Array<StudySession>>;
    getSubjectStudyMinutes(subjectId: bigint): Promise<bigint>;
    getSubjects(): Promise<Array<Subject>>;
    updateGoalProgress(goalId: bigint, hours: number): Promise<void>;
}
