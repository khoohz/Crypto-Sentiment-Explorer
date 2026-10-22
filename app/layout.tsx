import QueryProvider from "@/components/providers/QueryProvider";
import "./globals.css";
import localFont from 'next/font/local'

const dmMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-dm-mono',
})

const geist = localFont({
  src: './fonts/GeistVF.woff',
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
