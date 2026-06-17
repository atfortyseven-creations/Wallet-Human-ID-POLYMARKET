import { NextResponse } from 'next/server';
import { fetchTopVerifiers } from '@/lib/leaderboard-service';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    // Leemos la página, por defecto es 1 si no viene nada
    const page = parseInt(searchParams.get('page') || '1');

    const verifiers = await fetchTopVerifiers(page);

    return NextResponse.json(verifiers, {
        headers: {
            'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
        },
    });
}

