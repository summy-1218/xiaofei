import { clsx } from "clsx";
import { forwardRef } from "react";

// ── Button ────────────────────────────────────

type ButtonVariant = "primary" | "secondary" | "dark" | "ghost" | "link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const buttonStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-pressed disabled:bg-hairline disabled:text-muted",
  secondary: "bg-transparent text-ink border border-hairline-strong hover:bg-surface",
  dark: "bg-ink-deep text-white hover:opacity-90",
  ghost: "bg-transparent text-ink hover:bg-surface rounded-sm",
  link: "bg-transparent text-link-blue p-0 hover:text-link-blue-pressed",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(
        "inline-flex items-center justify-center rounded-md px-4.5 py-2.5 text-sm font-medium transition-colors duration-150",
        buttonStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = "Button";

// ── Card ──────────────────────────────────────

type CardTint = "default" | "peach" | "rose" | "mint" | "lavender" | "sky" | "yellow" | "yellow-bold" | "cream";

interface CardProps {
  tint?: CardTint;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  hover?: boolean;
}

const cardTintStyles: Record<CardTint, string> = {
  default: "bg-canvas border border-hairline",
  peach: "bg-card-peach text-charcoal",
  rose: "bg-card-rose text-charcoal",
  mint: "bg-card-mint text-charcoal",
  lavender: "bg-card-lavender text-charcoal",
  sky: "bg-card-sky text-charcoal",
  yellow: "bg-card-yellow text-charcoal",
  "yellow-bold": "bg-card-yellow-bold text-charcoal",
  cream: "bg-card-cream text-charcoal",
};

export function Card({ tint = "default", className, children, onClick, hover = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "rounded-lg p-xl",
        cardTintStyles[tint],
        hover && "cursor-pointer transition-all duration-200 hover:translate-y-[-2px] hover:shadow-card",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

// ── Badge ─────────────────────────────────────

type BadgeVariant = "purple" | "orange" | "tag-purple" | "tag-orange" | "tag-green";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const badgeStyles: Record<BadgeVariant, string> = {
  purple: "bg-primary text-white rounded-full",
  orange: "bg-brand-orange text-white rounded-full",
  "tag-purple": "bg-card-lavender text-brand-purple-800 rounded-sm text-[13px] px-2 py-0.5",
  "tag-orange": "bg-card-peach text-brand-orange-deep rounded-sm text-[13px] px-2 py-0.5",
  "tag-green": "bg-card-mint text-brand-green rounded-sm text-[13px] px-2 py-0.5",
};

export function Badge({ variant = "purple", children, className }: BadgeProps) {
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-[13px] font-semibold", badgeStyles[variant], className)}>
      {children}
    </span>
  );
}

// ── ProgressBar ───────────────────────────────

interface ProgressBarProps {
  value: number;
  className?: string;
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  return (
    <div className={clsx("h-1.5 overflow-hidden rounded-full bg-hairline", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#1a56db] to-[#60a5fa] transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

// ── PillTab ───────────────────────────────────

interface PillTabProps {
  active?: boolean;
  label: string;
  onClick?: () => void;
}

export function PillTab({ active, label, onClick }: PillTabProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "rounded-full border px-md py-xs text-sm font-medium transition-colors duration-150",
        active ? "bg-ink-deep text-white border-ink-deep" : "bg-transparent text-steel border-hairline hover:bg-surface"
      )}
    >
      {label}
    </button>
  );
}
