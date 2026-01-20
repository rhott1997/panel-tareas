import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panel de Tareas',
  description: 'Gestiona tus tareas con Supabase y Next.js.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
