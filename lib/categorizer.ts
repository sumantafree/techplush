import type { Category } from "@/types";

type RuleSet = { keywords: string[]; category: Category };

const RULES: RuleSet[] = [
  {
    keywords: [
      "artificial intelligence", "machine learning", "deep learning", "neural network",
      "llm", "large language model", "gpt", "openai", "claude", "gemini", "mistral",
      "chatgpt", "generative ai", "ai model", "transformer", "diffusion", "stable diffusion",
      "midjourney", "computer vision", "nlp", "natural language", "reinforcement learning",
      "robotics", "autonomous", "ai agent",
    ],
    category: "Artificial Intelligence",
  },
  {
    keywords: [
      "digital marketing", "seo", "sem", "content marketing", "email marketing",
      "affiliate marketing", "influencer", "growth hacking", "conversion rate",
      "ppc", "google ads", "facebook ads", "landing page", "marketing funnel",
      "brand awareness", "b2b marketing", "inbound marketing", "lead generation",
      "marketing automation", "customer acquisition", "roi", "marketing strategy",
    ],
    category: "Digital Marketing",
  },
  {
    keywords: [
      "social media", "instagram", "tiktok", "twitter", "x.com", "linkedin",
      "facebook", "youtube", "snapchat", "reddit", "threads", "algorithm",
      "engagement rate", "viral", "influencer", "creator economy", "short video",
      "reels", "hashtag", "social platform", "content creator",
    ],
    category: "Social Media",
  },
  {
    keywords: [
      "research", "paper", "study", "arxiv", "journal", "university", "scientist",
      "experiment", "discovery", "breakthrough", "publication", "findings",
      "academic", "peer review", "nature", "science", "ieee", "acm", "preprint",
    ],
    category: "Research & Papers",
  },
  {
    keywords: [
      "ethics", "privacy", "society", "human", "health", "mental health", "wellbeing",
      "future of work", "job", "employment", "automation", "bias", "regulation",
      "policy", "gdpr", "legislation", "impact", "inequality", "digital divide",
      "surveillance", "misinformation", "deepfake", "trust", "safety", "environment",
      "sustainability", "climate tech",
    ],
    category: "Tech & Human Life",
  },
];

export function categorize(title: string, excerpt?: string): Category {
  const text = `${title} ${excerpt ?? ""}`.toLowerCase();

  for (const rule of RULES) {
    if (rule.keywords.some((kw) => text.includes(kw))) {
      return rule.category;
    }
  }

  return "Tech Updates";
}

export function estimateReadTime(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200)); // avg 200 wpm
}
