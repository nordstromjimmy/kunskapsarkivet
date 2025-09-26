"use client";

export function DeleteButton() {
  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirm("Är du säker på att du vill radera detta ämne?")) {
      e.preventDefault();
    }
  };
  return (
    <button
      onClick={onClick}
      className="rounded-md bg-rose-600 px-3 py-1.5 text-sm text-white hover:bg-rose-800 cursor-pointer"
    >
      Radera ämne
    </button>
  );
}
