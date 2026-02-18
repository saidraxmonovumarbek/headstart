export const dynamic = "force-dynamic";

import { getGroupsStats } from "@/lib/groups/stats";
import GroupsClient from "./GroupsClient";

export default async function GroupsPage() {
  const stats = await getGroupsStats();

  return <GroupsClient stats={stats} />;
}