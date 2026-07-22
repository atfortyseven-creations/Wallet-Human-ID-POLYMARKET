import { ReactNode } from "react";

// Cryptographic FIX: Use h-screen + overflow-hidden to prevent page-level
// scroll bleed from WhaleProShell's internal h-[100vh] container.
export default function TerminalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-[100vh] overflow-hidden bg-transparent text-[#050505] dark:text-[#FFFFFF]">
      {children}
    </div>
  );
}
