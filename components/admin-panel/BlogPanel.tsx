"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  ArrowLeft,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { Doc } from "@/convex/_generated/dataModel";

/**
 * Gestione blog (admin/superadmin): elenco post, creazione/modifica in
 * Markdown, cover image, pubblicazione/archiviazione ed eliminazione.
 */
export default function BlogPanel() {
  const t = useTranslations("adminPanel");
  const posts = useQuery(api.blog.listAllPosts);
  const [editing, setEditing] = useState<Id<"blogPosts"> | null>(null);
  const [creating, setCreating] = useState(false);

  if (creating) {
    return <PostEditor onCancel={() => setCreating(false)} />;
  }
  if (editing) {
    return <PostEditor postId={editing} onCancel={() => setEditing(null)} />;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
          <div>
            <h3 className="text-base font-semibold">{t("blog.title")}</h3>
            <p className="mt-1 text-sm text-foreground-muted">{t("blog.hint")}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex min-h-11 items-center gap-2 bg-foreground px-6 text-sm font-medium text-white transition-colors duration-300 hover:bg-accent"
        >
          <Plus className="h-4 w-4" aria-hidden />
          {t("blog.create")}
        </button>
      </div>

      {!posts ? (
        <p className="flex items-center gap-2 text-sm text-foreground-muted">
          <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden />
          {t("blog.loading")}
        </p>
      ) : posts.length === 0 ? (
        <p className="border border-border p-6 text-sm text-foreground-muted">
          {t("blog.empty")}
        </p>
      ) : (
        <ul className="divide-y divide-border border border-border">
          {posts.map((post) => (
            <li key={post._id} className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div className="min-w-0">
                <p className="font-medium text-foreground">{post.title}</p>
                <p className="mt-1 truncate text-sm text-foreground-muted">
                  /blog/{post.slug}
                </p>
                <p className="mt-1 text-xs text-foreground-muted">
                  {new Date(post.createdAt).toLocaleString()}
                  {" · "}
                  {post.status === "published" ? t("blog.published") : t("blog.draft")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(post._id)}
                  className="inline-flex min-h-10 items-center gap-2 border border-border px-4 text-sm font-medium text-foreground-muted transition-colors duration-300 hover:border-foreground hover:text-foreground"
                >
                  {t("blog.edit")}
                </button>
                <PublishToggle post={post} />
                <DeletePost post={post} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function PublishToggle({ post }: { post: Doc<"blogPosts"> }) {
  const t = useTranslations("adminPanel");
  const publish = useMutation(api.blog.publishPost);
  const unpublish = useMutation(api.blog.unpublishPost);
  const [busy, setBusy] = useState(false);

  const published = post.status === "published";

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => {
        setBusy(true);
        void (published ? unpublish({ postId: post._id }) : publish({ postId: post._id }))
          .catch(() => undefined)
          .finally(() => setBusy(false));
      }}
      className={`inline-flex min-h-10 items-center gap-2 border px-4 text-sm font-medium transition-colors duration-300 disabled:opacity-60 ${
        published
          ? "border-foreground text-foreground hover:bg-foreground hover:text-white"
          : "border-accent text-accent hover:bg-accent hover:text-white"
      }`}
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : published ? (
        <EyeOff className="h-4 w-4" aria-hidden />
      ) : (
        <Eye className="h-4 w-4" aria-hidden />
      )}
      {published ? t("blog.unpublish") : t("blog.publish")}
    </button>
  );
}

function DeletePost({ post }: { post: Doc<"blogPosts"> }) {
  const t = useTranslations("adminPanel");
  const deletePost = useMutation(api.blog.deletePost);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex min-h-10 items-center gap-2 border border-accent px-4 text-sm font-medium text-accent transition-colors duration-300 hover:bg-accent hover:text-white"
      >
        <Trash2 className="h-4 w-4" aria-hidden />
        {t("blog.delete")}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          void deletePost({ postId: post._id })
            .catch(() => undefined)
            .finally(() => {
              setBusy(false);
              setConfirming(false);
            });
        }}
        className="inline-flex min-h-10 items-center gap-2 bg-accent px-4 text-sm font-medium text-white transition-colors duration-300 hover:bg-foreground disabled:opacity-60"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {t("blog.confirmDelete")}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="link-ghost text-sm"
      >
        {t("users.cancel")}
      </button>
    </div>
  );
}

function PostEditor({
  postId,
  onCancel,
}: {
  postId?: Id<"blogPosts">;
  onCancel: () => void;
}) {
  const t = useTranslations("adminPanel");
  const existing = useQuery(
    api.blog.getPost,
    postId ? { postId } : "skip"
  );
  const create = useMutation(api.blog.createPost);
  const update = useMutation(api.blog.updatePost);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [bodyMarkdown, setBodyMarkdown] = useState("");
  const [coverImageId, setCoverImageId] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: "ok" | "err";
    msg: string;
  } | null>(null);

  // Hydrate dal post esistente quando arriva (editing).
  const [hydrated, setHydrated] = useState(false);
  if (existing && !hydrated) {
    setTitle(existing.title);
    setSlug(existing.slug);
    setExcerpt(existing.excerpt);
    setBodyMarkdown(existing.bodyMarkdown);
    setCoverImageId(existing.coverImageId ?? undefined);
    setHydrated(true);
  }

  const coverUrl = useQuery(api.storage.getStorageUrl, {
    storageId: (coverImageId ?? undefined) as never,
  });

  const onCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, { method: "POST", body: file });
      const { storageId } = (await result.json()) as { storageId: string };
      setCoverImageId(storageId);
    } catch {
      setFeedback({ kind: "err", msg: t("blog.error") });
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setFeedback(null);
    try {
      if (postId) {
        await update({
          postId,
          title: title.trim(),
          slug: slug.trim() || undefined,
          excerpt: excerpt.trim(),
          bodyMarkdown,
          coverImageId: coverImageId as never,
        });
      } else {
        await create({
          title: title.trim(),
          slug: slug.trim() || undefined,
          excerpt: excerpt.trim(),
          bodyMarkdown,
          coverImageId: coverImageId as never,
        });
      }
      setFeedback({ kind: "ok", msg: t("blog.saved") });
    } catch {
      setFeedback({ kind: "err", msg: t("blog.error") });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="border border-border bg-surface p-6 md:p-8">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold">
          {postId ? t("blog.editTitle") : t("blog.createTitle")}
        </h3>
        <button type="button" onClick={onCancel} className="link-ghost text-sm">
          <ArrowLeft className="mr-1 inline h-4 w-4" aria-hidden />
          {t("blog.back")}
        </button>
      </div>

      <form onSubmit={(e) => void submit(e)} className="mt-6 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="blog-title" className="tech-label block">
              {t("blog.titleLabel")}
            </label>
            <input
              id="blog-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
              className="input-core829 mt-2"
            />
          </div>
          <div>
            <label htmlFor="blog-slug" className="tech-label block">
              {t("blog.slugLabel")}
            </label>
            <input
              id="blog-slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              maxLength={200}
              placeholder={t("blog.slugPlaceholder")}
              className="input-core829 mt-2"
            />
          </div>
        </div>

        <div>
          <label htmlFor="blog-excerpt" className="tech-label block">
            {t("blog.excerptLabel")}
          </label>
          <textarea
            id="blog-excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            maxLength={500}
            required
            className="input-core829 mt-2 resize-y"
          />
        </div>

        <div>
          <p className="tech-label">{t("blog.coverLabel")}</p>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            {coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverUrl}
                alt={t("blog.coverAlt")}
                className="h-24 w-40 border border-border object-cover"
              />
            )}
            <label
              htmlFor="blog-cover"
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 border border-border px-4 text-sm font-medium text-foreground-muted transition-colors duration-300 hover:border-foreground hover:text-foreground"
            >
              <FileText className="h-4 w-4" aria-hidden />
              {t("blog.uploadCover")}
            </label>
            <input
              id="blog-cover"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => void onCoverChange(e)}
              className="sr-only"
            />
          </div>
        </div>

        <div>
          <label htmlFor="blog-body" className="tech-label block">
            {t("blog.bodyLabel")}
          </label>
          <textarea
            id="blog-body"
            value={bodyMarkdown}
            onChange={(e) => setBodyMarkdown(e.target.value)}
            rows={16}
            maxLength={100_000}
            required
            placeholder={t("blog.bodyPlaceholder")}
            className="input-core829 mt-2 resize-y font-mono"
          />
          <p className="mt-1 text-xs text-foreground-muted">{t("blog.markdownHint")}</p>
        </div>

        {feedback && (
          <p
            role={feedback.kind === "err" ? "alert" : "status"}
            className={`flex items-center gap-2 text-sm ${
              feedback.kind === "err" ? "text-accent" : "text-foreground"
            }`}
          >
            {feedback.kind === "err" ? (
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" aria-hidden />
            )}
            {feedback.msg}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex min-h-11 items-center gap-2 bg-foreground px-8 text-sm font-medium text-white transition-colors duration-300 hover:bg-accent disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {t("blog.save")}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="link-ghost text-sm"
          >
            {t("users.cancel")}
          </button>
        </div>
      </form>
    </section>
  );
}
