"use client";

import { Formik, Form, Field, ErrorMessage as FormikError } from "formik";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Yup from "yup";

import { createNote } from "@/lib/api";
import type { Note, CreateNoteData } from "@/types/note";

import css from "./NoteForm.module.css";

interface NoteFormProps {
  onClose: () => void;
}

/* Правила валідації полів форми за допомогою бібліотеки Yup */
const NoteValidationSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, "Minimum 3 characters")
    .max(50, "Maximum 50 characters")
    .required("Title is a required field"),
  content: Yup.string().max(500, "Maximum 500 characters"),
  tag: Yup.string()
    .oneOf(["Todo", "Work", "Personal", "Meeting", "Shopping"], "Invalid tag selection")
    .required("Tag is a required field"),
});

export default function NoteForm({ onClose }: NoteFormProps) {
  /* Підключаємо інструменти для роботи з глобальним кешем та сервісом запитів */
  const queryClient = useQueryClient();

  /* Задаємо початкові порожні значення для полів форми, які Formik візьме при запуску */
  const initialValues: CreateNoteData = {
    title: "",
    content: "",
    tag: "Work",
  };

  /* Налаштування мутації для створення та інвалідації нотатки: виконання запиту та оновлення інтерфейсу */
  const createMutation = useMutation<Note, Error, CreateNoteData>({
    /* Передаємо чисті дані форми безпосередньо в axios-сервіс через єдиний проксі */
    mutationFn: (newNote: CreateNoteData) => createNote(newNote),
    /* Якщо сервер успішно створив нотатку — запускаємо сценарій очищення та закриття */
    onSuccess: () => {
      /* Скидаємо кеш нотаток, щоб головна сторінка автоматично підтягнула нову картку */
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      /* Закриваємо модальне вікно, повертаємо користувача до списку нотаток */
      onClose();
    },
  });

  /* Перехоплення перевірених даних з Formik і перенаправлення їх до функції мутації */
  const handleFormikSubmit = (values: CreateNoteData): void => {
    createMutation.mutate(values);
  };

  return (
    /* Ініціалізація Formik, передача початкових станів, схеми валідації Yup та функції надсилання */
    <Formik
      initialValues={initialValues}
      validationSchema={NoteValidationSchema}
      onSubmit={handleFormikSubmit}
    >
      {/* Рендеринг HTML-форми із застосуванням модульних стилів */}
      <Form className={css.form}>
        {/* Поле для введення заголовка нотатки */}
        <div className={css.formGroup}>
          <label htmlFor="title">Title</label>
          <Field id="title" type="text" name="title" className={css.input} />
          {/* Якщо є помилка валідації заголовка — Formik сам відмалює її червоним текстом у span */}
          <FormikError name="title" component="span" className={css.error} />
        </div>

        {/* Текстова область для введення основного змісту */}
        <div className={css.formGroup}>
          <label htmlFor="content">Content</label>
          <Field id="content" as="textarea" name="content" rows={8} className={css.textarea} />
          <FormikError name="content" component="span" className={css.error} />
        </div>

        {/* Випадаючий список для вибору категорії (тегу) нотатки */}
        <div className={css.formGroup}>
          <label htmlFor="tag">Tag</label>
          <Field id="tag" as="select" name="tag" className={css.select}>
            <option value="Todo">Todo</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Meeting">Meeting</option>
            <option value="Shopping">Shopping</option>
          </Field>
          <FormikError name="tag" component="span" className={css.error} />
        </div>

        {/* Блок із кнопками відміна / створення нотатки в нижній частині форми */}
        <div className={css.actions}>
          <button type="button" className={css.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={css.submitButton} disabled={createMutation.isPending}>
            {createMutation.isPending ? "Saving..." : "Create note"}
          </button>
        </div>
      </Form>
    </Formik>
  );
}
