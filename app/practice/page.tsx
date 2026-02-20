import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function PracticePage() {
  const tests = await prisma.practiceTest.findMany({
    include: { sections: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Practice Tests</h1>

      <div className="grid gap-5">
        {tests.map((t) => (
          <Link
            key={t.id}
            href={`/practice/${t.id}`}
            className="border rounded-xl p-6 hover:shadow-sm transition bg-white"
          >
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h2 className="font-semibold text-lg">{t.title}</h2>

                <div className="text-sm text-gray-500 flex gap-4">
                  <span>Type: {t.type}</span>
                  <span>Difficulty: {t.difficulty}</span>
                  <span>Duration: {t.duration} min</span>
                  <span>Sections: {t.sections.length}</span>
                </div>
              </div>

              <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">
                Start
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}