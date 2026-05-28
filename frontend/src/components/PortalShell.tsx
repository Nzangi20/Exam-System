"use client";

import React from 'react';

interface PortalShellProps {
  children: React.ReactNode;
  className?: string;
}

/** Wraps portal main content with CDAM-themed background */
export default function PortalShell({ children, className = '' }: PortalShellProps) {
  return (
    <div className={`cdam-page-bg min-h-full bg-slate-100 ${className}`}>
      <div className="relative z-10 cdam-content">{children}</div>
    </div>
  );
}
