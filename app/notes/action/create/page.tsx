// ============================================================================
// Серверна сторінка створення нової нотатки (Маршрут app/notes/action/create/page.tsx)
// Створює окремий повноцінний маршрут згідно з вимогами ДЗ.
// ============================================================================

import type { Metadata } from "next";
import NoteForm from "@/components/NoteForm/NoteForm";
import css from "./CreateNote.module.css";

// Для цієї сторінки реалізуйте експорт об’єкта metadata з полями title, description
export const metadata: Metadata = {
  title: "Create Note | NoteHub",
  description: "Page for creating a new note in the NoteHub application.",
  openGraph: {
    title: "Create Note | NoteHub",
    description: "Page for creating a new note in the NoteHub application.",
    url: "https://notehub.com",
    images: [
      {
        url: "https://goit.global",
        width: 1200,
        height: 630,
        alt: "Create note page on NoteHub",
      },
    ],
  },
};

export default function CreateNote() {
  return (
    <main className={css.main}>
      <div className={css.container}>
        <h1 className={css.title}>Create note</h1>

        {/* Клієнтська форма створення нотатки */}
        <NoteForm />
      </div>
    </main>
  );
}
