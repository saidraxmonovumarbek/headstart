"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useSession } from "next-auth/react";
import ReflectionBox from "@/app/components/calendar/ReflectionBox";
import MonthlyGoalsBox from "@/app/components/calendar/MonthlyGoalsBox";
import { 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Globe,
  BookOpen,
  User,
  CheckCircle,
  TrendingUp,       // Habits
  HeartPulse,   // Health
  Layers        // Others
} from "lucide-react";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function AdminCalendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState<dayjs.Dayjs | null>(null);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const [monthDirection, setMonthDirection] = useState<"left" | "right">("right");
  

  useEffect(() => {
  fetchEvents();

  const today = dayjs().tz("Asia/Tashkent");

  setCurrentMonth(today);
  setSelectedDate(today);

  setTimeout(() => {
    const el = document.getElementById(
      `day-${today.format("YYYY-MM-DD")}`
    );
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);

}, []);

  async function fetchEvents() {
  try {
    const res = await fetch("/api/events");
    if (!res.ok) return;

    const data = await res.json();
    setEvents(data);
  } catch (err) {
    console.error("Failed to fetch events");
  }
}

  function getEventsForDate(date: dayjs.Dayjs) {
    return events
      .filter(
        (e) =>
          dayjs(e.startTime).tz("Asia/Tashkent").format("YYYY-MM-DD") ===
          date.format("YYYY-MM-DD")
      )
      .sort((a, b) => dayjs(a.startTime).diff(dayjs(b.startTime)));
  }


function getEventColors(type: string) {
  switch (type) {
    case "GLOBAL":
      return "bg-blue-200 text-black";
    case "CLASS":
      return "bg-purple-200 text-black";
    case "PERSONAL":
      return "bg-yellow-200 text-black";
    case "TODO":
      return "bg-rose-300 text-black";
    case "HABITS":
      return "bg-slate-300 text-black";
    case "HEALTH":
      return "bg-teal-200 text-black";
    case "OTHERS":
  return "bg-emerald-300 text-black";
    default:
      return "bg-gray-200 text-black";
  }
}

function showWarning(message: string) {
  setWarning(message);
  setShake(true);

  setTimeout(() => setShake(false), 500);
  setTimeout(() => setWarning(null), 2500);
}

function countWords(text: string) {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function getEventIcon(type: string) {
  switch (type) {
    case "GLOBAL":
      return <Globe size={18} className="opacity-70" />;
    case "CLASS":
      return <BookOpen size={18} className="opacity-70" />;
    case "PERSONAL":
      return <User size={18} className="opacity-70" />;
    case "TODO":
      return <CheckCircle size={18} className="opacity-70" />;
    case "HABITS":
      return <TrendingUp size={18} className="opacity-70" />;
    case "HEALTH":
      return <HeartPulse size={18} className="opacity-70" />;
    case "OTHERS":
      return <Layers size={18} className="opacity-70" />;
    default:
      return null;
  }
}

if (!currentMonth || !selectedDate) return null;

const startOfMonth = currentMonth.startOf("month");

const startWeekDay = startOfMonth.day();

const calendarDays: (dayjs.Dayjs | null)[] = [];

for (let i = 0; i < startWeekDay; i++) {
  calendarDays.push(null);
}

for (let i = 1; i <= currentMonth.daysInMonth(); i++) {
  calendarDays.push(currentMonth.date(i));
}

const daysInMonth = Array.from(
  { length: currentMonth.daysInMonth() },
  (_, i) => currentMonth.date(i + 1)
);

  return (
  <>
    {warning && (
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
        <div
          className={`bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg transition ${
            shake ? "animate-shake" : ""
          }`}
        >
          {warning}
        </div>
      </div>
    )}

    <div className="flex flex-col xl:flex-row gap-8 h-full">

      {/* CENTER */}
      <div className="flex-1 bg-green-100 rounded-3xl p-6 sm:p-10 overflow-y-auto">

        {/* MONTH HEADER */}
        <div className="relative flex items-center justify-center mb-12">

          <button
            onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))}
            className="absolute left-0 p-2 rounded-xl hover:bg-white/60"
          >
            <ChevronLeft />
          </button>

          <div className="text-3xl font-bold text-black">
            {currentMonth.format("MMMM YYYY")}
          </div>

          <button
            onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}
            className="absolute right-0 p-2 rounded-xl hover:bg-white/60"
          >
            <ChevronRight />
          </button>
        </div>

        {/* DAILY LIST */}
        <div className="space-y-16">
          {daysInMonth.map((day) => (
            <div
  id={`day-${day.format("YYYY-MM-DD")}`}
  key={day.toString()}
  className="relative border-b border-green-200 pb-10"
>

              <div className="flex flex-col md:flex-row">

                {/* DATE SIDE */}
                <div className="md:w-[35%] mb-6 md:mb-0">
                  <div className="text-[90px] font-black leading-none text-black">
                    {day.format("DD")}
                  </div>
                  <div className="text-gray-600 font-semibold">
                    {day.format("ddd")}
                  </div>
                </div>

                {/* EVENTS SIDE */}
                <div className="flex-1 space-y-4">

                  {getEventsForDate(day).map((event) => {
  const canEdit =
    role === "admin" ||
    (!event.isGlobal && event.creatorId === (session?.user as any)?.id);

  return (
  <div
    key={event.id}
    className={`group relative flex flex-col md:flex-row md:items-start rounded-2xl px-6 py-5 transition shadow-sm ${getEventColors(event.type)}`}
  >
    {/* TIME */}
<div className="md:w-[22%] flex-shrink-0 mb-3 md:mb-0 font-semibold text-sm text-black whitespace-normal leading-snug">
  <span className="block">
    {dayjs(event.startTime).tz("Asia/Tashkent").format("HH:mm")} –
  </span>
  <span className="block">
    {dayjs(event.endTime).tz("Asia/Tashkent").format("HH:mm")}
  </span>
</div>

{/* TITLE + ICON */}
<div className="flex items-start gap-3 flex-1 min-w-0">
  
  {/* ICON */}
  <div className="mt-1 text-black opacity-70">
    {getEventIcon(event.type)}
  </div>

  {/* TITLE */}
  <div className="font-semibold text-black break-words whitespace-normal">
    {event.title}
  </div>

</div>

                      {/* HOVER ACTION */}
{canEdit && (
  <button
    onClick={() => {
  const now = dayjs().tz("Asia/Tashkent");
  const eventDate = dayjs(event.startTime).tz("Asia/Tashkent");

  const diffHours = now.diff(eventDate, "hour");

  if (diffHours >= 48) {
    showWarning("Editing is only allowed within 48 hours.");
    return;
  }

  setEditingEvent(event);
}}
                        className="absolute right-4 opacity-60 md:opacity-0 md:group-hover:opacity-100 transition p-2 rounded-lg hover:bg-white"
                      >
                        <MoreVertical size={16} />
                        </button>
)}
                                        </div>
  );
})}

                </div>
              </div>

                {/* DAY ADD BUTTON (BOTTOM LEFT) */}
    <button
      onClick={() => {
  const today = dayjs().tz("Asia/Tashkent").startOf("day");
  const clickedDate = day.startOf("day");

  if (clickedDate.isBefore(today)) {
    showWarning("You can only add events to today or future dates.");
    return;
  }

  setSelectedDate(day);
  setShowForm(true);
}}
      className="absolute bottom-1 right-1 z-10 w-5 h-5 flex items-center justify-center rounded-full bg-white/70 backdrop-blur-sm shadow-sm hover:bg-white transition"
    >
      <Plus size={14} className="text-black" />
    </button>

            </div>
          ))}
        </div>
      </div>

      {/* RIGHT MONTH MINI CALENDAR + REFLECTION + GOALS */}
