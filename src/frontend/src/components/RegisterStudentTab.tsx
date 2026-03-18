import { useCamera } from "@/camera/useCamera";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Camera, UserPlus } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useRegisterStudent } from "../hooks/useQueries";
import { extractFaceDescriptor } from "../lib/faceUtils";

interface Props {
  modelsReady: boolean;
}

export default function RegisterStudentTab({ modelsReady }: Props) {
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [captured, setCaptured] = useState(false);
  const [capturedDescriptor, setCapturedDescriptor] =
    useState<Array<number> | null>(null);

  const { isActive, isLoading, error, startCamera, videoRef, canvasRef } =
    useCamera({
      facingMode: "user",
      width: 640,
      height: 480,
    });

  const registerStudent = useRegisterStudent();
  const hasStarted = useRef(false);

  const handleStartCamera = useCallback(async () => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    await startCamera();
  }, [startCamera]);

  const handleCaptureFace = useCallback(async () => {
    if (!modelsReady) {
      toast.error("AI models not ready yet.");
      return;
    }
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    const descriptor = await extractFaceDescriptor(canvas);
    if (!descriptor) {
      toast.warning("No face detected. Please look at the camera.");
      return;
    }

    setCapturedDescriptor(descriptor);
    setCaptured(true);
    toast.success("Face captured successfully!");
  }, [modelsReady, canvasRef, videoRef]);

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      toast.error("Please enter student name.");
      return;
    }
    if (!studentId.trim() || Number.isNaN(Number(studentId))) {
      toast.error("Please enter a valid numeric student ID.");
      return;
    }
    if (!capturedDescriptor) {
      toast.error("Please capture the student's face first.");
      return;
    }

    try {
      await registerStudent.mutateAsync({
        id: BigInt(studentId),
        name: name.trim(),
        faceDescriptor: capturedDescriptor,
      });
      toast.success(`${name} registered successfully!`);
      setName("");
      setStudentId("");
      setCaptured(false);
      setCapturedDescriptor(null);
      hasStarted.current = false;
    } catch (e: any) {
      toast.error(`Registration failed: ${e.message}`);
    }
  }, [name, studentId, capturedDescriptor, registerStudent]);

  return (
    <div className="grid lg:grid-cols-2 gap-6 max-w-3xl">
      {/* Form */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" /> Student Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="student-name">Full Name</Label>
            <Input
              id="student-name"
              placeholder="e.g. Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-ocid="register.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="student-id">Student ID (number)</Label>
            <Input
              id="student-id"
              type="number"
              placeholder="e.g. 1042"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              data-ocid="register.input"
            />
          </div>

          {captured && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-green-600 text-sm font-medium">
                ✓ Face captured
              </span>
              <button
                type="button"
                onClick={() => {
                  setCaptured(false);
                  setCapturedDescriptor(null);
                }}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground"
              >
                Redo
              </button>
            </div>
          )}

          <Button
            className="w-full rounded-full font-semibold"
            onClick={handleSubmit}
            disabled={registerStudent.isPending || !captured}
            data-ocid="register.submit_button"
          >
            {registerStudent.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Registering...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Register Student
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Camera */}
      <Card className="shadow-card border-border overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" /> Face Capture
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative bg-slate-900" style={{ minHeight: 220 }}>
            {!isActive && !isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <Button
                  onClick={handleStartCamera}
                  size="sm"
                  className="rounded-full"
                  data-ocid="register.primary_button"
                >
                  Open Camera
                </Button>
              </div>
            )}
            {isLoading && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                data-ocid="register.loading_state"
              >
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {error && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4"
                data-ocid="register.error_state"
              >
                <AlertCircle className="w-6 h-6 text-destructive" />
                <p className="text-xs text-white text-center">
                  {error.message}
                </p>
              </div>
            )}
            <video
              ref={videoRef}
              className="w-full object-cover"
              style={{ display: isActive ? "block" : "none", minHeight: 220 }}
              playsInline
              muted
              autoPlay
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>
          {isActive && (
            <div className="p-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-full"
                onClick={handleCaptureFace}
                disabled={!modelsReady}
                data-ocid="register.secondary_button"
              >
                <Camera className="w-3 h-3 mr-1" /> Capture Face
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
