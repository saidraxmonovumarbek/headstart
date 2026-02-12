"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { MoreVertical, Plus } from "lucide-react";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function AdminCalendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs().tz("Asia/Tashkent"));
  const [selectedDate, setSelectedDate] = useState(dayjs().tz("Asia/Tashkent"));
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    const res = await fetch("/api/events");
    const data = await res.json();
    setEvents(data);
  }

  function getEventsForDate(date: dayjs.Dayjs) {
    return events
      .filter((e) =>
        dayjs(e.startTime).tz("Asia/Tashkent").format("YYYY-MM-DD") ===
        date.format("YYYY-MM-DD")
      )
      .sort((a, b) =>
        dayjs(a.startTime).diff(dayjs(b.startTime))
      );
  }

  function getColor(type: string) {
    switch (type) {
      case "CLASS":
        return "border-green-700 text-green-700";
      case "GLOBAL":
        return "border-emerald-500 text-emerald-600";
      case "PERSONAL":
        return "border-blue-500 text-blue-600";
      case "TODO":
        return "border-yellow-500 text-yellow-600";
      default:
        return "border-gray-300";
    }
  }

  const daysInMonth = Array.from(
    { length: currentMonth.daysInMonth() },
    (_, i) => currentMonth.date(i + 1)
  );

  return (
    <div className="flex gap-8">
      
      {/* CENTER DAILY VIEW */}
      <div className="flex-1">
        <div className="text-3xl font-bold mb-6 text-green-700">
          {currentMonth.format("MMMM YYYY")}
        </div>

        <div className="space-y-12">
          {daysInMonth.map((day) => (
            <div key={day.toString()} className="border-b pb-8 relative">

              {/* Three Dots */}
              <button
                onClick={() => {
                  setSelectedDate(day);
                  setShowForm(true);
                }}
                className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-lg"
              >
                <MoreVertical size={18} />
              </button>

              <div className="flex">
                
                {/* LEFT DATE SIDE */}
                <div className="w-[35%]">
                  <div className="text-[80px] font-black leading-none">
                    {day.format("DD")}
                  </div>
                  <div className="text-green-600 font-semibold">
                    {day.format("ddd")}
                  </div>
                </div>

                {/* RIGHT EVENTS SIDE */}
                <div className="flex-1 space-y-4">
                  {getEventsForDate(day).map((event) => (
                    <div
                      key={event.id}
                      className={`border-l-4 pl-4 py-2 ${getColor(event.type)}`}
                    >
                      <div className="text-sm font-semibold">
                        {dayjs(event.startTime)
                          .tz("Asia/Tashkent")
                          .format("HH:mm")}{" "}
                        -{" "}
                        {dayjs(event.endTime)
                          .tz("Asia/Tashkent")
                          .format("HH:mm")}
                      </div>

                      <div className="font-medium">
                        {event.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT MINI MONTH CALENDAR (DESKTOP ONLY) */}
      <div className="hidden xl:block w-[280px] border-l pl-6">
        <div className="grid grid-cols-7 gap-2 text-center text-sm">
          {daysInMonth.map((day) => {
            const dayEvents = getEventsForDate(day);

            return (
              <div
                key={day.toString()}
                className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                onClick={() => setSelectedDate(day)}
              >
                <div>{day.format("D")}</div>
                <div className="flex justify-center gap-1 mt-1">
                  {dayEvents.slice(0, 3).map((e, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        e.type === "CLASS"
                          ? "bg-green-700"
                          : e.type === "GLOBAL"
                          ? "bg-emerald-500"
                          : e.type === "PERSONAL"
                          ? "bg-blue-500"
                          : "bg-yellow-500"
                      }`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SIMPLE ADD FORM */}
      {showForm && (
        <AddEventModal
          date={selectedDate}
          onClose={() => setShowForm(false)}
          refresh={fetchEvents}
        />
      )}
    </div>
  );
}


function AddEventModal({ date, onClose, refresh }: any) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("PERSONAL");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");

  async function handleSubmit() {
    await fetch("/api/events", {
      method: "POST",
      body: JSON.stringify({
        title,
        type,
        startTime: date.format("YYYY-MM-DD") + "T" + start,
        endTime: date.format("YYYY-MM-DD") + "T" + end,
      }),
    });

    refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 w-[400px] space-y-4">
        <h2 className="text-lg font-bold">Add Event</h2>

        <input
          className="w-full border p-2 rounded-lg"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <select
          className="w-full border p-2 rounded-lg"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="GLOBAL">Global Event</option>
          <option value="CLASS">Lesson</option>
          <option value="PERSONAL">Personal</option>
          <option value="TODO">To-Do</option>
        </select>

        <div className="flex gap-2">
          <input
            type="time"
            className="flex-1 border p-2 rounded-lg"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
          <input
            type="time"
            className="flex-1 border p-2 rounded-lg"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}