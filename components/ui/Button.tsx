"use client";

import { forwardRef } from "react";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  MouseEventHandler,
  Ref,
} from "react";
import { Children } from "react";
import { cn } from "@/lib/utils";
import { useGoToSection } from "@/lib/useGoToSection";
import RollText from "@/components/ui/RollText";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "group/btn relative isolate inline-flex min-h-11 max-w-full items-center justify-center gap-2 overflow-hidden text-sm font-medium transition-[color,transform,border-color] duration-500 ease-out-expo active:scale-[0.97] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none motion-reduce:active:scale-100 " +
  // riempimento che sale dal basso all'hover
  "before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:transition-transform before:duration-500 before:ease-out-expo hover:before:scale-y-100 motion-reduce:before:transition-none " +
  // icone (frecce) che scattano in avanti
  "[&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-500 [&_svg]:ease-out-expo hover:[&_svg]:translate-x-1";

const variants: Record<Variant, string> = {
  primary: "bg-foreground px-7 text-white before:bg-accent",
  secondary:
    "border border-foreground px-7 text-foreground before:bg-foreground hover:text-white",
  ghost: "text-foreground hover:text-accent before:hidden",
};

/** Le etichette testuali brevi rotolano all'hover; icone e altro restano invariati. */
function renderChildren(children: React.ReactNode) {
  return Children.map(children, (c) =>
    typeof c === "string" ? <RollText text={c} /> : c
  );
}

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
        {renderChildren(children)}
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
      {renderChildren(children)}
    </button>
  );
});