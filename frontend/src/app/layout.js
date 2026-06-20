import './globals.css';
import { Inter, Lora } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const lora = Lora({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-serif',
});

export const metadata = {
  title: 'SGC - Universidad Nacional de Trujillo',
  description: 'Sistema de Gestión de la Calidad',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${inter.variable} ${lora.variable}`}>
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}