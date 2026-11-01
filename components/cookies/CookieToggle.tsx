"use client";

import { cn } from "@/lib/utils";

interface CookieToggleProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label: string;
}

/**
 * Switch accessibile per una categoria di cookie. Quando `disabled` è true
 * (cookie strettamente necessari) è visivamente "acceso" ma non interagibile.
 */
export default function CookieToggle({
  checked,
  onChange,
  disabled,
  label,
}: CookieToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-300",
        checked
          ? "border-accent bg-accent"
          : "border-border bg-background",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow transition-all duration-300",
          checked ? "left-[1.625rem]" : "left-1"
        )}
      />
    </button>
  );
}
