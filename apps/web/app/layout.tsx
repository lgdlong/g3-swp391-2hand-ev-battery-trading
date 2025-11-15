import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { Providers } from '@/app/providers';
// import { Geist, Geist_Mono, Montserrat, Roboto } from "next/font/google"

// const geist = Geist({
//   subsets: ["latin"],
//   variable: "--font-geist",
//   display: "swap",
// })
//
// const geistMono = Geist_Mono({
//   subsets: ["latin"],
//   variable: "--font-geist-mono",
//   display: "swap",
// })
//
// const montserrat = Montserrat({
//   subsets: ["latin"],
//   variable: "--font-montserrat",
//   display: "swap",
// })
//
// const roboto = Roboto({
//   subsets: ["latin"],
//   variable: "--font-roboto",
//   display: "swap",
// })

import { Roboto } from 'next/font/google';

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
  weight: ['100', '300', '400', '500', '700', '900'],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      // comment bellow to using the default font of shadcn ui, tailwind: font-sans
      // className={`${geist.variable} ${geistMono.variable} ${montserrat.variable} ${roboto.variable}`}
      className={`${roboto.variable}`}
    >
      <body suppressHydrationWarning={true}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
