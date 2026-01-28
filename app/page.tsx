import { getDashboardData } from "@/actions/dashboard.actions";
import EnterpriseDashboard from "@/components/EnterpriseDashboard";

// Server Component (Async por defecto en Next.js 14)
export default async function Page() {

    // Fetching de datos en el servidor (SEO Friendly + Rápido)
    // We use a try-catch block to ensure the page loads even if the DB is cold/unreachable
    let data;
    try {
        data = await getDashboardData();
    } catch (e) {
        console.error("Failed to fetch dashboard data:", e);
        // Fallback data is handled inside the component if data is undefined/null
    }

    return (
        <EnterpriseDashboard
            initialData={data}
        />
    );
}
