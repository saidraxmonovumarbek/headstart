"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { LogOut, Settings as SettingsIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRef, useEffect } from "react";
import {
  Home,
  GraduationCap,
  User,
  Users,
  CalendarDays,
  FileText,
  Settings,
  PanelLeft,
  DollarSign,
  BookOpen,
  CalendarCheck
} from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
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

  // Close account dropdown when clicking outside
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

// Auto close mobile sidebar on route change
useEffect(() => {
  setMobileOpen(false);
}, [pathname]);

  if (status === "loading") return null;

  if (
  !session ||
  !["admin"].includes((session.user as any).role)
) {
  return <div className="p-10">Access denied.</div>;
}

  const menu = [
  { name: "Home", icon: Home, href: "/admin" },
  { name: "Teachers", icon: GraduationCap, href: "/admin/teachers" },
  { name: "Students", icon: User, href: "/admin/students" },
  { name: "Groups", icon: Users, href: "/admin/groups" },

  { name: "Calendar", icon: CalendarDays, href: "/admin/calendar" },
  { name: "Vocabulary", icon: BookOpen, href: "/admin/vocabulary" }, // 🔥 NEW

  { name: "Mock Exams", icon: FileText, href: "/admin/mock-exam" },
  { name: "Events", icon: CalendarCheck, href: "/admin/events" }, // 🔥 NEW

  { name: "Registered Users", icon: Users, href: "/admin/users" },

  ...(session.user.isSuperAdmin
    ? [{ name: "Finance", icon: DollarSign, href: "/admin/finance" }]
    : []),
];

  return (
    <div className="relative flex h-screen overflow-hidden bg-white">
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

      <aside
  className={`
    fixed lg:static top-0 left-0 h-full bg-white flex flex-col z-50
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
  {/* LEFT: Logo */}
  <img
    src="/assets/headstart.png"
    alt="HeadStart"
    className={`w-8 h-8 transition-opacity duration-200 ${
      collapsed ? "group-hover:opacity-0" : ""
    }`}
  />

  {/* RIGHT: Toggle (always visible when open, hover-only when collapsed) */}
  <button
    onClick={() => {
  if (window.innerWidth < 1024) {
    setMobileOpen(false);
  } else {
    setCollapsed(!collapsed);
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

        {/* Text wrapper */}
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

  {/* Trigger */}
  <button
    onClick={() => setOpenMenu(!openMenu)}
    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-colors duration-200"
  >
    {/* Avatar */}
    <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
      {session.user.name
        ?.split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()}
    </div>

    {/* Name */}
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

  {/* DROP-UP PANEL */}
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

      {/* Profile Info */}
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

      {/* Settings */}
      <Link
        href="/admin/settings"
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition"
      >
        <SettingsIcon size={18} />
        <span className="text-sm font-medium">Settings</span>
      </Link>

      {/* Logout */}
      <button
        onClick={() => setConfirmLogout(true)}
        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-red-50 text-red-600 transition"
      >
        <LogOut size={18} />
        <span className="text-sm font-medium">Logout</span>
      </button>

      {/* Logout Confirmation Modal */}
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

      {/* MOBILE OVERLAY */}
{mobileOpen && (
  <div
    onClick={() => setMobileOpen(false)}
    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
  />
)}

      {/* Content */}
      <main className="flex-1 overflow-y-auto bg-white pt-16 px-4 sm:px-6 lg:p-10">
        {children}
      </main>
    </div>
  );
}