import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { sanitizeSingleLine, sanitizeText } from "./sanitize";
import { requireUser } from "./users";
import { rankOf } from "./roles";
import { logAdminAction } from "./admin";

const MAX_TITLE = 200;
const MAX_SLUG = 200;
const MAX_EXCERPT = 500;
const MAX_BODY = 100_000;

/** Trasforma un titolo in uno slug URL-safe (server-side). */
function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG);
  return base || "post";
}

function requireAdmin(user: { role?: string | null }) {
  if (rankOf(user.role) < rankOf("admin")) {
    throw new Error("Not authorized");
  }
}

/** Slug univoco con suffisso numerico in caso di collisione. */
async function uniqueSlug(
  ctx: { db: {
    query(table: "blogPosts"): any;
  } },
  base: string
): Promise<string> {
  const existing = await ctx.db
    .query("blogPosts")
    .withIndex("by_slug", (q: any) => q.eq("slug", base))
    .first();
  if (!existing) {
    return base;
  }
  for (let i = 2; i < 1000; i++) {
    const candidate = `${base}-${i}`;
    const clash = await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q: any) => q.eq("slug", candidate))
      .first();
    if (!clash) {
      return candidate;
    }
  }
  return `${base}-${Date.now()}`;
}

// ------------------------------ Scrittura (admin+) ------------------------------

export const createPost = mutation({
  args: {
    title: v.string(),
    slug: v.optional(v.string()),
    excerpt: v.string(),
    coverImageId: v.optional(v.id("_storage")),
    bodyMarkdown: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    requireAdmin(user);
    const title = sanitizeSingleLine(args.title, MAX_TITLE);
    const excerpt = sanitizeSingleLine(args.excerpt, MAX_EXCERPT);
    const bodyMarkdown = sanitizeText(args.bodyMarkdown, MAX_BODY, true);
    if (!title || !excerpt || !bodyMarkdown) {
      throw new Error("Missing required fields");
    }
    const requested = args.slug
      ? slugify(sanitizeSingleLine(args.slug, MAX_SLUG))
      : slugify(title);
    const slug = await uniqueSlug(ctx, requested);
    const now = Date.now();
    const postId = await ctx.db.insert("blogPosts", {
      title,
      slug,
      excerpt,
      coverImageId: args.coverImageId,
      bodyMarkdown,
      authorId: user._id,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
    await logAdminAction(ctx, {
      actor: user._id,
      action: "blog.create",
      details: slug,
    });
    return { postId, slug };
  },
});

export const updatePost = mutation({
  args: {
    postId: v.id("blogPosts"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    coverImageId: v.optional(v.id("_storage")),
    bodyMarkdown: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    requireAdmin(user);
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) {
      const title = sanitizeSingleLine(args.title, MAX_TITLE);
      if (!title) throw new Error("Invalid title");
      patch.title = title;
    }
    if (args.slug !== undefined) {
      const slug = await uniqueSlug(
        ctx,
        slugify(sanitizeSingleLine(args.slug, MAX_SLUG))
      );
      patch.slug = slug;
    }
    if (args.excerpt !== undefined) {
      const excerpt = sanitizeSingleLine(args.excerpt, MAX_EXCERPT);
      if (!excerpt) throw new Error("Invalid excerpt");
      patch.excerpt = excerpt;
    }
    if (args.coverImageId !== undefined) {
      patch.coverImageId = args.coverImageId;
    }
    if (args.bodyMarkdown !== undefined) {
      const bodyMarkdown = sanitizeText(
        args.bodyMarkdown,
        MAX_BODY,
        true
      );
      if (!bodyMarkdown) throw new Error("Invalid body");
      patch.bodyMarkdown = bodyMarkdown;
    }
    await ctx.db.patch(args.postId, patch);
    await logAdminAction(ctx, {
      actor: user._id,
      action: "blog.update",
      details: post.slug,
    });
  },
});

export const publishPost = mutation({
  args: { postId: v.id("blogPosts") },
  handler: async (ctx, { postId }) => {
    const user = await requireUser(ctx);
    requireAdmin(user);
    const post = await ctx.db.get(postId);
    if (!post) {
      throw new Error("Post not found");
    }
    const now = Date.now();
    await ctx.db.patch(postId, {
      status: "published",
      publishedAt: post.publishedAt ?? now,
      updatedAt: now,
    });
    await logAdminAction(ctx, {
      actor: user._id,
      action: "blog.publish",
      details: post.slug,
    });
  },
});

export const unpublishPost = mutation({
  args: { postId: v.id("blogPosts") },
  handler: async (ctx, { postId }) => {
    const user = await requireUser(ctx);
    requireAdmin(user);
    const post = await ctx.db.get(postId);
    if (!post) {
      throw new Error("Post not found");
    }
    await ctx.db.patch(postId, {
      status: "draft",
      publishedAt: undefined,
      updatedAt: Date.now(),
    });
    await logAdminAction(ctx, {
      actor: user._id,
      action: "blog.unpublish",
      details: post.slug,
    });
  },
});

export const deletePost = mutation({
  args: { postId: v.id("blogPosts") },
  handler: async (ctx, { postId }) => {
    const user = await requireUser(ctx);
    requireAdmin(user);
    const post = await ctx.db.get(postId);
    if (!post) {
      throw new Error("Post not found");
    }
    await ctx.db.delete(postId);
    await logAdminAction(ctx, {
      actor: user._id,
      action: "blog.delete",
      details: post.slug,
    });
  },
});

// ------------------------------ Lettura (admin) ------------------------------

export const listAllPosts = query({
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    requireAdmin(user);
    return await ctx.db
      .query("blogPosts")
      .order("desc")
      .collect();
  },
});

export const getPost = query({
  args: { postId: v.id("blogPosts") },
  handler: async (ctx, { postId }) => {
    const user = await requireUser(ctx);
    requireAdmin(user);
    const post = await ctx.db.get(postId);
    if (!post) {
      return null;
    }
    const author = await ctx.db.get(post.authorId);
    return { ...post, authorName: author?.name ?? "" };
  },
});

// ------------------------------ Lettura (pubblica) ------------------------------

export const listPublishedPosts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_status_publishedAt", (q) =>
        q.eq("status", "published")
      )
      .order("desc")
      .take(Math.min(limit ?? 20, 50));
    return Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        return {
          _id: post._id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          coverImageId: post.coverImageId,
          publishedAt: post.publishedAt ?? post.createdAt,
          authorName: author?.name ?? "",
        };
      })
    );
  },
});

export const getPublishedPost = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const post = await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!post || post.status !== "published") {
      return null;
    }
    const author = await ctx.db.get(post.authorId);
    return {
      _id: post._id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      coverImageId: post.coverImageId,
      bodyMarkdown: post.bodyMarkdown,
      publishedAt: post.publishedAt ?? post.createdAt,
      updatedAt: post.updatedAt,
      authorName: author?.name ?? "",
    };
  },
});

export type { Id };
