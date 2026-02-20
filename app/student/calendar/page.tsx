import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import AdminCalendar from "@/app/admin/calendar/page";

export default async function StudentCalendar() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "student") {
    return <div className="p-10">Access denied.</div>;
  }

  const studentId = (session.user as any).id;

  // 🔥 Get student groups directly from DB (no client fetch)
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    include: {
      groups: true,
    },
  });

  const groups = student?.groups ?? [];

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-6 mt-20">
        <h1 className="text-3xl font-bold text-gray-900">
          Calendar unavailable
        </h1>

        <p className="text-gray-600 max-w-md">
          You need to be enrolled in a class to access your calendar.
          Ask your teacher to invite you using your Student ID.
        </p>

        <div className="bg-green-50 border rounded-xl px-6 py-4">
          <p className="text-sm text-gray-500">Your Student ID</p>
          <p className="text-lg font-semibold text-gray-900">
            {studentId}
          </p>
        </div>
      </div>
    );
  }

  // ✅ Student has groups → show full calendar instantly
  return <AdminCalendar />;
}