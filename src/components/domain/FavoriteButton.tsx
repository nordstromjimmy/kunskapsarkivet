"use client";
import { useState, useTransition } from "react";
import { Star } from "lucide-react";

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
      className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm cursor-pointer hover:bg-slate-50 disabled:opacity-50"
    >
      <Star
        size={20}
        className={fav ? "fill-yellow-400 text-yellow-400" : "text-slate-400"}
      />
      {fav ? "Favorit" : "Lägg till favorit"}
    </button>
  );
}
