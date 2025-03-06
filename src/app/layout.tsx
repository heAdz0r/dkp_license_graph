// app/layout.tsx (Server Component)

import { Inter } from "next/font/google";
import ClientLayout from "./ClientLayout"; // Импортируем Client Component
import "./globals.css"; // Импортируем глобальные стили

const inter = Inter({ subsets: ["latin", "cyrillic"] });

// Определяем metadata.  Это ДОЛЖНО быть в Server Component.
export const metadata = {
  title: "Выбор редакции Deckhouse Kubernetes Platform",
  description:
    "Интерактивный инструмент для выбора оптимальной редакции DKP на основе ваших требований",
};

// Этот компонент - Server Component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        {/* Оборачиваем все дочерние компоненты (ваши страницы) в ClientLayout */}
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
