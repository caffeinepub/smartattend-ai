import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Camera, UserPlus, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import MarkAttendanceTab from "../components/MarkAttendanceTab";
import RegisterStudentTab from "../components/RegisterStudentTab";
import StudentsTab from "../components/StudentsTab";
import { loadFaceModels } from "../lib/faceUtils";

export default function Dashboard() {
  const [modelsReady, setModelsReady] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);

  useEffect(() => {
    const tryLoad = () => {
      loadFaceModels()
        .then(() => setModelsReady(true))
        .catch((e) => setModelError(e.message));
    };

    // face-api.js loaded via defer script; wait a tick then try
    const t = setTimeout(tryLoad, 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-xs">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
              data-ocid="nav.link"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <div className="w-px h-5 bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-primary flex items-center justify-center text-white text-xs font-bold">
                Ai
              </div>
              <span className="font-bold text-foreground">SmartAttend AI</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {modelsReady ? (
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                AI Models Ready
              </span>
            ) : modelError ? (
              <span className="text-xs text-destructive">Model load error</span>
            ) : (
              <span
                className="flex items-center gap-1 text-xs text-muted-foreground"
                data-ocid="dashboard.loading_state"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Loading AI...
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <Tabs defaultValue="mark" className="w-full">
          <TabsList className="mb-6 bg-secondary rounded-full p-1">
            <TabsTrigger
              value="mark"
              className="rounded-full flex items-center gap-2"
              data-ocid="dashboard.tab"
            >
              <Camera className="w-4 h-4" /> Mark Attendance
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="rounded-full flex items-center gap-2"
              data-ocid="dashboard.tab"
            >
              <UserPlus className="w-4 h-4" /> Register Student
            </TabsTrigger>
            <TabsTrigger
              value="students"
              className="rounded-full flex items-center gap-2"
              data-ocid="dashboard.tab"
            >
              <Users className="w-4 h-4" /> Students
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="mark" asChild>
              <motion.div
                key="mark"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <MarkAttendanceTab modelsReady={modelsReady} />
              </motion.div>
            </TabsContent>

            <TabsContent value="register" asChild>
              <motion.div
                key="register"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <RegisterStudentTab modelsReady={modelsReady} />
              </motion.div>
            </TabsContent>

            <TabsContent value="students" asChild>
              <motion.div
                key="students"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <StudentsTab />
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </main>

      <footer className="border-t border-border py-4 px-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="underline hover:text-foreground transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
