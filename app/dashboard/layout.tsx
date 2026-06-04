import { ReactNode } from "react";

// Enterprise FIX: Use h-screen + overflow-hidden to prevent page-level
// scroll bleed from WhaleProShell's internal h-[100dvh] container.
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-[100dvh] overflow-hidden bg-transparent text-[#050505] dark:text-[#FFFFFF]">
      {children}
    </div>
  );
}
