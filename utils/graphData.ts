export interface GraphNode {
    id: string;
    name?: string;
    val: number; // Volume/Importance (Scale)
    group: 'USER' | 'DEFI' | 'WALLET' | 'UNKNOWN' | 'PHISHING';
    color?: string;
    date?: string; // ISO String
}

export interface GraphLink {
    source: string;
    target: string;
    value: number; // Tx Count (Thickness)
}

export interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
}
