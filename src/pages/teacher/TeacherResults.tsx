import { useState, useEffect } from "react";
import { useResults, useStudents } from "@/hooks/useFirestore";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Users,
  ClipboardList,
  Save,
  Send,
  BookOpen,
  CheckCircle,
} from "lucide-react";
import { CLASSES, TERMS, SUBJECTS, type Result, type ClassLevel, type Term, type Subject, calculateGrade, type ResultStatus } from "@/types";
import toast from "react-hot-toast";

const TeacherResults = () => {
  const { teacherProfile } = useStore();
  const { data: results, fetchAll, create, update } = useResults();
  const { data: students, fetchAll: fetchStudents } = useStudents();

  const [selectedClass, setSelectedClass] = useState<ClassLevel>(teacherProfile?.classes?.[0] || "JSS1");
  const [selectedTerm, setSelectedTerm] = useState<Term>("First Term");
  const [selectedSession, setSelectedSession] = useState("2025/2026");
  const [selectedSubject, setSelectedSubject] = useState<Subject>(teacherProfile?.subjects?.[0] || "Mathematics");
  const [scores, setScores] = useState<Record<string, { ca: string; exam: string }>>({});
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchAll();
    fetchStudents();
  }, []);

  const teacherStudents = students.filter((s) =>
    s.class === selectedClass && s.status === "active"
  );

  const existingResults = results.filter(
    (r) =>
      r.class === selectedClass &&
      r.term === selectedTerm &&
      r.session === selectedSession &&
      r.subject === selectedSubject &&
      r.teacherId === teacherProfile?.id
  );

  const handleScoreChange = (studentId: string, field: "ca" | "exam", value: string) => {
    const num = Math.min(Math.max(Number(value), 0), field === "ca" ? 30 : 70);
    setScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value === "" ? "" : String(num),
      },
    }));
  };

  const handleSaveDraft = async () => {
    try {
      for (const student of teacherStudents) {
        const score = scores[student.id];
        if (!score || (!score.ca && !score.exam)) continue;

        const ca = Number(score.ca) || 0;
        const exam = Number(score.exam) || 0;
        const { total, grade, remark } = calculateGrade(ca, exam);

        const existingResult = existingResults.find((r) => r.studentId === student.id);

        if (existingResult) {
          await update(existingResult.id, {
            ca,
            exam,
            total,
            grade,
            remark,
            status: "draft",
          });
        } else {
          await create({
            studentId: student.id,
            studentName: student.name,
            class: selectedClass,
            term: selectedTerm,
            session: selectedSession,
            subject: selectedSubject,
            teacherId: teacherProfile?.id || "",
            teacherName: teacherProfile?.name || "",
            ca,
            exam,
            total,
            grade,
            remark,
            status: "draft",
          });
        }
      }
      toast.success("Results saved as draft");
      fetchAll();
    } catch (error) {
      toast.error("Failed to save results");
    }
  };

  const handleSubmitForApproval = async () => {
    try {
      for (const student of teacherStudents) {
        const score = scores[student.id];
        if (!score || (!score.ca && !score.exam)) continue;

        const ca = Number(score.ca) || 0;
        const exam = Number(score.exam) || 0;
        const { total, grade, remark } = calculateGrade(ca, exam);

        const existingResult = existingResults.find((r) => r.studentId === student.id);

        if (existingResult) {
          await update(existingResult.id, {
            ca,
            exam,
            total,
            grade,
            remark,
            status: "pending",
          });
        } else {
          await create({
            studentId: student.id,
            studentName: student.name,
            class: selectedClass,
            term: selectedTerm,
            session: selectedSession,
            subject: selectedSubject,
            teacherId: teacherProfile?.id || "",
            teacherName: teacherProfile?.name || "",
            ca,
            exam,
            total,
            grade,
            remark,
            status: "pending",
          });
        }
      }
      toast.success("Results submitted for admin approval!");
      setShowConfirm(false);
      fetchAll();
      setScores({});
    } catch (error) {
      toast.error("Failed to submit results");
    }
  };

  const getExistingScore = (studentId: string) => {
    const result = existingResults.find((r) => r.studentId === studentId);
    return result ? { ca: result.ca, exam: result.exam, status: result.status } : null;
  };

  const statusColors: Record<ResultStatus, string> = {
    draft: "bg-gray-100 text-gray-800",
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-blue-100 text-blue-800",
    published: "bg-green-100 text-green-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#102542] dark:text-white flex items-center gap-2">
            <ClipboardList size={24} />
            Enter Results
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter CA (30) and Exam (70) scores for your subjects
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save size={16} className="mr-2" />
            Save Draft
          </Button>
          <Button className="bg-[#1E3A8A] hover:bg-[#264b9e]" onClick={() => setShowConfirm(true)}>
            <Send size={16} className="mr-2" />
            Submit for Approval
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Class</Label>
              <Select value={selectedClass} onValueChange={(v) => setSelectedClass(v as ClassLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teacherProfile?.classes?.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Subject</Label>
              <Select value={selectedSubject} onValueChange={(v) => setSelectedSubject(v as Subject)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teacherProfile?.subjects?.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Term</Label>
              <Select value={selectedTerm} onValueChange={(v) => setSelectedTerm(v as Term)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TERMS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Session</Label>
              <Input value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scores Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen size={18} className="text-[#1E3A8A]" />
            {selectedSubject} - {selectedClass} - {selectedTerm}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teacherStudents.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No students found in {selectedClass}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">S/N</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Student</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">CA (30)</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Exam (70)</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Total</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Grade</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {teacherStudents.map((student, index) => {
                    const existing = getExistingScore(student.id);
                    const currentScore = scores[student.id];
                    const ca = Number(currentScore?.ca ?? existing?.ca ?? 0);
                    const exam = Number(currentScore?.exam ?? existing?.exam ?? 0);
                    const { total, grade, remark } = calculateGrade(ca, exam);

                    return (
                      <tr key={student.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 px-4 text-sm text-gray-500">{index + 1}</td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.schoolId}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Input
                            type="number"
                            min={0}
                            max={30}
                            value={currentScore?.ca ?? existing?.ca ?? ""}
                            onChange={(e) => handleScoreChange(student.id, "ca", e.target.value)}
                            className="w-20 text-center mx-auto"
                            disabled={existing?.status === "published"}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <Input
                            type="number"
                            min={0}
                            max={70}
                            value={currentScore?.exam ?? existing?.exam ?? ""}
                            onChange={(e) => handleScoreChange(student.id, "exam", e.target.value)}
                            className="w-20 text-center mx-auto"
                            disabled={existing?.status === "published"}
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-sm font-bold ${total >= 50 ? "text-[#059669]" : "text-red-600"}`}>
                            {total || "-"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {grade && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              grade === "A" ? "bg-green-100 text-green-800" :
                              grade === "B" ? "bg-blue-100 text-blue-800" :
                              grade === "C" ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {grade}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {existing?.status && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${(statusColors as any)[existing.status]}`}>
                              {existing.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Results for Approval</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 dark:text-gray-300 py-4">
            Are you sure you want to submit these results to the admin for approval?
            You will not be able to edit them after submission.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button className="bg-[#1E3A8A] hover:bg-[#264b9e]" onClick={handleSubmitForApproval}>
              <CheckCircle size={16} className="mr-2" />
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherResults;
