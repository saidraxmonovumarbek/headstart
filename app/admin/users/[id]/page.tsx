import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ Next.js 16 requires this
  const { id } = await params;
  const userId = id;

  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { groups: true },
  });

  if (!user) {
    notFound();
  }

  const groups = await prisma.group.findMany();

  // =========================
  // SERVER ACTIONS
  // =========================

  async function makeAdmin() {
    "use server";

    await prisma.user.update({
      where: { id: userId },
      data: { role: "admin" },
    });

    redirect("/admin/users");
  }

  async function makeTeacher() {
    "use server";

    await prisma.user.update({
      where: { id: userId },
      data: { role: "teacher" },
    });

    redirect("/admin/users");
  }

  async function makeStudent() {
    "use server";

    await prisma.user.update({
      where: { id: userId },
      data: { role: "student" },
    });

    redirect("/admin/users");
  }

  async function deleteUser() {
    "use server";

    const target = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!target) return;

    if (target.isSuperAdmin) {
      throw new Error("Cannot delete super admin");
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    redirect("/admin/users");
  }

  async function assignGroup(formData: FormData) {
    "use server";

    const groupId = formData.get("groupId") as string;

    await prisma.group.update({
      where: { id: groupId },
      data: {
        students: {
          connect: { id: userId },
        },
      },
    });

    redirect(`/admin/users/${userId}`);
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">Manage User</h1>

      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Super Admin:</strong> {user.isSuperAdmin ? "Yes" : "No"}</p>
      </div>

      {!user.isSuperAdmin && (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h2 className="text-xl font-semibold">Change Role</h2>

          <div className="flex gap-4 flex-wrap">
            <form action={makeAdmin}>
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition">
                Make Admin
              </button>
            </form>

            <form action={makeTeacher}>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition">
                Make Teacher
              </button>
            </form>

            <form action={makeStudent}>
              <button className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition">
                Make Student
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
        <h2 className="text-xl font-semibold">Assign to Group</h2>

        <form action={assignGroup} className="flex gap-4">
          <select name="groupId" className="border rounded-xl px-4 py-2">
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition">
            Assign
          </button>
        </form>
      </div>

      {!user.isSuperAdmin && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-red-600">
            Danger Zone
          </h2>

          <form action={deleteUser}>
            <button className="mt-4 bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition">
              Delete User
            </button>
          </form>
        </div>
      )}
    </div>
  );
}