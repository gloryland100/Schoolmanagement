import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useStudents } from "@/hooks/useFirestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  GraduationCap,
  Ban,
  CheckCircle,
  Filter,
} from "lucide-react";
import { CLASSES, TERMS, type Student, type StudentStatus, type ClassLevel } from "@/types";
import toast from "react-hot-toast";

const StudentManagement = () => {
  const { data: students, loading, fetchAll, create, update, remove } = useStudents();
  const { createUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    schoolId: "",
    password: "",
    class: "JSS1" as ClassLevel,
    session: "2025/2026",
    term: "First Term",
    parentPhone: "",
    parentEmail: "",
    gender: "male" as "male" | "female",
    address: "",
    dateOfBirth: "",
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      schoolId: "",
      password: "",
      class: "JSS1",
      session: "2025/2026",
      term: "First Term",
      parentPhone: "",
      parentEmail: "",
      gender: "male",
      address: "",
      dateOfBirth: "",
    });
    setEditingStudent(null);
  };

  const handleAdd = async () => {
    try {
      if (!formData.name || !formData.schoolId || !formData.password) {
        toast.error("Name, School ID and Password are required");
        return;
      }

      // Create Firebase auth user
      const result = await createUser(
        formData.schoolId,
        formData.password,
        formData.name,
        "student",
        {
          phone: formData.parentPhone,
          gender: formData.gender,
          address: formData.address,
        }
      );

      if (!result.success) return;

      // Create student record
      await create({
        schoolId: formData.schoolId,
        userId: result.uid!,
        name: formData.name,
        class: formData.class,
        session: formData.session,
        term: formData.term as any,
        parentPhone: formData.parentPhone,
        parentEmail: formData.parentEmail,
        gender: formData.gender,
        address: formData.address,
        status: "active",
        dateOfBirth: formData.dateOfBirth,
        admissionDate: new Date().toISOString(),
      });

      setShowAddDialog(false);
      resetForm();
      fetchAll();
    } catch (error) {
      console.error("Error adding student:", error);
    }
  };

  const handleUpdate = async () => {
    if (!editingStudent) return;
    try {
      await update(editingStudent.id, {
        name: formData.name,
        class: formData.class,
        session: formData.session,
        term: formData.term as any,
        parentPhone: formData.parentPhone,
        parentEmail: formData.parentEmail,
        gender: formData.gender,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
      });
      setEditingStudent(null);
      resetForm();
      fetchAll();
    } catch (error) {
      console.error("Error updating student:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await remove(id);
        fetchAll();
      } catch (error) {
        console.error("Error deleting student:", error);
      }
    }
  };

  const handleStatusChange = async (student: Student, newStatus: StudentStatus) => {
    try {
      await update(student.id, { status: newStatus });
      toast.success(`Student ${newStatus}`);
      fetchAll();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handlePromote = async (student: Student) => {
    const classIndex = CLASSES.indexOf(student.class);
    if (classIndex < CLASSES.length - 1) {
      const newClass = CLASSES[classIndex + 1];
      await update(student.id, { class: newClass, status: "promoted" as StudentStatus });
      toast.success(`Promoted to ${newClass}`);
      fetchAll();
    } else {
      await update(student.id, { status: "graduated" as StudentStatus });
      toast.success("Student graduated!");
      fetchAll();
    }
  };

  const startEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      schoolId: student.schoolId,
      password: "",
      class: student.class,
      session: student.session,
      term: student.term,
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail || "",
      gender: student.gender,
      address: student.address || "",
      dateOfBirth: student.dateOfBirth || "",
    });
    setShowAddDialog(true);
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      (student.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.schoolId || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === "all" || student.class === filterClass;
    const matchesStatus = filterStatus === "all" || student.status === filterStatus;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const statusColors: Record<StudentStatus, string> = {
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    suspended: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    graduated: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    promoted: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#102542] dark:text-white flex items-center gap-2">
            <Users size={24} />
            Student Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage all students at De-Best Gloryland School
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button
              className="bg-[#1E3A8A] hover:bg-[#264b9e]"
              onClick={() => {
                resetForm();
                setShowAddDialog(true);
              }}
            >
              <Plus size={16} className="mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingStudent ? "Edit Student" : "Add New Student"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label>School ID *</Label>
                <Input
                  value={formData.schoolId}
                  onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                  placeholder="e.g., STU001"
                  disabled={!!editingStudent}
                />
              </div>
              {!editingStudent && (
                <div className="space-y-2">
                  <Label>Password *</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Class</Label>
                <Select
                  value={formData.class}
                  onValueChange={(v) => setFormData({ ...formData, class: v as ClassLevel })}
                >
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
              <div className="space-y-2">
                <Label>Session</Label>
                <Input
                  value={formData.session}
                  onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                  placeholder="e.g., 2025/2026"
                />
              </div>
              <div className="space-y-2">
                <Label>Term</Label>
                <Select
                  value={formData.term}
                  onValueChange={(v) => setFormData({ ...formData, term: v })}
                >
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
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(v: "male" | "female") => setFormData({ ...formData, gender: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Parent Phone</Label>
                <Input
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  placeholder="Enter parent phone"
                />
              </div>
              <div className="space-y-2">
                <Label>Parent Email</Label>
                <Input
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                  placeholder="Enter parent email"
                />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter address"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>
                Cancel
              </Button>
              <Button
                className="bg-[#1E3A8A] hover:bg-[#264b9e]"
                onClick={editingStudent ? handleUpdate : handleAdd}
              >
                {editingStudent ? "Update Student" : "Add Student"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search by name or school ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="promoted">Promoted</SelectItem>
                <SelectItem value="graduated">Graduated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Students ({filteredStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-[#1E3A8A] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-500 mt-2">Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No students found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Class</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Gender</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#1E3A8A] flex items-center justify-center text-white text-xs font-medium">
                            {(student.name || "?").charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.parentPhone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{student.schoolId}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{student.class}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300 capitalize">{student.gender}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${(statusColors as any)[student.status]}`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(student)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          {student.status === "active" && (
                            <>
                              <button
                                onClick={() => handlePromote(student)}
                                className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 transition-colors"
                                title="Promote"
                              >
                                <GraduationCap size={16} />
                              </button>
                              <button
                                onClick={() => handleStatusChange(student, "suspended")}
                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                                title="Suspend"
                              >
                                <Ban size={16} />
                              </button>
                            </>
                          )}
                          {student.status === "suspended" && (
                            <button
                              onClick={() => handleStatusChange(student, "active")}
                              className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 transition-colors"
                              title="Reactivate"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
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
    </div>
  );
};

export default StudentManagement;
