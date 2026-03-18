import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { BarChart3, Camera, CheckCircle, Shield, Zap } from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: Camera,
    title: "Face Recognition",
    description:
      "Instantly identify students using advanced AI-powered facial recognition technology.",
    color: "bg-blue-50 text-primary",
  },
  {
    icon: Zap,
    title: "Real-Time Tracking",
    description:
      "Mark attendance in seconds. Live updates ensure your records are always current.",
    color: "bg-amber-50 text-amber-500",
  },
  {
    icon: BarChart3,
    title: "Attendance Insights",
    description:
      "Predictive ML analytics surface at-risk students before absences become a problem.",
    color: "bg-green-50 text-green-600",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-xs">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white text-xs font-bold">
              Ai
            </div>
            <span className="font-bold text-foreground text-lg">
              SmartAttend AI
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a
              href="#features"
              className="hover:text-foreground transition-colors"
              data-ocid="nav.link"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-foreground transition-colors"
              data-ocid="nav.link"
            >
              How It Works
            </a>
            <a
              href="#preview"
              className="hover:text-foreground transition-colors"
              data-ocid="nav.link"
            >
              Preview
            </a>
          </nav>
          <Link to="/dashboard">
            <Button
              className="rounded-full font-semibold"
              data-ocid="nav.primary_button"
            >
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[oklch(0.962_0.03_241)] py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-0 rounded-full px-3">
              Powered by Face AI
            </Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight mb-4">
              Automate Attendance with{" "}
              <span className="text-primary">Face Recognition AI</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed">
              SmartAttend AI eliminates manual roll calls. Capture, recognize,
              and record student attendance instantly — with ML-powered
              predictions to keep you ahead.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link to="/dashboard">
                <Button
                  size="lg"
                  className="rounded-full font-semibold px-8"
                  data-ocid="hero.primary_button"
                >
                  Start Marking Attendance
                </Button>
              </Link>
              <a href="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full font-semibold px-8"
                  data-ocid="hero.secondary_button"
                >
                  See Features
                </Button>
              </a>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" /> No manual
                roll calls
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" /> Real-time
                tracking
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-primary" /> Secure &amp; private
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl shadow-card p-4 border border-border">
              <div className="bg-[oklch(0.962_0.03_241)] rounded-xl p-4 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-white text-xs font-bold">
                      Ai
                    </div>
                    <span className="text-xs font-semibold text-foreground">
                      SmartAttend Dashboard
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">Live</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-border">
                    <div className="w-full h-24 bg-slate-100 rounded-lg flex items-center justify-center mb-2">
                      <div className="w-12 h-12 border-2 border-primary rounded-full flex items-center justify-center">
                        <Camera className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <div className="text-xs text-center text-muted-foreground">
                      Camera Preview
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-border space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        AJ
                      </div>
                      <div>
                        <div className="text-xs font-semibold">
                          Alex Johnson
                        </div>
                        <div className="text-xs text-muted-foreground">
                          #1042
                        </div>
                      </div>
                    </div>
                    <Badge className="text-xs bg-green-100 text-green-700 border-0 rounded-full">
                      ✓ Present
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      Scan Again →
                    </div>
                  </div>
                </div>
                <div className="mt-3 bg-white rounded-lg p-3 border border-border">
                  <div className="text-xs font-semibold mb-2">
                    Daily Statistics
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14">
                      {/* biome-ignore lint/a11y/noSvgWithoutTitle: decorative donut chart */}
                      <svg
                        viewBox="0 0 36 36"
                        className="w-14 h-14 -rotate-90"
                        aria-hidden="true"
                      >
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="oklch(0.919 0.007 254.8)"
                          strokeWidth="3"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="oklch(0.512 0.196 258.1)"
                          strokeWidth="3"
                          strokeDasharray="75.4 87.96"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                        87%
                      </span>
                    </div>
                    <div className="text-xs space-y-1">
                      <div>
                        <span className="text-muted-foreground">Present:</span>{" "}
                        <span className="font-semibold text-green-600">26</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total:</span>{" "}
                        <span className="font-semibold">30</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Why SmartAttend AI?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need to run a modern, efficient classroom
              attendance system.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="shadow-card border-border h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div
                      className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4`}
                    >
                      <f.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-foreground text-lg mb-2">
                      {f.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {f.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section id="preview" className="py-20 px-6 bg-[oklch(0.962_0.03_241)]">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-3">
              SmartAttend AI Dashboard
            </h2>
            <p className="text-muted-foreground mb-10">
              A powerful, clean interface built for educators.
            </p>
            <div className="rounded-2xl overflow-hidden shadow-card border border-border bg-white">
              <img
                src="/assets/generated/dashboard-mockup.dim_900x560.png"
                alt="SmartAttend AI Dashboard"
                className="w-full object-cover"
              />
            </div>
            <div className="mt-8">
              <Link to="/dashboard">
                <Button
                  size="lg"
                  className="rounded-full font-semibold px-10"
                  data-ocid="preview.primary_button"
                >
                  Open Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              How It Works
            </h2>
            <p className="text-muted-foreground">
              Three simple steps to automated attendance.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Register Students",
                desc: "Add students with their name and ID. Capture their face using the webcam.",
              },
              {
                step: "02",
                title: "Capture & Recognize",
                desc: "Point the camera at students. The AI instantly identifies each face.",
              },
              {
                step: "03",
                title: "Track & Predict",
                desc: "View attendance stats, percentages, and ML-powered predictions for each student.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="flex gap-4"
              >
                <div className="text-4xl font-extrabold text-primary/20">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-primary flex items-center justify-center text-white text-xs font-bold">
              Ai
            </div>
            <span className="font-semibold text-foreground">
              SmartAttend AI
            </span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-foreground transition-colors"
            >
              How It Works
            </a>
            <Link
              to="/dashboard"
              className="hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="underline hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
