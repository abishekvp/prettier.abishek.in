import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Prettier Code Studio — Professional Multi-Language Formatter & Diff Viewer | abishek.in',
  description: 'Professional fullscreen code formatter powered by Prettier: Format JavaScript, TypeScript, HTML, CSS, JSON, Markdown, YAML, SQL, Python, and GraphQL with diff view, minifier, and customizable rules.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✨</text></svg>" />
      </head>
      <body className="bg-surface-darker text-slate-100 antialiased overflow-hidden select-none">
        {children}
      </body>
    </html>
  );
}
