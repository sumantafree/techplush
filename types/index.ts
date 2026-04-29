export type Category =
  | "Tech Updates"
  | "Artificial Intelligence"
  | "Digital Marketing"
  | "Social Media"
  | "Research & Papers"
  | "Tech & Human Life";

export const CATEGORY_SLUGS: Record<string, Category> = {
  "tech-updates": "Tech Updates",
  "artificial-intelligence": "Artificial Intelligence",
  "digital-marketing": "Digital Marketing",
  "social-media": "Social Media",
  "research-papers": "Research & Papers",
  "tech-human-life": "Tech & Human Life",
};

export const SLUG_FROM_CATEGORY: Record<Category, string> = {
  "Tech Updates": "tech-updates",
  "Artificial Intelligence": "artificial-intelligence",
  "Digital Marketing": "digital-marketing",
  "Social Media": "social-media",
  "Research & Papers": "research-papers",
  "Tech & Human Life": "tech-human-life",
};

export interface Article {
  id: string;
  title: string;
  excerpt: string | null;
  url: string;
  source: string;
  published_at: string;
  category: Category;
  image: string | null;
  read_time: number;
  created_at: string;
}

export interface SavedArticle {
  id: string;
  user_id: string;
  article_id: string;
  notes: string | null;
  tags: string[];
  created_at: string;
  article?: Article;
}

export interface BlogIdea {
  headline: string;
  outline: string[];
  keywords: string[];
  meta_description: string;
}

export interface BlogPost {
  title: string;
  meta_title: string;
  meta_description: string;
  keywords: string[];
  content: string;
  faq: { question: string; answer: string }[];
  word_count: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  image: string;
}
