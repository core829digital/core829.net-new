"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  MouseEventHandler,
  Ref,
} from "react";
import { useGoToSection } from "@/lib/useGoToSection";

import { buttonClasses, type ButtonVariant as Variant, type ButtonTone as Tone } from "@/components/ui/buttonStyles";

export { buttonClasses };

interface CommonProps {
  className?: string;
  variant?: Variant;
  tone?: Tone;
  /** Mostra un indicatore di attività al posto dell'icona (azioni non istantanee). */
  loading?: boolean;
}

type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  CommonProps & { href: string };
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & CommonProps;

const isAnchor = (props: AnchorProps | ButtonProps): props is AnchorProps =>
  "href" in props;

export const Button = forwardRef<
  HTMLAnchorElement | HTMLButtonElement,
  AnchorProps | ButtonProps
>(function Button(
  { className, variant = "primary", tone = "light", loading = false, ...props },
  ref
) {
  const classes = buttonClasses(variant, className, tone);
  const goToSection = useGoToSection();

  if (isAnchor(props)) {
    const { href, target, onClick, children, ...rest } = props;
    const isHash = href.startsWith("#");
    const isExternal = href.startsWith("http");
    return (
      <a
        ref={ref as Ref<HTMLAnchorElement>}
        href={href}
        target={isExternal ? (target ?? "_blank") : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        onClick={(e) => {
          if (isHash) {
            e.preventDefault();
            goToSection(href);
          }
          onClick?.(e);
        }}
        className={classes}
        {...rest}
      >
        {children}
      </a>
    );
  }

  const {
    type = "button",
    children,
    onClick,
    ...rest
  } = props as ButtonProps;
  return (
    <button
      ref={ref as Ref<HTMLButtonElement>}
      type={type}
      onClick={onClick as MouseEventHandler<HTMLButtonElement> | undefined}
      className={classes}
      aria-busy={loading || undefined}
      {...rest}
      disabled={loading || rest.disabled}
    >
      {loading && (
        <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />
      )}
      {children}
    </button>
  );
});