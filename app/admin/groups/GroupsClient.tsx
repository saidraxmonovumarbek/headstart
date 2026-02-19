"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import LevelDonut from "./LevelDonut";
import GroupCard from "./GroupCard";
import { Calendar, Target, Users, ChevronDown, Check } from "lucide-react";

export default function GroupsClient({ stats, sessionUserId }: any) {
  const [groups, setGroups] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [showStudents, setShowStudents] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  const [dayFilter, setDayFilter] = useState("ALL");
  const [levelFilter, setLevelFilter] = useState("ALL");
  
  const [teacherFilter, setTeacherFilter] = useState<string[]>([]);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [teacherDropdown, setTeacherDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [dayDropdown, setDayDropdown] = useState(false);
  const [levelDropdown, setLevelDropdown] = useState(false);

  const dayRef = useRef<HTMLDivElement | null>(null);
  const levelRef = useRef<HTMLDivElement | null>(null);

  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const [formError, setFormError] = useState("");
  const [splitError, setSplitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setGroups(Array.isArray(data) ? data : []);
  }

  async function fetchTeachers() {
    const res = await fetch("/api/users?role=teacher");
    const data = await res.json();
    setTeachers(Array.isArray(data) ? data : []);
  }

  async function saveGroupWithSplit() {
  const method = editingGroup ? "PUT" : "POST";
  const url = editingGroup
    ? `/api/groups/${editingGroup.id}`
    : "/api/groups";

  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
  ...form,
  monthlyPrice: Number(form.monthlyPrice),
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

  // Reset form after save
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

  setSplit({
    headstart: "",
    teacher1: "",
    teacher2: "",
    teacher3: "",
  });

  setEditingGroup(null);
  setShowRevenueModal(false);
  setShowCreateModal(false);

  fetchGroups();
}

  async function deleteGroup(id: string) {
  setDeleteTarget(groups.find(g => g.id === id) ?? null);
}

async function confirmDelete() {
  if (!deleteTarget) return;

  try {
  await fetch(`/api/groups/${deleteTarget.id}`, {
    method: "DELETE",
  });

  setDeleteTarget(null);
  fetchGroups();
} catch (e) {
  console.error("Delete failed", e);
}
}

  const filteredGroups = useMemo(() => {
  return groups.filter((g) => {
    // DAY FILTER
    if (dayFilter !== "ALL" && g.dayType !== dayFilter) {
      if (!(dayFilter === "CUSTOM" && g.dayType === "CUSTOM")) return false;
    }

    // LEVEL FILTER
if (levelFilter === "MY") {
  const isMine =
    g.teacher1Id === sessionUserId ||
    g.teacher2Id === sessionUserId ||
    g.teacher3Id === sessionUserId;
  if (!isMine) return false;
} else if (levelFilter !== "ALL" && g.level !== levelFilter) {
  return false;
}

    // TEACHER FILTER (multi-select by id)
if (teacherFilter.length > 0) {
  const ids = [g.teacher1Id, g.teacher2Id, g.teacher3Id].filter(Boolean);
  if (!ids.some((id) => teacherFilter.includes(id))) return false;
}

    return true;
  });
}, [groups, dayFilter, levelFilter, teacherFilter, sessionUserId]);

const filteredTeachers = useMemo(() => {
  const query = teacherSearch.toLowerCase().trim();

  return teachers.filter((t: any) => {
    const full = `${t.name ?? ""} ${t.email ?? ""}`.toLowerCase();
return full.includes(query);
  });
}, [teachers, teacherSearch]);

useEffect(() => {
  function handleClickOutside(e: MouseEvent) {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setTeacherDropdown(false);
      setTeacherSearch("");
    }

    if (dayRef.current && !dayRef.current.contains(e.target as Node)) {
      setDayDropdown(false);
    }

    if (levelRef.current && !levelRef.current.contains(e.target as Node)) {
      setLevelDropdown(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
  <h1 className="text-3xl font-bold">Groups</h1>

  <button
  onClick={() => {
  setFormError("");
  setEditingGroup(null);

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

  setSplit({
    headstart: "",
    teacher1: "",
    teacher2: "",
    teacher3: "",
  });

  setShowCreateModal(true);
}}
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

      <div className="flex flex-wrap gap-3">

  {/* DAY FILTER */}
<div ref={dayRef} className="relative w-[180px]">
  <button
  type="button"
  onClick={() => setDayDropdown(prev => !prev)}
  className="relative flex items-center w-full pl-10 pr-8 py-2 border rounded-lg bg-white text-sm shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
>
  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

  <span className="truncate">
    {dayFilter === "ALL" ? "All Days" : dayFilter}
  </span>

  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
</button>

  {dayDropdown && (
    <div className="absolute mt-2 w-full bg-white border rounded-xl shadow-lg z-50 p-2">
      {["ALL","ODD","EVEN","INTENSIVE","CUSTOM"].map(d => (
        <div
          key={d}
          onClick={() => {
            setDayFilter(d);
            setDayDropdown(false);
          }}
          className="px-3 py-2 rounded hover:bg-gray-100 cursor-pointer text-sm"
        >
          {d === "ALL" ? "All Days" : d}
        </div>
      ))}
    </div>
  )}
</div>

  {/* LEVEL FILTER */}
<div ref={levelRef} className="relative w-[200px]">
  <button
  type="button"
  onClick={() => setLevelDropdown(prev => !prev)}
  className="relative flex items-center w-full pl-10 pr-8 py-2 border rounded-lg bg-white text-sm shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
>
  <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

  <span className="truncate">
    {levelFilter === "ALL"
      ? "All Levels"
      : levelFilter === "MY"
      ? "My Groups"
      : levelFilter}
  </span>

  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
</button>

  {levelDropdown && (
    <div className="absolute mt-2 w-full bg-white border rounded-xl shadow-lg z-50 p-2">
      {/* ALL */}
      <div
        onClick={() => { setLevelFilter("ALL"); setLevelDropdown(false); }}
        className="px-3 py-2 rounded hover:bg-gray-100 cursor-pointer text-sm"
      >
        All Levels
      </div>

      {/* MY */}
      <div
        onClick={() => { setLevelFilter("MY"); setLevelDropdown(false); }}
        className="px-3 py-2 rounded hover:bg-gray-100 cursor-pointer text-sm"
      >
        My Groups
      </div>

      {/* LEVELS WITH COLORS */}
      {stats.levelDistribution.map((l:any) => (
        <div
          key={l.level}
          onClick={() => {
            setLevelFilter(l.level);
            setLevelDropdown(false);
          }}
          className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 cursor-pointer text-sm"
        >
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: l.color }}
          />
          {l.level}
        </div>
      ))}
    </div>
  )}
</div>

  {/* TEACHER FILTER */}
  <div ref={dropdownRef} className="relative w-[240px]">
  <button
  type="button"
  onClick={() => {
    setTeacherDropdown(prev => {
      if (prev) setTeacherSearch("");
      return !prev;
    });
  }}
  className="relative flex items-center w-full pl-10 pr-8 py-2 border rounded-lg bg-white text-sm shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
>
  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

  <span className="truncate">
    {teacherFilter.length === 0
      ? "All Teachers"
      : `${teacherFilter.length} teacher${teacherFilter.length > 1 ? "s" : ""}`}
  </span>

  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
</button>

  {teacherDropdown && (
    <div
  onMouseDown={(e) => e.stopPropagation()}
  onClick={(e) => e.stopPropagation()}
  className="absolute mt-2 w-full bg-white border rounded-xl shadow-lg z-50 p-2"
>
      <input
        placeholder="Search teacher..."
        value={teacherSearch}
        onChange={(e) => setTeacherSearch(e.target.value)}
        className="w-full border rounded-lg p-2 mb-2 text-sm"
      />

      <div className="max-h-48 overflow-y-auto">
        {filteredTeachers.map((t: any) => {
          const selected = teacherFilter.includes(t.id);

          return (
            <div
              key={t.id}
              onClick={() => {
  setTeacherFilter(prev =>
  selected ? prev.filter(id => id !== t.id) : [...prev, t.id]
);
  setTeacherSearch("");
}}
              className="flex items-center justify-between px-2 py-1 rounded hover:bg-gray-100 cursor-pointer text-sm"
            >
              <span>{t.name || t.email}</span>
              {selected && <Check className="w-4 h-4 text-green-600" />}
            </div>
          );
        })}
      </div>
    </div>
  )}
</div>

</div>

      <div className="space-y-4">
  {filteredGroups.map((group) => (
    <GroupCard
      key={group.id}
      group={group}
      onDelete={deleteGroup}
      onEdit={(g:any)=>{
        setEditingGroup(g);

        setForm({
          name: g.name.replace(`${g.level} `, ""),
          level: g.level,
          monthlyPrice: String(g.monthlyPrice ?? ""),
          dayType: g.dayType,
          customDays: Array.isArray(g.customDays)
  ? g.customDays
  : g.customDays
  ? JSON.parse(g.customDays)
  : [],
          startTime: g.startTime,
          endTime: g.endTime,
          teacher1Id: g.teacher1Id,
          teacher2Id: g.teacher2Id || "",
          teacher3Id: g.teacher3Id || "",
        });

        const splits:any = { headstart:"", teacher1:"", teacher2:"", teacher3:"" };

        g.revenueSplits?.forEach((r:any)=>{
          if(!r.userId) splits.headstart = r.percentage;
          else if(r.userId === g.teacher1Id) splits.teacher1 = r.percentage;
          else if(r.userId === g.teacher2Id) splits.teacher2 = r.percentage;
          else if(r.userId === g.teacher3Id) splits.teacher3 = r.percentage;
        });

        setSplit(splits);
        setShowCreateModal(true);
      }}
      onSeeStudents={(g:any)=>{
        setSelectedGroup(g);
        setShowStudents(true);
      }}
    />
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

    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
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
  <Modal
  onClose={() => {
    setShowCreateModal(false);
    setEditingGroup(null);
  }}
>
    <h2 className="text-xl font-bold mb-6">
  {editingGroup ? "Edit Group" : "Create New Group"}
</h2>

    <div className={`space-y-4 ${formError ? "animate-shake" : ""}`}>

      <input
  value={form.name}
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
  value={form.monthlyPrice}
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
  value={form.dayType}
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
  value={form.startTime}
  className="border p-2 w-full"
  onChange={(e) =>
    setForm({ ...form, startTime: e.target.value })
  }
/>

        <input
  type="time"
  value={form.endTime}
  className="border p-2 w-full"
  onChange={(e) =>
    setForm({ ...form, endTime: e.target.value })
  }
/>
      </div>

      <select
  className="border p-2 w-full"
  value={form.teacher1Id}
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
  value={form.teacher3Id}
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
  value={form.teacher2Id}
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
  setFormError("");

  setTimeout(() => {
    if (!form.level) {
      setFormError("Please select group level.");
      return;
    }

    if (!form.teacher1Id) {
      setFormError("Please select at least one teacher.");
      return;
    }

    if (!form.monthlyPrice) {
      setFormError("Monthly price is required.");
      return;
    }

    setSplitError("");
    setShowRevenueModal(true);
  }, 10);
}}
        className="bg-green-600 text-white px-6 py-2 rounded w-full"
      >
        {editingGroup ? "Update Group" : "Create Group"}
      </button>

      {formError && (
  <p className="text-red-500 text-sm text-center mt-2">
    {formError}
  </p>
)}

    </div>
  </Modal>
)}

{deleteTarget && (
  <Modal onClose={() => setDeleteTarget(null)}>
    <h2 className="text-xl font-bold mb-4 text-center">
      Delete Group
    </h2>

    <p className="text-gray-600 text-center mb-6">
      Are you sure you want to delete{" "}
      <span className="font-semibold">{deleteTarget.name}</span>?
      <br />
      This action cannot be undone.
    </p>

    <div className="flex gap-3">
      <button
        onClick={() => setDeleteTarget(null)}
        className="flex-1 py-2 rounded-lg border"
      >
        Cancel
      </button>

      <button
        onClick={confirmDelete}
        className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
      >
        Delete
      </button>
    </div>
  </Modal>
)}

{showRevenueModal && (
  <Modal
  onClose={() => {
    setShowRevenueModal(false);
  }}
>
    <h2 className="text-xl font-bold mb-2">
      Revenue Split
    </h2>

    <p className="text-sm text-gray-500 mb-6">
      Total Monthly Price:{" "}
      <span className="font-semibold">
        {Number(form.monthlyPrice).toLocaleString()} UZS
      </span>
    </p>

    <div className={`space-y-4 ${splitError ? "animate-shake" : ""}`}>

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

      <p className="text-xs text-gray-500 text-center">
  Please click the button only once. Processing may take a few seconds.
  Clicking multiple times can result in duplicate group creation.
</p>

      <button
  disabled={isSubmitting}
  className={`px-6 py-2 rounded w-full mt-4 text-white ${
    isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
  }`}
  onClick={async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
          const totalPercent =
  Number(split.headstart || 0) +
  Number(split.teacher1 || 0) +
  (form.teacher2Id ? Number(split.teacher2 || 0) : 0) +
  (form.teacher3Id ? Number(split.teacher3 || 0) : 0);

          if (totalPercent !== 100) {
  setSplitError("");

  setTimeout(() => {
    if (totalPercent > 100) {
      setSplitError("Total percentage cannot exceed 100%.");
    } else {
      setSplitError("Total percentage must equal 100%.");
    }
  }, 10);

  setIsSubmitting(false);

  return;
}

setSplitError("");

          await saveGroupWithSplit();
          setIsSubmitting(false);
        }}
      >
        {editingGroup ? "Save Changes" : "Confirm & Create Group"}
      </button>

      {splitError && (
  <p className="text-red-500 text-sm text-center mt-2">
    {splitError}
  </p>
)}

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