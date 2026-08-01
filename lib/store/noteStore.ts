import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CreateNoteData } from "@/types/note";

// Типізуємо наш Zustand-стор відповідно до вимог ТЗ
interface NoteStoreState {
  draft: CreateNoteData;
  setDraft: (note: Partial<CreateNoteData>) => void;
  clearDraft: () => void;
}

// Початковий стан строго за умовою домашнього завдання
const initialDraft: CreateNoteData = {
  title: "",
  content: "",
  tag: "Todo", // Змінено з 'Work' на 'Todo' відповідно до ТЗ
};

/**
 * Zustand-стор для збереження чорнетки.
 * Використовує подвійні дужки create<...>()(...) для коректного визначення типів у TS.
 */
export const useNoteStore = create<NoteStoreState>()(
  persist(
    (set) => ({
      draft: initialDraft,

      // Функція для оновлення полів чорнетки з обов'язковим збереженням інших полів draft
      setDraft: (note) =>
        set((state) => ({
          draft: {
            ...state.draft,
            ...note, // Накладаємо оновлені поля поверх попереднього стану
          },
        })),

      // Функція для очищення чорнетки до початкового стану
      clearDraft: () => set({ draft: initialDraft }),
    }),
    {
      name: "notehub-draft-storage", // Ключ для localStorage
      // СУВОРА ВИМОГА ДЗ: зберігаємо в localStorage ЛИШЕ об'єкт draft, без методів
      partialize: (state) => ({ draft: state.draft }),
    },
  ),
);
