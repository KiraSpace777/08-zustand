import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CreateNoteData } from "@/types/note";

// Типізація стану нашого Zustand-стору відповідно до вимог TypeScript
interface NoteStoreState {
  draft: CreateNoteData;
  setDraftField: (field: keyof CreateNoteData, value: string) => void;
  resetDraft: () => void;
}

// Початкові дефолтні значення для чорнетки нотатки
const initialDraft: CreateNoteData = {
  title: "",
  content: "",
  tag: "Work",
};

/**
 * Глобальний стор Zustand для збереження чорнетки форми створення нотатки.
 * Використовує middleware persist для автоматичного збереження даних у localStorage,
 * щоб введені користувачем дані не зникали при випадковому оновленні сторінки.
 */
export const useNoteStore = create<NoteStoreState>()(
  persist(
    (set) => ({
      draft: initialDraft,

      // Функція для динамічного оновлення конкретного поля чорнетки (title, content, tag)
      setDraftField: (field, value) =>
        set((state) => ({
          draft: {
            ...state.draft,
            [field]: value,
          },
        })),

      // Функція для повного очищення чорнетки після успішного створення нотатки
      resetDraft: () => set({ draft: initialDraft }),
    }),
    {
      name: "notehub-draft-storage", // Ключ, за яким дані будуть збережені в localStorage
    },
  ),
);
