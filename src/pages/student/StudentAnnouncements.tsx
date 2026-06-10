import { useEffect, useState } from "react";
import { useAnnouncements } from "@/hooks/useFirestore";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bell,
  Pin,
  AlertTriangle,
  Megaphone,
  Info,
  Clock,
} from "lucide-react";

const StudentAnnouncements = () => {
  const { data: announcements, loading, fetchAll } = useAnnouncements();

  useEffect(() => {
    fetchAll();
  }, []);

  const priorityConfig = {
    low: { icon: Info, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200" },
    normal: { icon: Megaphone, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200" },
    high: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200" },
  };

  const sortedAnnouncements = [...announcements]
    .filter((a) => a.targetRoles.includes("student"))
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#102542] dark:text-white flex items-center gap-2">
          <Bell size={24} />
          Announcements
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          School news, events and notices
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-[#DC2626] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : sortedAnnouncements.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No announcements</p>
          </div>
        ) : (
          sortedAnnouncements.map((announcement) => {
            const config = (priorityConfig as any)[announcement.priority];
            const Icon = config.icon;
            return (
              <Card
                key={announcement.id}
                className={`${announcement.pinned ? "border-l-4 border-l-[#D4A017]" : ""} hover:shadow-md transition-shadow`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${config.bg} ${config.color} flex-shrink-0`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{announcement.title}</h3>
                        {announcement.pinned && (
                          <span className="px-2 py-0.5 bg-[#D4A017]/10 text-[#D4A017] rounded-full text-xs font-medium flex items-center gap-1">
                            <Pin size={10} />
                            Pinned
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${config.bg} ${config.color}`}>
                          {announcement.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                        {announcement.content}
                      </p>
                      <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </span>
                        <span>By {announcement.authorName}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentAnnouncements;
