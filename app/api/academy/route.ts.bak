import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const address = cookies().get('wallet-auth')?.value;

        // Fetch courses + lessons (sorted by orderIndex)
        const courses = await prisma.course.findMany({
            include: {
                lessons: {
                    orderBy: { orderIndex: 'asc' }
                }
            }
        });

        // Initialize progress framework
        let userProgress: any[] = [];
        if (address) {
            const user = await prisma.user.findUnique({
                where: { walletAddress: address },
                include: { progress: true }
            });
            if (user && user.progress) userProgress = user.progress;
        }

        // Map and compute progress percentage dynamically just like the mock did, but backed by real DB logic
        const enrichedCourses = courses.map(course => {
            const lessonsEnriched = course.lessons.map(l => {
                const completed = userProgress.some(up => up.lessonId === l.id && up.completed);
                return {
                    id: l.id,
                    title: l.title,
                    duration: l.duration,
                    level: l.level,
                    description: l.description,
                    locked: l.isLocked,
                    completed
                };
            });

            const completedCount = lessonsEnriched.filter(l => l.completed).length;
            const progress = lessonsEnriched.length > 0 ? (completedCount / lessonsEnriched.length) * 100 : 0;

            return {
                id: course.id,
                title: course.title,
                description: course.description,
                totalDuration: course.totalDuration,
                badge: course.badge,
                level: course.level, // Not used heavily in frontend map natively, but keeping standard
                progress: Math.round(progress),
                lessons: lessonsEnriched
            };
        });

        return NextResponse.json({ ok: true, data: enrichedCourses });
    } catch (e) {
        console.error("Academy Load Error", e);
        return NextResponse.json({ ok: false, error: 'Database retrieval failed' }, { status: 500 });
    }
}

// Handler for when a user marks a lesson complete
export async function POST(req: Request) {
    try {
        const address = cookies().get('wallet-auth')?.value;
        if (!address) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

        const { lessonId } = await req.json();

        const user = await prisma.user.findUnique({ where: { walletAddress: address } });
        if (!user) return NextResponse.json({ ok: false, error: 'User mapping lost' }, { status: 400 });

        await prisma.userProgress.upsert({
            where: {
                userId_lessonId: { userId: user.id, lessonId }
            },
            create: { userId: user.id, lessonId, completed: true },
            update: { completed: true }
        });

        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json({ ok: false, error: 'Failed to update progress' }, { status: 500 });
    }
}
