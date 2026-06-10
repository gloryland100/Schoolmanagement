import { useState, useEffect } from "react";
import { useMessages } from "@/hooks/useFirestore";
import { useStore } from "@/store/useStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Send,
  Plus,
  Search,
  Inbox,
} from "lucide-react";
import toast from "react-hot-toast";

const StudentMessages = () => {
  const { studentProfile, currentUser } = useStore();
  const { data: messages, fetchAll, create } = useMessages();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    subject: "",
    content: "",
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSendMessage = async () => {
    try {
      await create({
        senderId: currentUser?.id || "",
        senderName: studentProfile?.name || currentUser?.name || "Student",
        senderRole: "student",
        recipientId: "admin",
        recipientRole: "admin",
        subject: formData.subject,
        content: formData.content,
        read: false,
      });
      toast.success("Message sent to admin");
      setShowNewDialog(false);
      setFormData({ subject: "", content: "" });
      fetchAll();
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const studentMessages = messages.filter(
    (m) => m.senderId === currentUser?.id || (m.recipientId === currentUser?.id || m.senderRole === "admin")
  );

  const filteredMessages = studentMessages.filter(
    (m) =>
      m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#102542] dark:text-white flex items-center gap-2">
            <MessageSquare size={24} />
            Messages
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Send messages to the admin
          </p>
        </div>
        <Button className="bg-[#D97706] hover:bg-[#b45309]" onClick={() => setShowNewDialog(true)}>
          <Plus size={16} className="mr-2" />
          New Message
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <Inbox size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No messages</p>
          </div>
        ) : (
          filteredMessages.map((message) => (
            <Card key={message.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{message.subject}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        message.senderRole === "admin" ? "bg-blue-100 text-blue-700" :
                        message.senderRole === "student" ? "bg-purple-100 text-purple-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {message.senderRole}
                      </span>
                      {!message.read && message.senderRole !== "student" && (
                        <span className="w-2 h-2 bg-amber-500 rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{message.content}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>From: {message.senderName}</span>
                      <span>{new Date(message.createdAt).toLocaleString()}</span>
                    </div>
                    {message.replies && message.replies.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.replies.map((reply: any) => (
                          <div key={reply.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm">
                            <p className="text-xs text-gray-500 mb-1">{reply.senderName}</p>
                            <p className="text-gray-700 dark:text-gray-300">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* New Message Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Message to Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Enter subject"
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter your message"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
            <Button className="bg-[#D97706] hover:bg-[#b45309]" onClick={handleSendMessage}>
              <Send size={16} className="mr-2" />
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentMessages;
