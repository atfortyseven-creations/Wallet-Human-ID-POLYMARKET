import { redirect } from 'next/navigation';

/** Next.js 15: searchParams is async — must be awaited before access. */
export default async function MobileKYCPage({ searchParams }: any) {
  const params = await Promise.resolve(searchParams);
  const session = params?.session as string | undefined;
  const ekey    = params?.ekey    as string | undefined;

  if (session && ekey) {
    redirect(`/?uuid=${session}&pub=${ekey}`);
  }
  redirect('/');
}
