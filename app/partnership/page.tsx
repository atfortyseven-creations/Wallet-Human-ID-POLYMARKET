import { redirect } from 'next/navigation';

/** /partnership removed from footer — permanent redirect to home */
export default function PartnershipPage() {
  redirect('/');
}
