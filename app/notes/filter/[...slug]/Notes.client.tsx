// ==========================================================
// NotesClient - робота з CSR рендерингом
// CSR (Client-Side Rendering): "use client"
// ==========================================================
// У клієнтському компоненті NotesClient потрібно отримати пропс tag та використати його в useQuery.
// Паралельні маршрути для фільтрації нотаток за тегом
// ----------------------------------------------------------
// app/notes/filter/[...slug]/notes.client.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { fetchNotes } from "@/lib/api";
import NoteList from "@/components/NoteList/NoteList";
import SearchBox from "@/components/SearchBox/SearchBox";
import Pagination from "@/components/Pagination/Pagination";
import css from "./NotesPage.module.css";

// ------------------------------------------------------
//  ГЛОБАЛЬНІ КОНСТАНТИ НАЛАШТУВАННЯ СТОРІНКИ НОТАТОК
// ------------------------------------------------------
const NOTES_PER_PAGE = 10; // // Кількість нотаток, які відображаються на одній сторінці
const DEBOUNCE_DELAY = 500; // // Час затримки пошукового запиту у мілісекундах

interface NotesClientProps {
  initialPage: number;
  initialSearch: string;
  tag: string;
}

export default function NotesClient({ initialPage, initialSearch, tag }: NotesClientProps) {
  const router = useRouter();

  // Локальний стан для тексту в полі введення користувача та пагінації
  // Стан повністю контролює сторінку та пошук всередині компонента
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // --- ЛОГІКА ЗАТРИМКИ ПОШУКОВОГО ЗАПИТУ ЗА ШАБЛОНОМ DEBOUNCE ---
  useEffect(() => {
    if (searchInput === initialSearch) return;

    const debouncerTimer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1); // При новому пошуку завжди повертаємо на першу сторінку
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(debouncerTimer);
  }, [searchInput, initialSearch]);

  // Фонова синхронізація з URL-адресою для збереження історії навігації
  useEffect(() => {
    const queryParams = new URLSearchParams();
    queryParams.set("page", String(currentPage));
    if (debouncedSearch) {
      queryParams.set("search", debouncedSearch);
    }
    router.push(`/notes/filter/${tag}?${queryParams.toString()}`);
  }, [debouncedSearch, currentPage, tag, router]);

  // отримання даних через TanStack query
  // useQuery тепер строго підписаний на ЛОКАЛЬНІ реактивні стани (currentPage, debouncedSearch)
  const { data } = useQuery({
    queryKey: ["notes", currentPage, debouncedSearch, tag],
    queryFn: () =>
      fetchNotes({
        page: currentPage,
        perPage: NOTES_PER_PAGE,
        search: debouncedSearch,
        tag: tag,
      }),
    placeholderData: (previousData) => previousData,
  });

  // Колбек для миттєвого оновлення тексту в інпуті пошуку
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  // Колбек для зміни сторінки та синхронізації з URL-рядком браузера
  // приймає чисте число `page: number`, як вимагає компонент <Pagination>
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return (
    <div className={css.app}>
      <div className={css.toolbar}>
        {/* Компонент пошуку нотаток */}
        {/* передається пропc value, інпут повністю контрольований */}
        <SearchBox onSearchChange={handleSearchChange} value={searchInput} />

        {/* // компонент пагінації */}
        {data && data.totalPages > 1 && (
          /* Передаємо контрольовану локальну сторінку currentPage замість статичного initialPage */
          <Pagination
            pageCount={data.totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* кнопка перенаправляє користувача на окрему сторінку створення */}
      <button
        type="button"
        className={css.button}
        onClick={() => router.push("/notes/action/create")}
      >
        create note +
      </button>

      {/* Повідомлення, якщо нотаток за пошуком чи тегом не знайдено */}
      {data && data.notes.length === 0 && (
        <p className={css.emptyMessage}>
          No notes found for <strong>{debouncedSearch || "this criteria"}</strong>. Create a new one
          or try another search.
        </p>
      )}

      {/* Список карток нотаток */}
      {data && data.notes.length > 0 && <NoteList notes={data.notes} />}
    </div>
  );
}
