import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Plus, PlusCircle, Target, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Goal } from "../backend.d";
import {
  useAddGoal,
  useDeleteGoal,
  useGoals,
  useSubjects,
  useUpdateGoalProgress,
} from "../hooks/useQueries";

export default function Goals() {
  const { data: goals = [], isLoading: loadingGoals } = useGoals();
  const { data: subjects = [], isLoading: loadingSubjects } = useSubjects();
  const addGoal = useAddGoal();
  const deleteGoal = useDeleteGoal();
  const updateProgress = useUpdateGoalProgress();

  const [addOpen, setAddOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [logHours, setLogHours] = useState("");

  const [form, setForm] = useState({
    title: "",
    subjectId: "",
    targetHours: "",
    deadline: "",
  });

  const subjectMap: Record<string, string> = {};
  for (const s of subjects) {
    subjectMap[s.id.toString()] = s.name;
  }

  const goalsBySubject: Record<string, Goal[]> = {};
  for (const g of goals) {
    const key = g.subjectId.toString();
    if (!goalsBySubject[key]) goalsBySubject[key] = [];
    goalsBySubject[key].push(g);
  }

  async function handleAddGoal() {
    if (!form.title.trim() || !form.subjectId || !form.targetHours) {
      toast.error("Please fill in all required fields");
      return;
    }
    const hrs = Number.parseFloat(form.targetHours);
    if (Number.isNaN(hrs) || hrs <= 0) {
      toast.error("Target hours must be a positive number");
      return;
    }
    try {
      await addGoal.mutateAsync({
        subjectId: BigInt(form.subjectId),
        title: form.title.trim(),
        targetHours: hrs,
        deadline: form.deadline || null,
      });
      toast.success("Goal added!");
      setForm({ title: "", subjectId: "", targetHours: "", deadline: "" });
      setAddOpen(false);
    } catch {
      toast.error("Failed to add goal");
    }
  }

  async function handleLogProgress() {
    if (!selectedGoal) return;
    const hrs = Number.parseFloat(logHours);
    if (Number.isNaN(hrs) || hrs <= 0) {
      toast.error("Enter a valid number of hours");
      return;
    }
    try {
      await updateProgress.mutateAsync({ goalId: selectedGoal.id, hours: hrs });
      toast.success(`Logged ${hrs}h for "${selectedGoal.title}"`);
      setLogHours("");
      setLogOpen(false);
      setSelectedGoal(null);
    } catch {
      toast.error("Failed to log progress");
    }
  }

  async function handleDelete(id: bigint, title: string) {
    try {
      await deleteGoal.mutateAsync(id);
      toast.success(`Deleted "${title}"`);
    } catch {
      toast.error("Failed to delete goal");
    }
  }

  const isLoading = loadingGoals || loadingSubjects;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-extrabold"
            style={{ color: "oklch(0.17 0.05 243)" }}
          >
            Goals
          </h1>
          <p className="text-sm mt-1" style={{ color: "oklch(0.45 0.03 220)" }}>
            Track your study objectives and progress
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button
              data-ocid="goals.add.open_modal_button"
              className="flex items-center gap-2 rounded-full font-semibold shadow-md text-white"
              style={{ backgroundColor: "oklch(0.75 0.16 63)" }}
            >
              <Plus size={16} /> New Goal
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="goals.add.dialog">
            <DialogHeader>
              <DialogTitle>Add New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Title *</Label>
                <Input
                  data-ocid="goals.title.input"
                  placeholder="e.g. Complete Calculus Chapter 3"
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Subject *</Label>
                <Select
                  value={form.subjectId}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, subjectId: v }))
                  }
                >
                  <SelectTrigger
                    data-ocid="goals.subject.select"
                    className="mt-1"
                  >
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id.toString()} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Target Hours *</Label>
                <Input
                  data-ocid="goals.target_hours.input"
                  type="number"
                  min="0.5"
                  step="0.5"
                  placeholder="e.g. 10"
                  value={form.targetHours}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, targetHours: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Deadline (optional)</Label>
                <Input
                  data-ocid="goals.deadline.input"
                  type="date"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, deadline: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setAddOpen(false)}
                  data-ocid="goals.add.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="goals.add.submit_button"
                  onClick={handleAddGoal}
                  disabled={addGoal.isPending}
                  className="text-white font-semibold"
                  style={{ backgroundColor: "oklch(0.75 0.16 63)" }}
                >
                  {addGoal.isPending ? (
                    <Loader2 className="animate-spin mr-2" size={14} />
                  ) : null}
                  Add Goal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Log Progress Dialog */}
      <Dialog
        open={logOpen}
        onOpenChange={(o) => {
          setLogOpen(o);
          if (!o) {
            setLogHours("");
            setSelectedGoal(null);
          }
        }}
      >
        <DialogContent data-ocid="goals.log.dialog">
          <DialogHeader>
            <DialogTitle>Log Progress</DialogTitle>
          </DialogHeader>
          {selectedGoal && (
            <div className="space-y-4 pt-2">
              <p className="text-sm" style={{ color: "oklch(0.45 0.03 220)" }}>
                Logging hours for:{" "}
                <strong style={{ color: "oklch(0.17 0.05 243)" }}>
                  {selectedGoal.title}
                </strong>
              </p>
              <p className="text-sm" style={{ color: "oklch(0.45 0.03 220)" }}>
                Current: {selectedGoal.completedHours}h /{" "}
                {selectedGoal.targetHours}h
              </p>
              <div>
                <Label>Hours to add</Label>
                <Input
                  data-ocid="goals.log_hours.input"
                  type="number"
                  min="0.25"
                  step="0.25"
                  placeholder="e.g. 1.5"
                  value={logHours}
                  onChange={(e) => setLogHours(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogProgress()}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setLogOpen(false)}
                  data-ocid="goals.log.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="goals.log.submit_button"
                  onClick={handleLogProgress}
                  disabled={updateProgress.isPending}
                  style={{ backgroundColor: "oklch(0.60 0.20 255)" }}
                  className="text-white font-semibold"
                >
                  {updateProgress.isPending ? (
                    <Loader2 className="animate-spin mr-2" size={14} />
                  ) : null}
                  Log Hours
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-20" data-ocid="goals.empty_state">
          <Target
            className="mx-auto mb-4"
            size={48}
            style={{ color: "oklch(0.75 0.10 220)" }}
          />
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: "oklch(0.17 0.05 243)" }}
          >
            No goals yet
          </h2>
          <p className="mb-6" style={{ color: "oklch(0.45 0.03 220)" }}>
            Set your first study goal to stay motivated.
          </p>
          <Button
            onClick={() => setAddOpen(true)}
            data-ocid="goals.first_add.primary_button"
            className="text-white rounded-full font-semibold"
            style={{ backgroundColor: "oklch(0.75 0.16 63)" }}
          >
            <Plus size={16} className="mr-1" /> Add Your First Goal
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(goalsBySubject).map(([subjectId, subjectGoals]) => (
            <div key={subjectId}>
              <h2
                className="text-base font-bold mb-3 flex items-center gap-2"
                style={{ color: "oklch(0.17 0.05 243)" }}
              >
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{
                    backgroundColor:
                      subjects.find((s) => s.id.toString() === subjectId)
                        ?.colorHex ?? "#ccc",
                  }}
                />
                {subjectMap[subjectId] ?? "Unknown Subject"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {subjectGoals.map((goal, idx) => {
                    const pct = Math.min(
                      100,
                      Math.round(
                        (goal.completedHours / goal.targetHours) * 100,
                      ),
                    );
                    const isDone = goal.completedHours >= goal.targetHours;
                    return (
                      <motion.div
                        key={goal.id.toString()}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.05 }}
                        data-ocid={`goals.item.${idx + 1}`}
                      >
                        <Card className="shadow-card border-0 hover:shadow-card-hover transition-all">
                          <CardHeader className="pb-2 pt-4 px-4">
                            <div className="flex items-start justify-between">
                              <CardTitle
                                className="text-sm font-semibold"
                                style={{ color: "oklch(0.17 0.05 243)" }}
                              >
                                {goal.title}
                              </CardTitle>
                              <div className="flex items-center gap-1">
                                {isDone && (
                                  <Badge className="bg-green-100 text-green-700 text-xs border-0">
                                    Complete
                                  </Badge>
                                )}
                                {!isDone && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedGoal(goal);
                                      setLogOpen(true);
                                    }}
                                    data-ocid="goals.log.open_modal_button"
                                    className="h-7 text-xs rounded-full px-3"
                                    style={{ color: "oklch(0.40 0.08 222)" }}
                                  >
                                    <PlusCircle size={13} className="mr-1" />{" "}
                                    Log
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  data-ocid={`goals.delete_button.${idx + 1}`}
                                  onClick={() =>
                                    handleDelete(goal.id, goal.title)
                                  }
                                  className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="px-4 pb-4">
                            <Progress value={pct} className="h-2.5 mb-2" />
                            <div
                              className="flex items-center justify-between text-xs"
                              style={{ color: "oklch(0.45 0.03 220)" }}
                            >
                              <span>
                                {goal.completedHours}h / {goal.targetHours}h
                              </span>
                              <span className="font-semibold">{pct}%</span>
                            </div>
                            {goal.deadline && (
                              <p
                                className="text-xs mt-1"
                                style={{ color: "oklch(0.45 0.03 220)" }}
                              >
                                Due: {goal.deadline}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
