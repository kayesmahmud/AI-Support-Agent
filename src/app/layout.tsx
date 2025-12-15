import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Support Agent',
  description: 'AI-powered support agent trained on your knowledge base',
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
