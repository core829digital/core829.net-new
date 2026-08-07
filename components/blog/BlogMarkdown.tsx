import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Rendering Markdown per il blog (client component: react-markdown è ESM).
 * GFM abilitato (tabelle, checklist, strikethrough). Stile coerente con
 * il design system CORE829 (titoli, paragrafi, codice, link, liste).
 */
export default function BlogMarkdown({ markdown }: { markdown: string }) {
  return (
    <div className="prose-core829">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
}
