import { useState, useEffect } from "react";
import { useSettings, useSessions } from "@/hooks/useFirestore";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  School,
  Calendar,
  Save,
} from "lucide-react";
import { TERMS, CLASSES, type Term } from "@/types";
import toast from "react-hot-toast";

const AdminSettings = () => {
  const { data: settings, fetchAll: fetchSettings, create: createSetting, update: updateSetting } = useSettings();
  const { data: sessions, fetchAll: fetchSessions, create: createSession, update: updateSession } = useSessions();
  
  const [schoolForm, setSchoolForm] = useState({
    schoolName: "De-Best Gloryland School",
    address: "",
    phone: "",
    email: "",
    principalName: "",
    currentSession: "2025/2026",
    currentTerm: "First Term" as Term,
  });

  const [sessionForm, setSessionForm] = useState({
    year: "2025/2026",
    currentTerm: "First Term" as Term,
    startDate: "",
    endDate: "",
    active: true,
  });

  useEffect(() => {
    fetchSettings();
    fetchSessions();
  }, []);

  useEffect(() => {
    if (settings.length > 0) {
      const s = settings[0];
      setSchoolForm({
        schoolName: s.schoolName || "De-Best Gloryland School",
        address: s.address || "",
        phone: s.phone || "",
        email: s.email || "",
        principalName: s.principalName || "",
        currentSession: s.currentSession || "2025/2026",
        currentTerm: s.currentTerm || "First Term",
      });
    }
  }, [settings]);

  const handleSaveSchool = async () => {
    try {
      if (settings.length > 0) {
        await updateSetting(settings[0].id, {
          ...schoolForm,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await createSetting({
          ...schoolForm,
          updatedAt: new Date().toISOString(),
        });
      }
      toast.success("School settings saved");
      fetchSettings();
    } catch (error) {
      toast.error("Failed to save settings");
    }
  };

  const handleCreateSession = async () => {
    try {
      await createSession({
        year: sessionForm.year,
        currentTerm: sessionForm.currentTerm,
        startDate: sessionForm.startDate,
        endDate: sessionForm.endDate,
        active: sessionForm.active,
      });
      toast.success("Academic session created");
      fetchSessions();
    } catch (error) {
      toast.error("Failed to create session");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#102542] dark:text-white flex items-center gap-2">
          <Settings size={24} />
          Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage school settings and academic sessions
        </p>
      </div>

      <Tabs defaultValue="school" className="w-full">
        <TabsList>
          <TabsTrigger value="school">
            <School size={16} className="mr-2" />
            School Info
          </TabsTrigger>
          <TabsTrigger value="sessions">
            <Calendar size={16} className="mr-2" />
            Academic Sessions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="school" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <School size={18} className="text-[#1E3A8A]" />
                School Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>School Name</Label>
                  <Input
                    value={schoolForm.schoolName}
                    onChange={(e) => setSchoolForm({ ...schoolForm, schoolName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Principal Name</Label>
                  <Input
                    value={schoolForm.principalName}
                    onChange={(e) => setSchoolForm({ ...schoolForm, principalName: e.target.value })}
                    placeholder="Enter principal name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={schoolForm.phone}
                    onChange={(e) => setSchoolForm({ ...schoolForm, phone: e.target.value })}
                    placeholder="Enter school phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={schoolForm.email}
                    onChange={(e) => setSchoolForm({ ...schoolForm, email: e.target.value })}
                    placeholder="Enter school email"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Address</Label>
                  <Input
                    value={schoolForm.address}
                    onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })}
                    placeholder="Enter school address"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Current Session</Label>
                  <Input
                    value={schoolForm.currentSession}
                    onChange={(e) => setSchoolForm({ ...schoolForm, currentSession: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Current Term</Label>
                  <Select
                    value={schoolForm.currentTerm}
                    onValueChange={(v) => setSchoolForm({ ...schoolForm, currentTerm: v as Term })}
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
              </div>
              <Button onClick={handleSaveSchool} className="bg-[#1E3A8A] hover:bg-[#264b9e]">
                <Save size={16} className="mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar size={18} className="text-[#059669]" />
                Create Academic Session
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Session Year</Label>
                  <Input
                    value={sessionForm.year}
                    onChange={(e) => setSessionForm({ ...sessionForm, year: e.target.value })}
                    placeholder="e.g., 2025/2026"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Term</Label>
                  <Select
                    value={sessionForm.currentTerm}
                    onValueChange={(v) => setSessionForm({ ...sessionForm, currentTerm: v as Term })}
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
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={sessionForm.startDate}
                    onChange={(e) => setSessionForm({ ...sessionForm, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={sessionForm.endDate}
                    onChange={(e) => setSessionForm({ ...sessionForm, endDate: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleCreateSession} className="bg-[#059669] hover:bg-[#047857]">
                <Calendar size={16} className="mr-2" />
                Create Session
              </Button>
            </CardContent>
          </Card>

          {/* Sessions List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Academic Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No sessions created</p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-4 rounded-lg border ${
                        session.active
                          ? "border-green-300 bg-green-50 dark:bg-green-900/20"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {session.year} - {session.currentTerm}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(session.startDate).toLocaleDateString()} - {new Date(session.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          session.active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {session.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
