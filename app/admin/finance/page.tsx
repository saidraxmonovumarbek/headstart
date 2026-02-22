"use client";

import { useEffect, useState } from "react";
import { useRef } from "react";
import { useSession } from "next-auth/react";
import { Check } from "lucide-react";
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
  const [openExpenseMenu, setOpenExpenseMenu] = useState<string | null>(null);
  const [openEmployeeMenu, setOpenEmployeeMenu] = useState<string | null>(null);

  const [deleteExpense, setDeleteExpense] = useState<any>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [payrollSearch, setPayrollSearch] = useState("");

  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [employeePosition, setEmployeePosition] = useState("");
  const [employeeSalary, setEmployeeSalary] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [deleteEmployee, setDeleteEmployee] = useState<any>(null);
  
  useEffect(() => {
  async function init() {
  const res = await fetch("/api/finance");

  if (!res.ok) {
    setIsLoading(false);
    return;
  }

  const data = await res.json();
  setStats(data);

  requestAnimationFrame(() => {
    setIsLoading(false);
  });
}

  init();
}, []);

  useEffect(() => {
  function handleClickOutside(e: MouseEvent) {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setOpenEmployeeMenu(null);
setOpenExpenseMenu(null);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

  async function fetchStats() {
  try {
    const res = await fetch("/api/finance");

    if (!res.ok) {
      console.error("Finance fetch failed");
      return;
    }

    const data = await res.json();
    setStats(data);
  } catch (err) {
    console.error("Finance fetch crash:", err);
  }
}

async function refetchStats() {
  setIsLoading(true);
  await fetchStats();
  setIsLoading(false);
}

  async function addExpense() {
    if (!expenseTitle || !expenseAmount) return;

    await fetch("/api/expenses", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: expenseTitle,
    amount: Number(expenseAmount),
  }),
});

    setExpenseTitle("");
    setExpenseAmount("");
    await refetchStats();
  }

  async function togglePayroll(id: string, currentStatus: string) {
  const newStatus = currentStatus === "paid" ? "pending" : "paid";

  const paidAt = newStatus === "paid" ? new Date().toISOString() : null;

  // ⭐ optimistic UI update
  setStats((prev: any) => ({
    ...prev,
    payroll: prev.payroll.map((p: any) =>
      p.id === id ? { ...p, status: newStatus, paidAt } : p
    ),
  }));

  try {
    await fetch(`/api/payroll/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, paidAt }),
    });
  } catch {
    await refetchStats(); // fallback
  }
}

  if (!session?.user?.isSuperAdmin) {
    return <div className="p-10">Access denied.</div>;
  }

  if (isLoading) {
  return (
    <div className="flex flex-col xl:flex-row gap-8 h-full">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md px-6 text-center">
          <p className="text-emerald-600 text-lg font-semibold mb-6">
            Loading your finance dashboard...
          </p>

          <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 animate-loading-bar" />
          </div>
        </div>
      </div>
    </div>
  );
}

  const chartData = [
  {
    name: "Month",
    collected: stats?.totalCollected ?? 0,
    teacher: stats?.totalTeacher ?? 0,
    expenses: stats?.totalExpenses ?? 0,
    profit: stats?.netProfit ?? 0,
  },
];

const filteredPayroll = stats?.payroll?.filter((p: any) =>
  (p.name || "")
    .toLowerCase()
    .includes(payrollSearch.toLowerCase())
);

function formatPaidTime(date: string | null) {
  if (!date) return "—";

  const d = new Date(date);

  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function saveEmployee() {
  if (!employeeName || !employeeSalary) return;

  if (editingEmployee) {
    await fetch(`/api/payroll/${editingEmployee.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: employeeName,
        position: employeePosition,
        salary: Number(employeeSalary),
      }),
    });
  } else {
    await fetch("/api/payroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: employeeName,
        position: employeePosition,
        salary: Number(employeeSalary),
      }),
    });
  }

  setEditingEmployee(null);
  setShowEmployeeModal(false);
  setEmployeeName("");
  setEmployeePosition("");
  setEmployeeSalary("");

  await refetchStats();
}

