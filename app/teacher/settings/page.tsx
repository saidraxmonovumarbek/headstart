"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Mail, Lock, Camera } from "lucide-react";

export default function SettingsPage() {
  const { data: session, update } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
  const [initialData, setInitialData] = useState<{
  name: string;
  email: string;
} | null>(null);
const hasChanges =
  !!initialData &&
  (
    name !== initialData.name ||
    email !== initialData.email ||
    password.length > 0
  );

  useEffect(() => {
  if (session?.user) {
    const current = {
  name: session.user.name || "",
  email: session.user.email || "",
};

    setName(current.name);
    setEmail(current.email);
    setInitialData(current);
  }
}, [session]);

  if (!session?.user) return null;

  const handleSave = async () => {
  if (loading) return;

  setLoading(true);
  setMessage(null);

  try {
    const res = await fetch("/api/user/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
  name,
  email,
  password,
}),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Update failed");
    }

    // Update session instantly
    await update({
  user: {
    name: data.name,
    email: data.email,
  },
});

    setInitialData({
  name: data.name,
  email: data.email,
});

    setPassword("");

    // ✅ FORCE MESSAGE AFTER UPDATE
    let successText = "Profile updated successfully.";

if (password.length > 0) {
  successText = "Your password has been updated successfully.";
} else if (name !== initialData?.name) {
  successText = "Your name has been updated successfully.";
} else if (email !== initialData?.email) {
  successText = "Your email has been updated successfully.";
}

setMessageType("success");
setMessage(successText);

  } catch (err: any) {
    setMessageType("error");
    setMessage(err.message || "Something went wrong.");
  } finally {
    setLoading(false);

    setTimeout(() => {
      setMessage(null);
      setMessageType(null);
    }, 3000);
  }
};

  return (
    <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8">
  <div className="w-full max-w-3xl space-y-8 sm:space-y-10">

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
        Settings
      </h1>

      {/* TOP GREEN PROFILE CARD */}
      <div className="bg-green-600 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shadow-lg text-center sm:text-left">

        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 flex items-center justify-center text-2xl sm:text-3xl font-bold border-4 border-white">
  {name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()}
</div>

        <div>
          <h2 className="text-2xl font-bold">{name}</h2>
          <p className="opacity-90">{email}</p>
          <p className="opacity-70 text-sm">
            ID: {session.user.id}
          </p>
        </div>

      </div>

      {/* FEEDBACK MESSAGE */}
{message && (
  <div
    className={`px-5 py-4 rounded-2xl text-sm font-medium transition-all duration-300 ${
      messageType === "success"
  ? "bg-green-100 text-green-700 animate-success"
        : "bg-red-100 text-red-600 animate-shake"
    }`}
  >
    {message}
  </div>
)}

      {/* EDIT SECTION */}
      <div className="bg-white p-5 sm:p-8 rounded-3xl shadow-sm border space-y-6 sm:space-y-8">

        {/* Name */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <User size={16} /> Full Name
          </label>

          <input
  name="name"
  autoComplete="off"
  value={name}
  onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Mail size={16} /> Email Address
          </label>

          <input
  name="email"
  autoComplete="off"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500 focus:outline-none"
/>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Lock size={16} /> Change Password
          </label>

          <div className="relative">
            <input
  type={showPassword ? "text" : "password"}
  autoComplete="new-password"
  name="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500 focus:outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
  onClick={handleSave}
  disabled={loading || !hasChanges}
  className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold transition ${
    loading || !hasChanges
      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
      : "bg-green-600 text-white hover:bg-green-700"
  }`}
>
  {loading ? "Saving..." : "Save Changes"}
</button>

      </div>
</div>
    </div>
  );
}