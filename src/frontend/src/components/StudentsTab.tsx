import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import type { Student } from "../backend";
import { useActor } from "../hooks/useActor";
import { useAllStudents, useDeleteStudent } from "../hooks/useQueries";

function StudentRow({ student, index }: { student: Student; index: number }) {
  const { actor, isFetching } = useActor();
  const deleteStudent = useDeleteStudent();

  const { data: attendanceData } = useQuery({
    queryKey: ["studentAttendance", student.id.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getStudentAttendancePercentage(student.id);
    },
    enabled: !!actor && !isFetching,
  });

  const { data: predictionData } = useQuery({
    queryKey: ["attendancePrediction", student.id.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAttendancePrediction(student.id);
    },
    enabled: !!actor && !isFetching,
  });

  const percentage = attendanceData
    ? Math.round(attendanceData[2] * 100)
    : null;
  const prediction = predictionData?.prediction ?? null;
  const isOnTrack = prediction === "On Track";

  const handleDelete = async () => {
    try {
      await deleteStudent.mutateAsync(student.id);
      toast.success(`${student.name} removed.`);
    } catch {
      toast.error("Failed to delete student.");
    }
  };

  return (
    <div
      className="flex items-center gap-4 p-4 hover:bg-secondary/50 rounded-lg transition-colors"
      data-ocid={`students.item.${index}`}
    >
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
        {student.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-foreground truncate">
          {student.name}
        </div>
        <div className="text-xs text-muted-foreground">
          ID: {student.id.toString()}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {percentage !== null ? (
          <span className="text-sm font-semibold text-foreground">
            {percentage}%
          </span>
        ) : (
          <Skeleton className="w-10 h-4" />
        )}
        {prediction ? (
          <Badge
            className={`rounded-full text-xs px-2 py-0.5 border-0 flex items-center gap-1 ${
              isOnTrack
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {isOnTrack ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {prediction}
          </Badge>
        ) : (
          <Skeleton className="w-16 h-5 rounded-full" />
        )}
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full w-8 h-8 p-0"
          onClick={handleDelete}
          disabled={deleteStudent.isPending}
          data-ocid={`students.delete_button.${index}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function StudentsTab() {
  const { data: students, isLoading } = useAllStudents();

  return (
    <div className="max-w-2xl">
      <Card className="shadow-card border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3" data-ocid="students.loading_state">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : !students?.length ? (
            <div
              className="py-16 text-center text-muted-foreground"
              data-ocid="students.empty_state"
            >
              <div className="w-12 h-12 rounded-full bg-secondary mx-auto mb-3 flex items-center justify-center text-2xl">
                👤
              </div>
              <p className="font-medium">No students registered yet</p>
              <p className="text-sm">
                Use the Register tab to add your first student.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border" data-ocid="students.list">
              {students.map((student, i) => (
                <StudentRow
                  key={student.id.toString()}
                  student={student}
                  index={i + 1}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
