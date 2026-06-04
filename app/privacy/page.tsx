import type { Metadata } from 'next';
import { PrivacyArchitecturePage } from '@/components/privacy/PrivacyArchitecturePage';

export const metadata: Metadata = {
  title: 'Privacy & Architecture | Humanity Ledger',
  description:
    'Plain-language guide to wallet login, sessions, encrypted chat, QR device linking, data boundaries, and Aztec private state.',
};

export default function PrivacyPage() {
  return <PrivacyArchitecturePage />;
}
