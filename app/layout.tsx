export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Il root layout è un pass-through: <html> e <body> vivono nel layout di locale
  // (pattern richiesto da next-intl per l'impostazione di lang/dir).
  return children;
}
