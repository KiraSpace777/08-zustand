// ==========================================================
// Локальна перевірка помилок завантаження: app/notes
// ==========================================================
// error.tsx обов'язково має бути клієнтським ("use client"). Файли помилок у Next.js працюють як React Error Boundaries. Вони мають вміти перехоплювати помилки як на сервері, так і на клієнті, а також містять клієнтську функцію reset() для спроби повторного завантаження сторінки без повного перезавантаження браузера.
// ------------------------------------------------
// app/notes/filter/[...slug]/error.tsx

"use client";

import css from "./error.module.css";
import NotFound from "@/app/not-found"; // Імпортуємо ваш компонент без змін назви

const ERROR_TEXT = "Could not fetch the list of notes.";

type Props = {
  error: Error & { digest?: string };
};

export default function NotesError({ error }: Props) {
  // Перевіряємо, чи помилка викликана функцією notFound()
  const isNotFound =
    error.message?.includes("NEXT_NOT_FOUND") || error.digest?.includes("NEXT_NOT_FOUND");

  if (isNotFound) {
    return <NotFound />;
  }

  return (
    <p className={css.text}>
      {ERROR_TEXT} <br /> <br />
      {error.message}
    </p>
  );
}

// ===================================
// "use client";

// import css from "./error.module.css";

// type Props = {
//   error: Error;
// };

// export default function NotesError({ error }: Props) {
//   return <p className={css.text}>Could not fetch the list of notes. {error.message}</p>;
// }
