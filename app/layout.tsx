import QueryProvider from "@/components/providers/QueryProvider";
import "./globals.css";
import { DM_Sans, DM_Mono, Geist } from 'next/font/google'

// const dmSans = DM_Sans({
//   subsets: ['latin'],
//   variable: '--font-dm-sans',
// })

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
})

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en" className={`${geist.variable} ${dmMono.variable}`}>
      <body className="antialiased">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
};

export default RootLayout;
