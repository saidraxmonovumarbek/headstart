"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="px-4 py-2 text-sm text-gray-400">
        Loading...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex gap-3">
        <Link
          href="/login"
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
        >
          Log In
        </Link>

        <Link
          href="/signup"
          className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  // If logged in
  const role = session.user.role;

  let dashboardLink = "/student";
  if (role === "admin") dashboardLink = "/admin";
  if (role === "teacher") dashboardLink = "/teacher";

  return (
    <div className="flex items-center gap-4">
      <Link
        href={dashboardLink}
        className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition"
      >
        Dashboard
      </Link>

      <button
        onClick={() => signOut()}
        className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
      >
        Logout
      </button>
    </div>
  );
}