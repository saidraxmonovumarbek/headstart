"use client";

import { useState, useEffect } from "react";

export default function NotificationsBell({ userId }: any) {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/notifications/${userId}`)
      .then(res => res.json())
      .then(data => setNotifications(data));
  }, []);

  return (
    <div className="relative">

      <button className="relative">
        🔔
        {notifications.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

    </div>
  );
}