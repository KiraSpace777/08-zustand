/* === [ДЗ 7: Паралельні маршрути для фільтрації нотаток за тегом] === */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const timerId = setTimeout(() => {
      router.replace("/");
    }, 3000);

    return () => {
      clearTimeout(timerId);
    };
  }, [router]);

  return (
    <>
      <h1>404 | Page not found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
    </>
  );
}
