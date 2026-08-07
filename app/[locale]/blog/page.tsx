import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("blog"),
    description: t("description"),
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "blogPage" });

  let posts;
  try {
    posts = await fetchQuery(api.blog.listPublishedPosts, { limit: 30 });
  } catch {
    return notFound();
  }

  return (
    <main>
      <section className="container-core829 py-24 lg:py-32">
        <p className="kicker">{t("kicker")}</p>
        <h1 className="mt-4 text-section-title">{t("title")}</h1>
        <p className="mt-6 max-w-2xl text-lg text-foreground-muted">
          {t("subtitle")}
        </p>

        {posts.length === 0 ? (
          <div className="mt-16 border border-border p-8">
            <p className="text-foreground-muted">{t("empty")}</p>
          </div>
        ) : (
          <ul className="mt-16 grid gap-px border border-border bg-border md:grid-cols-2">
            {posts.map((post) => (
              <li key={post._id} className="flex flex-col bg-surface">
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col p-6 transition-colors duration-300 hover:bg-surface"
                >
                  <p className="text-xs uppercase tracking-widest text-foreground-muted">
                    {new Date(post.publishedAt).toLocaleDateString(locale, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    {post.authorName ? ` · ${post.authorName}` : ""}
                  </p>
                  <h2 className="mt-3 text-xl font-semibold text-foreground transition-colors duration-300 group-hover:text-accent">
                    {post.title}
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground-muted">
                    {post.excerpt}
                  </p>
                  <p className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent">
                    {t("readMore")}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
