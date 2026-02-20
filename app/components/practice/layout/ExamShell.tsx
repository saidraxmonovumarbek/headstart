"use client";

export default function ExamShell({
  timer,
  onSubmit,
  children,
}: any) {
  return (
    <div className="flex flex-col h-full">

      {/* TOP BAR */}
      <div className="flex justify-between items-center border-b p-4">
        <div className="font-bold">IELTS Practice</div>

        <div className="font-semibold">{timer}</div>

        <button
          onClick={onSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}