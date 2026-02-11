import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function GroupsPage() {

  const groups = await prisma.group.findMany({
    include: {
      teacher: true,
      students: true,
    },
  });

  const teachers = await prisma.user.findMany({
    where: { role: "teacher" },
  });

  async function createGroup(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;

    await prisma.group.create({
      data: { name },
    });

    redirect("/admin/groups");
  }

  async function assignTeacher(formData: FormData) {
    "use server";

    const groupId = formData.get("groupId") as string;
    const teacherId = formData.get("teacherId") as string;

    await prisma.group.update({
      where: { id: groupId },
      data: {
        teacher: {
          connect: { id: teacherId },
        },
      },
    });

    redirect("/admin/groups");
  }

  return (
    <div className="space-y-10">

      <h1 className="text-3xl font-bold">
        Groups Management
      </h1>

      {/* Create Group */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">

        <h2 className="text-xl font-semibold mb-4">
          Create Group
        </h2>

        <form action={createGroup} className="flex gap-4">

          <input
            name="name"
            placeholder="Group name..."
            required
            className="border rounded-xl px-4 py-2"
          />

          <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl">
            Create
          </button>

        </form>

      </div>

      {/* Groups List */}
      <div className="space-y-6">

        {groups.map((group) => (
          <div
            key={group.id}
            className="bg-white p-6 rounded-xl shadow-sm border space-y-4"
          >

            <h3 className="text-xl font-semibold">
              {group.name}
            </h3>

            <p>
              <strong>Teacher:</strong>{" "}
              {group.teacher?.email || "Not assigned"}
            </p>

            <form action={assignTeacher} className="flex gap-4">

              <input type="hidden" name="groupId" value={group.id} />

              <select
                name="teacherId"
                className="border rounded-xl px-4 py-2"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.email}
                  </option>
                ))}
              </select>

              <button className="bg-blue-600 text-white px-6 py-2 rounded-xl">
                Assign Teacher
              </button>

            </form>

            <div>
              <strong>Students:</strong>
              <ul className="list-disc ml-6 mt-2">
                {group.students.map((s) => (
                  <li key={s.id}>{s.email}</li>
                ))}
              </ul>
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}