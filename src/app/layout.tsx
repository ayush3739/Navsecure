import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { Public_Sans } from 'next/font/google';

export const metadata: Metadata = {
  title: 'NavSecure',
  description: 'AI-Powered Women’s Safety Navigation',
};

const publicSans = Public_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-public-sans',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    return (
      <html lang="en" className={`${publicSans.variable} dark`}>
        <body className={cn('font-body antialiased')}>
            <div className="w-full h-screen bg-muted flex items-center justify-center">
              <div className="text-center text-muted-foreground p-4">
                <p className="font-bold">Google Maps API key is missing.</p>
                <p className="text-sm">Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file.</p>
              </div>
            </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className={`${publicSans.variable} dark`}>
      <body className={cn('font-body antialiased')}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
