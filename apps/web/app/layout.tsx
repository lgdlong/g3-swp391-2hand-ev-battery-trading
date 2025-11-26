import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { Providers } from '@/app/providers';

import { Roboto } from 'next/font/google';

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
  weight: ['100', '300', '400', '500', '700', '900'],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${roboto.variable}`}>
      <body suppressHydrationWarning={true}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
