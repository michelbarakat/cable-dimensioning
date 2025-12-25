import { useOnlineStatus } from "../hooks/useOnlineStatus";

/**
 * Component that displays an online/offline status indicator
 */
export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  return (
    <div className="flex items-center gap-1 text-xs">
      <div
        className={`w-2 h-2 rounded-full ${
          isOnline ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <span className={`${isOnline ? "text-green-500" : "text-red-500"}`}>{isOnline ? "Online" : "Offline"}</span>
    </div>
  );
}