<div className="hidden xl:flex flex-col w-[300px] bg-emerald-400 text-white rounded-3xl p-6 h-full">

  {/* MONTH HEADER */}
<div className="flex items-center justify-between mb-6">
  <button
  onClick={() => {
    setMonthDirection("left");
    setCurrentMonth(currentMonth.subtract(1, "month"));
  }}
  className="absolute left-0 p-2 rounded-xl hover:bg-white/60 active:scale-95"
>
  <ChevronLeft />
</button>

  <div
    key={currentMonth.format("YYYY-MM")}
    className={`text-lg font-semibold ${
      monthDirection === "right"
        ? "animate-slide-left"
        : "animate-slide-right"
    }`}
  >
    {currentMonth.format("MMMM YYYY")}
  </div>

  <button
  onClick={() => {
    setMonthDirection("right");
    setCurrentMonth(currentMonth.add(1, "month"));
  }}
  className="absolute right-0 p-2 rounded-xl hover:bg-white/60 active:scale-95"
>
  <ChevronRight />
</button>
</div>

  {/* WEEKDAY HEADER */}
<div className="grid grid-cols-7 text-center text-xs font-semibold mb-3">
  {["S","M","T","W","T","F","S"].map((d, i) => (
    <div key={i}>{d}</div>
  ))}
