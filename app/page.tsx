"use client";

import { useEffect, useState } from 'react';
import EnterpriseDashboard from "@/components/EnterpriseDashboard";
import { toast } from 'sonner';

// Production Backend URL
const API_URL = "https://wallet-human-polymarket-id-production.up.railway.app";

export default function Page() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch from the live backend
                const res = await fetch(`${API_URL}/api/dashboard`);
                if (!res.ok) throw new Error('Failed to fetch data');
                const jsonData = await res.json();
                setData(jsonData);
            } catch (error) {
                console.error("Dashboard fetch error:", error);
                // Silent fail or toast, using fallback in component
                toast.error("Using offline mode", { description: "Could not connect to Vault Network." });
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-pulse text-[#00f2ea] font-mono text-sm">INITIALIZING VAULT LINK...</div>
            </div>
        );
    }

    return (
        <EnterpriseDashboard
            initialData={data}
        />
    );
}
