import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AttendanceStatus } from "../backend";
import type { Student } from "../backend";
import { useActor } from "./useActor";

export function useAttendanceStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["attendanceStats"],
    queryFn: async () => {
      if (!actor) return { presentToday: BigInt(0), totalStudents: BigInt(0) };
      return actor.getAttendanceStats();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
  });
}

export function useAllStudents() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allStudents"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStudentsByName();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStudentAttendancePercentage(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["studentAttendance", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getStudentAttendancePercentage(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useAttendancePrediction(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["attendancePrediction", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getAttendancePrediction(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useRegisterStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      name: string;
      faceDescriptor: Array<number>;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerStudent(
        params.id,
        params.name,
        params.faceDescriptor,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allStudents"] });
      queryClient.invalidateQueries({ queryKey: ["attendanceStats"] });
    },
  });
}

export function useMarkAttendance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: bigint; date: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.markAttendance(
        params.id,
        params.date,
        AttendanceStatus.present,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendanceStats"] });
    },
  });
}

export function useAuthenticateFace() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (descriptor: Array<number>): Promise<Student | null> => {
      if (!actor) throw new Error("Not connected");
      return actor.authenticateFace(descriptor, 0.5);
    },
  });
}

export function useDeleteStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteStudent(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allStudents"] });
      queryClient.invalidateQueries({ queryKey: ["attendanceStats"] });
    },
  });
}
