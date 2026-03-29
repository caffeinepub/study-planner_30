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
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Loader2, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddSubject,
  useDeleteSubject,
  useSubjects,
} from "../hooks/useQueries";

const PRESET_COLORS = [
  "#6EE7B7",
  "#93C5FD",
  "#FCA5A5",
  "#C4B5FD",
  "#FDE68A",
  "#86EFAC",
  "#FDA4AF",
  "#7DD3FC",
  "#A5B4FC",
  "#F9A8D4",
  "#6EE7B7",
  "#FB923C",
];

export default function Subjects() {
  const { data: subjects = [], isLoading } = useSubjects();
  const addSubject = useAddSubject();
  const deleteSubject = useDeleteSubject();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [colorHex, setColorHex] = useState(PRESET_COLORS[0]);

  async function handleAdd() {
    if (!name.trim()) {
      toast.error("Please enter a subject name");
      return;
    }
    try {
      await addSubject.mutateAsync({ name: name.trim(), colorHex });
      toast.success(`Added "${name.trim()}"`);
      setName("");
      setColorHex(PRESET_COLORS[0]);
      setOpen(false);
    } catch {
      toast.error("Failed to add subject");
    }
  }

  async function handleDelete(id: bigint, subjectName: string) {
    try {
      await deleteSubject.mutateAsync(id);
      toast.success(`Deleted "${subjectName}"`);
    } catch {
      toast.error("Failed to delete subject");
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-extrabold"
            style={{ color: "oklch(0.17 0.05 243)" }}
          >
            Subjects
          </h1>
          <p className="text-sm mt-1" style={{ color: "oklch(0.45 0.03 220)" }}>
            Manage your study subjects
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              data-ocid="subjects.add.open_modal_button"
              className="flex items-center gap-2 rounded-full font-semibold shadow-md text-white"
              style={{ backgroundColor: "oklch(0.75 0.16 63)" }}
            >
              <Plus size={16} /> Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="subjects.add.dialog">
            <DialogHeader>
              <DialogTitle>New Subject</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label htmlFor="subject-name">Subject Name</Label>
                <Input
                  id="subject-name"
                  data-ocid="subjects.name.input"
                  placeholder="e.g. Mathematics"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setColorHex(c)}
                      className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                        colorHex === c
                          ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                          : ""
                      }`}
                      style={{ backgroundColor: c }}
                      aria-label={`Color ${c}`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <label
                    htmlFor="custom-color"
                    className="text-sm"
                    style={{ color: "oklch(0.45 0.03 220)" }}
                  >
                    Custom:
                  </label>
                  <input
                    id="custom-color"
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border border-border"
                  />
                  <span
                    className="text-xs font-mono"
                    style={{ color: "oklch(0.45 0.03 220)" }}
                  >
                    {colorHex}
                  </span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  data-ocid="subjects.add.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="subjects.add.submit_button"
                  onClick={handleAdd}
                  disabled={addSubject.isPending}
                  className="text-white font-semibold"
                  style={{ backgroundColor: "oklch(0.75 0.16 63)" }}
                >
                  {addSubject.isPending ? (
                    <Loader2 className="animate-spin mr-2" size={14} />
                  ) : null}
                  Add Subject
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-20" data-ocid="subjects.empty_state">
          <BookOpen
            className="mx-auto mb-4"
            size={48}
            style={{ color: "oklch(0.75 0.10 220)" }}
          />
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: "oklch(0.17 0.05 243)" }}
          >
            No subjects yet
          </h2>
          <p className="mb-6" style={{ color: "oklch(0.45 0.03 220)" }}>
            Add your first subject to get started.
          </p>
          <Button
            onClick={() => setOpen(true)}
            data-ocid="subjects.first_add.primary_button"
            className="text-white rounded-full font-semibold"
            style={{ backgroundColor: "oklch(0.75 0.16 63)" }}
          >
            <Plus size={16} className="mr-1" /> Add Your First Subject
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {subjects.map((subject, idx) => (
              <motion.div
                key={subject.id.toString()}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                data-ocid={`subjects.item.${idx + 1}`}
              >
                <Card className="shadow-card border-0 hover:shadow-card-hover transition-all overflow-hidden">
                  <div
                    className="h-2"
                    style={{ backgroundColor: subject.colorHex }}
                  />
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: subject.colorHex }}
                      >
                        {subject.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p
                          className="font-semibold"
                          style={{ color: "oklch(0.17 0.05 243)" }}
                        >
                          {subject.name}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "oklch(0.45 0.03 220)" }}
                        >
                          {subject.colorHex}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      data-ocid={`subjects.delete_button.${idx + 1}`}
                      onClick={() => handleDelete(subject.id, subject.name)}
                      disabled={deleteSubject.isPending}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
