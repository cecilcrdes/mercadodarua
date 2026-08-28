import React, { useEffect, useRef, useState } from "react";
import { useApp } from "../state";

export const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(" ");

/* ============================= ícones (SVG próprio) ============================= */

type IconProps = { className?: string; sw?: number };
const S = ({ children, className, sw = 1.8 }: IconProps & { children: React.ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className ?? "w-5 h-5"}
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const IStore = (p: IconProps) => (
  <S {...p}>
    <path d="M3.5 9.5 5 4.5h14l1.5 5" />
    <path d="M3.5 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 2-.1" />
    <path d="M5 12v7.5h14V12" />
    <path d="M9.5 19.5v-4.5h5v4.5" />
  </S>
);
export const IBasket = (p: IconProps) => (
  <S {...p}>
    <path d="M4 9.5h16l-1.4 9a2 2 0 0 1-2 1.5H7.4a2 2 0 0 1-2-1.5L4 9.5Z" />
    <path d="m8 9.5 3-6M16 9.5l-3-6" />
    <path d="M9 13v3.5M12 13v3.5M15 13v3.5" />
  </S>
);
export const IPin = (p: IconProps) => (
  <S {...p}>
    <path d="M12 21s-6.5-5.4-6.5-10a6.5 6.5 0 0 1 13 0c0 4.6-6.5 10-6.5 10Z" />
    <circle cx="12" cy="10.6" r="2.3" />
  </S>
);
export const IBike = (p: IconProps) => (
  <S {...p}>
    <circle cx="6" cy="16.5" r="3.2" />
    <circle cx="18" cy="16.5" r="3.2" />
    <path d="M6 16.5 9.5 9h4l3 7.5M13.5 9H16m-6.5 0h3l2.5 4.5" />
  </S>
);
export const IStar = (p: IconProps) => (
  <S {...p}>
    <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1.1 5.8-5.3-2.8-5.3 2.8 1.1-5.8-4.3-4.1 5.9-.8L12 3.5Z" />
  </S>
);
export const IClock = (p: IconProps) => (
  <S {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </S>
);
export const IShield = (p: IconProps) => (
  <S {...p}>
    <path d="M12 3 5 5.8v5.4c0 4.6 3 7.7 7 9.3 4-1.6 7-4.7 7-9.3V5.8L12 3Z" />
    <path d="m9 11.5 2.2 2.2L15.5 9" />
  </S>
);
export const ILock = (p: IconProps) => (
  <S {...p}>
    <rect x="5.5" y="10.5" width="13" height="9.5" rx="2" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    <path d="M12 14.5v2" />
  </S>
);
export const IChart = (p: IconProps) => (
  <S {...p}>
    <path d="M4 20V4" />
    <path d="M4 20h16" />
    <path d="M8.5 16.5v-5M13 16.5V7.5M17.5 16.5v-3" />
  </S>
);
export const IGear = (p: IconProps) => (
  <S {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M18 6l-1.6 1.6M7.6 16.4 6 18M18 18l-1.6-1.6M7.6 7.6 6 6" />
  </S>
);
export const IPlus = (p: IconProps) => (
  <S {...p}>
    <path d="M12 5.5v13M5.5 12h13" />
  </S>
);
export const IMinus = (p: IconProps) => (
  <S {...p}>
    <path d="M5.5 12h13" />
  </S>
);
export const ITrash = (p: IconProps) => (
  <S {...p}>
    <path d="M5 7h14M9.5 7V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v2M6.5 7l1 12.2a1.8 1.8 0 0 0 1.8 1.3h5.4a1.8 1.8 0 0 0 1.8-1.3l1-12.2" />
    <path d="M10 11v5M14 11v5" />
  </S>
);
export const ICheck = (p: IconProps) => (
  <S {...p}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </S>
);
export const IX = (p: IconProps) => (
  <S {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </S>
);
export const ISearch = (p: IconProps) => (
  <S {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </S>
);
export const IArrowLeft = (p: IconProps) => (
  <S {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </S>
);
export const IChevron = (p: IconProps) => (
  <S {...p}>
    <path d="m6 9.5 6 6 6-6" />
  </S>
);
export const IPhone = (p: IconProps) => (
  <S {...p}>
    <path d="M7.5 3.5h-2a2 2 0 0 0-2 2.2c.4 7.6 6.8 14 14.3 14.3a2 2 0 0 0 2.2-2v-2.1l-4-1.7-1.8 1.9c-2.6-1-4.6-3-5.6-5.6l1.9-1.8-1.7-4Z" />
    <path d="m4.5 20.5 15-15" />
  </S>
);
export const ICard = (p: IconProps) => (
  <S {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path d="M3 10h18M7 14.5h4" />
  </S>
);
export const IPix = (p: IconProps) => (
  <S {...p}>
    <path d="M12 3.5 20.5 12 12 20.5 3.5 12 12 3.5Z" />
    <path d="M9 9.5c1 0 2 .5 3 1.5s2 1.5 3 1.5M9 14.5c1 0 2-.5 3-1.5" />
  </S>
);
export const ICash = (p: IconProps) => (
  <S {...p}>
    <rect x="3" y="6.5" width="18" height="11" rx="1.8" />
    <circle cx="12" cy="12" r="2.6" />
    <path d="M6 9.5v.01M18 14.5v.01" />
  </S>
);
export const IBox = (p: IconProps) => (
  <S {...p}>
    <path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4v-9Z" />
    <path d="M3.5 7.5 12 11.5l8.5-4M12 11.5v9" />
  </S>
);
export const IUsers = (p: IconProps) => (
  <S {...p}>
    <circle cx="9" cy="8.5" r="3.2" />
    <path d="M3.5 19.5c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" />
    <path d="M15.5 5.8a3.2 3.2 0 0 1 0 5.4M17.5 14.9c1.6.7 2.7 2.2 3 4.6" />
  </S>
);
export const IEye = (p: IconProps) => (
  <S {...p}>
    <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.8" />
  </S>
);
export const IReceipt = (p: IconProps) => (
  <S {...p}>
    <path d="M6 3.5h12V20l-2.4-1.5-2.4 1.5-2.4-1.5L8.4 20l-2.4-1.5V3.5Z" />
    <path d="M9 8h6M9 11.5h6M9 15h3.5" />
  </S>
);
export const IDownload = (p: IconProps) => (
  <S {...p}>
    <path d="M12 4v10M8 10.5l4 4 4-4" />
    <path d="M4.5 19.5h15" />
  </S>
);
export const IRadar = (p: IconProps) => (
  <S {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <path d="M12 12v.01M12 12l5.5-6" />
  </S>
);
export const IAlert = (p: IconProps) => (
  <S {...p}>
    <path d="M12 4 2.8 19.5h18.4L12 4Z" />
    <path d="M12 10v4M12 16.8v.01" />
  </S>
);
export const ISplit = (p: IconProps) => (
  <S {...p}>
    <path d="M4 12h5c3 0 3-5 6-5h5M4 12h5c3 0 3 5 6 5h5" />
    <path d="m17.5 4.5 2.5 2.5-2.5 2.5M17.5 14.5l2.5 2.5-2.5 2.5" />
  </S>
);
export const ILeaf = (p: IconProps) => (
  <S {...p}>
    <path d="M5.5 18.5C5 10 10.5 4.5 19.5 4.5c.5 9-4.5 14.5-13 14Z" />
    <path d="M4.5 20c3-5.5 7-9.5 11-11.5" />
  </S>
);
export const IWheat = (p: IconProps) => (
  <S {...p}>
    <path d="M12 21V9" />
    <path d="M12 9c-3 0-4.5-1.8-4.5-4.5C10.5 4.5 12 6.3 12 9ZM12 9c3 0 4.5-1.8 4.5-4.5C13.5 4.5 12 6.3 12 9ZM12 14c-3 0-4.7-1.6-5-4.5 3.3.2 5 1.8 5 4.5ZM12 14c3 0 4.7-1.6 5-4.5-3.3.2-5 1.8-5 4.5ZM12 19c-3 0-4.7-1.6-5-4.5 3.3.2 5 1.8 5 4.5ZM12 19c3 0 4.7-1.6 5-4.5-3.3.2-5 1.8-5 4.5Z" />
  </S>
);
export const IMeat = (p: IconProps) => (
  <S {...p}>
    <path d="M14.5 4.5c3.5 0 6 2.4 6 5.5 0 4.5-5 9.5-10 9.5-3.2 0-7-2.3-7-6 0-2.8 2.4-4.6 5-5 2.2-.3 3.2-4 6-4Z" />
    <circle cx="15" cy="9.5" r="1.8" />
  </S>
);
export const IMilk = (p: IconProps) => (
  <S {...p}>
    <path d="M9 3.5h6M9.5 3.5v2.5L7.5 9.5v10A1.5 1.5 0 0 0 9 21h6a1.5 1.5 0 0 0 1.5-1.5v-10l-2-3.5V3.5" />
    <path d="M7.5 13c2-1.5 4.5 1.5 6.5 0s2.5-.5 2.5-.5" />
  </S>
);
export const ICup = (p: IconProps) => (
  <S {...p}>
    <path d="M6 4.5h12l-1.2 15a1.5 1.5 0 0 1-1.5 1.4H8.7a1.5 1.5 0 0 1-1.5-1.4L6 4.5Z" />
    <path d="M6.5 9h11" />
  </S>
);
export const IJar = (p: IconProps) => (
  <S {...p}>
    <rect x="7" y="3.5" width="10" height="3" rx="1" />
    <path d="M8 6.5h8l1 3v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9l1-3Z" />
    <path d="M7 13h10" />
  </S>
);
export const ISpray = (p: IconProps) => (
  <S {...p}>
    <path d="M8.5 10h7l.5 9.5a1 1 0 0 1-1 1.5H9a1 1 0 0 1-1-1.5L8.5 10Z" />
    <path d="M9.5 10V7.5h5V10M10.5 7.5V5h3v2.5M17 4.5h.01M19 6.5h.01M19 3h.01" />
  </S>
);
export const ISoap = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="9" width="12" height="9" rx="2.5" />
    <circle cx="17.5" cy="6" r="1.4" />
    <circle cx="20" cy="10" r="1" />
    <path d="M8 13h4" />
  </S>
);
export const ISpinner = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={cx(p.className ?? "w-5 h-5", "animate-spin")} aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const CATEGORY_ICON: Record<string, (p: IconProps) => React.ReactElement> = {
  Hortifruti: ILeaf,
  Padaria: IWheat,
  Açougue: IMeat,
  Laticínios: IMilk,
  Bebidas: ICup,
  Mercearia: IJar,
  Limpeza: ISpray,
  Higiene: ISoap,
};

export const CATEGORY_TONE: Record<string, string> = {
  Hortifruti: "bg-[#e2efd8] text-[#2f7a48]",
  Padaria: "bg-[#f8e7c4] text-[#a86e08]",
  Açougue: "bg-[#f6dcd2] text-[#b44a2e]",
  Laticínios: "bg-[#e0ebf4] text-[#33688a]",
  Bebidas: "bg-[#d9ece7] text-[#106c63]",
  Mercearia: "bg-[#ece5d2] text-[#6b5b33]",
  Limpeza: "bg-[#ddecf3] text-[#2c6e8f]",
  Higiene: "bg-[#f2e2ea] text-[#a14e76]",
};

/* ============================= primitivos ============================= */

export function Btn({
  children,
  onClick,
  kind = "primary",
  className,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  kind?: "primary" | "sun" | "ghost" | "danger" | "dark";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-lg px-4 py-2.5 text-sm transition select-none disabled:opacity-45 disabled:pointer-events-none";
  const kinds = {
    primary: "btn-hard bg-moss-800 text-sun-200 hover:bg-moss-700",
    sun: "btn-hard bg-sun-400 text-ink hover:bg-sun-300",
    dark: "btn-hard bg-ink text-paper hover:bg-moss-900",
    ghost: "border border-line bg-card hover:border-moss-400 hover:bg-moss-50 text-ink",
    danger: "bg-clay-500 text-card hover:bg-clay-600 shadow-[0_3px_0_#7c2f18] active:translate-y-0.5",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cx(base, kinds[kind], className)}>
      {children}
    </button>
  );
}

export function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-2.5 py-0.5 text-xs font-medium text-inksoft",
        className
      )}
    >
      {children}
    </span>
  );
}

export function Monogram({ initials, className }: { initials: string; className?: string }) {
  return (
    <div
      className={cx(
        "grid place-items-center rounded-xl bg-moss-800 font-display font-bold text-sun-300 tracking-tight",
        className ?? "w-12 h-12 text-lg"
      )}
    >
      {initials}
    </div>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label ?? "alternar"}
      onClick={() => onChange(!on)}
      className={cx(
        "relative h-6 w-11 rounded-full transition-colors duration-200 shrink-0",
        on ? "bg-moss-600" : "bg-ink/20"
      )}
    >
      <span
        className={cx(
          "absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-all duration-200",
          on ? "left-[22px]" : "left-0.5"
        )}
      />
    </button>
  );
}

export function Modal({
  open,
  onClose,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-moss-900/60 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={cx(
          "anim-scale relative w-full rounded-t-2xl sm:rounded-2xl bg-card shadow-lift max-h-[92vh] overflow-y-auto",
          wide ? "sm:max-w-2xl" : "sm:max-w-md"
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  sub,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="anim-fadeUp flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-moss-300 bg-moss-50/60 px-6 py-12 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-card text-moss-600 shadow-sm">{icon}</div>
      <p className="font-display text-lg font-bold text-ink">{title}</p>
      {sub && <p className="max-w-sm text-sm text-inksoft">{sub}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-left">
      <span className="mb-1 flex items-baseline justify-between text-xs font-bold uppercase tracking-wide text-inksoft">
        {label}
        {hint && <em className="font-medium normal-case tracking-normal text-inksoft/70 not-italic">{hint}</em>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs font-semibold text-clay-600">{error}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-inksoft/60 outline-none transition focus:border-moss-500 focus:bg-card focus:ring-2 focus:ring-moss-200";

/* ============================= toasts ============================= */

export function Toasts() {
  const { state } = useApp();
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[90] flex w-[min(92vw,360px)] flex-col gap-2">
      {state.toasts.map((t) => (
        <div
          key={t.id}
          className={cx(
            "anim-pop pointer-events-auto flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm font-semibold shadow-lift",
            t.kind === "ok" && "border-moss-300 bg-moss-800 text-sun-100",
            t.kind === "info" && "border-sun-300 bg-sun-100 text-ink",
            t.kind === "warn" && "border-clay-500/40 bg-clay-100 text-clay-600"
          )}
        >
          <span className="mt-0.5 shrink-0">
            {t.kind === "ok" ? <ICheck className="h-4 w-4" /> : t.kind === "info" ? <IBike className="h-4 w-4" /> : <IAlert className="h-4 w-4" />}
          </span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

/* ============================= reveal on scroll ============================= */

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={cx("reveal", inView && "is-in", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ============================= gráficos ============================= */

export function MiniBars({ data, labels, className }: { data: number[]; labels?: string[]; className?: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className={cx("flex items-end gap-1.5", className)}>
      {data.map((v, i) => (
        <div key={i} className="group flex flex-1 flex-col items-center gap-1">
          <span className="text-[10px] font-bold text-inksoft opacity-0 transition group-hover:opacity-100">
            {Math.round(v / 100) / 10}k
          </span>
          <div
            className="w-full rounded-t-md bg-moss-500 transition-all duration-500 group-hover:bg-sun-500"
            style={{ height: `${Math.max(6, (v / max) * 100)}%` }}
            title={labels?.[i]}
          />
          {labels && <span className="text-[10px] font-semibold text-inksoft">{labels[i]}</span>}
        </div>
      ))}
    </div>
  );
}

export function AreaChart({ data, labels }: { data: number[]; labels: string[] }) {
  const w = 560;
  const h = 150;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => [ (i / (data.length - 1)) * (w - 20) + 10, h - 14 - (v / max) * (h - 40) ]);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0]},${h - 8} L${pts[0][0]},${h - 8} Z`;
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        <defs>
          <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#35794a" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#35794a" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="10" x2={w - 10} y1={h - 14 - f * (h - 40)} y2={h - 14 - f * (h - 40)} stroke="#1b2a20" strokeOpacity="0.08" strokeDasharray="4 5" />
        ))}
        <path d={area} fill="url(#gArea)" />
        <path d={line} fill="none" stroke="#184e2e" strokeWidth="2.5" strokeLinecap="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="3.4" fill="#ffc41f" stroke="#184e2e" strokeWidth="1.6" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between px-1 text-[11px] font-semibold text-inksoft">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
}

export function HBars({ items, format }: { items: { label: string; value: number; sub?: string }[]; format: (v: number) => string }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={it.label}>
          <div className="mb-1 flex items-baseline justify-between text-sm">
            <span className="font-bold text-ink">{it.label}</span>
            <span className="font-display font-bold text-moss-700">
              {format(it.value)}
              {it.sub && <span className="ml-1.5 text-xs font-medium text-inksoft">{it.sub}</span>}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-moss-100">
            <div
              className="h-full rounded-full bg-moss-600 transition-all duration-700"
              style={{ width: `${(it.value / max) * 100}%`, transitionDelay: `${i * 70}ms` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  icon,
  tone = "card",
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  tone?: "card" | "dark" | "sun";
}) {
  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-xl border p-4 transition hover:-translate-y-0.5 hover:shadow-lift",
        tone === "card" && "border-line bg-card",
        tone === "dark" && "border-moss-900 bg-moss-800 text-sun-100",
        tone === "sun" && "border-sun-500/50 bg-sun-100"
      )}
    >
      <div className="flex items-start justify-between">
        <p className={cx("text-[11px] font-bold uppercase tracking-wider", tone === "dark" ? "text-sun-200/80" : "text-inksoft")}>
          {label}
        </p>
        {icon && <span className={tone === "dark" ? "text-sun-300" : "text-moss-500"}>{icon}</span>}
      </div>
      <p className="mt-1 font-display text-[26px] font-extrabold leading-none tracking-tight">{value}</p>
      {sub && <p className={cx("mt-1.5 text-xs font-medium", tone === "dark" ? "text-sun-200/70" : "text-inksoft")}>{sub}</p>}
    </div>
  );
}
