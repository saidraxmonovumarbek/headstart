"use client";

const LEVEL_COLORS: Record<string, string> = {
  Beginner: "#10b981",
  Elementary: "#34d399",
  "Pre-Intermediate": "#6ee7b7",
  Intermediate: "#a7f3d0",
  "Upper-Intermediate": "#3b82f6",
  Advanced: "#6366f1",
  IELTS: "#8b5cf6",
  Kids: "#f59e0b",
  CEFR: "#ef4444",
};

export default function GroupCard({
  group,
  onDelete,
  onSeeStudents,
  onEdit,
}: any) {
  const color = LEVEL_COLORS[group.level] || "#9CA3AF";

  const totalStudents = group.students?.length || 0;
  const paidStudents =
    group.students?.filter((s: any) => s.payments?.[0]?.paid)?.length || 0;

  const completion =
    totalStudents === 0
      ? 0
      : Math.round((paidStudents / totalStudents) * 100);

  return (
    <div className="relative bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden">

      {/* LEVEL COLOR ACCENT */}
      <div
        className="absolute left-0 top-0 h-full w-1.5"
        style={{ backgroundColor: color }}
      />

      <div className="p-5 pl-6 space-y-4">

        {/* HEADER */}
        <div>
          <div className="text-lg font-bold">{group.name}</div>
          <div className="text-sm text-gray-500">{group.level}</div>
        </div>

        {/* TEACHERS + SPLIT */}
        <div className="text-sm text-gray-600 space-y-1">
          {group.revenueSplits?.map((r: any) => {
            if (!r.user) {
              return (
                <div key={r.id} className="flex items-center gap-2">
                  <span>HeadStart</span>
                  <span className="text-green-600 font-semibold">
                    {r.percentage}%
                  </span>
                </div>
              );
            }

            return (
              <div key={r.id} className="flex items-center gap-2">
                <span>{r.user.name || r.user.email}</span>
                <span className="text-indigo-600 font-semibold">
                  {r.percentage}%
                </span>
              </div>
            );
          })}
        </div>

        {/* SCHEDULE */}
        <div className="text-sm text-gray-600">
          {group.dayType} • {group.startTime}–{group.endTime}
        </div>

        {/* STUDENTS + PAYMENT */}
        <div className="flex items-center justify-between text-sm">

          <div className="text-gray-600">
            Students:{" "}
            <span className="font-semibold">{totalStudents}</span>
          </div>

          <div className="text-gray-600">
            Payment:{" "}
            <span className="font-semibold">
              {completion}% ({paidStudents}/{totalStudents})
            </span>
          </div>
        </div>

        {/* PAYMENT PROGRESS BAR */}
<div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
  <div
    className={`h-full transition-all duration-500 ${
      completion < 40
        ? "bg-red-500"
        : completion < 70
        ? "bg-yellow-500"
        : "bg-green-500"
    }`}
    style={{ width: `${completion}%` }}
  />
</div>

        {/* BOOK PLACEHOLDER */}
        <div className="text-xs text-gray-400">
          Book: Coming soon
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onSeeStudents(group)}
            className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm"
          >
            Students
          </button>

          <button
            onClick={() => onEdit(group)}
            className="px-3 py-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 text-sm"
          >
            Edit
          </button>

          <button
            onClick={() => onDelete(group.id)}
            className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm"
          >
            Delete
          </button>
        </div>

      </div>
    </div>
  );
}