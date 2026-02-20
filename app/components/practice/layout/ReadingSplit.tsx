"use client";

export default function ReadingSplit({
  passage,
  questions,
  children,
}: any) {
  return (
    <div className="grid grid-cols-2 gap-4 h-full">

      {/* PASSAGE */}
      <div className="overflow-y-auto border rounded p-6">
        {passage}
      </div>

      {/* QUESTIONS */}
      <div className="overflow-y-auto border rounded p-6">
        {children}
      </div>

    </div>
  );
}