</div>

{/* ANIMATED MONTH WRAPPER */}
<div className="overflow-hidden relative w-full">
  <div
    key={currentMonth.format("YYYY-MM")}
    className={`${
      monthDirection === "right"
        ? "animate-slide-left"
        : "animate-slide-right"
    }`}
  >

  {/* MONTH GRID */}
  <div className="grid grid-cols-7 gap-2 text-center text-sm mb-8">
    {calendarDays.map((day, index) => (
      <div key={index}>
        {day ? (
          <button
  onClick={() => {
    // 🔥 Fire-and-forget save (NO await, NO async)

    // 🚀 Immediately switch date (no waiting)
    setSelectedDate(day);

    // Smooth scroll
    setTimeout(() => {
      const el = document.getElementById(
        `day-${day.format("YYYY-MM-DD")}`
      );
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }}
  className={`w-8 h-8 rounded-full transition ${
    day.isSame(selectedDate, "day")
      ? "bg-white text-emerald-600 font-bold"
      : "hover:bg-white/30"
  }`}
>
  {day.date()}
</button>
        ) : (
          <div className="w-8 h-8" />
        )}
      </div>
    ))}
  </div>

  {/* SCROLLABLE LOWER SECTION */}
<div className="flex-1 overflow-y-auto space-y-8">

  <ReflectionBox selectedDate={selectedDate} />

  <MonthlyGoalsBox currentMonth={currentMonth} />

</div> {/* END SCROLLABLE LOWER SECTION */}
</div> {/* END ANIMATION INNER */}
</div> {/* END ANIMATION OUTER WRAPPER */}

</div> {/* END RIGHT SIDEBAR */}

{/* ADD / EDIT MODAL */}
{(showForm || editingEvent) && (
  <AddEventModal
    role={role}
    date={editingEvent ? dayjs(editingEvent.startTime) : selectedDate}
    existingEvent={editingEvent}
    onClose={() => {
      setShowForm(false);
      setEditingEvent(null);
    }}
    refresh={fetchEvents}
  />
)}

</div>
</>
);
}

function AddEventModal({
  date,
  existingEvent,
  onClose,
  refresh,
  role,
}: any) {
  const [title, setTitle] = useState(existingEvent?.title || "");
  const [type, setType] = useState(existingEvent?.type || "PERSONAL");
  const [start, setStart] = useState(
    existingEvent
      ? dayjs(existingEvent.startTime).format("HH:mm")
      : "09:00"
  );
  const [end, setEnd] = useState(
    existingEvent
      ? dayjs(existingEvent.endTime).format("HH:mm")
      : "10:00"
  );

  async function handleSubmit() {
    if (existingEvent) {
      await fetch(`/api/events/${existingEvent.id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
          title,
          type,
          startTime: dayjs
  .tz(date.format("YYYY-MM-DD") + " " + start, "Asia/Tashkent")
  .toISOString(),

endTime: dayjs
  .tz(date.format("YYYY-MM-DD") + " " + end, "Asia/Tashkent")
  .toISOString(),
        }),
      });
    } else {
      await fetch("/api/events", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
          title,
          type,
          startTime: dayjs
  .tz(date.format("YYYY-MM-DD") + " " + start, "Asia/Tashkent")
  .toISOString(),

endTime: dayjs
  .tz(date.format("YYYY-MM-DD") + " " + end, "Asia/Tashkent")
  .toISOString(),
        }),
      });
    }

    refresh();
    onClose();
  }

  async function handleDelete() {
    await fetch(`/api/events/${existingEvent.id}`, {
  method: "DELETE",
  headers: { "Content-Type": "application/json" },
});

    refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[420px] space-y-4">

        <h2 className="text-lg font-bold">
          {existingEvent ? "Edit Event" : "Add Event"}
        </h2>

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
          {role === "admin" && (
  <option value="GLOBAL">Global Event</option>
)}
          <option value="CLASS">Lesson</option>
          <option value="PERSONAL">Personal</option>
          <option value="TODO">To-Do</option>
          <option value="HABITS">Habits</option>
          <option value="HEALTH">Health</option>
          <option value="OTHERS">Others</option>
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

        <div className="flex justify-between items-center">
          {existingEvent && (
            <button
              onClick={handleDelete}
              className="text-red-600 text-sm"
            >
              Delete
            </button>
          )}

          <div className="flex gap-3 ml-auto">
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
    </div>
  );
}