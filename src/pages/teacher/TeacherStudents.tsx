import { useEffect, useState } from "react";
import { useStudents } from "@/hooks/useFirestore";
import { useStore } from "@/store/useStore";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Search, Filter, User } from "lucide-react";
import { CLASSES } from "@/types";

const TeacherStudents = () => {
  const { teacherProfile } = useStore();
  const { data: allStudents, fetchAll } = useStudents();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("all");

  useEffect(() => {
    fetchAll();
  }, []);

  const teacherStudents = allStudents.filter((student) =>
    teacherProfile?.classes?.includes(student.class)
  );

  const filteredStudents = teacherStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.schoolId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === "all" || student.class === filterClass;
    return matchesSearch && matchesClass;
  });

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    suspended: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    graduated: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    promoted: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#102542] dark:text-white flex items-center gap-2">
          <Users size={24} />
          My Students
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Students in your assigned classes
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search students..."
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
                {teacherProfile?.classes?.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#102542] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{student.name}</h3>
                  <p className="text-xs text-gray-500">{student.schoolId}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-[#1E3A8A]/10 text-[#1E3A8A] rounded-full text-xs font-medium">
                      {student.class}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[student.status]}`}>
                      {student.status}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    <p>Parent: {student.parentPhone}</p>
                    <p className="capitalize">{student.gender}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No students found in your classes</p>
        </div>
      )}
    </div>
  );
};

export default TeacherStudents;
