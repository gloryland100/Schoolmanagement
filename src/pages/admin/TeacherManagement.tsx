import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTeachers } from "@/hooks/useFirestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  GraduationCap,
  Search,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Users,
} from "lucide-react";
import { CLASSES, SUBJECTS, type Teacher, type ClassLevel, type Subject } from "@/types";

const TeacherManagement = () => {
  const { data: teachers, loading, fetchAll, create, update, remove } = useTeachers();
  const { createUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    schoolId: "",
    password: "",
    subjects: [] as Subject[],
    classes: [] as ClassLevel[],
    classTeacher: "" as string,
    phone: "",
    email: "",
    gender: "male" as "male" | "female",
    address: "",
    qualification: "",
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      schoolId: "",
      password: "",
      subjects: [],
      classes: [],
      classTeacher: "",
      phone: "",
      email: "",
      gender: "male",
      address: "",
      qualification: "",
    });
    setEditingTeacher(null);
  };

  const toggleSubject = (subject: Subject) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const toggleClass = (cls: ClassLevel) => {
    setFormData((prev) => ({
      ...prev,
      classes: prev.classes.includes(cls)
        ? prev.classes.filter((c) => c !== cls)
        : [...prev.classes, cls],
    }));
  };

  const handleAdd = async () => {
    try {
      if (!formData.name || !formData.schoolId || !formData.password) {
        return;
      }

      const result = await createUser(
        formData.schoolId,
        formData.password,
        formData.name,
        "teacher",
        {
          phone: formData.phone,
          email: formData.email,
          gender: formData.gender,
          address: formData.address,
        }
      );

      if (!result.success) return;

      await create({
        schoolId: formData.schoolId,
        userId: result.uid!,
        name: formData.name,
        subjects: formData.subjects,
        classes: formData.classes,
        classTeacher: formData.classTeacher || undefined,
        phone: formData.phone,
        email: formData.email,
        gender: formData.gender,
        address: formData.address,
        qualification: formData.qualification,
      });

      setShowAddDialog(false);
      resetForm();
      fetchAll();
    } catch (error) {
      console.error("Error adding teacher:", error);
    }
  };

  const handleUpdate = async () => {
    if (!editingTeacher) return;
    try {
      await update(editingTeacher.id, {
        name: formData.name,
        subjects: formData.subjects,
        classes: formData.classes,
        classTeacher: formData.classTeacher || undefined,
        phone: formData.phone,
        email: formData.email,
        gender: formData.gender,
        address: formData.address,
        qualification: formData.qualification,
      });
      setEditingTeacher(null);
      resetForm();
      fetchAll();
    } catch (error) {
      console.error("Error updating teacher:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      try {
        await remove(id);
        fetchAll();
      } catch (error) {
        console.error("Error deleting teacher:", error);
      }
    }
  };

  const startEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      schoolId: teacher.schoolId,
      password: "",
      subjects: teacher.subjects || [],
      classes: teacher.classes || [],
      classTeacher: teacher.classTeacher || "",
      phone: teacher.phone || "",
      email: teacher.email || "",
      gender: teacher.gender || "male",
      address: teacher.address || "",
      qualification: teacher.qualification || "",
    });
    setShowAddDialog(true);
  };

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.schoolId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#102542] dark:text-white flex items-center gap-2">
            <GraduationCap size={24} />
            Teacher Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage teachers and their assignments
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <Button
            className="bg-[#059669] hover:bg-[#047857]"
            onClick={() => {
              resetForm();
              setShowAddDialog(true);
            }}
          >
            <Plus size={16} className="mr-2" />
            Add Teacher
          </Button>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTeacher ? "Edit Teacher" : "Add New Teacher"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="e.g., TCH001"
                    disabled={!!editingTeacher}
                  />
                </div>
                {!editingTeacher && (
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
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email"
                  />
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
                  <Label>Qualification</Label>
                  <Input
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="e.g., B.Ed, M.Sc"
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

              {/* Class Teacher */}
              <div className="space-y-2">
                <Label>Class Teacher Of</Label>
                <Select
                  value={formData.classTeacher || "none"}
                  onValueChange={(v) => setFormData({ ...formData, classTeacher: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {CLASSES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subjects */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <BookOpen size={16} />
                  Assigned Subjects
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
                  {SUBJECTS.map((subject) => (
                    <label key={subject} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={formData.subjects.includes(subject)}
                        onCheckedChange={() => toggleSubject(subject)}
                      />
                      <span className="text-xs truncate">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Classes */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users size={16} />
                  Assigned Classes
                </Label>
                <div className="flex flex-wrap gap-2">
                  {CLASSES.map((cls) => (
                    <label
                      key={cls}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                        formData.classes.includes(cls)
                          ? "border-[#1E3A8A] bg-[#1E3A8A]/10 text-[#1E3A8A]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Checkbox
                        checked={formData.classes.includes(cls)}
                        onCheckedChange={() => toggleClass(cls)}
                      />
                      <span className="text-sm">{cls}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>
                Cancel
              </Button>
              <Button
                className="bg-[#059669] hover:bg-[#047857]"
                onClick={editingTeacher ? handleUpdate : handleAdd}
              >
                {editingTeacher ? "Update Teacher" : "Add Teacher"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search by name or school ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Teachers Grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-[#059669] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 mt-2">Loading teachers...</p>
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="text-center py-12">
          <GraduationCap size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No teachers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeachers.map((teacher) => (
            <Card key={teacher.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#059669] to-[#047857] flex items-center justify-center text-white font-bold text-lg">
                      {teacher.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{teacher.name}</h3>
                      <p className="text-xs text-gray-500">{teacher.schoolId}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(teacher)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(teacher.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <BookOpen size={14} className="text-[#D4A017]" />
                    <span>{teacher.subjects?.length || 0} subjects</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Users size={14} className="text-[#1E3A8A]" />
                    <span>{teacher.classes?.join(", ") || "N/A"}</span>
                  </div>
                  {teacher.classTeacher && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#D4A017]/10 text-[#D4A017] rounded-full text-xs font-medium">
                        Class Teacher: {teacher.classTeacher}
                      </span>
                    </div>
                  )}
                  {teacher.qualification && (
                    <p className="text-xs text-gray-500">{teacher.qualification}</p>
                  )}
                  <div className="flex flex-wrap gap-1 pt-2">
                    {teacher.subjects?.slice(0, 4).map((subject: any) => (
                      <span
                        key={subject}
                        className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300"
                      >
                        {subject}
                      </span>
                    ))}
                    {(teacher.subjects?.length || 0) > 4 && (
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-500">
                        +{(teacher.subjects || []).length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherManagement;
