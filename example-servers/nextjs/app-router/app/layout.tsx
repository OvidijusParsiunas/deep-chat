import {Inter} from 'next/font/google';
import type {Metadata} from 'next';

const inter = Inter({subsets: ['latin']});

export const metadata: Metadata = {
  title: 'Deep Chat',
  description: 'Demo Deep Chat app for NextJS App Router',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
