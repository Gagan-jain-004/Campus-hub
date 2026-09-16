import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CampusHub — Your campus, online.',
  description:
    'The college-centric student marketplace, anonymous communities, lost & found recovery, and in-app chat ecosystem.',
  openGraph: {
    title: 'CampusHub — Your campus, online.',
    description:
      'Buy, sell, connect and recover lost items across your college campus.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} overflow-x-hidden`}>
        <body className="min-h-screen bg-[#faf8ff] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased overflow-x-hidden w-full max-w-full">
          <AuthProvider>
            <Navbar />
            <main className="flex-1 w-full max-w-full pb-16 md:pb-0 overflow-x-hidden">{children}</main>
            <MobileNav />
          </AuthProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
