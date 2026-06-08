"use client";

import React from 'react';
import { usePathname } from 'next/navigation';

interface PortalShellProps {
  children: React.ReactNode;
  className?: string;
}

/** Wraps portal main content with CDAM-themed background */
export default function PortalShell({ children, className = '' }: PortalShellProps) {
  const pathname = usePathname();
  
  let bgClass = 'cdam-page-bg';
  if (pathname?.startsWith('/student')) {
    bgClass = 'cdam-student-page-bg';
  } else if (pathname?.startsWith('/trainer')) {
    bgClass = 'cdam-trainer-page-bg';
  } else if (pathname?.startsWith('/admin')) {
    bgClass = 'cdam-admin-page-bg';
  }

  return (
    <div className={`${bgClass} min-h-full bg-slate-100 ${className}`}>
      <div className="relative z-10 cdam-content">{children}</div>
    </div>
  );
}
