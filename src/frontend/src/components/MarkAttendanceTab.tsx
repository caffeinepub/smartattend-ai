import { useCamera } from "@/camera/useCamera";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Camera, RefreshCw } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import type { Student } from "../backend";
import {
  useAttendanceStats,
  useAuthenticateFace,
  useMarkAttendance,
} from "../hooks/useQueries";
import { extractFaceDescriptor, getTodayDate } from "../lib/faceUtils";

interface Props {
  modelsReady: boolean;
}

type ScanResult = { student: Student | null; scanned: boolean };

export default function MarkAttendanceTab({ modelsReady }: Props) {
  const { isActive, isLoading, error, startCamera, videoRef, canvasRef } =
    useCamera({
      facingMode: "user",
      width: 640,
      height: 480,
    });
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const authenticateFace = useAuthenticateFace();
  const markAttendance = useMarkAttendance();
  const { data: stats, isLoading: statsLoading } = useAttendanceStats();
  const hasStarted = useRef(false);

  const handleStartCamera = useCallback(async () => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    await startCamera();
  }, [startCamera]);

  const handleCapture = useCallback(async () => {
    if (!modelsReady) {
      toast.error("AI models are still loading. Please wait.");
      return;
    }
    if (!canvasRef.current || !videoRef.current) return;

    setScanning(true);
    setScanResult(null);

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");
      ctx.drawImage(video, 0, 0);

      const descriptor = await extractFaceDescriptor(canvas);
      if (!descriptor) {
        toast.warning("No face detected. Please look at the camera.");
        setScanResult({ student: null, scanned: true });
        setScanning(false);
        return;
      }

      const student = await authenticateFace.mutateAsync(descriptor);
      setScanResult({ student, scanned: true });

      if (student) {
        await markAttendance.mutateAsync({
          id: student.id,
          date: getTodayDate(),
        });
        toast.success(`Attendance marked for ${student.name}`);
      } else {
        toast.warning("Student not recognized.");
      }
    } catch (e) {
      toast.error("Scan failed. Please try again.");
      console.error(e);
    } finally {
      setScanning(false);
    }
  }, [modelsReady, canvasRef, videoRef, authenticateFace, markAttendance]);

  const totalStudents = stats ? Number(stats.totalStudents) : 0;
  const presentToday = stats ? Number(stats.presentToday) : 0;
  const percentage =
    totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;
  const circumference = 2 * Math.PI * 40;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Camera */}
      <div className="space-y-4">
        <Card className="shadow-card border-border overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary" /> Camera Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative bg-slate-900" style={{ minHeight: 280 }}>
              {!isActive && !isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                  <Button
                    onClick={handleStartCamera}
                    className="rounded-full"
                    data-ocid="camera.primary_button"
                  >
                    Start Camera
                  </Button>
                </div>
              )}
              {isLoading && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  data-ocid="camera.loading_state"
                >
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {error && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4"
                  data-ocid="camera.error_state"
                >
                  <AlertCircle className="w-8 h-8 text-destructive" />
                  <p className="text-sm text-white text-center">
                    {error.message}
                  </p>
                </div>
              )}
              <video
                ref={videoRef}
                className="w-full object-cover"
                style={{ minHeight: 280, display: isActive ? "block" : "none" }}
                playsInline
                muted
                autoPlay
              />
              <canvas ref={canvasRef} style={{ display: "none" }} />
              {isActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-40 h-40 border-2 border-primary rounded-full opacity-60" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Button
          className="w-full rounded-full font-semibold py-6 text-base"
          onClick={handleCapture}
          disabled={!isActive || scanning || !modelsReady}
          data-ocid="attendance.primary_button"
        >
          {scanning ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Scanning...
            </>
          ) : (
            <>
              <Camera className="w-5 h-5 mr-2" />
              CAPTURE ATTENDANCE
            </>
          )}
        </Button>
      </div>

      {/* Right column */}
      <div className="space-y-4">
        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Current Scan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!scanResult ? (
              <div
                className="text-center py-8 text-muted-foreground text-sm"
                data-ocid="scan.empty_state"
              >
                <div className="w-12 h-12 rounded-full bg-secondary mx-auto mb-3 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                Capture a face to see results
              </div>
            ) : scanResult.student ? (
              <div className="space-y-4" data-ocid="scan.success_state">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {scanResult.student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      {scanResult.student.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ID: {scanResult.student.id.toString()}
                    </div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-0 rounded-full px-3 py-1 text-sm font-semibold">
                  ✓ Present
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => setScanResult(null)}
                  data-ocid="scan.secondary_button"
                >
                  <RefreshCw className="w-3 h-3 mr-1" /> Scan Again
                </Button>
              </div>
            ) : (
              <div className="space-y-4" data-ocid="scan.error_state">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 font-bold text-lg">
                    ?
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      Unknown Student
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Not registered in system
                    </div>
                  </div>
                </div>
                <Badge className="bg-amber-100 text-amber-700 border-0 rounded-full px-3 py-1 text-sm font-semibold">
                  ⚠ Unknown
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => setScanResult(null)}
                  data-ocid="scan.secondary_button"
                >
                  <RefreshCw className="w-3 h-3 mr-1" /> Retry
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Daily Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-2" data-ocid="stats.loading_state">
                <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <div className="relative w-20 h-20 flex-shrink-0">
                  {/* biome-ignore lint/a11y/noSvgWithoutTitle: decorative donut chart */}
                  <svg
                    viewBox="0 0 100 100"
                    className="w-20 h-20 -rotate-90"
                    aria-hidden="true"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="oklch(0.919 0.007 254.8)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="oklch(0.512 0.196 258.1)"
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 0.6s ease" }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">
                    {percentage}%
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm text-muted-foreground">
                      Present Today
                    </span>
                    <span className="font-semibold text-green-600">
                      {presentToday}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-border" />
                    <span className="text-sm text-muted-foreground">
                      Total Students
                    </span>
                    <span className="font-semibold">{totalStudents}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getTodayDate()}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
