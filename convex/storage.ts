import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Storage Convex per immagini profilo e copertine blog.
 * generateUploadUrl: mutation pubblica autenticata (Convex chiede un utente
 * connesso per generare URL di upload). Il risultato va usato dal client
 * con un upload HTTP diretto (POST) prima di salvare lo storage id.
 */
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * URL pubblico per uno storage id (opzionale: null se assente). Convex firma
 * l'URL con scadenza e l'id di storage è univoco e non indovinabile: esporlo
 * non è un problema di sicurezza. Usato per avatar e copertine blog.
 */
export const getStorageUrl = query({
  args: { storageId: v.optional(v.id("_storage")) },
  handler: async (ctx, { storageId }) => {
    if (!storageId) {
      return null;
    }
    return await ctx.storage.getUrl(storageId);
  },
});
