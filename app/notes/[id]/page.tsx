// ==========================================================
// NoteDetails (серверний компонент)
// - Динамічні маршрути / Prefetch, кешування, dehydrate
// ==========================================================
// Структура:
// -------------------------
// app/notes/[id]/page.tsx – залишаємо page.tsx серверним
// app/notes/[id]/NoteDetails.client.tsx – створюємо окремий клієнтський компонент для інтерактивного вмісту
// ----------------------------------------------------------
// До серверного компонента "app/notes/[id]/page.tsx" повертаємо логіку читання ідентифікатора із параметрів та додамо (prefetch), щоб компонент завантажував дані заздалегідь.
// Для того, щоб використати ці дані в клієнтському компоненті, необхідно використати HydrationBoundary із React Query
// ----------------------------------------------------------
// app/notes/[id]/page.tsx
//

import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { fetchNoteById } from "@/lib/api";
import NoteDetailsClient from "./NoteDetails.client";

// Імпортуємо інструмент 404, Вбудована функція Next.js (з маленької літери)
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NoteDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const queryClient = new QueryClient();

  try {
    /* Серверне завантаження деталей однієї конкретної нотатки за допомогою fetchQuery */
    await queryClient.fetchQuery({
      queryKey: ["note", id],
      queryFn: () => fetchNoteById(id),
    });
  } catch (error) {
    // Виводимо технічний текст помилки в термінал для додаткової інформації
    console.error("Fetch notes details failed:", error);
    // Викликаємо саме системну функцію-команду Next.js з маленької літери.
    // Вона зупинить завантаження і передасть керування у ваш error.tsx, де вже увімкнеться ваш <NotFound />
    notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NoteDetailsClient />
    </HydrationBoundary>
  );
}

// ==========================================================
// NoteDetails - Динамічні маршрути / Prefetch, кешування, dehydrate
// ==========================================================
// до серверного компонента app/notes/[id]/page.tsx повертаємо логіку читання ідентифікатора із параметрів. Також додамо код, щоб компонент завантажував дані заздалегідь (prefetch):
// *** prefetchQuery – функція, яка завчасно завантажить нам ці нотатки та збереже їх у кеш на сервері. Завдяки цьому при виклику useQuery у клієнтському компоненті, дані вже будуть доступні – без повторного запиту.
// *** queryKey – ключ, за яким дані будуть збережені у кеш
// *** queryFn – функція HTTP-запиту

// Для того, щоб використати ці дані в клієнтському компоненті, необхідно використати HydrationBoundary із React Query:
// *** HydrationBoundary – компонент, передає кеш клієнту
// *** dehydrate(queryClient) – перетворює кеш у серіалізований обʼєкт
