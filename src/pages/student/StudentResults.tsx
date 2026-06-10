import { useState, useEffect, useRef } from "react";
import { useResults } from "@/hooks/useFirestore";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  TrendingUp,
  Printer,
  FileText,
} from "lucide-react";
import { CLASSES, TERMS, type Result, type Term, type ClassLevel } from "@/types";
import { getGrade } from "@/types";

const StudentResults = () => {
  const { studentProfile } = useStore();
  const { data: allResults, fetchAll } = useResults();
  const [selectedClass, setSelectedClass] = useState<ClassLevel>(studentProfile?.class || "JSS1");
  const [selectedTerm, setSelectedTerm] = useState<Term>(studentProfile?.term || "First Term");
  const [selectedSession, setSelectedSession] = useState(studentProfile?.session || "2025/2026");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const myResults = allResults.filter(
    (r) =>
      r.studentId === studentProfile?.id &&
      r.class === selectedClass &&
      r.term === selectedTerm &&
      r.session === selectedSession &&
      r.status === "published"
  );

  const overallAverage = myResults.length > 0
    ? Math.round(myResults.reduce((sum, r) => sum + r.total, 0) / myResults.length)
    : 0;

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Report Card - ${studentProfile?.name || "Student"}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Inter', sans-serif;
              padding: 40px;
              background: white;
              color: #1f2937;
            }
            .header {
              text-align: center;
              border-bottom: 3px double #102542;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .school-logo {
              width: 80px;
              height: 80px;
              margin-bottom: 10px;
            }
            .school-name {
              font-size: 24px;
              font-weight: 700;
              color: #102542;
              letter-spacing: 1px;
            }
            .school-motto {
              font-size: 12px;
              color: #D4A017;
              margin-top: 4px;
            }
            .report-title {
              font-size: 18px;
              font-weight: 600;
              margin-top: 15px;
              color: #1E3A8A;
              text-transform: uppercase;
              letter-spacing: 2px;
            }
            .student-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px 40px;
              margin: 25px 0;
              padding: 15px;
              background: #f8f9fa;
              border-radius: 8px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              font-size: 13px;
              padding: 5px 0;
            }
            .info-label { font-weight: 600; color: #4b5563; }
            .info-value { color: #1f2937; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              font-size: 13px;
            }
            th {
              background: #102542;
              color: white;
              padding: 10px;
              text-align: left;
              font-weight: 600;
            }
            td {
              padding: 8px 10px;
              border-bottom: 1px solid #e5e7eb;
            }
            tr:nth-child(even) { background: #f8f9fa; }
            .grade-A { background: #d1fae5; color: #065f46; font-weight: 600; }
            .grade-B { background: #dbeafe; color: #1e40af; font-weight: 600; }
            .grade-C { background: #fef3c7; color: #92400e; font-weight: 600; }
            .grade-D { background: #fed7aa; color: #9a3412; }
            .grade-E { background: #fecaca; color: #991b1b; }
            .grade-F { background: #fca5a5; color: #7f1d1d; font-weight: 700; }
            .summary {
              margin-top: 25px;
              padding: 20px;
              background: #f0f4ff;
              border-radius: 8px;
              border: 1px solid #c7d2fe;
            }
            .summary-title {
              font-size: 14px;
              font-weight: 600;
              color: #1E3A8A;
              margin-bottom: 10px;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
            }
            .summary-item {
              text-align: center;
            }
            .summary-value {
              font-size: 20px;
              font-weight: 700;
              color: #102542;
            }
            .summary-label {
              font-size: 11px;
              color: #6b7280;
              margin-top: 4px;
            }
            .signatures {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 40px;
              margin-top: 50px;
              padding-top: 30px;
              border-top: 1px solid #e5e7eb;
            }
            .signature-line {
              border-top: 1px solid #374151;
              padding-top: 8px;
              text-align: center;
              font-size: 12px;
              color: #4b5563;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 11px;
              color: #9ca3af;
              border-top: 1px solid #e5e7eb;
              padding-top: 15px;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const { grade: overallGrade, remark: overallRemark } = getGrade(overallAverage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#102542] dark:text-white flex items-center gap-2">
            <TrendingUp size={24} />
            My Results
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View your published results
          </p>
        </div>
        {myResults.length > 0 && (
          <Button onClick={handlePrint} className="bg-[#1E3A8A] hover:bg-[#264b9e]">
            <Printer size={16} className="mr-2" />
            Print Report Card
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Class</Label>
              <Select value={selectedClass} onValueChange={(v) => setSelectedClass(v as ClassLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLASSES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
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
              <input
                type="text"
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {selectedClass} - {selectedTerm} ({selectedSession})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myResults.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No published results found for this term</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Subject</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">CA (30)</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Exam (70)</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Total (100)</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Grade</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myResults.map((result) => (
                      <tr key={result.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{result.subject}</td>
                        <td className="py-3 px-4 text-sm text-center text-gray-600 dark:text-gray-300">{result.ca}</td>
                        <td className="py-3 px-4 text-sm text-center text-gray-600 dark:text-gray-300">{result.exam}</td>
                        <td className="py-3 px-4 text-sm text-center font-bold text-[#102542] dark:text-white">{result.total}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            result.grade === "A" ? "bg-green-100 text-green-800" :
                            result.grade === "B" ? "bg-blue-100 text-blue-800" :
                            result.grade === "C" ? "bg-yellow-100 text-yellow-800" :
                            result.grade === "D" ? "bg-orange-100 text-orange-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {result.grade}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{result.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-[#1E3A8A]/5 dark:bg-[#1E3A8A]/10 rounded-lg">
                <h3 className="text-sm font-semibold text-[#1E3A8A] mb-3">Term Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#102542] dark:text-white">{overallAverage}%</p>
                    <p className="text-xs text-gray-500">Overall Average</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#102542] dark:text-white">{overallGrade}</p>
                    <p className="text-xs text-gray-500">Overall Grade</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#102542] dark:text-white">{myResults.length}</p>
                    <p className="text-xs text-gray-500">Subjects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#059669]">{overallRemark}</p>
                    <p className="text-xs text-gray-500">Remark</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Print-Only Report Card (hidden) */}
      <div ref={printRef} className="hidden">
        <div className="header">
          <img src="/school-logo.png" alt="De-Best Gloryland School" className="school-logo" />
          <div className="school-name">DE-BEST GLORYLAND SCHOOL</div>
          <div className="school-motto">Excellence in Education</div>
          <div className="report-title">Student Report Card</div>
        </div>

        <div className="student-info">
          <div className="info-row">
            <span className="info-label">Student Name:</span>
            <span className="info-value">{studentProfile?.name}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Student ID:</span>
            <span className="info-value">{studentProfile?.schoolId}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Class:</span>
            <span className="info-value">{selectedClass}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Term:</span>
            <span className="info-value">{selectedTerm}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Session:</span>
            <span className="info-value">{selectedSession}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Gender:</span>
            <span className="info-value capitalize">{studentProfile?.gender}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>CA (30)</th>
              <th>Exam (70)</th>
              <th>Total (100)</th>
              <th>Grade</th>
              <th>Remark</th>
            </tr>
          </thead>
          <tbody>
            {myResults.map((result) => (
              <tr key={result.id}>
                <td>{result.subject}</td>
                <td>{result.ca}</td>
                <td>{result.exam}</td>
                <td><strong>{result.total}</strong></td>
                <td className={`grade-${result.grade}`}>{result.grade}</td>
                <td>{result.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="summary">
          <div className="summary-title">Academic Summary</div>
          <div className="summary-grid">
            <div className="summary-item">
              <div className="summary-value">{overallAverage}%</div>
              <div className="summary-label">Overall Average</div>
            </div>
            <div className="summary-item">
              <div className="summary-value">{overallGrade}</div>
              <div className="summary-label">Overall Grade</div>
            </div>
            <div className="summary-item">
              <div className="summary-value">{myResults.length}</div>
              <div className="summary-label">Subjects Taken</div>
            </div>
          </div>
        </div>

        <div className="signatures">
          <div className="signature-line">
            <strong>Class Teacher</strong><br />
            Signature & Date
          </div>
          <div className="signature-line">
            <strong>Principal</strong><br />
            Signature & Date
          </div>
          <div className="signature-line">
            <strong>Parent/Guardian</strong><br />
            Signature & Date
          </div>
        </div>

        <div className="footer">
          <p>De-Best Gloryland School - Official Report Card</p>
          <p>Generated on {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default StudentResults;
