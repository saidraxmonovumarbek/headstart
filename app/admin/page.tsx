import { getDashboardStats } from "@/lib/dashboard/stats";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import TopStats from "@/app/components/admin/TopStats";
import StudentBarChart from "@/app/components/admin/StudentBarChart";
import StudentDonutChart from "@/app/components/admin/StudentDonutChart";
import LiveClasses from "@/app/components/admin/LiveClasses";
import PaymentStatus from "@/app/components/admin/PaymentStatus";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const fullName = session?.user?.name || "Admin";

  const stats = await getDashboardStats();

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {fullName}
        </h1>
        <p className="text-gray-500 mt-2">
          Here is your real-time system overview
        </p>
      </div>

      {/* TOP STATS */}
      <TopStats
        totalEmployees={stats.totalEmployees}
        employeeChange={stats.employeeChange}
        teacherAbsentRate={stats.teacherAbsentRate}
        studentAbsentRate={stats.studentAbsentRate}
      />

      {/* MIDDLE SECTION */}
      <div className="grid grid-cols-12 gap-6">

        {/* LEFT — BAR CHART */}
<div className="col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
  <StudentBarChart
    totalStudents={stats.totalStudents}
    monthlyData={stats.monthlyData}
  />
</div>

        {/* RIGHT — DONUT CHART */}
        <div className="col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <StudentDonutChart
            data={stats.levelDistribution}
            totalStudents={stats.totalStudents}
          />
        </div>

      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-12 gap-6">

        {/* LIVE CLASSES */}
        <div className="col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <LiveClasses groups={stats.liveGroups} />
        </div>

        {/* PAYMENT STATUS */}
        <div className="col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <PaymentStatus completionRate={stats.paymentCompletionRate} />
        </div>

      </div>

    </div>
  );
}