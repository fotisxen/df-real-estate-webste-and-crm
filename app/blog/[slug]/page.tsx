import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllArticles, getArticleBySlug } from "@/lib/contentful";
import { SITE_URL } from "@/lib/site";
import T from "@/components/T";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt || undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt || undefined,
      images: article.coverImage ? [article.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || undefined,
    image: article.coverImage ? [article.coverImage] : undefined,
    datePublished: article.date || undefined,
    author: { "@type": "Organization", name: "DF Real Estate" },
    mainEntityOfPage: `${SITE_URL}/blog/${article.slug}`,
  };

  return (
    <article className="container-content py-12">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/blog"
        className="font-mono text-xs uppercase tracking-wide text-clay transition-colors hover:text-ink"
      >
        <T k="blog.back" />
      </Link>

      <p className="mt-4 font-mono text-xs uppercase tracking-wide text-olive">
        {[
          article.category,
          article.readTime,
          article.date &&
            new Date(article.date).toLocaleDateString("el-GR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>
      <h1 className="mt-2 max-w-3xl text-4xl leading-tight md:text-5xl">
        {article.title}
      </h1>
      {article.excerpt && (
        <p className="mt-4 max-w-2xl text-ink/70">{article.excerpt}</p>
      )}

      {article.coverImage && (
        <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-sm bg-ink/10">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      <div
        className="prose prose-lg mt-10 max-w-3xl
          prose-headings:font-display prose-headings:text-ink
          prose-p:text-ink/80 prose-p:leading-relaxed
          prose-a:text-clay prose-a:no-underline hover:prose-a:underline
          prose-strong:text-ink
          prose-blockquote:border-clay prose-blockquote:text-ink/70
          prose-img:rounded-sm"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
      />

      <div className="mt-16 rounded-sm border border-ink/10 bg-limestone2 p-8">
        <h3 className="text-2xl">
          <T k="blog.cta.title" />
        </h3>
        <p className="mt-2 text-ink/70">
          <T k="blog.cta.subtitle" />
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-block rounded-full bg-ink px-6 py-3 font-mono text-xs uppercase tracking-wide text-limestone transition-colors hover:bg-clay"
        >
          <T k="contact.requestInfo" />
        </Link>
      </div>
    </article>
  );
}
