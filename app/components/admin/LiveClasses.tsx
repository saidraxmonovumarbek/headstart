"use client";

interface LiveClassesProps {
  groups: any[];
}

export default function LiveClasses({
  groups,
}: LiveClassesProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">
        Live Classes
      </h3>

      {groups.length === 0 ? (
        <p className="text-gray-500">No live classes now</p>
      ) : (
        groups.map((g) => (
          <div key={g.id} className="mb-2">
            {g.name}
          </div>
        ))
      )}
    </div>
  );
}