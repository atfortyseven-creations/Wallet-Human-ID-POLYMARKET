import React from "react";
import { CosmicForgePanel } from "@/components/forge/CosmicForgePanel";

export const dynamic = "force-dynamic";

export default function CosmicForgePage() {
    return (
        <div className="bg-transparent text-[#050505] dark:text-[#FFFFFF] w-full min-h-full">
            <CosmicForgePanel />
        </div>
    );
}
