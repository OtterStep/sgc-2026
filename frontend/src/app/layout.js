import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'SGC - Universidad Nacional de Trujillo',
  description: 'Sistema de Gestión de la Calidad',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}