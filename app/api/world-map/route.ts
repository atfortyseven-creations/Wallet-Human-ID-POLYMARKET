import { NextResponse } from 'next/server';

// Cache the GeoJSON in-memory for the lifetime of the server instance
// so we don't hammer the CDN on every page load.
let cachedGeoJson: any = null;

const GEOJSON_SOURCES = [
  'https://cdn.jsdelivr.net/gh/holtzy/D3-graph-gallery@master/DATA/world.geojson',
  'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson',
];

export async function GET() {
  // Serve from cache if available
  if (cachedGeoJson) {
    return NextResponse.json(cachedGeoJson, {
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // Try each CDN source in order
  for (const url of GEOJSON_SOURCES) {
    try {
      const res = await fetch(url, {
        next: { revalidate: 86400 }, // Next.js 13+ fetch cache 24h
      });
      if (!res.ok) continue;

      const data = await res.json();
      cachedGeoJson = data;

      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch {
      // Try next source
    }
  }

  return NextResponse.json(
    { error: 'Failed to fetch world map data from all sources.' },
    { status: 502 }
  );
}
