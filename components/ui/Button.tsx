"use client";

import { forwardRef } from "react";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  MouseEventHandler,
  Ref,
} from "react";
import { cn } from "@/lib/utils";
import { smoothScrollTo } from "@/lib/scrollTo";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 text-sm font-medium transition-colors duration-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60 min-h-11";

const variants: Record<Variant, string> = {
  primary: "bg-foreground px-7 text-white hover:bg-accent",
  secondary:
    "border border-foreground px-7 text-foreground hover:bg-foreground hover:text-white",
  ghost: "text-foreground hover:text-accent",
};

interface CommonProps {
  className?: string;
  variant?: Variant;
}

type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  CommonProps & { href: string };
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & CommonProps;

const isAnchor = (props: AnchorProps | ButtonProps): props is AnchorProps =>
  "href" in props;

export const Button = forwardRef<
  HTMLAnchorElement | HTMLButtonElement,
  AnchorProps | ButtonProps
>(function Button({ className, variant = "primary", ...props }, ref) {
  const classes = cn(base, variants[variant], className);

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
            smoothScrollTo(href);
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
      {...rest}
    >
      {children}
    </button>
  );
});