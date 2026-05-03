import { useState, useEffect, useCallback } from "react";
import { presenceManager } from "../utils/presenceManager";

export function useCollaboration(userId) {
  const [activeUsers, setActiveUsers] = useState([]);
  const [cursorPositions, setCursorPositions] = useState({});

  useEffect(() => {
    // Initialize current user presence
    const currentUser = {
      id: userId || `user_${Math.random().toString(36).slice(2, 9)}`,
      name: `User ${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
      color: presenceManager.generateColor(),
      lastActive: Date.now(),
    };

    // Subscribe to presence updates
    const unsubscribe = presenceManager.subscribe((presence) => {
      setActiveUsers(presence.users || []);
      setCursorPositions(presence.cursors || {});
    });

    // Simulate presence heartbeat
    const heartbeat = setInterval(() => {
      const presence = {
        users: [
          currentUser,
          ...Object.values(cursorPositions)
            .filter((c) => c.userId !== currentUser.id)
            .slice(0, 2)
            .map((c) => ({
              id: c.userId,
              name: c.userName,
              color: c.color,
              lastActive: Date.now(),
            })),
        ],
        cursors: cursorPositions,
      };
      presenceManager.notify(presence);
    }, 2000);

    return () => {
      clearInterval(heartbeat);
      unsubscribe();
    };
  }, [userId, cursorPositions]);

  const updateCursor = useCallback((x, y, nodeId = null) => {
    const userId = `user_${Math.random().toString(36).slice(2, 9)}`;
    setCursorPositions((prev) => ({
      ...prev,
      [userId]: {
        userId,
        x,
        y,
        nodeId,
        color: presenceManager.generateColor(),
        userName: `User ${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
      },
    }));
  }, []);

  return { activeUsers, cursorPositions, updateCursor };
}