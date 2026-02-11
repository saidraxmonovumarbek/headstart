"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Users,
  CalendarDays,
  FileText,
  BarChart3,
  Notebook,
  LogOut,
  Settings as SettingsIcon,
  PanelLeft,
} from "lucide-react";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        openMenu &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenu]);

  if (status === "loading") return null;

  if (!session || (session.user as any).role !== "teacher") {
    return <div className="p-10">Access denied.</div>;
  }

  const menu = [
    { name: "Home", icon: Home, href: "/teacher" },
    { name: "My Groups", icon: Users, href: "/teacher/groups" },
    { name: "Student Profiles", icon: Users, href: "/teacher/students" },
    { name: "Attendance", icon: FileText, href: "/teacher/attendance" },
    { name: "Calendar", icon: CalendarDays, href: "/teacher/calendar" },
    { name: "Notes", icon: Notebook, href: "/teacher/notes" },
    { name: "Mock Exams", icon: FileText, href: "/teacher/mock-exam" },
    { name: "My Progress", icon: BarChart3, href: "/teacher/progress" },
  ];

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside
        className={`border-r bg-white flex flex-col transition-[width] duration-300 ease-in-out ${
          collapsed ? "w-20" : "w-72"
        }`}
      >
        {/* Logo + Toggle */}
        <div
          className={`group relative flex items-center ${
            collapsed ? "justify-center" : "justify-between"
          } px-4 py-6`}
        >
          <img
            src="/assets/headstart.png"
            alt="HeadStart"
            className={`w-8 h-8 transition-opacity duration-200 ${
              collapsed ? "group-hover:opacity-0" : ""
            }`}
          />

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`${
              collapsed
                ? "absolute opacity-0 group-hover:opacity-100"
                : ""
            } transition-opacity duration-200 p-2 rounded-lg hover:bg-gray-100`}
          >
            <PanelLeft size={20} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 space-y-2 mt-4">
          {menu.map((item, i) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={i}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-xl transition-colors duration-200 ${
                  active
                    ? "bg-green-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon
                  size={20}
                  className={`flex-shrink-0 ${
                    active ? "text-white" : "text-gray-600"
                  }`}
                />

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    collapsed
                      ? "max-w-0 opacity-0 translate-x-[-8px]"
                      : "max-w-xs opacity-100 translate-x-0 ml-3"
                  }`}
                >
                  <span
                    className={`whitespace-nowrap font-medium ${
                      active ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {item.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Account Section */}
        <div className="relative border-t p-3">
          <button
  onClick={() => setOpenMenu(!openMenu)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {session.user.name
                ?.split(" ")
                .map((n: string) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                collapsed
                  ? "max-w-0 opacity-0 translate-x-[-8px]"
                  : "max-w-xs opacity-100 translate-x-0"
              }`}
            >
              <div className="whitespace-nowrap font-medium text-gray-800">
                {session.user.name}
              </div>
            </div>
          </button>

          {openMenu && (
            <div
              ref={menuRef}
              className={`absolute bg-white rounded-2xl shadow-xl border p-4 space-y-3 animate-fade-in-up z-50 transition-all duration-200
  ${
    collapsed
      ? "bottom-16 left-20 w-64"
      : "bottom-20 left-3 right-3"
  }`}
            >
              <div className="space-y-1 text-left">
                <div className="font-semibold text-gray-900">
                  {session.user.name}
                </div>

                <div className="text-xs text-gray-500">
                  {session.user.email}
                </div>

                <div className="text-xs text-gray-400">
                  ID: {(session.user as any).id || "—"}
                </div>
              </div>

              <div className="border-t" />

              <Link
                href="/teacher/settings"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <SettingsIcon size={18} />
                <span className="text-sm font-medium">Settings</span>
              </Link>

              <button
                onClick={() => setConfirmLogout(true)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-red-50 text-red-600 transition"
              >
                <LogOut size={18} />
                <span className="text-sm font-medium">Logout</span>
              </button>

              {confirmLogout && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl p-6 w-[320px] shadow-xl">
                    <h3 className="text-lg font-semibold mb-3">
                      Are you sure you want to log out?
                    </h3>

                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        onClick={() => setConfirmLogout(false)}
                        className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={() => signOut({ callbackUrl: "/auth" })}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-10 bg-white">
        {children}
      </main>
    </div>
  );
}