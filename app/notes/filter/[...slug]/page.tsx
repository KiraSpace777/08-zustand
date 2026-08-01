// ============================================================================
// Notes (сторінка списку нотаток) - розмітка сторінки
// SSR (Server-Side Rendering)
// ============================================================================

import type { Metadata } from "next"; // Імпортуємо тип для метаданих
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { fetchNotes, FetchNotesResponse } from "@/lib/api";

import NotesClient from "@/app/notes/filter/[...slug]/Notes.client";

import { Suspense } from "react";
import Loading from "@/app/loading";
import NotFound from "@/app/not-found";

// --- [ГЛОБАЛЬНІ КОНСТАНТИ НА ПОЧАТКУ ФАЙЛУ] ---
const DEFAULT_PER_PAGE = 10;
const DEFAULT_TAG = "all";

interface PageProps {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ page?: string; search?: string }>;
}

/**
 * Асинхронна функція для генерації динамічних метаданих сторінки фільтрації
 * Типізована як Promise<Metadata> відповідно до вимог домашнього завдання
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;

  // Отримуємо поточний тег зі slug або беремо дефолтний "all"
  const currentTag = resolvedParams.slug?.[0] || DEFAULT_TAG;

  // Формуємо гарний заголовок: перша літера велика (наприклад, "Work notes", "Todo notes", "All notes")
  const formattedTag = currentTag.charAt(0).toUpperCase() + currentTag.slice(1);
  const pageTitle = `${formattedTag} Notes | NoteHub`;
  const pageDescription = `View and manage your filtered notes for category: ${currentTag}. Stay organized with NoteHub.`;

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `https://notehub.com{currentTag}`,
      images: [
        {
          url: "https://goit.global",
          width: 1200,
          height: 630,
          alt: `${formattedTag} notes filtering page on NoteHub`,
        },
      ],
    },
  };
}

export default async function NotesPage({ params, searchParams }: PageProps) {
  // Тестування помилки:
  // throw new Error("Error message");

  // Проводимо асинхронне розгортання параметрів шляху - resolvedParams
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const currentTag = resolvedParams.slug?.[0] || DEFAULT_TAG;

  // Перевіряємо й виводимо дані саме з об'єкта розгорнутих пошукових параметрів URL
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const searchTerm = resolvedSearchParams.search || "";

  const queryClient = new QueryClient();

  const queryKey = ["notes", currentPage, searchTerm, currentTag];

  try {
    await queryClient.prefetchQuery({
      queryKey: queryKey,
      queryFn: () =>
        fetchNotes({
          page: currentPage,
          perPage: DEFAULT_PER_PAGE,
          search: searchTerm,
          tag: currentTag,
        }),
    });

    const fetchedData = queryClient.getQueryData<FetchNotesResponse>(queryKey);
    if (!fetchedData || fetchedData.notes.length === 0) {
      NotFound();
    }
  } catch (error) {
    console.error("Fetch notes failed:", error);
    NotFound();
  }

  return (
    <Suspense fallback={<Loading />}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <NotesClient
          key={`${currentTag}-${searchTerm}`}
          initialPage={currentPage}
          initialSearch={searchTerm}
          tag={currentTag}
        />
      </HydrationBoundary>
    </Suspense>
  );
}

// ================================================================================

// // ==========================================================
// // Notes  (сторінка списку нотаток) - розмітка сторінки
// // SSR (Server-Side Rendering)
// // ==========================================================
// // Отримання списку нотатків у серверний компонент
// // +  npm install use-debounce
// // +  npm install @tanstack/react-query
// //
// // Весь вміст компонента App з попередньої ДЗ перенесено на
// // сторінку "/notes", взято з HW-05 вміст компонента "App.tsx"
// // ----------------------------------------------------------
// // ЗМІНИ === [ДЗ 7: Паралельні маршрути для фільтрації нотаток за тегом] ===
// // "app/notes/page.tsx" перенесено в "app/notes/filter/[...slug]/page.tsx"
// // У серверному компоненті використовуйте params,в який Next.js в catch-all маршруті автоматично передає значення параметра як масив slug. На основі значення slug отримайте поточний тег фільтрації та використайте його під час виконання prefetch, та передайте пропсом в клієнтський компонент NotesClient

// import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
// import { fetchNotes, FetchNotesResponse } from "@/lib/api";

// import NotesClient from "@/app/notes/filter/[...slug]/Notes.client";

// import { Suspense } from "react";
// import Loading from "@/app/loading";
// import NotFound from "@/app/not-found";

// // === [ГЛОБАЛЬНІ КОНСТАНТИ НА ПОЧАТКУ ФАЙЛУ] ===
// const DEFAULT_PER_PAGE = 10;
// const DEFAULT_TAG = "all";

// interface PageProps {
//   // === [ДЗ 7: Паралельні маршрути для фільтрації нотаток за тегом] ===
//   // Додаємо асинхронні параметри динамічного catch-all роуту [...slug]
//   params: Promise<{ slug: string[] }>;
//   searchParams: Promise<{ page?: string; search?: string }>;
// }

// export default async function NotesPage({ params, searchParams }: PageProps) {
//   // Тестування помилки:
//   // throw new Error("Error message");

//   // === [ДЗ 7: Паралельні маршрути для фільтрації нотаток за тегом] ===
//   // Проводимо асинхронне розгортання динамічних параметрів шляху - resolvedParams
//   const resolvedParams = await params;
//   const resolvedSearchParams = await searchParams;

//   const currentTag = resolvedParams.slug?.[0] || DEFAULT_TAG;

//   // Перевіряємо й виводимо дані саме з об'єкта розгорнутих пошукових параметрів URL
//   const currentPage = Number(resolvedSearchParams.page) || 1;
//   const searchTerm = resolvedSearchParams.search || "";

//   const queryClient = new QueryClient();

//   // === [ДЗ 7: Паралельні маршрути для фільтрації нотаток за тегом] ===
//   /* Серверне попереднє завантаження кешу даних (Prefetch) перед рендерингом сторінки */
//   // Щоб змусити код дойти до функції notFound(), нам потрібно обернути prefetchQuery у
//   // простий блок try...catch. Якщо зловимо помилку 400 від сервера (Bad Request) —
//   // ми відразу викликаємо вашу помилку.

