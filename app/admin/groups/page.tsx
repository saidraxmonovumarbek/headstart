"use client";

import { useEffect, useState } from "react";

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  const [form, setForm] = useState({
  name: "",
  monthlyPrice: "",
  dayType: "ODD",
  customDays: [] as string[],
  startTime: "14:00",
  endTime: "16:00",
  teacher1Id: "",
  teacher2Id: "",
});

  useEffect(() => {
    fetchGroups();
    fetchTeachers();
  }, []);

  async function fetchGroups() {
    const res = await fetch("/api/groups");
    const data = await res.json();
    setGroups(data);
  }

  async function fetchTeachers() {
    const res = await fetch("/api/users?role=teacher");
    const data = await res.json();
    setTeachers(data);
  }

  async function createGroup() {
    await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
  ...form,
  customDays:
    form.dayType === "CUSTOM"
      ? form.customDays
      : null,
}),
    });

    fetchGroups();
  }

  async function deleteGroup(id: string) {
    await fetch(`/api/groups/${id}`, {
      method: "DELETE",
    });

    fetchGroups();
  }

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">Groups</h1>

      <div className="bg-white p-6 rounded-xl shadow space-y-4">

        <input
          placeholder="Group Name"
          className="border p-2 w-full"
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          placeholder="Monthly Price"
          type="number"
          className="border p-2 w-full"
          onChange={(e) =>
            setForm({ ...form, monthlyPrice: e.target.value })
          }
        />

        <select
  className="border p-2 w-full"
  onChange={(e) =>
    setForm({ ...form, dayType: e.target.value })
  }
>
  <option value="ODD">Odd Days (Mon/Wed/Fri)</option>
  <option value="EVEN">Even Days (Tue/Thu/Sat)</option>
  <option value="INTENSIVE">Intensive (Mon–Sat)</option>
  <option value="CUSTOM">Custom</option>
</select>

{form.dayType === "CUSTOM" && (
  <div className="flex flex-wrap gap-2 mt-3">
    {["MON","TUE","WED","THU","FRI","SAT"].map((day) => (
      <button
        key={day}
        type="button"
        onClick={() =>
          setForm({
            ...form,
            customDays: form.customDays.includes(day)
              ? form.customDays.filter((d) => d !== day)
              : [...form.customDays, day],
          })
        }
        className={`px-3 py-1 rounded border ${
          form.customDays.includes(day)
            ? "bg-green-600 text-white"
            : "bg-white"
        }`}
      >
        {day}
      </button>
    ))}
  </div>
)}

        <div className="flex gap-4">
          <input
  type="time"
  className="border p-2 w-full"
  onChange={(e) =>
    setForm({ ...form, startTime: e.target.value })
  }
/>

<input
  type="time"
  className="border p-2 w-full"
  onChange={(e) =>
    setForm({ ...form, endTime: e.target.value })
  }
/>
        </div>

        <select
          className="border p-2 w-full"
          onChange={(e) =>
            setForm({ ...form, teacher1Id: e.target.value })
          }
        >
          <option value="">Select Teacher 1</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.email}
            </option>
          ))}
        </select>

        <select
          className="border p-2 w-full"
          onChange={(e) =>
            setForm({ ...form, teacher2Id: e.target.value })
          }
        >
          <option value="">Select Teacher 2 (Optional)</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.email}
            </option>
          ))}
        </select>

        <button
          onClick={createGroup}
          className="bg-green-600 text-white px-6 py-2 rounded"
        >
          Create Group
        </button>
      </div>

      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.id} className="border p-4 rounded">
            <h3 className="font-bold">{group.name}</h3>
            <p>Price: {group.monthlyPrice}</p>
            <p>Day Type: {group.dayType}</p>
            <p>Time: {group.startTime} - {group.endTime}</p>

            <button
              onClick={() => deleteGroup(group.id)}
              className="text-red-600 mt-2"
            >
              Delete Group
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}