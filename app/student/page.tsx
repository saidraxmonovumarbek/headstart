import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);
  const fullName = session?.user?.name || "Student";

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
    </div>
  );
}