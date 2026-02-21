"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Receipt,
  MoreVertical,
  Plus,
  Pencil,
  Trash2
} from "lucide-react";

export default function FinancePage() {
  const { data: session } = useSession();

  const [stats, setStats] = useState<any>(null);
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    const res = await fetch("/api/finance");
    const data = await res.json();
    setStats(data);
  }

  async function addExpense() {
    if (!expenseTitle || !expenseAmount) return;

    await fetch("/api/expenses", {
      method: "POST",
      body: JSON.stringify({
        title: expenseTitle,
        amount: Number(expenseAmount),
      }),
    });

    setExpenseTitle("");
    setExpenseAmount("");
    fetchStats();
  }

  if (!session?.user?.isSuperAdmin) {
    return <div className="p-10">Access denied.</div>;
  }

  if (!stats) {
    return <div className="p-10">Loading...</div>;
  }

  const chartData = [
    {
      name: "Month",
      collected: stats.totalCollected,
      teacher: stats.totalTeacher,
      expenses: stats.totalExpenses,
      profit: stats.netProfit,
    },
  ];

  return (
    <div className="p-10 space-y-10">

      <h1 className="text-3xl font-bold">Finance Dashboard</h1>

      {/* ===================== TOP PANEL ===================== */}
      <div className="grid grid-cols-5 gap-6">

        {/* CHART */}
        <div className="col-span-4 bg-white p-8 rounded-2xl shadow border">

          <div className="flex justify-between mb-6">
            <div>
              <div className="text-sm text-gray-500">Headstart Profit</div>
              <div className="text-4xl font-bold text-green-600">
                {stats.netProfit.toLocaleString()} UZS
              </div>
            </div>

            {/* LEGEND */}
            <div className="flex gap-4 text-sm">
              <Legend color="#10b981" label="Collected" />
              <Legend color="#3b82f6" label="Teacher payout" />
              <Legend color="#ef4444" label="Expenses" />
              <Legend color="#a855f7" label="Profit" />
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />

              <Bar dataKey="collected" fill="#10b981" radius={[6,6,0,0]} />
              <Bar dataKey="teacher" fill="#3b82f6" radius={[6,6,0,0]} />
              <Bar dataKey="expenses" fill="#ef4444" radius={[6,6,0,0]} />
              <Bar dataKey="profit" fill="#a855f7" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* STAT CARDS */}
        <div className="space-y-4">
          <Stat title="Total Collected" value={stats.totalCollected} color="green" icon={DollarSign} />
<Stat title="Teacher payout" value={stats.totalTeacher} color="blue" icon={CreditCard} />
<Stat title="Expenses" value={stats.totalExpenses} color="red" icon={Receipt} />
<Stat title="Net Profit" value={stats.netProfit} color="purple" icon={TrendingUp} />
        </div>
      </div>

      {/* ===================== BOTTOM PANEL ===================== */}
      <div className="grid grid-cols-2 gap-6">

        {/* TRANSACTIONS */}
        <div className="bg-white p-8 rounded-2xl shadow border">
          <h2 className="text-xl font-semibold mb-6">Transactions</h2>

          <div className="space-y-4">
            {stats.transactions.map((t: any) => (
              <div
                key={t.id}
                className="flex justify-between items-center p-4 border rounded-xl hover:bg-gray-50"
              >
                <div>
                  <div className="font-semibold">{t.studentName}</div>
                  <div className="text-sm text-gray-500">
                    {t.groupName} • {t.teacherName}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold">
                    {t.amountPaid?.toLocaleString()} UZS
                  </div>
                  <div className="text-xs text-gray-500">
                    H: {t.headstartRevenue} • T: {t.teacherRevenue}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EXPENSE FORM */}
        <div className="bg-white p-8 rounded-2xl shadow border">
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-xl font-semibold flex items-center gap-2">
      <Receipt size={18} /> Expenses
    </h2>

    <button
      onClick={() => {
        setEditingExpense(null);
        setShowExpenseModal(true);
      }}
      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
    >
      <Plus size={16} /> Add
    </button>
  </div>

  <div className="space-y-3">
    {stats.expenses?.map((e: any) => (
      <div
        key={e.id}
        className="flex justify-between items-center p-4 border rounded-xl relative"
      >
        <div>
          <div className="font-medium">{e.title}</div>
          <div className="text-sm text-gray-500">
            {e.amount.toLocaleString()} UZS
          </div>
        </div>

        {/* 3 dots */}
        <button onClick={() => setOpenMenu(openMenu === e.id ? null : e.id)}>
          <MoreVertical size={18} />
        </button>

        {openMenu === e.id && (
          <div className="absolute right-4 top-12 bg-white shadow rounded-lg border z-20">
            <button
              onClick={() => {
  setOpenMenu(null);
  setEditingExpense(e);
  setExpenseTitle(e.title);
  setExpenseAmount(String(e.amount));
  setShowExpenseModal(true);
}}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 w-full"
            >
              <Pencil size={14} /> Edit
            </button>

            <button
              onClick={async () => {
                if (confirm("Delete expense?")) {
                  await fetch(`/api/expenses/${e.id}`, { method: "DELETE" });
setOpenMenu(null);
fetchStats();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-50 w-full"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>
    ))}
  </div>
</div>
            </div>

      {/* ⭐ EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[380px] space-y-4 shadow-xl">

            <h3 className="text-lg font-semibold">
              {editingExpense ? "Edit Expense" : "Add Expense"}
            </h3>

            <input
              placeholder="Expense title"
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
            />

            <input
              placeholder="Amount"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowExpenseModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  if (editingExpense) {
                    await fetch(`/api/expenses/${editingExpense.id}`, {
                      method: "PATCH",
                      body: JSON.stringify({
                        title: expenseTitle,
                        amount: Number(expenseAmount),
                      }),
                    });
                  } else {
                    await addExpense();
                  }

                  setShowExpenseModal(false);
                  setExpenseTitle("");
                  setExpenseAmount("");
                  fetchStats();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* ===================== SMALL COMPONENTS ===================== */

function Legend({ color, label }: any) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full" style={{ background: color }} />
      {label}
    </div>
  );
}

function Stat({ title, value, color, icon: Icon }: any) {
  const colors: any = {
    green: "text-green-600",
    blue: "text-blue-600",
    red: "text-red-600",
    purple: "text-purple-600",
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow border">
      <div className="text-sm text-gray-500 flex items-center gap-2">
  {Icon && <Icon size={14} />}
  {title}
</div>
      <div className={`text-xl font-bold mt-1 ${colors[color]}`}>
        {value.toLocaleString()} UZS
      </div>
    </div>
  );
}