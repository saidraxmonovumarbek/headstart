"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useSession } from "next-auth/react";
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
  const [currentMonth, setCurrentMonth] = useState(dayjs().tz("Asia/Tashkent"));
  const [selectedDate, setSelectedDate] = useState(dayjs().tz("Asia/Tashkent"));
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const REFLECTION_WORD_LIMIT = 100;

  const [reflection, setReflection] = useState("");
  const [reflectionWords, setReflectionWords] = useState(0);
  const [reflectionLoading, setReflectionLoading] = useState(false);

  const [goals, setGoals] = useState<string[]>(["", "", ""]);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [monthDirection, setMonthDirection] = useState<"left" | "right">("right");
  const [reflectionDate, setReflectionDate] = useState(
  dayjs().tz("Asia/Tashkent").format("YYYY-MM-DD")
);

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

useEffect(() => {
  const dateKey = selectedDate.format("YYYY-MM-DD");
  setReflectionDate(dateKey);

  async function loadReflection() {
    try {
      setReflectionLoading(true);

      const res = await fetch(
        `/api/reflection?date=${selectedDate.format("YYYY-MM-DD")}`
      );

      if (!res.ok) {
        setReflection("");
        setReflectionWords(0);
        return;
      }

      const text = await res.text();

      if (!text) {
        setReflection("");
        setReflectionWords(0);
        return;
      }

      const data = JSON.parse(text);

      setReflection(data?.content || "");
      setReflectionWords(countWords(data?.content || ""));
    } catch (err) {
      console.error("Reflection load error:", err);
      setReflection("");
      setReflectionWords(0);
    } finally {
      setReflectionLoading(false);
    }
  }

  loadReflection();
}, [selectedDate]);

useEffect(() => {
  if (reflectionLoading) return;

  const timeout = setTimeout(async () => {
    try {
      await fetch("/api/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: reflectionDate, // 🔥 use fixed date snapshot
          content: reflection,
        }),
      });
    } catch (err) {
      console.error("Reflection save error:", err);
    }
  }, 600);

  return () => clearTimeout(timeout);
}, [reflection, reflectionDate]);

useEffect(() => {
  async function loadGoals() {
    try {
      setGoalsLoading(true);

      const res = await fetch(
        `/api/monthly-goals?month=${currentMonth.format("YYYY-MM")}`
      );

      if (!res.ok) {
        setGoals(["", "", ""]);
        return;
      }

      const text = await res.text();

      if (!text) {
        setGoals(["", "", ""]);
        return;
      }

      const data = JSON.parse(text);

      if (data?.goals?.length) {
        setGoals(data.goals);
      } else {
        setGoals(["", "", ""]);
      }
    } catch (err) {
      console.error("Goals load error:", err);
      setGoals(["", "", ""]);
    } finally {
      setGoalsLoading(false);
    }
  }

  loadGoals();
}, [currentMonth]);

useEffect(() => {
  if (goalsLoading) return;

  const timeout = setTimeout(async () => {
    const cleanedGoals = goals
      .map((g) => g.trim())
      .filter((g) => g.length > 0);

    await fetch("/api/monthly-goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        month: currentMonth.format("YYYY-MM"),
        goals: cleanedGoals,
      }),
    });
  }, 800);

  return () => clearTimeout(timeout);
}, [goals, currentMonth]);

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

  const daysInMonth = Array.from(
    { length: currentMonth.daysInMonth() },
    (_, i) => currentMonth.date(i + 1)
  );

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

const startOfMonth = currentMonth.startOf("month");

const startWeekDay = startOfMonth.day(); // 0-6 (Sun-Sat)

const calendarDays: (dayjs.Dayjs | null)[] = [];

// Empty slots before month starts
for (let i = 0; i < startWeekDay; i++) {
  calendarDays.push(null);
}

// Actual month days
for (let i = 1; i <= currentMonth.daysInMonth(); i++) {
  calendarDays.push(currentMonth.date(i));
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
  onClick={async () => {
    try {
      // 🔥 FORCE SAVE CURRENT REFLECTION BEFORE SWITCHING
      await fetch("/api/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: reflectionDate,
          content: reflection,
        }),
      });
    } catch (err) {
      console.error("Force save error:", err);
    }

    // Now switch date
    setSelectedDate(day);

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

  {/* DAILY REFLECTION */}
  <div>
    <h3 className="text-sm font-semibold mb-2">
      Reflect on {selectedDate.format("MMMM D")}
    </h3>

    <textarea
      value={reflection}
      onChange={(e) => {
        const text = e.target.value;
        const words = countWords(text);

        if (words <= REFLECTION_WORD_LIMIT) {
          setReflection(text);
          setReflectionWords(words);
        }
      }}
      className="w-full min-h-[100px] rounded-xl p-3 text-sm text-black resize-none outline-none"
      placeholder="Briefly reflect on your day, what you learned, achieved, or improved..."
    />

    <div className="text-xs mt-1 opacity-70 text-right">
      {reflectionWords} / {REFLECTION_WORD_LIMIT} words
    </div>
  </div>

  {/* MONTHLY GOALS */}
<div>
  <h3 className="text-sm font-semibold mb-3">
    What are your goals for {currentMonth.format("MMMM")}?
  </h3>

  <div className="space-y-2">
    {goals.map((goal, index) => (
      <div
        key={index}
        className="relative group"
      >
        <input
          value={goal}
          onChange={(e) => {
            const updated = [...goals];
            updated[index] = e.target.value;
            setGoals(updated);
          }}
          className="w-full rounded-lg p-2 pr-8 text-sm text-black outline-none"
          placeholder={`Goal ${index + 1}`}
        />

        {/* HOVER DELETE BUTTON */}
        {goals.length > 1 && (
          <button
            onClick={() => {
              const updated = goals.filter((_, i) => i !== index);
              setGoals(updated);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover:opacity-100 transition text-xs"
          >
            −
          </button>
        )}
      </div>
    ))}
  </div>

  {goals.length < 7 && (
    <button
      onClick={() => setGoals([...goals, ""])}
      className="mt-2 text-xs opacity-80 hover:opacity-100 transition"
    >
      + Add goal
    </button>
  )}

  <div className="text-xs mt-2 opacity-60 text-right">
    {goals.length} / 7 goals
  </div>
</div>

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