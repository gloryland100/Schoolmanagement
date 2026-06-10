import { useState, useEffect } from "react";
import { useResults } from "@/hooks/useFirestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  FileText,
} from "lucide-react";
import { CLASSES, TERMS, type Result, type ResultStatus, type ClassLevel, type Term } from "@/types";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ResultApproval = () => {
  const { data: results, loading, fetchAll, update } = useResults();
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterTerm, setFilterTerm] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<ResultStatus | "all">("pending");
  const [viewingResult, setViewingResult] = useState<Result | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const handleApprove = async (result: Result) => {
    try {
      await update(result.id, {
        status: "approved",
        ...({} as any),
      });
      toast.success("Result approved");
      fetchAll();
    } catch (error) {
      toast.error("Failed to approve result");
    }
  };

  const handlePublish = async (result: Result) => {
    try {
      await update(result.id, {
        status: "published",
        publishedAt: new Date().toISOString(),
      });
      toast.success("Result published! Students can now view it.");
      fetchAll();
    } catch (error) {
      toast.error("Failed to publish result");
    }
  };

  const handleReject = async (result: Result) => {
    try {
      await update(result.id, { status: "draft" });
      toast.success("Result rejected and sent back to teacher");
      fetchAll();
    } catch (error) {
      toast.error("Failed to reject result");
    }
  };

  const filteredResults = results.filter((result) => {
    const matchesClass = filterClass === "all" || result.class === filterClass;
    const matchesTerm = filterTerm === "all" || result.term === filterTerm;
    const matchesStatus = filterStatus === "all" || result.status === filterStatus;
    return matchesClass && matchesTerm && matchesStatus;
  });

  const statusColors: Record<ResultStatus, string> = {
    draft: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    approved: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#102542] dark:text-white flex items-center gap-2">
            <ClipboardList size={24} />
            Result Approval
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Review and approve results submitted by teachers
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(["draft", "pending", "approved", "published"] as ResultStatus[]).map((status) => (
          <Card
            key={status}
            className={`cursor-pointer border-l-4 ${filterStatus === status ? "ring-2 ring-[#D4A017]" : ""}`}
            style={{ borderLeftColor: status === "draft" ? "#6B7280" : status === "pending" ? "#D97706" : status === "approved" ? "#1E3A8A" : "#059669" }}
            onClick={() => setFilterStatus(status)}
          >
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{status}</p>
              <p className="text-2xl font-bold text-[#102542] dark:text-white">
                {results.filter((r) => r.status === status).length}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="w-40">
                <Filter size={16} className="mr-2" />
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {CLASSES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterTerm} onValueChange={setFilterTerm}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Terms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Terms</SelectItem>
                {TERMS.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => { setFilterClass("all"); setFilterTerm("all"); setFilterStatus("all"); }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Results ({filteredResults.length})
            {filterStatus !== "all" && (
              <span className="ml-2 text-sm font-normal text-gray-500 capitalize">- {filterStatus}</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No results found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Student</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Class</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Subject</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">CA</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Exam</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Total</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Grade</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result) => (
                    <tr
                      key={result.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{result.studentName}</p>
                          <p className="text-xs text-gray-500">by {result.teacherName}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{result.class}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{result.subject}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{result.ca}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{result.exam}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-[#102542] dark:text-white">{result.total}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          result.grade === "A" ? "bg-green-100 text-green-800" :
                          result.grade === "B" ? "bg-blue-100 text-blue-800" :
                          result.grade === "C" ? "bg-yellow-100 text-yellow-800" :
                          result.grade === "D" ? "bg-orange-100 text-orange-800" :
                          result.grade === "E" ? "bg-red-100 text-red-800" :
                          "bg-red-200 text-red-900"
                        }`}>
                          {result.grade}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${(statusColors as any)[result.status]}`}>
                          {result.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setViewingResult(result)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          {result.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(result)}
                                className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                                title="Approve"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() => handleReject(result)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                                title="Reject"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          {result.status === "approved" && (
                            <button
                              onClick={() => handlePublish(result)}
                              className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                              title="Publish"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Result Dialog */}
      <Dialog open={!!viewingResult} onOpenChange={() => setViewingResult(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Result Details</DialogTitle>
          </DialogHeader>
          {viewingResult && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Student</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingResult.studentName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Class</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingResult.class}</p>
                </div>
                <div>
                  <p className="text-gray-500">Subject</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingResult.subject}</p>
                </div>
                <div>
                  <p className="text-gray-500">Teacher</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingResult.teacherName}</p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-[#1E3A8A]">{viewingResult.ca}</p>
                    <p className="text-xs text-gray-500">CA (30%)</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1E3A8A]">{viewingResult.exam}</p>
                    <p className="text-xs text-gray-500">Exam (70%)</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#D4A017]">{viewingResult.total}</p>
                    <p className="text-xs text-gray-500">Total (100%)</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Grade</p>
                  <p className="text-lg font-bold">{viewingResult.grade}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Remark</p>
                  <p className="text-lg font-medium">{viewingResult.remark}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${(statusColors as any)[viewingResult.status]}`}>
                    {viewingResult.status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResultApproval;
