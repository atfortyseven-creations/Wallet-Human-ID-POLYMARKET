import { Order } from "./eip712";

const CLOB_API_URL = "https://clob.polymarket.com"; // Mainnet URL

// Mock Market Interface
export interface Market {
    question: string;
    conditionId: string;
    slug: string;
    tokens: {
        outcome: string;
        tokenId: string;
        price: number;
    }[];
    volume: number;
    endDate: string;
}

export async function getMarkets(): Promise<Market[]> {
    try {
        const response = await fetch(`${CLOB_API_URL}/markets`);
        if (!response.ok) {
            console.error("[Clob API] Market fetch failed, returning empty.");
            return [];
        }
        const data = await response.json();

        // Robust check: API might return { data: [...] } or just [...]
        if (Array.isArray(data)) {
            return data;
        } else if (data && Array.isArray(data.data)) {
            return data.data; // Handle pagination wrapper
        }

        console.error("[Clob API] Unexpected payload format.");
        return [];
    } catch (error) {
        console.error("[Clob API] Failed to fetch markets", error);
        return [];
    }
}

export async function postOrder(order: Order, signature: string) {
    const payload = {
        order,
        owner: order.maker,
        orderType: "GTC", // Good Till Cancelled
        signature,
    };

    const response = await fetch(`${CLOB_API_URL}/order`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            // "Authorization": `...` // SIWE Headers would go here
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.message || "Failed to post order");
    }

    return response.json();
}

