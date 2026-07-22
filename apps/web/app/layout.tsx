import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bản tin | MyFuture News',
  description: 'Tin tức thị trường bất động sản',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
