import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <h1>MyFuture News</h1>
      <p>News module scaffold.</p>
      <Link href="/ban-tin">Open Bản tin</Link>
    </main>
  );
}
