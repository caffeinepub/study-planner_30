import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Loader2, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddSession,
  useDeleteSession,
  useSessions,
  useSubjects,
} from "../hooks/useQueries";

function formatDuration(minutes: bigint): string {
  const m = Number(minutes);
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h === 0) return `${rem}m`;
  if (rem === 0) return `${h}h`;
  return `${h}h ${rem}m`;
}

export default function Sessions() {
  const { data: sessions = [], isLoading: loadingSessions } = useSessions();
  const { data: subjects = [], isLoading: loadingSubjects } = useSubjects();
  const addSession = useAddSession();
  const deleteSession = useDeleteSession();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    subjectId: "",
    durationMinutes: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const subjectMap: Record<string, { name: string; colorHex: string }> = {};
  for (const s of subjects) {
    subjectMap[s.id.toString()] = { name: s.name, colorHex: s.colorHex };
  }

  const sorted = [...sessions].sort((a, b) => {
    if (a.date > b.date) return -1;
    if (a.date < b.date) return 1;
    return Number(b.createdAt - a.createdAt);
  });

  async function handleAdd() {
    if (!form.subjectId || !form.durationMinutes || !form.date) {
      toast.error("Please fill in all required fields");
      return;
    }
    const mins = Number.parseInt(form.durationMinutes);
    if (Number.isNaN(mins) || mins <= 0) {
      toast.error("Duration must be a positive number");
      return;
    }
    try {
      await addSession.mutateAsync({
        subjectId: BigInt(form.subjectId),
        durationMinutes: BigInt(mins),
        date: form.date,
        notes: form.notes.trim(),
      });
      toast.success("Session logged!");
      setForm({
        subjectId: "",
        durationMinutes: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setOpen(false);
    } catch {
      toast.error("Failed to log session");
    }
  }

  async function handleDelete(id: bigint) {
    try {
      await deleteSession.mutateAsync(id);
      toast.success("Session deleted");
    } catch {
      toast.error("Failed to delete session");
    }
  }

  const isLoading = loadingSessions || loadingSubjects;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-extrabold"
            style={{ color: "oklch(0.17 0.05 243)" }}
          >
            Study Sessions
          </h1>
          <p className="text-sm mt-1" style={{ color: "oklch(0.45 0.03 220)" }}>
            Log and review your study sessions
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              data-ocid="sessions.add.open_modal_button"
              className="flex items-center gap-2 rounded-full font-semibold shadow-md text-white"
              style={{ backgroundColor: "oklch(0.75 0.16 63)" }}
            >
              <Plus size={16} /> Log Session
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="sessions.add.dialog">
            <DialogHeader>
              <DialogTitle>Log Study Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Subject *</Label>
                <Select
                  value={form.subjectId}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, subjectId: v }))
                  }
                >
                  <SelectTrigger
                    data-ocid="sessions.subject.select"
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
                <Label>Duration (minutes) *</Label>
                <Input
                  data-ocid="sessions.duration.input"
                  type="number"
                  min="1"
                  placeholder="e.g. 90"
                  value={form.durationMinutes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, durationMinutes: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Date *</Label>
                <Input
                  data-ocid="sessions.date.input"
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, date: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <Textarea
                  data-ocid="sessions.notes.textarea"
                  placeholder="What did you study? Any highlights?"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  className="mt-1 resize-none"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  data-ocid="sessions.add.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="sessions.add.submit_button"
                  onClick={handleAdd}
                  disabled={addSession.isPending}
                  className="text-white font-semibold"
                  style={{ backgroundColor: "oklch(0.75 0.16 63)" }}
                >
                  {addSession.isPending ? (
                    <Loader2 className="animate-spin mr-2" size={14} />
                  ) : null}
                  Log Session
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20" data-ocid="sessions.empty_state">
          <Clock
            className="mx-auto mb-4"
            size={48}
            style={{ color: "oklch(0.75 0.10 220)" }}
          />
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: "oklch(0.17 0.05 243)" }}
          >
            No sessions logged yet
          </h2>
          <p className="mb-6" style={{ color: "oklch(0.45 0.03 220)" }}>
            Start tracking your study time to see your progress.
          </p>
          <Button
            onClick={() => setOpen(true)}
            data-ocid="sessions.first_add.primary_button"
            className="text-white rounded-full font-semibold"
            style={{ backgroundColor: "oklch(0.75 0.16 63)" }}
          >
            <Plus size={16} className="mr-1" /> Log Your First Session
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {sorted.map((session, idx) => {
              const subject = subjectMap[session.subjectId.toString()];
              return (
                <motion.div
                  key={session.id.toString()}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.04 }}
                  data-ocid={`sessions.item.${idx + 1}`}
                >
                  <Card className="shadow-card border-0 hover:shadow-card-hover transition-all overflow-hidden">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div
                        className="w-1 self-stretch rounded-full min-h-12"
                        style={{
                          backgroundColor:
                            subject?.colorHex ?? "oklch(0.60 0.20 255)",
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className="font-semibold text-sm"
                            style={{ color: "oklch(0.17 0.05 243)" }}
                          >
                            {subject?.name ?? "Unknown Subject"}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                            style={{
                              backgroundColor:
                                subject?.colorHex ?? "oklch(0.60 0.20 255)",
                            }}
                          >
                            {formatDuration(session.durationMinutes)}
                          </span>
                        </div>
                        <p
                          className="text-xs"
                          style={{ color: "oklch(0.45 0.03 220)" }}
                        >
                          {session.date}
                        </p>
                        {session.notes && (
                          <p
                            className="text-xs mt-1 line-clamp-2"
                            style={{ color: "oklch(0.45 0.03 220)" }}
                          >
                            {session.notes}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-ocid={`sessions.delete_button.${idx + 1}`}
                        onClick={() => handleDelete(session.id)}
                        disabled={deleteSession.isPending}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full flex-shrink-0"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
