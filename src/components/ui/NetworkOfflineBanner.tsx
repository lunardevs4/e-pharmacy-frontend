import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function NetworkOfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
    };

    const handleOnline = () => {
      setIsOffline(false);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div
      role="alert"
      className="fixed left-0 right-0 top-0 z-50 flex items-center justify-center gap-2 bg-gray-900 px-4 py-3 text-sm text-white"
    >
      <WifiOff className="h-4 w-4" />

      <span>
        You are currently offline. Some features may not be available.
      </span>
    </div>
  );
}