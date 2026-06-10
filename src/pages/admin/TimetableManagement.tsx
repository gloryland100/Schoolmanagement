import { useState, useEffect } from "react";
import { useTimetables } from "@/hooks/useFirestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Calendar,
  Plus,
} from "lucide-react";
import { CLASSES, TERMS, SUBJECTS, DAYS, type ClassLevel, type Term, type DayOfWeek, type TimetableEntry } from "@/types";
import toast from "react-hot-toast";

const PERIODS = [
  { num: 1, start: "08:00", end: "08:40", type: "lesson" as const },
  { num: 2, start: "08:40", end: "09:20", type: "lesson" as const },
  { num: 3, start: "09:20", end: "10:00", type: "lesson" as const },
  { num: 4, start: "10:00", end: "10:15", type: "short-break" as const },
  { num: 5, start: "10:15", end: "10:55", type: "lesson" as const },
  { num: 6, start: "10:55", end: "11:35", type: "lesson" as const },
  { num: 7, start: "11:35", end: "12:15", type: "long-break" as const },
  { num: 8, start: "12:15", end: "12:55", type: "lesson" as const },
  { num: 9, start: "12:55", end: "13:35", type: "lesson" as const },
  { num: 10, start: "13:35", end: "14:15", type: "lesson" as const },
];

const TimetableManagement = () => {
  const { data: timetables, fetchAll, create } = useTimetables();
  const [selectedClass, setSelectedClass] = useState<ClassLevel>("JSS1");
  const [selectedTerm, setSelectedTerm] = useState<Term>("First Term");
  const [selectedSession, setSelectedSession] = useState("2025/2026");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<{ day: DayOfWeek; period: number } | null>(null);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);

  const [formData, setFormData] = useState<{
    subject: string;
    teacherName: string;
    startTime: string;
    endTime: string;
  }>({
    subject: "Mathematics",
    teacherName: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    const timetable = timetables.find(
      (t) => t.class === selectedClass && t.term === selectedTerm && t.session === selectedSession
    );
    if (timetable) {
      setEntries(timetable.entries || []);
    } else {
      setEntries([]);
    }
  }, [timetables, selectedClass, selectedTerm, selectedSession]);

  const getEntry = (day: DayOfWeek, period: number) => {
    return entries.find((e) => e.day === day && e.period === period);
  };

  const handleSaveEntry = async () => {
    if (!editingEntry) return;

    const periodInfo = PERIODS.find((p) => p.num === editingEntry.period);
    const newEntry: TimetableEntry = {
      id: `${editingEntry.day}-${editingEntry.period}`,
      class: selectedClass,
      day: editingEntry.day,
      period: editingEntry.period,
      subject: (periodInfo?.type !== "lesson" ? "" : formData.subject) as any,
      teacherId: "",
      teacherName: periodInfo?.type !== "lesson" ? "" : formData.teacherName,
      startTime: formData.startTime || periodInfo?.start || "",
      endTime: formData.endTime || periodInfo?.end || "",
      isBreak: periodInfo?.type !== "lesson",
      breakType: periodInfo?.type === "short-break" ? "short" : periodInfo?.type === "long-break" ? "long" : undefined,
    };

    const updatedEntries = entries.filter(
      (e) => !(e.day === editingEntry.day && e.period === editingEntry.period)
    );
    updatedEntries.push(newEntry);
    setEntries(updatedEntries);
    setEditingEntry(null);
    toast.success("Period updated");
  };

  const handleSaveTimetable = async () => {
    try {
      const existingTimetable = timetables.find(
        (t) => t.class === selectedClass && t.term === selectedTerm && t.session === selectedSession
      );

      if (existingTimetable) {
        const { update } = useTimetables();
        await update(existingTimetable.id, { entries, updatedAt: new Date().toISOString() });
      } else {
        await create({
          class: selectedClass,
          term: selectedTerm,
          session: selectedSession,
          entries,
        });
      }
      toast.success("Timetable saved successfully");
      fetchAll();
    } catch (error) {
      toast.error("Failed to save timetable");
    }
  };

  const openEditDialog = (day: DayOfWeek, period: number) => {
    const entry = getEntry(day, period);
    const periodInfo = PERIODS.find((p) => p.num === period);
    setFormData({
      subject: (entry?.subject || "Mathematics") as string,
      teacherName: entry?.teacherName || "",
      startTime: entry?.startTime || periodInfo?.start || "",
      endTime: entry?.endTime || periodInfo?.end || "",
    });
    setEditingEntry({ day, period });
    setShowAddDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#102542] dark:text-white flex items-center gap-2">
            <Calendar size={24} />
            Timetable Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create and manage class timetables
          </p>
        </div>
        <Button onClick={handleSaveTimetable} className="bg-[#1E3A8A] hover:bg-[#264b9e]">
          Save Timetable
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <Label className="text-xs mb-1 block">Class</Label>
              <Select value={selectedClass} onValueChange={(v) => setSelectedClass(v as ClassLevel)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLASSES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Term</Label>
              <Select value={selectedTerm} onValueChange={(v) => setSelectedTerm(v as Term)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TERMS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Session</Label>
              <Input
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-36"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timetable Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {selectedClass} - {selectedTerm} ({selectedSession})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-500 w-24">
                    Period
                  </th>
                  {DAYS.map((day) => (
                    <th
                      key={day}
                      className="border border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-500 min-w-[140px]"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((period) => (
                  <tr key={period.num}>
                    <td className="border border-gray-200 dark:border-gray-700 p-2 text-center bg-gray-50 dark:bg-gray-800">
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        {period.type === "lesson" ? `P${period.num}` : "Break"}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {period.start}-{period.end}
                      </div>
                    </td>
                    {DAYS.map((day) => {
                      const entry = getEntry(day, period.num);
                      const isBreak = period.type !== "lesson";
                      return (
                        <td
                          key={`${day}-${period.num}`}
                          className={`border border-gray-200 dark:border-gray-700 p-1 min-h-[60px] cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                            isBreak ? "bg-amber-50 dark:bg-amber-900/10" : ""
                          }`}
                          onClick={() => !isBreak && openEditDialog(day, period.num)}
                        >
                          {isBreak ? (
                            <div className="text-center py-2">
                              <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 uppercase">
                                {period.type === "short-break" ? "Short Break" : "Long Break"}
                              </span>
                            </div>
                          ) : entry ? (
                            <div className="p-1">
                              <p className="text-xs font-medium text-[#102542] dark:text-blue-400 truncate">
                                {entry.subject}
                              </p>
                              {entry.teacherName && (
                                <p className="text-[10px] text-gray-500 truncate">{entry.teacherName}</p>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-2">
                              <Plus size={14} className="mx-auto text-gray-300" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit Period - {editingEntry?.day} Period {editingEntry?.period}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select
                value={formData.subject}
                onValueChange={(v) => setFormData({ ...formData, subject: v as string })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Teacher Name</Label>
              <Input
                value={formData.teacherName}
                onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                placeholder="Enter teacher name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-[#1E3A8A] hover:bg-[#264b9e]" onClick={handleSaveEntry}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimetableManagement;
