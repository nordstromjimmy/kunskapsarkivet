export type Post = {
  id: string;
  slug?: string;
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
