"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function OfflineDetector() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      toast.error("You are currently offline", {
        id: "offline-status",
        duration: Infinity,
      });
    };

    const handleOnline = () => {
      setIsOffline(false);
      toast.dismiss("offline-status");
      toast.success("You are back online!", {
        id: "online-status",
        duration: 3000,
      });
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // Initial check (in case they load the app offline)
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return null;
}
