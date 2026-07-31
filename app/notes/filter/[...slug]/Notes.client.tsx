// ==========================================================
// NotesClient - робота з CSR рендерингом
// CSR (Client-Side Rendering): "use client"
// ==========================================================
// === [HW 7 (NEXT): Паралельні маршрути для фільтрації нотаток за тегом] ===
// "app/notes/Notes.client.tsx" перенесено до "app/notes/filter/[...slug]/notes.client.tsx"
// У клієнтському компоненті NotesClient потрібно отримати пропс tag та використати його в useQuery.

"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { fetchNotes } from "@/lib/api";
import NoteList from "@/components/NoteList/NoteList";
import SearchBox from "@/components/SearchBox/SearchBox";
import Pagination from "@/components/Pagination/Pagination";
import NoteForm from "@/components/NoteForm/NoteForm";
import Modal from "@/components/Modal/Modal";
import css from "./NotesPage.module.css";

// ==========================================================================
// ГЛОБАЛЬНІ КОНСТАНТИ НАЛАШТУВАННЯ СТОРІНКИ НОТАТОК
// ==========================================================================
const NOTES_PER_PAGE = 10; // Кількість нотаток, які відображаються на одній сторінці
const DEBOUNCE_DELAY = 500; // Час затримки пошукового запиту у мілісекундах

interface NotesClientProps {
  initialPage: number;
  initialSearch: string;
  // === [HW 7 (NEXT): Паралельні маршрути для фільтрації нотаток за тегом] ===
  // пропс поточного тегу відфільтрованих нотаток
  tag: string;
}

// === [HW 7 (NEXT): Паралельні маршрути для фільтрації нотаток за тегом] ===
// Додаємо 'tag' у деструктуризацію пропсів, щоб усунути помилку "Cannot find name 'tag'"
export default function NotesClient({ initialPage, initialSearch, tag }: NotesClientProps) {
  const router = useRouter();

  // === [HW 7 (NEXT): Паралельні маршрути для фільтрації нотаток за тегом] ===
  // Локальний стан для тексту в полі введення користувача
  // Ініціалізується один раз і скидається автоматично через 'key' на рівні page.tsx
  const [searchInputValue, setSearchInputValue] = useState<string>(initialSearch);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  // === ЛОГІКА ЗАТРИМКИ ПОШУКОВОГО ЗАПИТУ ЗА ШАБЛОНОМ DEBOUNCE ===
  // === [HW 7 (NEXT): Паралельні маршрути для фільтрації нотаток за тегом] ===

  useEffect(() => {
    // якщо введене значення збігається з початковим пошуком, запит не виконуємо
    if (searchInputValue === initialSearch) return;

    const debounceTimer = setTimeout(() => {
      // Замість оновлення локальних станів, ми програмно оновлюємо URL-адресу додатка,
      // зберігаючи поточний тег фільтрації та скидаючи сторінку на першу.
      router.push(`/notes/filter/${tag}?page=1&search=${encodeURIComponent(searchInputValue)}`);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(debounceTimer);
  }, [searchInputValue, initialSearch, tag, router]);

  // Отримання даних через TanStack Query
  // -----------------------------------------------------
  // Запит залежить від серверних пропсів.
  // Це виключає будь-яке зациклення або повторні запити при рендерині сторінки.

  const { data } = useQuery({
    queryKey: ["notes", initialPage, initialSearch, tag],
    queryFn: () =>
      fetchNotes({ page: initialPage, perPage: NOTES_PER_PAGE, search: initialSearch, tag }),
    placeholderData: (previousData) => previousData,
  });

  // Колбек для миттєвого оновлення тексту в інпуті пошуку
  const handleSearchChange = useCallback((value: string): void => {
    setSearchInputValue(value);
  }, []);

  // Колбек для зміни сторінки та синхронізації з URL-рядком браузера
  const handlePageChange = useCallback(
    (page: number): void => {
      // Проводимо навігацію на нову сторінку з обов'язковим збереженням поточного тегу в адресі
      router.push(`/notes/filter/${tag}?page=${page}&search=${encodeURIComponent(initialSearch)}`);
    },
    [initialSearch, tag, router],
  );

  return (
    <div className={css.app}>
      {/* Верхня панель інструментів */}
      <div className={css.toolbar}>
        <SearchBox onSearchChange={handleSearchChange} />

        {data && data.totalPages > 1 && (
          // Перевіряємо й виводимо поточну сторінку безпосередньо з початкових серверних пропсів URL
          <Pagination
            pageCount={data.totalPages}
            currentPage={initialPage}
            onPageChange={handlePageChange}
          />
        )}

        <button type="button" className={css.button} onClick={() => setIsFormOpen(true)}>
          Create note +
        </button>
      </div>

      {/* 
        Рендеримо окремий компонент Modal.
        Передаємо обов'язкові пропси isOpen та onClose, а форму NoteForm — як children.
      */}
      {isFormOpen && (
        <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}>
          <NoteForm onClose={() => setIsFormOpen(false)} />
        </Modal>
      )}

      {/* Повідомлення про відсутність результатів пошуку */}
      {data && data.notes.length === 0 && (
        <p className={css.emptyMessage || css.empty}>
          No notes found for &quot;<strong>{initialSearch}</strong>&quot;. Create a new one or try
          another search.
        </p>
      )}

      {/* 
        Рендеримо список нотаток без пропсів мутації.
        Логіка видалення та інвалідації кешу повністю зосереджена в NoteList.tsx.
      */}
      {data && data.notes.length > 0 && <NoteList notes={data.notes} />}
    </div>
  );
}
