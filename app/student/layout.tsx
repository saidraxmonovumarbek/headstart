"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home,
  BookOpen,
  FileText,
  CalendarDays,
  Calendar,
  BarChart3,
  PanelLeft,
  LogOut,
  Settings as SettingsIcon,
} from "lucide-react";

export default function StudentLayout({
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
  const [mobileOpen, setMobileOpen] = useState(false);

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

  useEffect(() => {
  setMobileOpen(false);
}, [pathname]);

  if (status === "loading") return null;

  if (!session || (session.user as any).role !== "student") {
    return <div className="p-10">Access denied.</div>;
  }

  const menu = [
  { name: "Home", icon: Home, href: "/student" },
  { name: "Classes", icon: BookOpen, href: "/student/classes" },
  { name: "Notes", icon: FileText, href: "/student/notes" },
  { name: "Vocabulary", icon: BookOpen, href: "/student/vocabulary" },
  { name: "Study Plan", icon: CalendarDays, href: "/student/study-plan" },
  { name: "Calendar", icon: Calendar, href: "/student/calendar" },
  { name: "Mock Exams", icon: FileText, href: "/student/mock-exam" },
  { name: "My Progress", icon: BarChart3, href: "/student/progress" },
];

  return (
    <div className="relative flex h-screen bg-white">
      {/* Sidebar */}

{/* MOBILE HEADER */}
<div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b flex items-center px-4 z-40">
  <button
    onClick={() => setMobileOpen((prev) => !prev)}
    className="p-2 mr-3 flex flex-col justify-center"
  >
    <span className="block w-6 h-[2px] bg-gray-800 mb-1 rounded" />
    <span className="block w-4 h-[2px] bg-gray-800 rounded" />
  </button>

  <span className="text-green-600 font-semibold text-lg">
    Headstart
  </span>
</div>

{mobileOpen && (
  <div
    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
    onClick={() => setMobileOpen(false)}
  />
)}

      <aside
  className={`
    fixed lg:static top-0 left-0 h-full bg-white flex flex-col z-50 overflow-visible
    transition-all duration-300 ease-in-out
    w-[75%]
    lg:border-r lg:border-gray-200
    ${collapsed ? "lg:w-20" : "lg:w-72"}
    ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
  `}
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
    onClick={() => {
  if (window.innerWidth < 1024) {
    setMobileOpen((prev) => !prev);
  } else {
    setCollapsed((prev) => !prev);
  }
}}
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
  className={`group relative flex items-center px-4 py-3 rounded-xl transition-colors duration-200 ${
    active
      ? "bg-green-600 text-white"
      : "text-gray-700 hover:bg-gray-100"
  }`}
>
  {/* Desktop Animated Icon */}
  <motion.div
    className="flex-shrink-0 hidden lg:block"
    whileHover={{ scale: 1.15 }}
    transition={{ type: "spring", stiffness: 300, damping: 15 }}
  >
    <Icon
      size={20}
      className={active ? "text-white" : "text-gray-600"}
    />
  </motion.div>

  {/* Mobile Static Icon */}
  <div className="flex-shrink-0 lg:hidden">
    <Icon
      size={20}
      className={active ? "text-white" : "text-gray-600"}
    />
  </div>

  {/* Text */}
  <div
    className={`overflow-hidden transition-all duration-300 ease-in-out ${
      collapsed
        ? "max-w-0 opacity-0 -translate-x-2"
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

  {/* Tooltip (Collapsed Desktop Only) */}
  {collapsed && (
    <div
      className="
        absolute left-full ml-3 top-1/2 -translate-y-1/2
        hidden lg:block
        px-3 py-1.5
        rounded-lg bg-gray-900 text-white text-sm
        shadow-lg whitespace-nowrap
        opacity-0 -translate-x-2
        group-hover:opacity-100 group-hover:translate-x-0
        transition-all duration-150
        pointer-events-none
        z-50
      "
    >
      {item.name}
    </div>
  )}
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
              <div className="whitespace-nowrap font-medium text-gray-800 text-left">
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
                href="/student/settings"
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

            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-white pt-16 px-4 sm:px-6 lg:p-10">
  {children}
</main>

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
  );
}