async function confirmDeleteEmployee() {
  if (!deleteEmployee) return;

  await fetch(`/api/payroll/${deleteEmployee.id}`, {
    method: "DELETE",
  });

  setDeleteEmployee(null);
  await refetchStats();
}

  return (
    <div className="p-10 space-y-10">

      <h1 className="text-3xl font-bold">Finance Dashboard</h1>

      {/* ===================== TOP PANEL ===================== */}
      <div className="grid grid-cols-5 gap-6">

        {/* CHART */}
        <div className="col-span-4 bg-white p-8 rounded-2xl shadow border">

          <div className="flex justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
  <TrendingUp size={16} />
  Headstart Profit
</div>
              <div className="text-4xl font-bold text-green-600">
                {Number(stats?.netProfit ?? 0).toLocaleString()} UZS
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
          <Stat title="Total Collected" value={stats?.totalCollected} color="green" icon={DollarSign} />
<Stat title="Teacher payout" value={stats?.totalTeacher} color="blue" icon={CreditCard} />
<Stat title="Expenses" value={stats?.totalExpenses} color="red" icon={Receipt} />
<Stat title="Net Profit" value={stats?.netProfit} color="purple" icon={TrendingUp} />
        </div>
      </div>

      {/* ===================== PAYROLL TABLE ===================== */}
<div className="bg-white p-8 rounded-2xl shadow border space-y-6">

  <div className="flex justify-between items-center">
    <h2 className="text-xl font-semibold flex items-center gap-2">
      <CreditCard size={18} />
      Employees Payroll
    </h2>

    <div className="flex gap-3">
      {/* SEARCH */}
      <input
  value={payrollSearch}
  onChange={(e) => setPayrollSearch(e.target.value)}
  placeholder="Search employee..."
  className="border rounded-lg px-3 py-2 text-sm"
/>

      {/* MONTH SWITCH (UI only for now) */}
      <select className="border rounded-lg px-3 py-2 text-sm">
        <option>This month</option>
        <option>Last month</option>
      </select>

      {/* ADD EMPLOYEE */}
      <button
  onClick={() => setShowEmployeeModal(true)}
  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
>
  + Add Employee
</button>
    </div>
  </div>

  {/* TABLE HEADER */}
  <div className="grid grid-cols-6 text-sm font-medium text-gray-500 border-b pb-2">
  <div>Employee</div>
  <div>Position</div>
  <div>Salary</div>
  <div>Status</div>
  <div>Paid time</div>
  <div></div> {/* actions column */}
</div>

  {/* TABLE BODY PLACEHOLDER */}
  <div className="space-y-2">
  {filteredPayroll?.map((p: any) => (
    <div
  key={p.id}
  className="grid grid-cols-6 items-center p-3 border rounded-lg text-sm"
>
      {/* Employee */}
      <div className="font-medium">{p.name}</div>

      {/* Position */}
      <div className="text-gray-500">{p.position}</div>

      {/* Salary */}
      <div className="font-semibold">
        {Number(p.salary ?? 0).toLocaleString()} UZS
      </div>

      <div className="flex items-center gap-3">

  {/* STATUS BADGE */}
  <div
    className={`px-2 py-1 rounded-md text-xs font-medium
      ${p.status === "paid"
        ? "bg-green-100 text-green-700"
        : "bg-yellow-100 text-yellow-700"}
    `}
  >
    {p.status === "paid" ? "Paid" : "Pending"}
  </div>

  {/* TOGGLE BUTTON */}
  <button
    onClick={() => togglePayroll(p.id, p.status)}
    className={`w-7 h-7 rounded-md flex items-center justify-center border
      ${p.status === "paid"
        ? "bg-green-500 border-green-500 text-white"
        : "bg-white border-gray-300 hover:bg-gray-50"}
    `}
  >
    <Check size={14} />
  </button>

</div>

      {/* Paid time */}
      <div className="text-gray-400">
  {p.status === "paid" ? formatPaidTime(p.paidAt) : "—"}
</div>

{/* ACTION MENU (only fixed salary employees) */}
{p.position !== "Teacher" && (
  <div className="relative">
    <button
      onClick={() =>
        setOpenEmployeeMenu(openEmployeeMenu === p.id ? null : p.id)
      }
      className="p-1 rounded hover:bg-gray-100"
    >
      <MoreVertical size={16} />
    </button>

    {openEmployeeMenu === p.id && (
    <div
      ref={menuRef}
      className="absolute right-0 top-7 bg-white border rounded-lg shadow z-20 min-w-[120px]"
    >
      <button
        onClick={() => {
          setOpenEmployeeMenu(null);
          setEditingEmployee(p);
          setEmployeeName(p.name);
          setEmployeePosition(p.position);
          setEmployeeSalary(String(p.salary));
          setShowEmployeeModal(true);
        }}
        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 w-full"
      >
        <Pencil size={14} /> Edit
      </button>

      <button
        onClick={() => {
          setOpenEmployeeMenu(null);
          setDeleteEmployee(p);
        }}
        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-50 w-full"
      >
        <Trash2 size={14} /> Delete
      </button>
    </div>
  )}
</div>
       )}
    </div>
  ))}
</div>


</div>



      {/* ===================== BOTTOM PANEL ===================== */}
      <div className="grid grid-cols-2 gap-6">

        {/* TRANSACTIONS */}
        <div className="bg-white p-8 rounded-2xl shadow border">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
  <CreditCard size={18} />
  Transactions
</h2>
          <div className="space-y-4">
            {stats?.transactions?.map((t: any) => (
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
                    {Number(t.amountPaid ?? 0).toLocaleString()} UZS
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
  onClick={(event) => event.stopPropagation()}
>
        <div>
          <div className="font-medium">{e.title}</div>
          <div className="text-sm text-gray-500">
            {Number(e.amount ?? 0).toLocaleString()} UZS
          </div>
        </div>

        {/* 3 dots */}
        <button
  onClick={(event) => {
    event.stopPropagation();
    setOpenExpenseMenu(openExpenseMenu === e.id ? null : e.id);
  }}
>
  <MoreVertical size={18} />
</button>

        {openExpenseMenu === e.id && (
          <div
  ref={menuRef}
  className="absolute right-4 top-12 bg-white shadow rounded-lg border z-20"
>
            <button
              onClick={() => {
  setOpenExpenseMenu(null);
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
  onClick={() => {
    setOpenExpenseMenu(null);
    setDeleteExpense(e);
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

            {/* DELETE CONFIRM MODAL */}
{deleteExpense && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 w-[360px] space-y-4 shadow-xl">
      <h3 className="font-semibold text-lg">Delete expense?</h3>

      <p className="text-sm text-gray-500">
        This action cannot be undone.
      </p>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setDeleteExpense(null)}
          className="px-4 py-2 border rounded-lg"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
  try {
    const res = await fetch(`/api/expenses/${deleteExpense.id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("DELETE ERROR:", text);
      return;
    }

    setDeleteExpense(null);
    setOpenExpenseMenu(null);
    await refetchStats();
  } catch (err) {
    console.error("DELETE CRASH:", err);
  }
}}
          className="px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

{deleteEmployee && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 w-[360px] space-y-4 shadow-xl">
      <h3 className="font-semibold text-lg">Delete employee?</h3>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setDeleteEmployee(null)}
          className="px-4 py-2 border rounded-lg"
        >
          Cancel
        </button>

        <button
          onClick={confirmDeleteEmployee}
          className="px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

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
                onClick={() => {
  setShowExpenseModal(false);
  setEditingExpense(null);
}}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  if (editingExpense) {
                    const res = await fetch(`/api/expenses/${editingExpense.id}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: expenseTitle,
    amount: Number(expenseAmount),
  }),
});

const data = await res.json();
console.log("PATCH RESULT:", data);

if (!res.ok) {
  console.error("PATCH ERROR:", data);
  return;
}
                  } else {
                    await addExpense();
                  }

                  setShowExpenseModal(false);
setOpenExpenseMenu(null);
setEditingExpense(null);
setExpenseTitle("");
setExpenseAmount("");
await refetchStats();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⭐ EMPLOYEE MODAL */}
{showEmployeeModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 w-[380px] space-y-4 shadow-xl">

      <h3 className="text-lg font-semibold">
  {editingEmployee ? "Edit Employee" : "Add Employee"}
</h3>

      <input
        placeholder="Employee name"
        value={employeeName}
        onChange={(e) => setEmployeeName(e.target.value)}
        className="w-full border rounded-lg px-4 py-2"
      />

      <input
        placeholder="Position"
        value={employeePosition}
        onChange={(e) => setEmployeePosition(e.target.value)}
        className="w-full border rounded-lg px-4 py-2"
      />

      <input
        placeholder="Salary"
        value={employeeSalary}
        onChange={(e) => setEmployeeSalary(e.target.value)}
        className="w-full border rounded-lg px-4 py-2"
      />

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowEmployeeModal(false)}
          className="px-4 py-2 border rounded-lg"
        >
          Cancel
        </button>

        <button
  onClick={saveEmployee}
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
        {typeof value === "number" ? value.toLocaleString() : "0"} UZS
      </div>
    </div>
  );
}