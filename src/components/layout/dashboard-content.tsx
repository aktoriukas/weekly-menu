"use client";

import { PendingInvites } from "@/components/household/pending-invites";

interface DashboardContentProps {
  children: React.ReactNode;
}

export function DashboardContent({ children }: DashboardContentProps) {
  return (
    <div className="h-full flex flex-col gap-4">
      <PendingInvites />
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}
