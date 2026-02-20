import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function TeacherDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "teacher") {
    return <div>Access denied</div>;
  }

  const teacherId = (session.user as any).id;

  const groups = await prisma.group.findMany({
    where: {
      OR: [
        { teacher1Id: teacherId },
        { teacher2Id: teacherId },
      ],
    },
  });

  const today = new Date();

  const todayEvents = await prisma.event.findMany({
    where: {
      creatorId: teacherId,
      startTime: {
        gte: new Date(today.setHours(0, 0, 0, 0)),
      },
      endTime: {
        lte: new Date(today.setHours(23, 59, 59, 999)),
      },
    },
  });

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Welcome back, {session.user.name}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-lg font-semibold">My Groups</h2>
          <p className="text-3xl mt-2 font-bold">
            {groups.length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-lg font-semibold">Today Classes</h2>
          <p className="text-3xl mt-2 font-bold">
            {todayEvents.length}
          </p>
        </div>
      </div>
    </div>
  );
}