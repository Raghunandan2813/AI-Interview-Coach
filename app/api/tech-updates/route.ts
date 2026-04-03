import { NextResponse } from "next/server";
import Parser from "rss-parser";

type TechUpdate = {
  title: string;
  link: string;
  source: string;
  pubDate?: string;
};

const FEEDS = [
  { url: "https://hnrss.org/frontpage", source: "Hacker News" },
  { url: "https://www.theverge.com/rss/tech/index.xml", source: "The Verge" },
  { url: "https://www.smashingmagazine.com/feed/", source: "Smashing Mag" },
];

const KEYWORDS = [
  "tech",
  "software",
  "developer",
  "programming",
  "ai",
  "web",
  "javascript",
  "react",
  "next.js",
  "cloud",
  "data",
  "security",
];

export const revalidate = 1800;

export async function GET() {
  const parser = new Parser();

  try {
    const feedResults = await Promise.allSettled(
      FEEDS.map(async (feed) => {
        const parsed = await parser.parseURL(feed.url);
        return (parsed.items ?? []).map((item) => ({
          title: item.title ?? "Untitled",
          link: item.link ?? "",
          source: feed.source,
          pubDate: item.pubDate,
        }));
      }),
    );

    const mergedItems = feedResults.flatMap((result) =>
      result.status === "fulfilled" ? result.value : [],
    );

    const filtered = mergedItems
      .filter((item) => item.link && item.title)
      .filter((item) => {
        const title = item.title.toLowerCase();
        return KEYWORDS.some((keyword) => title.includes(keyword));
      })
      .sort((a, b) => {
        const first = a.pubDate ? new Date(a.pubDate).getTime() : 0;
        const second = b.pubDate ? new Date(b.pubDate).getTime() : 0;
        return second - first;
      })
      .slice(0, 8);

    return NextResponse.json({ updates: filtered as TechUpdate[] });
  } catch (error) {
    console.error("Failed to fetch tech updates", error);
    return NextResponse.json({ updates: [] }, { status: 200 });
  }
}
