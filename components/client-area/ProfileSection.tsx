"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Download,
  Camera,
  User as UserIcon,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Profilo utente completo (area clienti):
 * - Foto profilo (upload via storage Convex)
 * - Nome e cognome, azienda, partita IVA, paese, telefono
 * - Export dei propri dati (RGPD)
 */
export default function ProfileSection() {
  const t = useTranslations("clientArea");
  const me = useQuery(api.users.getMyUser);
  const updateProfile = useMutation(api.users.updateProfile);
  const updateProfileImage = useMutation(api.users.updateProfileImage);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const exportMyData = useMutation(api.users.exportMyData);

  const [status, setStatus] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [imgBusy, setImgBusy] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);
  const [exportError, setExportError] = useState(false);

  if (!me) {
    return (
      <p className="flex items-center gap-2 text-sm text-foreground-muted">
        <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden />
        {t("loading")}
      </p>
    );
  }

  const profile = me.profile;
  const profileImageId = profile?.profileImageId;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setStatus("busy");
    try {
      await updateProfile({
        firstName: String(f.get("firstName") ?? "").trim() || undefined,
        lastName: String(f.get("lastName") ?? "").trim() || undefined,
        company: String(f.get("company") ?? "").trim() || undefined,
        vatNumber: String(f.get("vatNumber") ?? "").trim() || undefined,
        country: String(f.get("country") ?? "").trim() || undefined,
        contactPhone: String(f.get("contactPhone") ?? "").trim() || undefined,
        onboardingCompleted: true,
      });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgBusy(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, { method: "POST", body: file });
      const { storageId } = (await result.json()) as { storageId: string };
      await updateProfileImage({ imageId: storageId as never });
    } catch {
      // errore gestito silenziosamente: l'utente può riprovare
    } finally {
      setImgBusy(false);
      e.target.value = "";
    }
  };

  const onExport = async () => {
    setExportBusy(true);
    setExportError(false);
    try {
      const data = await exportMyData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `core829-dati-${me.user.email ?? "utente"}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportError(true);
    } finally {
      setExportBusy(false);
    }
  };

  return (
    <section className="space-y-8">
      <ProfileImage
        imageId={profileImageId}
        name={profile?.firstName || me.user.name || ""}
        busy={imgBusy}
        onChange={onImageChange}
        t={t}
      />

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="pf-first" className="tech-label block">
              {t("firstName")}
            </label>
            <input
              id="pf-first"
              name="firstName"
              type="text"
              maxLength={60}
              autoComplete="given-name"
              defaultValue={profile?.firstName ?? ""}
              className="input-core829 mt-2"
            />
          </div>
          <div>
            <label htmlFor="pf-last" className="tech-label block">
              {t("lastName")}
            </label>
            <input
              id="pf-last"
              name="lastName"
              type="text"
              maxLength={60}
              autoComplete="family-name"
              defaultValue={profile?.lastName ?? ""}
              className="input-core829 mt-2"
            />
          </div>
          <div>
            <label htmlFor="pf-company" className="tech-label block">
              {t("company")}
            </label>
            <input
              id="pf-company"
              name="company"
              type="text"
              maxLength={150}
              autoComplete="organization"
              defaultValue={profile?.company ?? ""}
              className="input-core829 mt-2"
            />
          </div>
          <div>
            <label htmlFor="pf-vat" className="tech-label block">
              {t("vatNumber")}
            </label>
            <input
              id="pf-vat"
              name="vatNumber"
              type="text"
              maxLength={50}
              defaultValue={profile?.vatNumber ?? ""}
              className="input-core829 mt-2"
            />
          </div>
          <div>
            <label htmlFor="pf-country" className="tech-label block">
              {t("country")}
            </label>
            <input
              id="pf-country"
              name="country"
              type="text"
              maxLength={80}
              autoComplete="country-name"
              defaultValue={profile?.country ?? ""}
              className="input-core829 mt-2"
            />
          </div>
          <div>
            <label htmlFor="pf-phone" className="tech-label block">
              {t("contactPhone")}
            </label>
            <input
              id="pf-phone"
              name="contactPhone"
              type="tel"
              maxLength={40}
              autoComplete="tel"
              defaultValue={profile?.contactPhone ?? ""}
              className="input-core829 mt-2"
            />
          </div>
        </div>

        <div>
          <p className="tech-label">{t("email")}</p>
          <p className="mt-1 text-sm text-foreground">{me.user.email}</p>
        </div>

        {status === "done" && (
          <p role="status" className="flex items-center gap-2 text-sm text-foreground">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" aria-hidden />
            {t("saved")}
          </p>
        )}
        {status === "error" && (
          <p role="alert" className="flex items-center gap-2 text-sm text-accent">
            <AlertCircle className="h-4 w-4" aria-hidden />
            {t("genericError")}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "busy"}
          className="inline-flex min-h-11 items-center justify-center gap-2 bg-foreground px-8 text-sm font-medium text-white transition-colors duration-300 hover:bg-accent disabled:opacity-60"
        >
          {status === "busy" && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          )}
          {t("saveProfile")}
        </button>
      </form>

      <section className="border-t border-border pt-8">
        <h3 className="text-base font-semibold">{t("dataTitle")}</h3>
        <p className="mt-1 text-sm text-foreground-muted">{t("dataHint")}</p>
        <button
          type="button"
          disabled={exportBusy}
          onClick={() => void onExport()}
          className="mt-4 inline-flex min-h-11 items-center gap-2 border border-foreground px-6 text-sm font-medium text-foreground transition-colors duration-300 hover:bg-foreground hover:text-white disabled:opacity-60"
        >
          {exportBusy ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Download className="h-4 w-4" aria-hidden />
          )}
          {t("exportData")}
        </button>
        {exportError && (
          <p role="alert" className="mt-2 flex items-center gap-2 text-sm text-accent">
            <AlertCircle className="h-4 w-4" aria-hidden />
            {t("genericError")}
          </p>
        )}
      </section>
    </section>
  );
}

function ProfileImage({
  imageId,
  name,
  busy,
  onChange,
  t,
}: {
  imageId?: string;
  name: string;
  busy: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  t: (key: string) => string;
}) {
  const imageUrl = useQuery(api.storage.getStorageUrl, {
    storageId: (imageId ?? undefined) as never,
  });

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20 overflow-hidden rounded-full border border-border bg-surface">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <UserIcon className="h-8 w-8 text-foreground-muted" aria-hidden />
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Loader2 className="h-5 w-5 animate-spin text-accent" aria-hidden />
          </div>
        )}
      </div>
      <label
        htmlFor="pf-avatar"
        className="inline-flex min-h-10 cursor-pointer items-center gap-2 border border-border px-4 text-sm font-medium text-foreground-muted transition-colors duration-300 hover:border-foreground hover:text-foreground"
      >
        <Camera className="h-4 w-4" aria-hidden />
        {t("changePhoto")}
      </label>
      <input
        id="pf-avatar"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={onChange}
        className="sr-only"
      />
    </div>
  );
}
