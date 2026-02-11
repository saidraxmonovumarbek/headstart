import { prisma } from "@/lib/prisma";

export default async function LogsPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>

      <div className="bg-white rounded-xl shadow p-6">
        {logs.map((log) => (
          <div key={log.id} className="border-b py-3">
            <p className="font-medium">{log.action}</p>
            <p className="text-sm text-gray-500">
              {log.userEmail} • {log.createdAt.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}