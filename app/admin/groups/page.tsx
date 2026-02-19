export const dynamic = "force-dynamic";

import { getGroupsStats } from "@/lib/groups/stats";
import GroupsClient from "./GroupsClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function GroupsPage() {
  const stats = await getGroupsStats();
  const session = await getServerSession(authOptions);

  return (
    <GroupsClient
      stats={stats}
      sessionUserId={(session?.user as any)?.id}
    />
  );
}