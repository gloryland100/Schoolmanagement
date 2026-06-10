import { useState, useEffect } from "react";
import { useMessages } from "@/hooks/useFirestore";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
  Send,
  Search,
  User,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Message, MessageReply } from "@/types";
import toast from "react-hot-toast";

const MessagesPage = () => {
  const { data: messages, fetchAll, update } = useMessages();
  const { currentUser } = useStore();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    try {
      const newReply: MessageReply = {
        id: `reply-${Date.now()}`,
        senderId: currentUser?.id || "admin",
        senderName: currentUser?.name || "Admin",
        content: replyText.trim(),
        createdAt: new Date().toISOString(),
      };

      const existingReplies = selectedMessage.replies || [];
      await update(selectedMessage.id, {
        replies: [...existingReplies, newReply],
        read: true,
      });

      setReplyText("");
      setSelectedMessage({
        ...selectedMessage,
        replies: [...existingReplies, newReply],
        read: true,
      });
      fetchAll();
      toast.success("Reply sent");
    } catch (error) {
      toast.error("Failed to send reply");
    }
  };

  const handleMarkRead = async (message: Message) => {
    if (!message.read) {
      await update(message.id, { read: true });
      fetchAll();
    }
  };

  const filteredMessages = messages.filter(
    (m) =>
      m.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadMessages = filteredMessages.filter((m) => !m.read && m.senderRole !== "admin");
  const readMessages = filteredMessages.filter((m) => m.read || m.senderRole === "admin");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#102542] dark:text-white flex items-center gap-2">
          <MessageSquare size={24} />
          Messages
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Communicate with students and teachers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Message List */}
        <Card className="lg:col-span-1 overflow-hidden">
          <CardHeader className="p-4 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="inbox" className="w-full">
              <TabsList className="w-full mx-4 mt-2">
                <TabsTrigger value="inbox" className="flex-1">
                  Inbox {unreadMessages.length > 0 && `(${unreadMessages.length})`}
                </TabsTrigger>
                <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
              </TabsList>
              <TabsContent value="inbox" className="mt-0">
                <div className="overflow-y-auto max-h-[calc(100vh-320px)]">
                  {unreadMessages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">No unread messages</div>
                  ) : (
                    unreadMessages.map((message) => (
                      <MessageItem
                        key={message.id}
                        message={message}
                        selected={selectedMessage?.id === message.id}
                        onClick={() => {
                          setSelectedMessage(message);
                          handleMarkRead(message);
                        }}
                      />
                    ))
                  )}
                </div>
              </TabsContent>
              <TabsContent value="all" className="mt-0">
                <div className="overflow-y-auto max-h-[calc(100vh-320px)]">
                  {filteredMessages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">No messages</div>
                  ) : (
                    filteredMessages.map((message) => (
                      <MessageItem
                        key={message.id}
                        message={message}
                        selected={selectedMessage?.id === message.id}
                        onClick={() => {
                          setSelectedMessage(message);
                          handleMarkRead(message);
                        }}
                      />
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Message Detail */}
        <Card className="lg:col-span-2 overflow-hidden flex flex-col">
          {selectedMessage ? (
            <>
              <CardHeader className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1E3A8A] flex items-center justify-center text-white">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedMessage.senderName}</p>
                      <p className="text-xs text-gray-500 capitalize">{selectedMessage.senderRole} - {new Date(selectedMessage.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedMessage.read ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {selectedMessage.read ? "Read" : "Unread"}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-3">{selectedMessage.subject}</h3>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>

                {/* Replies */}
                {selectedMessage.replies?.map((reply) => (
                  <div
                    key={reply.id}
                    className={`flex ${reply.senderId === currentUser?.id ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      reply.senderId === currentUser?.id
                        ? "bg-[#1E3A8A] text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}>
                      <p className="text-xs opacity-75 mb-1">{reply.senderName}</p>
                      <p className="text-sm">{reply.content}</p>
                      <p className="text-[10px] opacity-60 mt-1">
                        {new Date(reply.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 min-h-[60px]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleReply();
                      }
                    }}
                  />
                  <Button onClick={handleReply} className="bg-[#1E3A8A] hover:bg-[#264b9e] self-end">
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Select a message to view</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

const MessageItem = ({ message, selected, onClick }: { message: Message; selected: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-3 border-b border-gray-100 dark:border-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
      selected ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-[#1E3A8A]" : ""
    } ${!message.read && message.senderRole !== "admin" ? "bg-amber-50/50 dark:bg-amber-900/10" : ""}`}
  >
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
        !message.read && message.senderRole !== "admin" ? "bg-amber-500" : "bg-transparent"
      }`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className={`text-sm truncate ${!message.read && message.senderRole !== "admin" ? "font-semibold" : "font-medium"} text-gray-900 dark:text-white`}>
            {message.senderName}
          </p>
          <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
            {new Date(message.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-xs text-gray-500 truncate">{message.subject}</p>
        <p className="text-xs text-gray-400 truncate">{message.content.substring(0, 60)}...</p>
      </div>
    </div>
  </button>
);

export default MessagesPage;
