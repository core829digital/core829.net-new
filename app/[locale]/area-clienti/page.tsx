import { redirect } from "@/i18n/navigation";

/**
 * L'area clienti è confluita nell'area riservata (punto di accesso unico):
 * login/registrazione, dashboard clienti e pannello interno vivono su
 * /area-riservata. Questa rotta reindirizza per compatibilità con vecchi link.
 */
export default async function AreaClientiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/area-riservata", locale });
}
