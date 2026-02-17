"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function FinancePage() {
  const { data: session } = useSession();

  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    const res = await fetch("/api/finance");
    const data = await res.json();
    setStats(data);
  }

  if (!session?.user?.isSuperAdmin) {
    return <div className="p-10">Access denied.</div>;
  }

  if (!stats) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="p-10 space-y-8">
      <h1 className="text-3xl font-bold">Finance Dashboard</h1>

      <div className="bg-white p-8 rounded-2xl shadow border space-y-4">

        <div className="text-lg">
          Total Collected:
          <span className="font-bold ml-2">
            {stats.totalCollected.toLocaleString()} UZS
          </span>
        </div>

        <div className="text-lg text-green-600">
          HeadStart Revenue:
          <span className="font-bold ml-2">
            {stats.totalHeadstart.toLocaleString()} UZS
          </span>
        </div>

        <div className="text-lg text-blue-600">
          Teacher Revenue:
          <span className="font-bold ml-2">
            {stats.totalTeacher.toLocaleString()} UZS
          </span>
        </div>

      </div>
    </div>
  );
}