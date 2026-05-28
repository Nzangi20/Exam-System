"use client";

import React, { useEffect, useState, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { API_BASE } from "@/lib/api";

interface AntiCheatWrapperProps {
  children: ReactNode;
  examId: string;
  studentId: string;
}

export default function AntiCheatWrapper({ children, examId, studentId }: AntiCheatWrapperProps) {
  const [warnings, setWarnings] = useState<number>(0);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Maximum allowed warnings before auto-submission or block
  const MAX_WARNINGS = 3;

  const logSuspiciousActivity = async (eventType: string, details: string) => {
    // API call to log activity to backend
    try {
      await fetch(`${API_BASE}/api/exams/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId,
          studentId,
          eventType,
          details,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error("Failed to log activity:", err);
    }
  };

  const handleWarning = (type: string, message: string) => {
    setWarnings((prev) => {
      const newWarnings = prev + 1;
      logSuspiciousActivity(type, message);
      if (newWarnings >= MAX_WARNINGS) {
        setIsBlocked(true);
      } else {
        alert(`Warning ${newWarnings}/${MAX_WARNINGS}: ${message}`);
      }
      return newWarnings;
    });
  };

  useEffect(() => {
    // 1. Detect Tab Switching / Minimizing (Visibility API)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleWarning("TAB_SWITCH", "You switched tabs or minimized the browser.");
      }
    };

    // 2. Disable Copy, Paste, Cut
    const preventCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      handleWarning("CLIPBOARD_ACCESS", "Copying and pasting are disabled during the exam.");
    };

    // 3. Disable Context Menu (Right Click)
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      handleWarning("RIGHT_CLICK", "Right-clicking is disabled.");
    };

    // 4. Keyboard Shortcuts (Print Screen, Inspect Element etc.)
    const preventKeyboardShortcuts = (e: KeyboardEvent) => {
      // Prevent F12 (Inspect Element)
      if (e.key === "F12") {
        e.preventDefault();
        handleWarning("INSPECT_ELEMENT", "Developer tools are not allowed.");
      }
      // Prevent Print Screen
      if (e.key === "PrintScreen") {
        e.preventDefault();
        handleWarning("PRINT_SCREEN", "Taking screenshots is not allowed.");
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        handleWarning("EXIT_FULLSCREEN", "You exited fullscreen mode.");
      } else {
        setIsFullscreen(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("copy", preventCopyPaste);
    document.addEventListener("cut", preventCopyPaste);
    document.addEventListener("paste", preventCopyPaste);
    document.addEventListener("contextmenu", preventContextMenu);
    document.addEventListener("keydown", preventKeyboardShortcuts);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("copy", preventCopyPaste);
      document.removeEventListener("cut", preventCopyPaste);
      document.removeEventListener("paste", preventCopyPaste);
      document.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("keydown", preventKeyboardShortcuts);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  };

  if (isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-900">
        <div className="max-w-md p-8 bg-white rounded-lg shadow-xl text-center space-y-4">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold">Exam Blocked</h1>
          <p>
            You have exceeded the maximum number of warnings due to suspicious activity. Your exam has been flagged and submitted for review.
          </p>
        </div>
      </div>
    );
  }

  if (!isFullscreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
        <div className="max-w-md p-8 bg-white rounded-lg shadow-xl text-center space-y-6">
          <h1 className="text-2xl font-bold">Fullscreen Required</h1>
          <p className="text-gray-600">
            This exam requires you to be in fullscreen mode. Any attempt to exit fullscreen will be logged as suspicious activity.
          </p>
          <button
            onClick={enterFullscreen}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
          >
            Enter Fullscreen to Start
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-wrapper select-none">
      <div className="fixed top-0 left-0 w-full bg-red-600 text-white py-1 px-4 text-xs font-semibold z-50 flex justify-between shadow">
        <span>EXAM IN PROGRESS - DO NOT REFRESH</span>
        <span>Warnings: {warnings}/{MAX_WARNINGS}</span>
      </div>
      <div className="pt-8">
        {children}
      </div>
    </div>
  );
}
