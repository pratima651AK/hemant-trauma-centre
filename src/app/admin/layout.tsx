import NextAuthSessionProvider from '@/components/SessionProvider';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Portal | Hemant Trauma and Sport Injury Centre',
  description: 'Secure admin access only',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
