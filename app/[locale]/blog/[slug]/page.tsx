import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Link } from "@/i18n/navigation";
import BlogMarkdown from "@/components/blog/BlogMarkdown";
import { ArrowLeft } from "lucide-react";

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://core829.net";

  let post;
  try {
    post = await fetchQuery(api.blog.getPublishedPost, { slug });
  } catch {
    post = null;
  }
  if (!post) {
    return {
      title: t("blog"),
      description: t("description"),
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${siteUrl}/${locale}/blog/${post.slug}`,
      type: "article",
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Params;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "blogPage" });

  let post;
  try {
    post = await fetchQuery(api.blog.getPublishedPost, { slug });
  } catch {
    post = null;
  }
  if (!post) {
    notFound();
  }

  return (
    <main>
      <article className="container-core829 py-24 lg:py-32">
        <Link href="/blog" className="link-ghost text-sm">
          <ArrowLeft className="mr-1 inline h-4 w-4" aria-hidden />
          {t("back")}
        </Link>

        <header className="mt-10 max-w-3xl">
          <p className="text-xs uppercase tracking-widest text-foreground-muted">
            {new Date(post.publishedAt).toLocaleDateString(locale, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {post.authorName ? ` · ${post.authorName}` : ""}
          </p>
          <h1 className="mt-4 text-section-title">{post.title}</h1>
          {post.excerpt && (
            <p className="mt-6 text-lg text-foreground-muted">{post.excerpt}</p>
          )}
        </header>

        <div className="mt-12 max-w-3xl">
          <BlogMarkdown markdown={post.bodyMarkdown} />
        </div>
      </article>
    </main>
  );
}
