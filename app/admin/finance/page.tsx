"use client";

import { useSession } from "next-auth/react";

export default function FinancePage() {
  const { data: session } = useSession();

  if (!session?.user?.isSuperAdmin) {
    return <div className="p-10">Access denied.</div>;
  }

  return (
    <div className="p-10">
      Finance Dashboard
    </div>
  );
}