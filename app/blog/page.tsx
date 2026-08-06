import Image from "next/image";
import Link from "next/link";
import { getAllArticles } from "@/lib/contentful";
import Reveal from "@/components/Reveal";
import T from "@/components/T";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Άρθρα",
  description:
    "Οδηγοί, νέα και συμβουλές για αγορά, πώληση και ενοικίαση ακινήτων στη Θεσσαλονίκη.",
};

export default async function BlogPage() {
  const articles = await getAllArticles();

  return (
    <section className="container-content py-16">
      <p className="font-mono text-xs uppercase tracking-wide text-clay">
        <T k="blog.kicker" />
      </p>
      <h1 className="mt-2 max-w-2xl text-4xl md:text-5xl">
        <T k="blog.title" />
      </h1>
      <p className="mt-4 max-w-xl text-ink/70">
        <T k="blog.subtitle" />
      </p>

      {articles.length === 0 ? (
        <p className="mt-16 rounded-sm border border-dashed border-ink/20 p-10 text-center text-ink/50">
          <T k="blog.empty" />
        </p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, i) => (
            <Reveal key={article.slug} delay={Math.min(i, 5) * 0.06}>
              <Link
                href={`/blog/${article.slug}`}
                className="group block h-full overflow-hidden rounded-sm bg-limestone2 transition-shadow hover:shadow-xl"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-ink/10">
                  {article.coverImage ? (
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-mono text-xs text-ink/40">
                      DF Real Estate
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="font-mono text-[11px] uppercase tracking-wide text-olive">
                    {[
                      article.category,
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
                  <h2 className="mt-1 font-display text-xl leading-snug">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm text-ink/70">
                      {article.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
