import { useEffect, useRef } from "react";
import { useUser } from "@/context/UserContext";
import { webSocketService } from "@/services/websocket.service";

/**
 * Component để tự động kết nối WebSocket cho Staff/Admin
 * ChatManagement sẽ subscribe các chat rooms cụ thể khi user select chat
 */
export default function AdminChatListener() {
  const { user, isStaff, isAdmin } = useUser();
  const hasConnectedRef = useRef(false);
  const isAdminOrStaff = isAdmin || isStaff;

  useEffect(() => {
    if (!user || !isAdminOrStaff) return;

    console.log('AdminChatListener: Attempting to connect WebSocket...', { isAdmin, isStaff });

    webSocketService.connect(
      () => {
        console.log('Admin WebSocket connected successfully!');
        hasConnectedRef.current = true;
      },
      (error) => {
        console.error('Admin WebSocket connection error:', error);
        hasConnectedRef.current = false;
      }
    );

    return () => {
      if (!user || !isAdminOrStaff) {
        console.log('AdminChatListener: Disconnecting WebSocket...');
        webSocketService.disconnect();
        hasConnectedRef.current = false;
      }
    };
  }, [user, isAdminOrStaff, isAdmin, isStaff]);
  
  return null;
}

