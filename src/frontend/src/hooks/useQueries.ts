import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Goal, ScheduleEntry, StudySession, Subject } from "../backend.d";
import { useActor } from "./useActor";

export function useSubjects() {
  const { actor, isFetching } = useActor();
  return useQuery<Subject[]>({
    queryKey: ["subjects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSubjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGoals() {
  const { actor, isFetching } = useActor();
  return useQuery<Goal[]>({
    queryKey: ["goals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGoals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSessions() {
  const { actor, isFetching } = useActor();
  return useQuery<StudySession[]>({
    queryKey: ["sessions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSessions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useScheduleEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<ScheduleEntry[]>({
    queryKey: ["schedule"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getScheduleEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

// Mutations
export function useAddSubject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      colorHex,
    }: { name: string; colorHex: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.addSubject(name, colorHex);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
  });
}

export function useDeleteSubject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteSubject(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
  });
}

export function useAddGoal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      subjectId,
      title,
      targetHours,
      deadline,
    }: {
      subjectId: bigint;
      title: string;
      targetHours: number;
      deadline: string | null;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addGoal(subjectId, title, targetHours, deadline);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}

export function useUpdateGoalProgress() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      goalId,
      hours,
    }: { goalId: bigint; hours: number }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateGoalProgress(goalId, hours);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}

export function useDeleteGoal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteGoal(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}

export function useAddSession() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      subjectId,
      durationMinutes,
      date,
      notes,
    }: {
      subjectId: bigint;
      durationMinutes: bigint;
      date: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addSession(subjectId, durationMinutes, date, notes);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
}

export function useDeleteSession() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteSession(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
}

export function useAddScheduleEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      subjectId,
      dayOfWeek,
      startTime,
      endTime,
      entryLabel,
    }: {
      subjectId: bigint;
      dayOfWeek: bigint;
      startTime: string;
      endTime: string;
      entryLabel: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addScheduleEntry(
        subjectId,
        dayOfWeek,
        startTime,
        endTime,
        entryLabel,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schedule"] }),
  });
}

export function useDeleteScheduleEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteScheduleEntry(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schedule"] }),
  });
}
