import React from "react";
import { Users, UserCheck } from "lucide-react";

export default function PresenceIndicators({ activeUsers, cursorPositions }) {
  if (!activeUsers || activeUsers.length === 0) return null;

  return (
    <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
      {/* Active users list */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg">
        <Users className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-foreground">
          {activeUsers.length} {activeUsers.length === 1 ? "user" : "users"}
        </span>
        <div className="flex -space-x-2">
          {activeUsers.slice(0, 3).map((user) => (
            <div
              key={user.id}
              className="w-6 h-6 rounded-full border-2 border-background flex items-center justify-center text-[9px] font-bold text-white"
              style={{ backgroundColor: user.color }}
              title={user.name}
            >
              {user.name.charAt(0)}
            </div>
          ))}
          {activeUsers.length > 3 && (
            <div className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[9px] font-bold text-foreground">
              +{activeUsers.length - 3}
            </div>
          )}
        </div>
      </div>

      {/* Cursor positions */}
      {Object.entries(cursorPositions).map(([key, cursor]) => (
        <div
          key={key}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] bg-background border border-border/50 shadow-sm"
          style={{ borderLeftColor: cursor.color, borderLeftWidth: "3px" }}
        >
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cursor.color }} />
          <span className="font-medium text-foreground">{cursor.userName}</span>
          {cursor.nodeId && (
            <span className="text-muted-foreground/60">• Node</span>
          )}
        </div>
      ))}
    </div>
  );
}