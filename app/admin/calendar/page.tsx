"use client";

import { useEffect, useState, useRef } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useSession } from "next-auth/react";
import ReflectionBox from "@/app/components/calendar/ReflectionBox";
import MonthlyGoalsBox from "@/app/components/calendar/MonthlyGoalsBox";
import { Shield, ShieldOff } from "lucide-react";
import {
  ChevronDown,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Plus,
  BookOpen,
  User,
  CheckCircle,
  TrendingUp,
  HeartPulse,
  Layers,
  Briefcase,
  Home
} from "lucide-react";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function AdminCalendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const today = dayjs().tz("Asia/Tashkent");

  const [currentMonth, setCurrentMonth] = useState<dayjs.Dayjs>(today);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(today);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;

  const [monthDirection, setMonthDirection] = useState<"left" | "right">("right");
  const [privacyEnabled, setPrivacyEnabled] = useState(() => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("calendarPrivacy");
    if (saved !== null) return saved === "true";
  }
  return false;
});
  

  useEffect(() => {
  async function init() {
    await fetchEvents();
    setIsLoading(false);
  }

  init();
}, []);


// 👇 NEW EFFECT — handles smooth scroll AFTER render
useEffect(() => {
  if (!isLoading) {
    const timeout = setTimeout(() => {
      const el = document.getElementById(
        `day-${today.format("YYYY-MM-DD")}`
      );

      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100); // small delay ensures DOM is painted

    return () => clearTimeout(timeout);
  }
}, [isLoading]);

useEffect(() => {
  localStorage.setItem("calendarPrivacy", String(privacyEnabled));
}, [privacyEnabled]);

async function fetchEvents() {
  try {
    const res = await fetch("/api/events");
    if (!res.ok) return [];

    const data = await res.json();
    setEvents(data);
    return data;
  } catch (err) {
    console.error("Failed to fetch events");
    return [];
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
      // 🔥 Premium green (shining)
      return "relative bg-gradient-to-r from-emerald-500 to-emerald-600 text-white overflow-hidden";

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

    case "WORK":
  return "bg-orange-300 text-black";

case "HOUSEWORK":
  return "bg-indigo-300 text-black";

case "OTHERS":
  return "bg-blue-300 text-black";

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
  return (
    <img
      src="/assets/headstartwhite.png"
      alt="Headstart"
      className="w-[28px] h-[28px] object-contain drop-shadow-sm"
    />
  );
  case "WORK":
  return <Briefcase size={18} className="opacity-70" />;

case "HOUSEWORK":
  return <Home size={18} className="opacity-70" />;
    case "CLASS":
  return <BookOpen size={18} className="opacity-70" />; // Study
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

if (isLoading) {
  return (
    <div className="flex flex-col xl:flex-row gap-8 h-full">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md px-6 text-center">
          <p className="text-emerald-600 text-lg font-semibold mb-6">
            Loading your calendar...
          </p>

          <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 animate-loading-bar" />
          </div>
        </div>
      </div>
    </div>
  );
}

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
  key={day.format("YYYY-MM-DD")}
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
                    const startTz = dayjs(event.startTime).tz("Asia/Tashkent");
const endTz = dayjs(event.endTime).tz("Asia/Tashkent");

const isNoTime =
  startTz.isSame(endTz) &&
  startTz.hour() === 0 &&
  startTz.minute() === 0;
  const canEdit =
    role === "admin" ||
    (!event.isGlobal && event.creatorId === (session?.user as any)?.id);

  return (
  <div
    key={event.id}
    className={`group relative flex flex-row items-center rounded-2xl px-6 py-5 transition shadow-sm ${getEventColors(event.type)}`}
  >
    {/* ✨ GLOBAL SHINE EFFECT */}
    {event.type === "GLOBAL" && (
      <span className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        <span className="absolute top-0 left-[-75%] h-full w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-global-shine" />
      </span>
    )}

    {/* TIME */}
{!isNoTime && (
  <div className="w-[90px] flex-shrink-0 font-semibold text-sm text-black leading-snug">
    <span className="block">
      {startTz.format("HH:mm")} –
    </span>
    <span className="block">
      {endTz.format("HH:mm")}
    </span>
  </div>
)}

{/* TITLE + ICON */}
<div className="flex items-center gap-3 flex-1 min-w-0">
  
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
                        className="absolute right-4 opacity-60 md:opacity-0 md:group-hover:opacity-100 transition p-2"
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
<div className="hidden xl:flex flex-col w-[300px] bg-emerald-400 text-white rounded-3xl p-6 h-full min-h-0 relative">

  {/* MONTH HEADER */}
<div className="relative flex items-center justify-center mb-6">
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
<div className="relative w-full">
  <div
    key={currentMonth.format("YYYY-MM")}
    className={`${
      monthDirection === "right"
        ? "animate-slide-left"
        : "animate-slide-right"
    }`}
  >

  {/* MONTH GRID */}
  <div className="grid grid-cols-7 gap-2 text-center text-sm mb-8 justify-items-center">
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

  {/* JOURNAL + GOALS SECTION */}
<div className="relative flex-1 mt-2 min-h-0 h-full">

  {/* WRAPPER (needed for positioning) */}
  <div className={`relative h-full ${privacyEnabled ? "group" : ""}`}>

    {/* SCROLLABLE CONTENT */}
    <div
      className={`
        h-full overflow-y-auto space-y-8 pr-1 transition-opacity duration-300
        ${privacyEnabled ? "opacity-0 group-hover:opacity-100" : "opacity-100"}
      `}
    >
      <ReflectionBox selectedDate={selectedDate} />
      <MonthlyGoalsBox currentMonth={currentMonth} />

    </div>

    {/* PRIVACY COVER */}
    {privacyEnabled && (
  <div className="absolute inset-0 z-20 bg-emerald-400 rounded-2xl 
                  transition-opacity duration-300 
                  group-hover:opacity-0 opacity-100 
                  pointer-events-none 
                  will-change-transform 
                  transform-gpu">

</div>
    )}

  </div>
</div>
</div> {/* END ANIMATION INNER */}
</div> {/* END ANIMATION OUTER WRAPPER */}

{/* STRICT BOTTOM PRIVACY TOGGLE */}
<div className="absolute bottom-4 left-0 right-0 flex justify-center z-40">
  <button
    onClick={() => setPrivacyEnabled(!privacyEnabled)}
    className="flex items-center gap-2 text-xs text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full transition"
  >
    {privacyEnabled ? (
      <>
        <ShieldOff size={14} />
        Disable privacy shield
      </>
    ) : (
      <>
        <Shield size={14} />
        Enable privacy shield
      </>
    )}
  </button>
</div>

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
  const [typeDropdown, setTypeDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
  function handleClickOutside(e: MouseEvent) {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node)
    ) {
      setTypeDropdown(false);
    }
  }

  function handleEsc(e: KeyboardEvent) {
    if (e.key === "Escape") {
      setTypeDropdown(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);
  document.addEventListener("keydown", handleEsc);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
    document.removeEventListener("keydown", handleEsc);
  };
}, []);

useEffect(() => {
  function esc(e: KeyboardEvent) {
    if (e.key === "Escape") {
      if (typeDropdown) {
        setTypeDropdown(false);
        return;
      }
      onClose();
    }
  }

  document.addEventListener("keydown", esc);
  return () => document.removeEventListener("keydown", esc);
}, [onClose, typeDropdown]);

useEffect(() => {
  document.body.style.overflow = "hidden";
  return () => {
    document.body.style.overflow = "auto";
  };
}, []);

  const eventTypes = [
  ...(role === "admin"
    ? [{ value: "GLOBAL", label: "Global Event", color: "bg-emerald-500" }]
    : []),
  { value: "CLASS", label: "Study", color: "bg-purple-400" },
  { value: "PERSONAL", label: "Personal", color: "bg-yellow-400" },
  { value: "TODO", label: "To-Do", color: "bg-rose-400" },
  { value: "HABITS", label: "Habits", color: "bg-slate-400" },
  { value: "HEALTH", label: "Health", color: "bg-teal-400" },
  { value: "WORK", label: "Work", color: "bg-orange-400" },
  { value: "HOUSEWORK", label: "Housework", color: "bg-indigo-400" },
  { value: "OTHERS", label: "Others", color: "bg-blue-400" },
];

  const [titleError, setTitleError] = useState(false);
  const [noTime, setNoTime] = useState(() => {
  if (!existingEvent) return false;

  const startTz = dayjs(existingEvent.startTime).tz("Asia/Tashkent");
  const endTz = dayjs(existingEvent.endTime).tz("Asia/Tashkent");

  return (
    startTz.isSame(endTz) &&
    startTz.hour() === 0 &&
    startTz.minute() === 0
  );
});
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
    if (!title.trim()) {
  setTitleError(true);
  return;
}

    if (existingEvent) {
      await fetch(`/api/events/${existingEvent.id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
          title,
          type,
          startTime: noTime
  ? dayjs(date).startOf("day").tz("Asia/Tashkent").toISOString()
  : dayjs
      .tz(date.format("YYYY-MM-DD") + " " + start, "Asia/Tashkent")
      .toISOString(),

endTime: noTime
  ? dayjs(date).startOf("day").tz("Asia/Tashkent").toISOString()
  : dayjs
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
          startTime: noTime
  ? dayjs(date).startOf("day").tz("Asia/Tashkent").toISOString()
  : dayjs
      .tz(date.format("YYYY-MM-DD") + " " + start, "Asia/Tashkent")
      .toISOString(),

endTime: noTime
  ? dayjs(date).startOf("day").tz("Asia/Tashkent").toISOString()
  : dayjs
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
    <div
  className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
  onClick={onClose}
>
      <div
  className="bg-white rounded-2xl p-6 w-[420px] space-y-4"
  onClick={(e) => e.stopPropagation()}
>

        <h2 className="text-lg font-bold">
          {existingEvent ? "Edit Event" : "Add Event"}
        </h2>

        <input
  className={`w-full border p-2 rounded-lg transition ${
    titleError ? "border-red-500 bg-red-50" : "border-gray-300"
  }`}
  placeholder="Title"
  value={title}
  onChange={(e) => {
    setTitle(e.target.value);
    if (titleError) setTitleError(false);
  }}
/>

<div
  ref={dropdownRef}
  className="relative"
  onClick={(e) => e.stopPropagation()}
>
  <button
    type="button"
    onClick={() => setTypeDropdown(!typeDropdown)}
    className="relative flex items-center w-full pl-3 pr-8 py-2 border rounded-lg bg-white text-sm shadow-sm"
  >
    <div className="flex items-center gap-2">
      <div
        className={`w-2.5 h-2.5 rounded-full ${
          eventTypes.find((t) => t.value === type)?.color
        }`}
      />
      {eventTypes.find((t) => t.value === type)?.label}
    </div>

    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
  </button>

  {typeDropdown && (
    <div className="absolute mt-2 w-full bg-white border rounded-xl shadow-lg z-50 p-2">
      {eventTypes.map((t) => (
        <div
          key={t.value}
          onClick={() => {
            setType(t.value);
            setTypeDropdown(false);
          }}
          className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 cursor-pointer text-sm"
        >
          <div className={`w-2.5 h-2.5 rounded-full ${t.color}`} />
          {t.label}
        </div>
      ))}
    </div>
  )}
</div>

        <div className="space-y-3">

  {/* No Time Toggle */}
  <button
    type="button"
    onClick={() => setNoTime(!noTime)}
    className={`w-full py-2 rounded-lg border text-sm transition ${
      noTime
        ? "bg-green-100 border-green-400 text-green-700"
        : "bg-gray-50 hover:bg-gray-100"
    }`}
  >
    {noTime ? "✓ No Time Selected" : "No Time"}
  </button>

  {/* Time Inputs */}
{!noTime && (
  <div className="flex gap-2">
    <input
      type="time"
      className="flex-1 border border-gray-300 p-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-green-400"
      value={start}
      onChange={(e) => setStart(e.target.value)}
    />
    <input
      type="time"
      className="flex-1 border border-gray-300 p-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-green-400"
      value={end}
      onChange={(e) => setEnd(e.target.value)}
    />
  </div>
)}
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