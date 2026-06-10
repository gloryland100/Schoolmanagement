import { useEffect, useState } from "react";
import { useTimetables } from "@/hooks/useFirestore";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { DAYS, type TimetableEntry, type DayOfWeek } from "@/types";

const PERIODS = [
  { num: 1, start: "08:00", end: "08:40", type: "lesson" as const },
  { num: 2, start: "08:40", end: "09:20", type: "lesson" as const },
  { num: 3, start: "09:20", end: "10:00", type: "lesson" as const },
  { num: 4, start: "10:00", end: "10:15", type: "short-break" as const },
  { num: 5, start: "10:15", end: "10:55", type: "lesson" as const },
  { num: 6, start: "10:55", end: "11:35", type: "lesson" as const },
  { num: 7, start: "11:35", end: "12:15", type: "long-break" as const },
  { num: 8, start: "12:15", end: "12:55", type: "lesson" as const },
  { num: 9, start: "12:55", end: "13:35", type: "lesson" as const },
  { num: 10, start: "13:35", end: "14:15", type: "lesson" as const },
];

const StudentTimetable = () => {
  const { studentProfile } = useStore();
  const { data: timetables, fetchAll } = useTimetables();

  useEffect(() => {
    fetchAll();
  }, []);

  const timetable = timetables.find((t: any) => t.class === studentProfile?.class);
  const entries = timetable?.entries || [];

  const getEntry = (day: DayOfWeek, period: number) => {
    return entries.find((e: any) => e.day === day && e.period === period);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#102542] dark:text-white flex items-center gap-2">
          <Calendar size={24} />
          My Timetable
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Class timetable for {studentProfile?.class}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{studentProfile?.class} - Weekly Timetable</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-500 w-24">
                    Period
                  </th>
                  {DAYS.map((day) => (
                    <th key={day} className="border border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-500 min-w-[140px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((period) => (
                  <tr key={period.num}>
                    <td className="border border-gray-200 dark:border-gray-700 p-2 text-center bg-gray-50 dark:bg-gray-800">
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        {period.type === "lesson" ? `P${period.num}` : "Break"}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {period.start}-{period.end}
                      </div>
                    </td>
                    {DAYS.map((day) => {
                      const entry = getEntry(day, period.num);
                      const isBreak = period.type !== "lesson";
                      return (
                        <td
                          key={`${day}-${period.num}`}
                          className={`border border-gray-200 dark:border-gray-700 p-1 min-h-[60px] ${
                            isBreak ? "bg-amber-50 dark:bg-amber-900/10" : ""
                          }`}
                        >
                          {isBreak ? (
                            <div className="text-center py-2">
                              <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 uppercase">
                                {period.type === "short-break" ? "Short Break" : "Long Break"}
                              </span>
                            </div>
                          ) : entry ? (
                            <div className="p-1">
                              <p className="text-xs font-medium text-[#102542] dark:text-blue-400 truncate">
                                {entry.subject}
                              </p>
                              {entry.teacherName && (
                                <p className="text-[10px] text-gray-500 truncate">{entry.teacherName}</p>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-2 text-gray-300">-</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentTimetable;
