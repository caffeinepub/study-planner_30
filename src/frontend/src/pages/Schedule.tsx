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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Loader2, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddScheduleEntry,
  useDeleteScheduleEntry,
  useScheduleEntries,
  useSubjects,
} from "../hooks/useQueries";

const DAYS = [
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
];

export default function Schedule() {
  const { data: entries = [], isLoading: loadingEntries } =
    useScheduleEntries();
  const { data: subjects = [], isLoading: loadingSubjects } = useSubjects();
  const addEntry = useAddScheduleEntry();
  const deleteEntry = useDeleteScheduleEntry();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    subjectId: "",
    dayOfWeek: "",
    startTime: "09:00",
    endTime: "10:00",
    entryLabel: "",
  });

  const subjectMap: Record<string, { name: string; colorHex: string }> = {};
  for (const s of subjects) {
    subjectMap[s.id.toString()] = { name: s.name, colorHex: s.colorHex };
  }

  const todayDow = new Date().getDay();

  const entriesByDay: Record<number, typeof entries> = {};
  for (const d of DAYS) {
    entriesByDay[d.value] = [];
  }
  for (const e of entries) {
    const dow = Number(e.dayOfWeek);
    if (entriesByDay[dow] !== undefined) entriesByDay[dow].push(e);
  }
  for (const arr of Object.values(entriesByDay)) {
    arr.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  async function handleAdd() {
    if (
      !form.subjectId ||
      form.dayOfWeek === "" ||
      !form.startTime ||
      !form.endTime ||
      !form.entryLabel.trim()
    ) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await addEntry.mutateAsync({
        subjectId: BigInt(form.subjectId),
        dayOfWeek: BigInt(form.dayOfWeek),
        startTime: form.startTime,
        endTime: form.endTime,
        entryLabel: form.entryLabel.trim(),
      });
      toast.success("Schedule entry added!");
      setForm({
        subjectId: "",
        dayOfWeek: "",
        startTime: "09:00",
        endTime: "10:00",
        entryLabel: "",
      });
      setOpen(false);
    } catch {
      toast.error("Failed to add schedule entry");
    }
  }

  async function handleDelete(id: bigint) {
    try {
      await deleteEntry.mutateAsync(id);
      toast.success("Entry removed");
    } catch {
      toast.error("Failed to remove entry");
    }
  }

  const isLoading = loadingEntries || loadingSubjects;
  const hasEntries = entries.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-extrabold"
            style={{ color: "oklch(0.17 0.05 243)" }}
          >
            Schedule
          </h1>
          <p className="text-sm mt-1" style={{ color: "oklch(0.45 0.03 220)" }}>
            Plan your weekly study timetable
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              data-ocid="schedule.add.open_modal_button"
              className="flex items-center gap-2 rounded-full font-semibold shadow-md text-white"
              style={{ backgroundColor: "oklch(0.75 0.16 63)" }}
            >
              <Plus size={16} /> Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="schedule.add.dialog">
            <DialogHeader>
              <DialogTitle>Add Schedule Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Label *</Label>
                <Input
                  data-ocid="schedule.label.input"
                  placeholder="e.g. Calculus Review"
                  value={form.entryLabel}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, entryLabel: e.target.value }))
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
                    data-ocid="schedule.subject.select"
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
                <Label>Day *</Label>
                <Select
                  value={form.dayOfWeek}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, dayOfWeek: v }))
                  }
                >
                  <SelectTrigger
                    data-ocid="schedule.day.select"
                    className="mt-1"
                  >
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d) => (
                      <SelectItem key={d.value} value={String(d.value)}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Start Time *</Label>
                  <Input
                    data-ocid="schedule.start_time.input"
                    type="time"
                    value={form.startTime}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, startTime: e.target.value }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>End Time *</Label>
                  <Input
                    data-ocid="schedule.end_time.input"
                    type="time"
                    value={form.endTime}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, endTime: e.target.value }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  data-ocid="schedule.add.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="schedule.add.submit_button"
                  onClick={handleAdd}
                  disabled={addEntry.isPending}
                  className="text-white font-semibold"
                  style={{ backgroundColor: "oklch(0.75 0.16 63)" }}
                >
                  {addEntry.isPending ? (
                    <Loader2 className="animate-spin mr-2" size={14} />
                  ) : null}
                  Add Entry
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : !hasEntries ? (
        <div className="text-center py-20" data-ocid="schedule.empty_state">
          <Calendar
            className="mx-auto mb-4"
            size={48}
            style={{ color: "oklch(0.75 0.10 220)" }}
          />
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: "oklch(0.17 0.05 243)" }}
          >
            No schedule entries yet
          </h2>
          <p className="mb-6" style={{ color: "oklch(0.45 0.03 220)" }}>
            Build your weekly study timetable to stay consistent.
          </p>
          <Button
            onClick={() => setOpen(true)}
            data-ocid="schedule.first_add.primary_button"
            className="text-white rounded-full font-semibold"
            style={{ backgroundColor: "oklch(0.75 0.16 63)" }}
          >
            <Plus size={16} className="mr-1" /> Add Your First Entry
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {DAYS.map((day) => {
            const dayEntries = entriesByDay[day.value];
            if (dayEntries.length === 0) return null;
            const isToday = day.value === todayDow;
            return (
              <motion.div
                key={day.value}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: day.value * 0.05 }}
              >
                <Card
                  className={`shadow-card border-0 overflow-hidden${isToday ? " ring-2 ring-blue-400" : ""}`}
                  data-ocid={`schedule.day.${day.value + 1}.panel`}
                >
                  <CardHeader
                    className="py-3 px-4"
                    style={{
                      backgroundColor: isToday
                        ? "oklch(0.97 0.01 248)"
                        : "oklch(0.99 0.005 220)",
                    }}
                  >
                    <CardTitle
                      className="text-sm font-bold flex items-center gap-2"
                      style={{ color: "oklch(0.17 0.05 243)" }}
                    >
                      {day.label}
                      {isToday && (
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: "oklch(0.60 0.20 255)" }}
                        >
                          Today
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-3">
                    <div className="space-y-2">
                      <AnimatePresence>
                        {dayEntries.map((entry, idx) => {
                          const subject =
                            subjectMap[entry.subjectId.toString()];
                          return (
                            <motion.div
                              key={entry.id.toString()}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0, x: -16 }}
                              className="flex items-center gap-3 py-1.5"
                              data-ocid={`schedule.entry.item.${idx + 1}`}
                            >
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{
                                  backgroundColor: subject?.colorHex ?? "#ccc",
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <span
                                  className="text-sm font-medium"
                                  style={{ color: "oklch(0.17 0.05 243)" }}
                                >
                                  {entry.entryLabel}
                                </span>
                                <span
                                  className="text-xs ml-2"
                                  style={{ color: "oklch(0.45 0.03 220)" }}
                                >
                                  {entry.startTime}–{entry.endTime}
                                </span>
                                {subject && (
                                  <span
                                    className="ml-2 px-1.5 py-0.5 rounded text-xs font-medium text-white"
                                    style={{
                                      backgroundColor: subject.colorHex,
                                    }}
                                  >
                                    {subject.name}
                                  </span>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                data-ocid={`schedule.delete_button.${idx + 1}`}
                                onClick={() => handleDelete(entry.id)}
                                disabled={deleteEntry.isPending}
                                className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full flex-shrink-0"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
