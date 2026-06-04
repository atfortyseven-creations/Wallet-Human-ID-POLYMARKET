import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { serializePassport } from '@/lib/passport/serialize';
import { PassportView } from '@/components/passport/PassportView';

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const passport = await prisma.productPassport.findUnique({
    where: { publicSlug: slug },
    select: { title: true },
  });
  if (!passport) return { title: 'Passport not found' };
  return {
    title: `${passport.title} · Product passport`,
    description: 'Public product provenance record from Humanity Ledger.',
  };
}

export default async function PassportPage({ params }: Props) {
  const { slug } = await params;
  if (!slug || !/^[a-zA-Z0-9_-]{4,64}$/.test(slug)) notFound();

  const passport = await prisma.productPassport.findUnique({
    where: { publicSlug: slug },
    include: { events: { orderBy: { createdAt: 'desc' }, take: 50 } },
  });

  if (!passport) notFound();

  return <PassportView passport={serializePassport(passport)} />;
}
