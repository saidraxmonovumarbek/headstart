"use client";

import { useEffect, useState } from "react";
import LevelDonut from "./LevelDonut";

export default function GroupsClient({ stats }: any) {
  const [groups, setGroups] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [showStudents, setShowStudents] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  const [form, setForm] = useState({
  name: "",
  level: "Beginner",   // add this
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
      customDays: form.dayType === "CUSTOM" ? form.customDays : null,
    }),
  });

  setForm({
    name: "",
    level: "Beginner",
    monthlyPrice: "",
    dayType: "ODD",
    customDays: [],
    startTime: "14:00",
    endTime: "16:00",
    teacher1Id: "",
    teacher2Id: "",
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
      <div className="flex items-center justify-between">
  <h1 className="text-3xl font-bold">Groups</h1>

  <button
    onClick={() => setShowCreateModal(true)}
    className="bg-green-600 text-white px-5 py-2 rounded-lg shadow-sm hover:bg-green-700 transition"
  >
    + Add New Group
  </button>
</div>

      {/* Analytics */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-6">
            <h2 className="text-xl font-semibold mb-6">
              Group Distribution by Level
            </h2>

            <div className="flex flex-col items-center">
  <LevelDonut data={stats.levelDistribution} />

  <div className="w-full mt-6 space-y-3">
    {stats.levelDistribution?.map((item: any) => (
      <div
        key={item.level}
        className="flex items-center justify-between border-b pb-2"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <div>{item.level}</div>
        </div>
        <div className="font-semibold">{item.count}</div>
      </div>
    ))}
  </div>
</div>

            <div className="mt-6 text-gray-500 text-sm">
              Total Groups: {stats.totalGroups}
            </div>
          </div>

          <div className="col-span-6">
            <h2 className="text-xl font-semibold mb-6">
              Worst Payment Groups (Top 3)
            </h2>

            <div className="space-y-6">
              {stats.worstPaymentGroups?.map(
                (group: any, index: number) => (
                  <div
                    key={group.id}
                    className="flex items-start justify-between"
                  >
                    <div>
                      <div className="text-lg font-bold">
                        {index + 1}. {group.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {group.teacherName}{" "}
                        {group.startTime}–{group.endTime}
                      </div>
                    </div>

                    <div className="text-xl font-semibold text-red-600">
                      {group.completionRate}%
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
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

<button
  onClick={() => {
    setSelectedGroup(group);
    setShowStudents(true);
  }}
  className="text-blue-600 mt-2 ml-4"
>
  See Students
</button>

          </div>
        ))}
      </div>

{showStudents && selectedGroup && (
  <Modal onClose={() => setShowStudents(false)}>
    <h2 className="text-xl font-bold mb-6">
      Students in {selectedGroup.name}
    </h2>

    {selectedGroup.students?.length === 0 && (
      <div className="text-gray-400">No students assigned.</div>
    )}

    <div className="space-y-4">
      {selectedGroup.students.map((student: any) => {
        const paid =
          student.payments?.[0]?.paid ?? false;

        return (
          <div
            key={student.id}
            className="flex items-center justify-between border p-3 rounded"
          >
            <div>
              <div className="font-semibold">
                {student.name || "No Name"}
              </div>
              <div className="text-sm text-gray-500">
                {student.email}
              </div>
            </div>

            <input
              type="checkbox"
              checked={paid}
              onChange={async (e) => {
                await fetch("/api/payments", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    studentId: student.id,
                    groupId: selectedGroup.id,
                    paid: e.target.checked,
                  }),
                });

                fetchGroups(); // refresh
              }}
              className="w-5 h-5"
            />
          </div>
        );
      })}
    </div>
  </Modal>
)}

{/* CREATE GROUP MODAL */}
{showCreateModal && (
  <Modal onClose={() => setShowCreateModal(false)}>
    <h2 className="text-xl font-bold mb-6">
      Create New Group
    </h2>

    <div className="space-y-4">

      <input
        placeholder="Group Name"
        className="border p-2 w-full"
        onChange={(e) =>
          setForm({ ...form, name: e.target.value })
        }
      />

      <select
        className="border p-2 w-full"
        value={form.level}
        onChange={(e) =>
          setForm({ ...form, level: e.target.value })
        }
      >
        <option value="Beginner">Beginner</option>
        <option value="Elementary">Elementary</option>
        <option value="Pre-Intermediate">Pre-Intermediate</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Upper-Intermediate">Upper-Intermediate</option>
        <option value="Advanced">Advanced</option>
        <option value="IELTS">IELTS</option>
      </select>

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
        <div className="flex flex-wrap gap-2">
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
        onClick={async () => {
          await createGroup();
          setShowCreateModal(false);
        }}
        className="bg-green-600 text-white px-6 py-2 rounded w-full"
      >
        Create Group
      </button>
    </div>
  </Modal>
)}

    </div>
  );
}

function Modal({ children, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl w-[500px] relative max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 text-xl"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}