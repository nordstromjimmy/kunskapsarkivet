"use client";
import { useState, useTransition } from "react";

export function FavoriteButton({
  topicId,
  initial,
}: {
  topicId: string;
  initial: boolean;
}) {
  const [fav, setFav] = useState(initial);
  const [pending, start] = useTransition();

  async function toggle() {
    start(async () => {
      const method = fav ? "DELETE" : "POST";
      const res = await fetch(`/api/favorites/${topicId}`, { method });
      if (res.ok) setFav(!fav);
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`rounded-md border px-3 py-1.5 text-sm hover:bg-yellow-200 ${fav ? "bg-yellow-300 border-yellow-300" : "border-slate-200 hover:bg-slate-50"} cursor-pointer`}
    >
      {fav ? "Sparad i favoriter" : "Spara som favorit"}
    </button>
  );
}
