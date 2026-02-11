import { prisma } from "@/lib/prisma";
import AnimatedCounter from "@/app/components/AnimatedCounter";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const fullName = session?.user?.name || "Admin";
 
  const teachers = await prisma.user.count({
    where: { role: "teacher" },
  });

  const students = await prisma.user.count({
    where: { role: "student" },
  });

  const admins = await prisma.user.count({
    where: { role: "admin" },
  });

  const groups = await prisma.group.count();

  const totalUsers = await prisma.user.count();

  return (
    <div className="space-y-12">

      <div>
  <h1 className="text-3xl font-bold text-gray-900">
    Dashboard
  </h1>

  <p className="text-gray-500 mt-2">
    Welcome back, {fullName}
  </p>
</div>

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-5 grid-rows-5 gap-6">

        {/* TOTAL USERS */}
        <StatCard
          className="col-span-2 row-span-3"
          title="Total Users"
          value={totalUsers}
        />

        {/* ADMINS */}
        <StatCard
          className="row-span-2 col-start-3"
          title="Admins"
          value={admins}
        />

        {/* TEACHERS */}
        <StatCard
          className="row-span-2 col-start-4"
          title="Teachers"
          value={teachers}
        />

        {/* STUDENTS */}
        <StatCard
          className="row-span-2 col-start-5"
          title="Students"
          value={students}
        />

        {/* GROUPS */}
        <StatCard
          className="col-span-2 row-span-2 row-start-4"
          title="Groups"
          value={groups}
        />

      </div>

    </div>
  );
}

function StatCard({
  title,
  value,
  className,
}: {
  title: string;
  value: number;
  className?: string;
}) {
  return (
    <div
      className={`bg-white border border-green-100 rounded-2xl shadow-sm p-8 flex flex-col justify-between hover:shadow-md transition ${className}`}
    >
      <h2 className="text-gray-600 font-medium text-sm uppercase tracking-wide">
        {title}
      </h2>

      <div className="text-5xl font-bold text-green-600">
        <AnimatedCounter value={value} />
      </div>
    </div>
  );
}