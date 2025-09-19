export type Post = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string; // ISO
};

export const categories = [
  "Slöjd & Hantverk",
  "Mat & Förvaring",
  "Livet på Landet",
  "Folktro & Berättelser",
  "Språk & Ord",
  "Hus & Hem",
];

export const posts: Post[] = [
  {
    id: "1",
    title: "Torkning av strömming på vägg – så gjorde vi",
    excerpt:
      "Spiklist, luftflöde från gårdssidan, ett fingertryck salt. När fisken “sjunger” är den klar.",
    category: "Mat & Förvaring",
    author: "Karin, Härnösand",
    date: "2025-09-10",
  },
  {
    id: "2",
    title: "Björkvispar & bastukvastar",
    excerpt:
      "Plocka kvistar i juni, torka i skugga. Doften håller hela vintern om du förvarar rätt.",
    category: "Slöjd & Hantverk",
    author: "Olle, Dalarna",
    date: "2025-09-08",
  },
  {
    id: "3",
    title: "Ordspråk från farmor på jämtska",
    excerpt: "Små ord som bär årstider, arbete och humor – med ljudklipp.",
    category: "Språk & Ord",
    author: "Eva, Östersund",
    date: "2025-09-07",
  },
  {
    id: "4",
    title: "Bygga gärdsgård med slanor",
    excerpt:
      "Spjälor av gran, portstolpar i kärnved. Knutar som håller i 40 år.",
    category: "Hus & Hem",
    author: "Mikael, Småland",
    date: "2025-09-05",
  },
  {
    id: "5",
    title: "Mjölksyrade morötter i stenkruka",
    excerpt: "Tre ingredienser: morot, salt, tid. Så undviker du mjuk textur.",
    category: "Mat & Förvaring",
    author: "Sofia, Skåne",
    date: "2025-09-03",
  },
  {
    id: "6",
    title: "Näverslöjd – ask med lock",
    excerpt:
      "Plocka näver skonsamt i rätt tid, annars dör trädet. Steg-för-steg bilder.",
    category: "Slöjd & Hantverk",
    author: "Rune, Norrbotten",
    date: "2025-09-01",
  },
];
