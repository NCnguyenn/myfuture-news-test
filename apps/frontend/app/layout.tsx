import type { Metadata } from 'next';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import './globals.css';

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
    <html lang="vi">
      <body>
        <Header />
        <main className="site-main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
