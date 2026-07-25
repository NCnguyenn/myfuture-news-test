import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import './globals.css';

const vietnameseFont = Be_Vietnam_Pro({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['vietnamese', 'latin'],
  display: 'swap',
  variable: '--font-vietnamese',
});

export const metadata: Metadata = {
  title: 'Bản tin | MyFuture News',
  description: 'Tin tức thị trường bất động sản từ MyFuture News.',
  openGraph: {
    type: 'website',
    title: 'Bản tin | MyFuture News',
    description: 'Tin tức thị trường bất động sản từ MyFuture News.',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={vietnameseFont.variable}>
      <body className={vietnameseFont.className}>
        <Header />
        <main className="site-main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

