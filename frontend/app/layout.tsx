import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'OpenAI Assistant Chat',
  description: 'Chat with OpenAI Assistant API',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}