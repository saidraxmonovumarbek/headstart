"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";

export default function StudentClassesPage() {
  const { data: session, status } = useSession();

  const [groups, setGroups] = useState<any[] | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());

  useEffect(() => {
    if (status === "authenticated") {
      fetchGroups();
      fetchEvents();
    }
  }, [status]);

  useEffect(() => {
    if (groups && groups.length > 0) {
      fetchHomeworks();
    }
  }, [selectedDate, groups]);

  async function fetchGroups() {
    const res = await fetch("/api/groups");
    const data = await res.json();
    setGroups(data);
  }

  async function fetchEvents() {
    const res = await fetch("/api/events");
    const data = await res.json();
    setEvents(data);
  }

  async function fetchHomeworks() {
    const all: any[] = [];

    for (const group of groups!) {
      const res = await fetch(`/api/homework?groupId=${group.id}`);
      const data = await res.json();
      all.push(...data);
    }

    setHomeworks(all);
  }

  // 🔄 Still loading
  if (status === "loading" || groups === null) {
    return (
      <div className="text-gray-400">
        Loading your classes...
      </div>
    );
  }

  // 🚫 Not assigned
  if (groups.length === 0) {
    return (
      <div className="space-y-6 text-center mt-20">
        <h1 className="text-3xl font-bold">Classes</h1>

        <div className="bg-gray-50 border rounded-xl p-8">
          <h2 className="text-xl font-semibold mb-4">
            You haven’t been assigned to any classes yet.
          </h2>

          <p className="text-gray-600 mb-4">
            To enroll, ask your teacher to invite you using your ID.
          </p>

          <div className="bg-white border rounded-lg p-4 inline-block">
            <div className="text-gray-500 text-sm">Your ID</div>
            <div className="font-mono text-lg">
              {session?.user?.id}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const todayEvents = events.filter(
    (e) =>
      dayjs(e.startTime).format("YYYY-MM-DD") ===
      selectedDate.format("YYYY-MM-DD")
  );

  const todayHomeworks = homeworks.filter(
    (h) =>
      dayjs(h.date).format("YYYY-MM-DD") ===
      selectedDate.format("YYYY-MM-DD")
  );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Classes</h1>

      {/* DATE NAVIGATION */}
      <div className="flex items-center gap-6 text-lg font-medium">
        <button onClick={() => setSelectedDate(selectedDate.subtract(1, "day"))}>
          ←
        </button>

        <div>{selectedDate.format("MMMM D, YYYY")}</div>

        <button onClick={() => setSelectedDate(selectedDate.add(1, "day"))}>
          →
        </button>
      </div>

      {/* CLASSES */}
      <div className="space-y-4">
        {todayEvents.length === 0 ? (
          <div className="text-gray-500 text-xl">
            No classes today.
          </div>
        ) : (
          todayEvents.map((event) => (
            <div key={event.id} className="border rounded-xl p-4">
              <h3 className="font-semibold text-lg">
                {event.group?.name}
              </h3>

              <p className="text-gray-600">
                {dayjs(event.startTime).format("HH:mm")} –{" "}
                {dayjs(event.endTime).format("HH:mm")}
              </p>

              <p className="text-gray-500">
                Teacher: {event.group?.teacher1?.name ?? "—"}
              </p>
            </div>
          ))
        )}
      </div>

      {/* HOMEWORK */}
      <div className="space-y-4 mt-6">
        <h2 className="text-xl font-semibold">Homework</h2>

        {todayHomeworks.length === 0 ? (
          <div className="text-gray-400">
            No homework for today.
          </div>
        ) : (
          todayHomeworks.map((hw) => (
            <div key={hw.id} className="border rounded-xl p-4 bg-gray-50">
              {hw.content}
            </div>
          ))
        )}
      </div>
    </div>
  );
}