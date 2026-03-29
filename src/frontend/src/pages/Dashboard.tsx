import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Target,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import {
  useGoals,
  useScheduleEntries,
  useSessions,
  useSubjects,
} from "../hooks/useQueries";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

type Page = "dashboard" | "subjects" | "goals" | "sessions" | "schedule";

interface Props {
  onNavigate: (page: Page) => void;
}

const STAT_CARDS = [
  {
    icon: <BookOpen size={20} />,
    label: "Subjects",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: <Target size={20} />,
    label: "Goals",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: <Clock size={20} />,
    label: "Sessions",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: <TrendingUp size={20} />,
    label: "Weekly Hours",
    color: "bg-purple-50 text-purple-600",
  },
];

export default function Dashboard({ onNavigate }: Props) {
  const { data: subjects = [], isLoading: loadingSubjects } = useSubjects();
  const { data: goals = [], isLoading: loadingGoals } = useGoals();
  const { data: sessions = [], isLoading: loadingSessions } = useSessions();
  const { data: scheduleEntries = [], isLoading: loadingSchedule } =
    useScheduleEntries();

  const isLoading =
    loadingSubjects || loadingGoals || loadingSessions || loadingSchedule;

  const weeklyMinutes = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return sessions
      .filter((s) => new Date(s.date) >= weekStart)
      .reduce((sum, s) => sum + Number(s.durationMinutes), 0);
  }, [sessions]);

  const weeklyHours = (weeklyMinutes / 60).toFixed(1);

  const todayDow = BigInt(new Date().getDay());
  const todayEntries = scheduleEntries.filter((e) => e.dayOfWeek === todayDow);

  const subjectMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of subjects) {
      map[s.id.toString()] = s.name;
    }
    return map;
  }, [subjects]);

  const activeGoals = goals
    .filter((g) => g.completedHours < g.targetHours)
    .slice(0, 4);

  const statValues = [
    subjects.length,
    goals.length,
    sessions.length,
    Number(weeklyHours),
  ];

  return (
    <div>
      {/* Hero */}
      <section className="hero-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1
                className="text-4xl lg:text-5xl font-extrabold leading-tight mb-4"
                style={{ color: "oklch(0.17 0.05 243)" }}
              >
                Master Your Studies.
                <br />
                <span style={{ color: "oklch(0.75 0.16 63)" }}>
                  Achieve Your Goals.
                </span>
              </h1>
              <p
                className="text-lg mb-8"
                style={{ color: "oklch(0.45 0.03 220)" }}
              >
                Plan smarter, track progress, and stay consistent with StudySync
                — your personal study command center.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Button
                  onClick={() => onNavigate("subjects")}
                  data-ocid="dashboard.get_started.primary_button"
                  className="font-semibold px-6 py-2.5 rounded-full shadow-md transition-all text-white"
                  style={{ backgroundColor: "oklch(0.75 0.16 63)" }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onNavigate("schedule")}
                  data-ocid="dashboard.view_schedule.secondary_button"
                  className="border-2 font-semibold px-6 py-2.5 rounded-full transition-all"
                  style={{
                    borderColor: "oklch(0.27 0.07 240)",
                    color: "oklch(0.27 0.07 240)",
                  }}
                >
                  View Schedule
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="hidden lg:flex justify-center"
            >
              <img
                src="/assets/generated/study-hero.dim_600x400.png"
                alt="Study dashboard illustration"
                className="w-full max-w-md rounded-2xl shadow-card-hover object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
            >
              <Card
                className="shadow-card border-0"
                data-ocid={`dashboard.stat.${i + 1}.card`}
              >
                <CardContent className="p-5 flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    {isLoading ? (
                      <Skeleton className="w-10 h-7 mb-1" />
                    ) : (
                      <p
                        className="text-2xl font-bold"
                        style={{ color: "oklch(0.17 0.05 243)" }}
                      >
                        {i === 3 ? weeklyHours : statValues[i]}
                      </p>
                    )}
                    <p
                      className="text-xs font-medium"
                      style={{ color: "oklch(0.45 0.03 220)" }}
                    >
                      {stat.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Goals */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-xl font-bold"
                style={{ color: "oklch(0.17 0.05 243)" }}
              >
                Active Goals
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate("goals")}
                data-ocid="dashboard.goals.link"
                className="text-sm font-medium flex items-center gap-1"
                style={{ color: "oklch(0.40 0.08 222)" }}
              >
                View all <ArrowRight size={14} />
              </Button>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : activeGoals.length === 0 ? (
              <Card
                className="shadow-card border-0"
                data-ocid="dashboard.goals.empty_state"
              >
                <CardContent className="p-8 text-center">
                  <Target
                    className="mx-auto mb-3"
                    size={32}
                    style={{ color: "oklch(0.45 0.03 220)" }}
                  />
                  <p
                    className="font-medium mb-2"
                    style={{ color: "oklch(0.45 0.03 220)" }}
                  >
                    No active goals yet
                  </p>
                  <Button
                    size="sm"
                    onClick={() => onNavigate("goals")}
                    data-ocid="dashboard.add_goal.primary_button"
                    style={{ backgroundColor: "oklch(0.75 0.16 63)" }}
                    className="text-white rounded-full"
                  >
                    Add a Goal
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {activeGoals.map((goal, idx) => {
                  const pct = Math.min(
                    100,
                    Math.round((goal.completedHours / goal.targetHours) * 100),
                  );
                  const subjectName =
                    subjectMap[goal.subjectId.toString()] ?? "Unknown";
                  return (
                    <motion.div
                      key={goal.id.toString()}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      data-ocid={`dashboard.goal.item.${idx + 1}`}
                    >
                      <Card className="shadow-card border-0 hover:shadow-card-hover transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p
                                className="font-semibold text-sm"
                                style={{ color: "oklch(0.17 0.05 243)" }}
                              >
                                {goal.title}
                              </p>
                              <p
                                className="text-xs"
                                style={{ color: "oklch(0.45 0.03 220)" }}
                              >
                                {subjectName}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-xs font-semibold"
                            >
                              {pct}%
                            </Badge>
                          </div>
                          <Progress value={pct} className="h-2" />
                          <p
                            className="text-xs mt-1.5"
                            style={{ color: "oklch(0.45 0.03 220)" }}
                          >
                            {goal.completedHours}h / {goal.targetHours}h
                            {goal.deadline ? ` · Due ${goal.deadline}` : ""}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Today's Schedule */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-xl font-bold"
                style={{ color: "oklch(0.17 0.05 243)" }}
              >
                Today
              </h2>
              <span
                className="text-sm font-medium"
                style={{ color: "oklch(0.45 0.03 220)" }}
              >
                {DAY_NAMES[new Date().getDay()]}
              </span>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : todayEntries.length === 0 ? (
              <Card
                className="shadow-card border-0"
                data-ocid="dashboard.today_schedule.empty_state"
              >
                <CardContent className="p-6 text-center">
                  <Calendar
                    className="mx-auto mb-2"
                    size={28}
                    style={{ color: "oklch(0.45 0.03 220)" }}
                  />
                  <p
                    className="text-sm"
                    style={{ color: "oklch(0.45 0.03 220)" }}
                  >
                    Nothing scheduled today
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onNavigate("schedule")}
                    data-ocid="dashboard.add_schedule.secondary_button"
                    className="mt-2 text-xs"
                    style={{ color: "oklch(0.40 0.08 222)" }}
                  >
                    Add to schedule
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {todayEntries.map((entry, idx) => (
                  <Card
                    key={entry.id.toString()}
                    className="shadow-card border-0"
                    data-ocid={`dashboard.schedule.item.${idx + 1}`}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      <div
                        className="w-1 self-stretch rounded-full"
                        style={{ backgroundColor: "oklch(0.60 0.20 255)" }}
                      />
                      <div>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: "oklch(0.17 0.05 243)" }}
                        >
                          {entry.entryLabel}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "oklch(0.45 0.03 220)" }}
                        >
                          {entry.startTime} – {entry.endTime} ·{" "}
                          {subjectMap[entry.subjectId.toString()] ?? ""}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Quick Subjects */}
            {subjects.length > 0 && (
              <div className="mt-6">
                <h3
                  className="text-base font-bold mb-3"
                  style={{ color: "oklch(0.17 0.05 243)" }}
                >
                  Subjects
                </h3>
                <div className="flex flex-wrap gap-2">
                  {subjects.slice(0, 6).map((s) => (
                    <span
                      key={s.id.toString()}
                      className="px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm"
                      style={{ backgroundColor: s.colorHex }}
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
