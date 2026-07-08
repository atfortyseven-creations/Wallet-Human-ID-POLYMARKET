const fs = require('fs');

// 1. Fix RealWorldMap
let mapContent = fs.readFileSync('components/landing/RealWorldMap.tsx', 'utf-8');
mapContent = mapContent.replace(
  /const TIER_COLORS: Record<string, string> = \{[^}]+\};/m,
  `const TIER_COLORS: Record<string, string> = {
  tier1: "#111111",
  tier2: "#333333",
  tier3: "#555555",
  tier4: "#777777",
  tier5: "#999999",
  tier6: "#AAAAAA",
  tier7: "#CCCCCC",
  tier8: "#DDDDDD",
  none: "#F5F5F5",
};`
);
// Make the map color logic respect isDark for the fill
mapContent = mapContent.replace(
  /fill,\n\s*stroke: "#ffffff"/g,
  `fill: isDark ? "rgba(255,255,255," + (tier === "tier1" ? 1 : tier === "tier2" ? 0.8 : tier === "tier3" ? 0.6 : tier === "tier4" ? 0.4 : tier === "tier5" ? 0.3 : tier === "tier6" ? 0.2 : tier === "tier7" ? 0.1 : tier === "tier8" ? 0.05 : 0.02) + ")" : "rgba(0,0,0," + (tier === "tier1" ? 1 : tier === "tier2" ? 0.8 : tier === "tier3" ? 0.6 : tier === "tier4" ? 0.4 : tier === "tier5" ? 0.3 : tier === "tier6" ? 0.2 : tier === "tier7" ? 0.1 : tier === "tier8" ? 0.05 : 0.02) + ")",\n                          stroke: isDark ? "rgba(0,0,0,0.5)" : "#ffffff"`
);
// Make legend colors respect isDark too (inline style)
mapContent = mapContent.replace(
  /style=\{\{ background: TIER_COLORS\[t\] \}\}/g,
  `style={{ background: isDark ? "rgba(255,255,255," + (t === "tier1" ? 1 : t === "tier2" ? 0.8 : t === "tier3" ? 0.6 : t === "tier4" ? 0.4 : t === "tier5" ? 0.3 : t === "tier6" ? 0.2 : t === "tier7" ? 0.1 : t === "tier8" ? 0.05 : 0.02) + ")" : "rgba(0,0,0," + (t === "tier1" ? 1 : t === "tier2" ? 0.8 : t === "tier3" ? 0.6 : t === "tier4" ? 0.4 : t === "tier5" ? 0.3 : t === "tier6" ? 0.2 : t === "tier7" ? 0.1 : t === "tier8" ? 0.05 : 0.02) + ")" }}`
);
mapContent = mapContent.replace(
  /style=\{\{ background: TIER_COLORS\[tooltip.tier\] \}\}/g,
  `style={{ background: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)" }}`
);
fs.writeFileSync('components/landing/RealWorldMap.tsx', mapContent);


// 2. Fix page.tsx
let pageContent = fs.readFileSync('app/registry/page.tsx', 'utf-8');

// Replace Downhead
pageContent = pageContent.replace(
  /import \{ LegendaryDownhead \} from "@\/components\/landing\/LegendaryDownhead";/,
  'import { DownheadSection } from "@/components/landing/DownheadSection";'
);
pageContent = pageContent.replace(/<LegendaryDownhead \/>/g, '<DownheadSection />');

// Light/Dark text flip
pageContent = pageContent.replace(
  /\{isDark \? "Light" : "Dark"\}/g,
  '{isDark ? "DARK" : "LIGHT"}'
);

// Sync wallet total
if (!pageContent.includes('const resMap = await fetch("/api/network/wallet-connections");')) {
  pageContent = pageContent.replace(
    /setStats\(\{\n\s*totalWallets: finalWallets\.length \+ 11530,/m,
    `
      let syncedTotal = finalWallets.length + 11530;
      try {
        const resMap = await fetch("/api/network/wallet-connections");
        if (resMap.ok) {
          const dataMap = await resMap.json();
          if (dataMap.total) {
            syncedTotal = dataMap.total;
          }
        }
      } catch (e) {}

      setStats({
        totalWallets: syncedTotal,`
  );
}

// Remove chain colors completely to B&W
pageContent = pageContent.replace(/color: "#627EEA"/g, 'color: "#000000"');
pageContent = pageContent.replace(/color: "#8247E5"/g, 'color: "#000000"');
pageContent = pageContent.replace(/color: "#0052FF"/g, 'color: "#000000"');
pageContent = pageContent.replace(/color: "#FF0420"/g, 'color: "#000000"');
pageContent = pageContent.replace(/color: "#12AAFF"/g, 'color: "#000000"');
pageContent = pageContent.replace(/color: "#F3BA2F"/g, 'color: "#000000"');
pageContent = pageContent.replace(/color: "#1E69FF"/g, 'color: "#000000"');
pageContent = pageContent.replace(/color: "#7B3FE4"/g, 'color: "#000000"');
pageContent = pageContent.replace(/color: "#10b981"/g, 'color: "#000000"');
pageContent = pageContent.replace(/color: "#f59e0b"/g, 'color: "#000000"');
pageContent = pageContent.replace(/color: "#06b6d4"/g, 'color: "#000000"');
pageContent = pageContent.replace(/color: "#ec4899"/g, 'color: "#000000"');
pageContent = pageContent.replace(/backgroundColor: chain\.color/g, 'backgroundColor: isDark ? "#fff" : "#000"');
pageContent = pageContent.replace(/backgroundColor: entry\.color/g, 'backgroundColor: isDark ? "#fff" : "#000"');
pageContent = pageContent.replace(/backgroundColor: w\.color/g, 'backgroundColor: isDark ? "#fff" : "#000"');
pageContent = pageContent.replace(/color: chain\.color/g, 'color: isDark ? "#fff" : "#000"');

fs.writeFileSync('app/registry/page.tsx', pageContent);

console.log("Fixes applied successfully.");
