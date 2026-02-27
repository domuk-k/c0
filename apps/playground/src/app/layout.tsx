import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'c0 Playground',
  description: 'Open-source Generative UI SDK — no vendor lock-in',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
