"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import LevelDonut from "./LevelDonut";

export default function GroupsClient({ stats }: any) {
  const [groups, setGroups] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [showStudents, setShowStudents] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  const [showRevenueModal, setShowRevenueModal] = useState(false);
const [split, setSplit] = useState({
  headstart: "",
  teacher1: "",
  teacher2: "",
  teacher3: "",
});

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
  teacher3Id: "",
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

  async function createGroupWithSplit() {
  await fetch("/api/groups", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...form,
      name: form.name
        ? `${form.level} ${form.name}`
        : form.level,
      customDays:
        form.dayType === "CUSTOM"
          ? form.customDays
          : null,
      revenueSplits: [
        {
  userId: null,
  percentage: Number(split.headstart || 0),
},
{
  userId: form.teacher1Id,
  percentage: Number(split.teacher1 || 0),
},
...(form.teacher2Id
  ? [
      {
        userId: form.teacher2Id,
        percentage: Number(split.teacher2 || 0),
      },
    ]
  : []),
...(form.teacher3Id
  ? [
      {
        userId: form.teacher3Id,
        percentage: Number(split.teacher3 || 0),
      },
    ]
  : []),
      ],
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
    teacher3Id: "",
  });

  setShowRevenueModal(false);
  setShowCreateModal(false);

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
  <LevelDonut 
  data={stats.levelDistribution} 
  total={stats.totalGroups}
/>

  <div className="w-full mt-6 flex gap-10">
  {/* LEFT COLUMN */}
  <div className="flex flex-col gap-3 flex-1">
    {stats.levelDistribution
      ?.slice(0, Math.ceil(stats.levelDistribution.length / 2))
      .map((item: any) => (
        <LegendItem key={item.level} item={item} />
      ))}
  </div>

  {/* RIGHT COLUMN */}
  <div className="flex flex-col gap-3 flex-1">
    {stats.levelDistribution
      ?.slice(Math.ceil(stats.levelDistribution.length / 2))
      .map((item: any) => (
        <LegendItem key={item.level} item={item} />
      ))}
  </div>
</div>
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
        placeholder="Optional specific name (e.g., DBO, Exclusive, Fast Track)"
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
        <option value="Kids">Kids</option>
        <option value="Beginner">Beginner</option>
        <option value="Elementary">Elementary</option>
        <option value="Pre-Intermediate">Pre-Intermediate</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Upper-Intermediate">Upper-Intermediate</option>
        <option value="Advanced">Advanced</option>
        <option value="CEFR">CEFR</option>
        <option value="IELTS">IELTS</option>
      </select>

      <div className="relative">
  <input
    placeholder="Monthly Price"
    type="number"
    className="border p-2 w-full pr-12"
    onChange={(e) =>
      setForm({ ...form, monthlyPrice: e.target.value })
    }
  />

  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
    UZS
  </span>
</div>

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
  {t.name || t.email}
</option>
        ))}
      </select>

      <select
  className="border p-2 w-full"
  onChange={(e) =>
    setForm({ ...form, teacher3Id: e.target.value })
  }
>
  <option value="">Select Teacher 3 (Optional)</option>
  {teachers.map((t) => (
    <option key={t.id} value={t.id}>
  {t.name || t.email}
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
  {t.name || t.email}
</option>
        ))}
      </select>

      <button
  onClick={() => {
    if (!form.level) {
      alert("Please select group level.");
      return;
    }

    if (!form.teacher1Id) {
      alert("Teacher 1 is required.");
      return;
    }

    if (!form.monthlyPrice) {
      alert("Monthly price is required.");
      return;
    }

    setShowRevenueModal(true);
  }}
        className="bg-green-600 text-white px-6 py-2 rounded w-full"
      >
        Create Group
      </button>
    </div>
  </Modal>
)}

{showRevenueModal && (
  <Modal onClose={() => setShowRevenueModal(false)}>
    <h2 className="text-xl font-bold mb-2">
      Revenue Split
    </h2>

    <p className="text-sm text-gray-500 mb-6">
      Total Monthly Price:{" "}
      <span className="font-semibold">
        {Number(form.monthlyPrice).toLocaleString()} UZS
      </span>
    </p>

    <div className="space-y-4">

      {/* HEADSTART */}
      <SplitRow
        label="HeadStart"
        percent={split.headstart}
        onChange={(val: string) =>
  setSplit({ ...split, headstart: val })
}
        total={Number(form.monthlyPrice)}
      />

      {/* TEACHER 1 */}
      <SplitRow
        label={
          teachers.find(t => t.id === form.teacher1Id)?.name ||
          "Teacher 1"
        }
        percent={split.teacher1}
        onChange={(val: string) =>
  setSplit({ ...split, teacher1: val })
}
        total={Number(form.monthlyPrice)}
      />

      {/* TEACHER 2 */}
      {form.teacher2Id && (
        <SplitRow
          label={
            teachers.find(t => t.id === form.teacher2Id)?.name ||
            "Teacher 2"
          }
          percent={split.teacher2}
          onChange={(val: string) =>
  setSplit({ ...split, teacher2: val })
}
          total={Number(form.monthlyPrice)}
        />
      )}

      {/* TEACHER 3 */}
      {form.teacher3Id && (
        <SplitRow
          label={
            teachers.find(t => t.id === form.teacher3Id)?.name ||
            "Teacher 3"
          }
          percent={split.teacher3}
          onChange={(val: string) =>
  setSplit({ ...split, teacher3: val })
}
          total={Number(form.monthlyPrice)}
        />
      )}

      <button
        className="bg-green-600 text-white px-6 py-2 rounded w-full mt-4"
        onClick={async () => {
          const totalPercent =
  Number(split.headstart || 0) +
  Number(split.teacher1 || 0) +
  (form.teacher2Id ? Number(split.teacher2 || 0) : 0) +
  (form.teacher3Id ? Number(split.teacher3 || 0) : 0);

          if (totalPercent !== 100) {
            alert("Total percentage must equal 100%");
            return;
          }

          await createGroupWithSplit();
        }}
      >
        Confirm & Create Group
      </button>
    </div>
  </Modal>
)}

    </div>
  );
}

function Modal({ children, onClose }: any) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white p-6 rounded-2xl w-[500px] relative max-h-[80vh] overflow-y-auto shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 text-xl"
        >
          ✕
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}

function LegendItem({ item }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        <span className="text-sm text-gray-700">
          {item.level}
        </span>
      </div>
      <span className="text-sm font-semibold text-gray-900">
        {item.count}
      </span>
    </div>
  );
}

function SplitRow({
  label,
  percent,
  onChange,
  total,
}: {
  label: string;
  percent: string;
  onChange: (v: string) => void;
  total: number;
}) {
  const numericPercent = Number(percent) || 0;
  const amount = Math.floor((total * numericPercent) / 100);

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="w-1/3 font-medium">{label}</div>

      <input
        type="number"
        placeholder="Enter %"
        className="border p-2 w-1/3 rounded"
        value={percent}
        onChange={(e) => onChange(e.target.value)}
      />

      <div className="w-1/3 text-right text-gray-600">
        {amount.toLocaleString()} UZS
      </div>
    </div>
  );
}