import './globals.css';
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      // comment bellow to using the default font of shadcn ui, tailwind: font-sans
      // className={`${geist.variable} ${geistMono.variable} ${montserrat.variable} ${roboto.variable}`}
    >
      <body className="font-sans">{children}</body>
    </html>
  );
}