//   const queryKey = ["notes", currentPage, searchTerm, currentTag];

//   try {
//     await queryClient.prefetchQuery({
//       // Додаємо поточний тег у ключ кешу, щоб сервер та клієнт мали ідентичну структуру даних - currentTag
//       queryKey: queryKey,
//       // Передаємо параметр tag у функцію запиту - tag: currentTag
//       queryFn: () =>
//         fetchNotes({
//           page: currentPage,
//           perPage: DEFAULT_PER_PAGE,
//           search: searchTerm,
//           tag: currentTag,
//         }),
//     });

//     // Додаткова перевірка на випадок, якщо сервер повернув 200, але масив порожній
//     const fetchedData = queryClient.getQueryData<FetchNotesResponse>(queryKey);
//     if (!fetchedData || fetchedData.notes.length === 0) {
//       NotFound();
//     }
//   } catch (error) {
//     // Виводимо технічний текст помилки в термінал для додаткової інформації
//     console.error("Fetch notes failed:", error);

//     // Примусово викликаємо ваш 404
//     NotFound();
//   }

//   return (
//     <Suspense fallback={<Loading />}>
//       <HydrationBoundary state={dehydrate(queryClient)}>
//         <NotesClient
//           key={`${currentTag}-${searchTerm}`}
//           initialPage={currentPage}
//           initialSearch={searchTerm}
//           tag={currentTag}
//         />
//       </HydrationBoundary>
//     </Suspense>
//   );
// }
