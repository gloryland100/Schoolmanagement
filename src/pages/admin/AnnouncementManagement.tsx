import { useState, useEffect } from "react";
import { useAnnouncements } from "@/hooks/useFirestore";
import { useStore } from "@/store/useStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Bell,
  Plus,
  Edit2,
  Trash2,
  Pin,
  PinOff,
  Megaphone,
  AlertTriangle,
  Info,
} from "lucide-react";
import type { Announcement, AnnouncementPriority, UserRole } from "@/types";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "student", label: "Students" },
  { value: "teacher", label: "Teachers" },
  { value: "admin", label: "Admin" },
];

const AnnouncementManagement = () => {
  const { data: announcements, loading, fetchAll, create, update, remove } = useAnnouncements();
  const { currentUser } = useStore();
  const [showDialog, setShowDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "normal" as AnnouncementPriority,
    pinned: false,
    targetRoles: ["student", "teacher"] as UserRole[],
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      priority: "normal",
      pinned: false,
      targetRoles: ["student", "teacher"],
    });
    setEditingAnnouncement(null);
  };

  const handleAdd = async () => {
    try {
      await create({
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        pinned: formData.pinned,
        targetRoles: formData.targetRoles,
        authorId: currentUser?.id || "admin",
        authorName: currentUser?.name || "Admin",
      });
      setShowDialog(false);
      resetForm();
      fetchAll();
    } catch (error) {
      console.error("Error creating announcement:", error);
    }
  };

  const handleUpdate = async () => {
    if (!editingAnnouncement) return;
    try {
      await update(editingAnnouncement.id, {
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        pinned: formData.pinned,
        targetRoles: formData.targetRoles,
      });
      setShowDialog(false);
      resetForm();
      fetchAll();
    } catch (error) {
      console.error("Error updating announcement:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this announcement?")) {
      try {
        await remove(id);
        fetchAll();
      } catch (error) {
        console.error("Error deleting announcement:", error);
      }
    }
  };

  const handleTogglePin = async (announcement: Announcement) => {
    try {
      await update(announcement.id, { pinned: !announcement.pinned });
      fetchAll();
    } catch (error) {
      console.error("Error toggling pin:", error);
    }
  };

  const startEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      pinned: announcement.pinned,
      targetRoles: announcement.targetRoles,
    });
    setShowDialog(true);
  };

  const toggleRole = (role: UserRole) => {
    setFormData((prev) => ({
      ...prev,
      targetRoles: prev.targetRoles.includes(role)
        ? prev.targetRoles.filter((r) => r !== role)
        : [...prev.targetRoles, role],
    }));
  };

  const priorityConfig = {
    low: { icon: Info, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200" },
    normal: { icon: Megaphone, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200" },
    high: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200" },
  };

  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#102542] dark:text-white flex items-center gap-2">
            <Bell size={24} />
            Announcements
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Post news, events and notices
          </p>
        </div>
        <Button
          className="bg-[#DC2626] hover:bg-[#b91c1c]"
          onClick={() => {
            resetForm();
            setShowDialog(true);
          }}
        >
          <Plus size={16} className="mr-2" />
          New Announcement
        </Button>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-[#DC2626] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : sortedAnnouncements.length === 0 ? (
        <div className="text-center py-12">
          <Bell size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedAnnouncements.map((announcement) => {
            const config = (priorityConfig as any)[announcement.priority];
            const Icon = config.icon;
            return (
              <Card
                key={announcement.id}
                className={`${announcement.pinned ? "border-l-4 border-l-[#D4A017]" : ""} hover:shadow-md transition-shadow`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${config.bg} ${config.color}`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {announcement.title}
                          </h3>
                          {announcement.pinned && (
                            <span className="px-2 py-0.5 bg-[#D4A017]/10 text-[#D4A017] rounded-full text-xs font-medium">
                              Pinned
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${config.bg} ${config.color}`}>
                            {announcement.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 whitespace-pre-wrap">
                          {announcement.content}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>By {announcement.authorName}</span>
                          <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                          <span className="capitalize">
                            For: {announcement.targetRoles.join(", ")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleTogglePin(announcement)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          announcement.pinned
                            ? "text-[#D4A017] hover:bg-[#D4A017]/10"
                            : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        title={announcement.pinned ? "Unpin" : "Pin"}
                      >
                        {announcement.pinned ? <Pin size={16} /> : <PinOff size={16} />}
                      </button>
                      <button
                        onClick={() => startEdit(announcement)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAnnouncement ? "Edit Announcement" : "New Announcement"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter announcement title"
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter announcement content"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(v) => setFormData({ ...formData, priority: v as AnnouncementPriority })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.pinned}
                onCheckedChange={(checked) => setFormData({ ...formData, pinned: checked as boolean })}
              />
              <Label className="cursor-pointer">Pin to top</Label>
            </div>
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <div className="flex gap-4">
                {ROLES.map((role) => (
                  <label key={role.value} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.targetRoles.includes(role.value)}
                      onCheckedChange={() => toggleRole(role.value)}
                    />
                    <span className="text-sm">{role.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>
              Cancel
            </Button>
            <Button className="bg-[#DC2626] hover:bg-[#b91c1c]" onClick={editingAnnouncement ? handleUpdate : handleAdd}>
              {editingAnnouncement ? "Update" : "Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnnouncementManagement;
