// Fetch helpers for the agency's Contentful blog space. Content type is
// "blogPost" with fields: title, slug, excerpt, category, readTime, date,
// coverImage (media), body (rich text). Falls back to an empty list/null
// when the Contentful env vars aren't set yet, so the site never breaks
// before the space is wired up.

import { documentToHtmlString } from "@contentful/rich-text-html-renderer";

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  coverImage: string | null;
}

export interface ArticleDetail extends Article {
  bodyHtml: string;
}

function contentfulCredentials() {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
  if (!spaceId || !accessToken) return null;
  return { spaceId, accessToken };
}

function coverImageUrl(fields: any, includes: any): string | null {
  const asset = includes?.Asset?.find(
    (a: any) => a.sys.id === fields.coverImage?.sys?.id,
  );
  return asset ? `https:${asset.fields.file.url}` : null;
}

export async function getAllArticles(): Promise<Article[]> {
  const credentials = contentfulCredentials();
  if (!credentials) return [];

  const url =
    `https://cdn.contentful.com/spaces/${credentials.spaceId}/entries` +
    `?content_type=blogPost&order=-fields.date&include=1&access_token=${credentials.accessToken}`;

  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return [];

  const data = await res.json();
  if (!data.items?.length) return [];

  return data.items.map((item: any) => {
    const fields = item.fields;
    return {
      slug: fields.slug ?? "",
      title: fields.title ?? "",
      excerpt: fields.excerpt ?? "",
      category: fields.category ?? "",
      readTime: fields.readTime ?? "",
      date: fields.date ?? "",
      coverImage: coverImageUrl(fields, data.includes),
    };
  });
}

export async function getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  const credentials = contentfulCredentials();
  if (!credentials) return null;

  const url =
    `https://cdn.contentful.com/spaces/${credentials.spaceId}/entries` +
    `?content_type=blogPost&fields.slug=${encodeURIComponent(slug)}&include=1&access_token=${credentials.accessToken}`;

  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return null;

  const data = await res.json();
  if (!data.items?.length) return null;

  const fields = data.items[0].fields;

  return {
    slug: fields.slug ?? "",
    title: fields.title ?? "",
    excerpt: fields.excerpt ?? "",
    category: fields.category ?? "",
    readTime: fields.readTime ?? "",
    date: fields.date ?? "",
    coverImage: coverImageUrl(fields, data.includes),
    bodyHtml: fields.body ? documentToHtmlString(fields.body) : "",
  };
}
