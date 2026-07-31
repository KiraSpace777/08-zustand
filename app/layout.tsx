// ==========================================================
// Глобальна розмітка структури сторінок (повторювані елементи)
// ==========================================================
// Підключення провайдера React Query (для завантаження даних у
// клієнтському компоненті), робимо один раз на весь проєкт, тому
// робимо це в головному шаблоні "app/layout.tsx", імпорт із папки:
// ----------------------------------------------------------
// components/TanStackProvider/TanStackProvider.tsx
// ----------------------------------------------------------
//
// app/layout.tsx

import TanStackProvider from "@/components/TanStackProvider/TanStackProvider";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

import "./globals.css";

interface RootLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode; // Паралельний слот для модального вікна
}

export default function RootLayout({ children, modal }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <TanStackProvider>
          <Header />
          <main>{children}</main>

          {/* // === [ДЗ 7: Паралельні маршрути для фільтрації нотаток за тегом] === */}
          {/* Рендеримо модальне вікно на найвищому рівні додатка */}
          {modal}

          <Footer />
        </TanStackProvider>
      </body>
    </html>
  );
}
