import React, { useState } from "react";
import { useApp, NEIGHBORHOODS, nextId, Role, ClientUser, VendorSession } from "../state";
import {
  cx, Btn, inputCls,
  IBasket, ICheck, IEye, IEyeOff, ILock, IPin, IShield, ISplit, IStore,
} from "../components/ui";
import { LegalModal } from "../components/Shell";
import { MarketScene } from "./Client";

/* ---------------- helpers ---------------- */

const maskPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

const maskCnpj = (v: string) =>
  v
    .replace(/\D/g, "")
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");

const isEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v.trim());

const prettyName = (email: string) =>
  email
    .split("@")[0]
    .split(/[._\-+]/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ") || "Cliente";

/* ---------------- primitivas de formulário ---------------- */

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-inksoft">{label}</span>
        {hint && <span className="text-[10px] font-semibold text-inksoft/70">{hint}</span>}
      </span>
      {children}
      {error && <span className="anim-fadeUp mt-1 block text-xs font-bold text-clay-600">{error}</span>}
    </label>
  );
}

const fieldCls = (invalid?: boolean) =>
  cx(inputCls, invalid && "border-clay-500 focus:border-clay-500 ring-2 ring-clay-500/15");

function PasswordInput({
  value,
  onChange,
  invalid,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        className={cx(fieldCls(invalid), "pr-11")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="mínimo 6 caracteres"
        autoComplete={autoComplete ?? "current-password"}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-0 grid w-11 place-items-center text-inksoft transition hover:text-moss-700"
        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
      >
        {show ? <IEyeOff className="h-5 w-5" /> : <IEye className="h-5 w-5" />}
      </button>
    </div>
  );
}

function CheckLine({
  checked,
  onChange,
  error,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className={cx(
          "flex w-full cursor-pointer items-start gap-2.5 rounded-lg border px-3.5 py-3 text-left transition",
          checked
            ? "border-moss-400 bg-moss-50"
            : error
              ? "border-clay-500 bg-clay-100/50"
              : "border-line bg-paper hover:border-moss-300"
        )}
      >
        <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span
          aria-hidden="true"
          className={cx(
            "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition",
            checked ? "border-moss-700 bg-moss-700 text-sun-200" : "border-inksoft/40 bg-card"
          )}
        >
          {checked && <ICheck className="h-3.5 w-3.5" sw={3.2} />}
        </span>
        <span className="text-xs font-semibold leading-relaxed text-ink/85">{children}</span>
      </label>
      {error && <p className="anim-fadeUp mt-1 text-xs font-bold text-clay-600">{error}</p>}
    </div>
  );
}

function Tabs({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { id: string; label: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-paper p-1" role="tablist">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={value === o.id}
          onClick={() => onChange(o.id)}
          className={cx(
            "rounded-lg px-3 py-2.5 text-sm font-extrabold transition",
            value === o.id ? "bg-moss-800 text-sun-200 shadow-sm" : "text-inksoft hover:bg-card hover:text-ink"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function LegalNote() {
  return (
    <p className="mt-6 flex items-start gap-2 rounded-lg border border-line bg-paper px-3.5 py-3 text-[11px] font-semibold leading-relaxed text-inksoft">
      <ILock className="mt-0.5 h-4 w-4 shrink-0 text-moss-600" />
      Protótipo de demonstração: qualquer credencial válida entra e a sessão fica salva apenas neste navegador. Em
      produção: TLS 1.3, senha com hash e dados mínimos por lei (LGPD).
    </p>
  );
}

/* ---------------- moldura compartilhada ---------------- */

function AuthFrame({ variant, children }: { variant: "client" | "vendor"; children: React.ReactNode }) {
  const { setModule } = useApp();
  const isClient = variant === "client";
  const bullets = isClient
    ? [
        "Mercados que já entregam na sua rua, com a equipe deles",
        "Checkout único com split automático entre as lojas",
        "Endereço e telefone protegidos por padrão (LGPD)",
      ]
    : [
        "Adesão R$ 0,00 — comissão de 8–12% somente sobre o que vender",
        "Entrega com a sua equipe: motoboy, bicicleta ou a pé",
        "Repasse D+1 automático via split direto no gateway",
      ];

  return (
    <section className="anim-fadeUp mx-auto max-w-6xl px-4 pt-8">
      <div className="grid overflow-hidden rounded-xl border border-line bg-card shadow-lift lg:grid-cols-[1.04fr_1fr]">
        <aside className={cx("relative flex flex-col overflow-hidden", isClient ? "bg-moss-800 text-paper" : "bg-sun-300 text-ink")}>
          <div className="awning-thin" />
          <div className="relative z-10 flex flex-1 flex-col gap-5 p-7 sm:p-9">
            <div className="flex items-center gap-3">
              <span
                className={cx(
                  "grid h-11 w-11 place-items-center rounded-xl shadow-lift",
                  isClient ? "bg-sun-400 text-ink" : "bg-ink text-sun-300"
                )}
              >
                {isClient ? <IBasket className="h-6 w-6" /> : <IStore className="h-6 w-6" />}
              </span>
              <div>
                <p className={cx("text-[11px] font-extrabold uppercase tracking-[0.16em]", isClient ? "text-sun-300" : "text-moss-700")}>
                  {isClient ? "Acesso do cliente" : "Área do parceiro"}
                </p>
                <p className={cx("text-xs font-semibold", isClient ? "text-moss-200" : "text-ink/70")}>
                  {isClient ? "compre de quem entrega na sua rua" : "onboarding zera-barreira"}
                </p>
              </div>
            </div>

            <h2 className="font-display text-3xl font-extrabold leading-[1.06] tracking-tight sm:text-[2.6rem]">
              {isClient ? (
                <>O bairro inteiro cabe na sua <span className="text-sun-300">sacola</span>.</>
              ) : (
                <>Seu mercadinho aberto para o <span className="underline decoration-moss-600 decoration-4 underline-offset-4">bairro todo</span>.</>
              )}
            </h2>
            <p className={cx("max-w-sm text-sm leading-relaxed", isClient ? "text-moss-100/90" : "text-ink/80")}>
              {isClient
                ? "Mercados e mercearias que você já conhece, entregando com a própria equipe — preço de balcão e entrega em minutos."
                : "Entre grátis, cadastre seus produtos em minutos e venda com a entrega que você já tem. A plataforma só ganha quando você ganha."}
            </p>

            <ul className="space-y-2.5">
              {bullets.map((b) => (
                <li key={b} className={cx("flex items-start gap-2.5 text-sm font-semibold", isClient ? "text-moss-100" : "text-ink/85")}>
                  <span
                    className={cx(
                      "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full",
                      isClient ? "bg-moss-600 text-sun-200" : "bg-moss-800 text-sun-300"
                    )}
                  >
                    <ICheck className="h-3 w-3" sw={3.2} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>

            {!isClient && (
              <div className="mt-1 w-fit -rotate-1 rounded-lg border border-ink/15 bg-card p-4 shadow-lift transition hover:rotate-0">
                <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-inksoft">
                  <ISplit className="h-3.5 w-3.5 text-moss-600" /> simulação de split — venda de R$ 100
                </p>
                <div className="mt-2 space-y-1 text-sm">
                  <p className="flex justify-between gap-6 font-semibold text-inksoft"><span>Sua loja recebe</span><span className="font-display font-extrabold text-moss-700">R$ 88,00</span></p>
                  <p className="flex justify-between gap-6 font-semibold text-inksoft"><span>Comissão da plataforma</span><span className="font-display font-extrabold text-ink">R$ 12,00</span></p>
                </div>
                <p className="mt-2 border-t border-dashed border-line pt-2 text-[10px] font-bold uppercase tracking-wider text-moss-600">
                  repasse D+1 • sem boleto, sem surpresa
                </p>
              </div>
            )}

            <button
              onClick={() => setModule(isClient ? "vendor" : "client")}
              className={cx(
                "mt-auto w-fit rounded-lg border px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider transition hover:-translate-y-0.5",
                isClient
                  ? "border-moss-500 text-sun-200 hover:bg-moss-700"
                  : "border-ink/25 text-ink hover:bg-sun-200"
              )}
            >
              {isClient ? "Tem um mercadinho? Área do parceiro →" : "Quer fazer compras? App do cliente →"}
            </button>
          </div>

          {isClient && (
            <div className="relative h-36 shrink-0 overflow-hidden sm:h-44">
              <MarketScene className="absolute inset-0 h-full w-full" />
              <div className="absolute inset-0 bg-gradient-to-b from-moss-800 via-moss-800/30 to-transparent" />
            </div>
          )}
        </aside>

        <div className="flex flex-col p-6 sm:p-9">{children}</div>
      </div>
    </section>
  );
}

/* ---------------- login do cliente ---------------- */

export function ClientLogin() {
  const { loginClient, toast } = useApp();
  const [tab, setTab] = useState("entrar");
  const [f, setF] = useState({ name: "", phone: "", email: "", password: "", neighborhood: "vm" });
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [legal, setLegal] = useState<{ open: boolean; tab: string }>({ open: false, tab: "termos" });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (tab === "criar") {
      if (f.name.trim().length < 3) errs.name = "Informe seu nome completo.";
      if (f.phone.replace(/\D/g, "").length < 10) errs.phone = "Telefone com DDD — usamos apenas número mascarado.";
    }
    if (!isEmail(f.email)) errs.email = "E-mail inválido.";
    if (f.password.length < 6) errs.password = "Senha com pelo menos 6 caracteres.";
    if (tab === "criar" && !agree) errs.agree = "Para criar a conta é preciso aceitar os termos (LGPD).";
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast("Revise os campos destacados para continuar", "warn");
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      const user: ClientUser =
        tab === "entrar"
          ? { id: nextId(), name: prettyName(f.email), email: f.email.trim(), phone: "", neighborhood: null, createdAt: Date.now() }
          : { id: nextId(), name: f.name.trim(), email: f.email.trim(), phone: f.phone, neighborhood: f.neighborhood, createdAt: Date.now() };
      loginClient(user);
      toast(
        tab === "entrar"
          ? `Bem-vindo(a) de volta, ${user.name.split(" ")[0]}!`
          : `Conta criada — boas compras, ${user.name.split(" ")[0]}! Consentimento registrado.`,
        "ok"
      );
    }, 900);
  };

  const demo = () => {
    setBusy(true);
    window.setTimeout(() => {
      loginClient({
        id: "demo-client",
        name: "Dona Maria",
        email: "maria@bairro.com",
        phone: "(11) 98765-4321",
        neighborhood: "vm",
        createdAt: Date.now(),
      });
      toast("Sessão demo iniciada — bem-vinda, Dona Maria!", "ok");
    }, 600);
  };

  return (
    <AuthFrame variant="client">
      <h3 className="font-display text-2xl font-extrabold text-ink">
        {tab === "entrar" ? "Entrar na sua conta" : "Criar conta grátis"}
      </h3>
      <p className="mt-1 text-sm font-semibold text-inksoft">
        {tab === "entrar"
          ? "Sua sacola, seus pedidos e seus mercados do bairro."
          : "Só o essencial: nome, contato e bairro. Nada de CPF."}
      </p>
      <div className="mt-5">
        <Tabs value={tab} onChange={(t) => { setTab(t); setErrors({}); }} options={[{ id: "entrar", label: "Entrar" }, { id: "criar", label: "Criar conta" }]} />
      </div>

      <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
        {tab === "criar" && (
          <>
            <Field label="Nome completo" error={errors.name}>
              <input className={fieldCls(!!errors.name)} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Maria da Silva" autoComplete="name" />
            </Field>
            <Field label="WhatsApp / telefone" hint="fica mascarado para as lojas" error={errors.phone}>
              <input className={fieldCls(!!errors.phone)} value={f.phone} onChange={(e) => set("phone", maskPhone(e.target.value))} placeholder="(11) 91234-5678" inputMode="tel" autoComplete="tel" />
            </Field>
          </>
        )}
        <Field label="E-mail" error={errors.email}>
          <input className={fieldCls(!!errors.email)} value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="voce@bairro.com" inputMode="email" autoComplete="email" />
        </Field>
        <Field label="Senha" error={errors.password}>
          <PasswordInput value={f.password} onChange={(v) => set("password", v)} invalid={!!errors.password} autoComplete={tab === "criar" ? "new-password" : "current-password"} />
        </Field>
        {tab === "criar" && (
          <>
            <Field label="Seu bairro" hint="usado para detectar mercados que entregam aí">
              <div className="relative">
                <select className={cx(inputCls, "appearance-none pr-9")} value={f.neighborhood} onChange={(e) => set("neighborhood", e.target.value)}>
                  {NEIGHBORHOODS.map((n) => (
                    <option key={n.id} value={n.id}>{n.name} — {n.zone}</option>
                  ))}
                </select>
                <IPin className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-moss-600" />
              </div>
            </Field>
            <CheckLine checked={agree} onChange={setAgree} error={errors.agree}>
              Li e aceito os{" "}
              <button type="button" className="font-extrabold text-moss-700 underline underline-offset-2" onClick={(e) => { e.preventDefault(); setLegal({ open: true, tab: "termos" }); }}>
                Termos de Uso
              </button>{" "}
              e a{" "}
              <button type="button" className="font-extrabold text-moss-700 underline underline-offset-2" onClick={(e) => { e.preventDefault(); setLegal({ open: true, tab: "privacidade" }); }}>
                Política de Privacidade
              </button>
              , autorizando o tratamento mínimo dos meus dados para entregas (LGPD).
            </CheckLine>
          </>
        )}

        <Btn type="submit" disabled={busy} className="w-full">
          {busy ? (<><Spinner /> {tab === "entrar" ? "Validando sessão…" : "Criando conta…"}</>) : tab === "entrar" ? "Entrar" : "Criar conta gratuita"}
        </Btn>
        <button
          type="button"
          onClick={demo}
          disabled={busy}
          className="w-full rounded-lg border border-dashed border-moss-400 bg-moss-50/60 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-moss-700 transition hover:-translate-y-0.5 hover:bg-moss-100"
        >
          Explorar com a conta demo — Dona Maria (Vila Madalena)
        </button>
      </form>

      <LegalNote />
      <LegalModal open={legal.open} tab={legal.tab} onClose={() => setLegal((l) => ({ ...l, open: false }))} setTab={(t) => setLegal((l) => ({ ...l, tab: t }))} />
    </AuthFrame>
  );
}

/* ---------------- login do vendedor ---------------- */

const ROLES: { id: Role; label: string; desc: string }[] = [
  { id: "gerente", label: "Gerente", desc: "Acesso total, inclusive repasses e dados bancários" },
  { id: "atendente", label: "Atendente", desc: "Pedidos e produtos — sem números financeiros" },
  { id: "entregador", label: "Entregador", desc: "Somente pedidos em entrega, com endereço liberado" },
];

export function VendorLogin() {
  const { state, loginVendor, registerStore, toast } = useApp();
  const [tab, setTab] = useState("entrar");
  const [f, setF] = useState({ storeId: "ze", email: "", password: "", storeName: "", cnpj: "", owner: "", neighborhood: "vm" });
  const [role, setRole] = useState<Role>("gerente");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [legal, setLegal] = useState<{ open: boolean; tab: string }>({ open: false, tab: "termos" });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (tab === "entrar") {
      if (!isEmail(f.email)) errs.email = "E-mail inválido.";
      if (f.password.length < 6) errs.password = "Senha com pelo menos 6 caracteres.";
    } else {
      if (f.storeName.trim().length < 3) errs.storeName = "Nome do estabelecimento obrigatório.";
      if (f.cnpj.replace(/\D/g, "").length !== 14) errs.cnpj = "CNPJ completo (14 dígitos) — validado na aprovação.";
      if (f.owner.trim().length < 3) errs.owner = "Nome do responsável obrigatório.";
      if (!isEmail(f.email)) errs.email = "E-mail inválido.";
      if (f.password.length < 6) errs.password = "Senha com pelo menos 6 caracteres.";
      if (!agree) errs.agree = "O cadastro exige aceite dos termos do vendedor (LGPD).";
    }
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast("Revise os campos destacados para continuar", "warn");
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      if (tab === "entrar") {
        const store = state.stores.find((s) => s.id === f.storeId) ?? state.stores[0];
        const user: VendorSession = {
          id: nextId(),
          storeId: store.id,
          name: store.owner,
          email: f.email.trim(),
          role,
          createdAt: Date.now(),
        };
        loginVendor(user);
        toast(`Sessão iniciada — ${store.name}, perfil ${ROLES.find((r) => r.id === role)?.label}`, "ok");
      } else {
        const storeId = registerStore({ name: f.storeName.trim(), owner: f.owner.trim(), neighborhood: f.neighborhood });
        loginVendor({
          id: nextId(),
          storeId,
          name: f.owner.trim(),
          email: f.email.trim(),
          role: "gerente",
          createdAt: Date.now(),
        });
        toast("Cadastro recebido! Loja em validação — enquanto isso, monte sua vitrine", "ok");
      }
    }, 900);
  };

  const demo = () => {
    setBusy(true);
    window.setTimeout(() => {
      loginVendor({
        id: "demo-vendor",
        storeId: "ze",
        name: "José Almeida",
        email: "ze@mercadinhodoze.com.br",
        role: "gerente",
        createdAt: Date.now(),
      });
      toast("Sessão iniciada como Gerente do Mercadinho do Zé", "ok");
    }, 600);
  };

  return (
    <AuthFrame variant="vendor">
      <h3 className="font-display text-2xl font-extrabold text-ink">
        {tab === "entrar" ? "Entrar no painel" : "Cadastrar meu mercadinho"}
      </h3>
      <p className="mt-1 text-sm font-semibold text-inksoft">
        {tab === "entrar"
          ? "Gestão de pedidos, vitrine, entrega e repasses."
          : "Grátis para sempre. A comissão só aparece quando você vende."}
      </p>
      <div className="mt-5">
        <Tabs
          value={tab}
          onChange={(t) => { setTab(t); setErrors({}); }}
          options={[{ id: "entrar", label: "Entrar" }, { id: "cadastrar", label: "Cadastrar loja" }]}
        />
      </div>

      <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
        {tab === "entrar" ? (
          <>
            <Field label="Mercadinho">
              <div className="relative">
                <select className={cx(inputCls, "appearance-none pr-9")} value={f.storeId} onChange={(e) => set("storeId", e.target.value)}>
                  {state.stores.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <IStore className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-moss-600" />
              </div>
            </Field>
            <Field label="E-mail do operador" error={errors.email}>
              <input className={fieldCls(!!errors.email)} value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="voce@loja.com.br" inputMode="email" autoComplete="email" />
            </Field>
            <Field label="Senha" error={errors.password}>
              <PasswordInput value={f.password} onChange={(v) => set("password", v)} invalid={!!errors.password} />
            </Field>
            <div>
              <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-inksoft">Perfil de acesso</span>
              <div className="space-y-2">
                {ROLES.map((r) => (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    aria-pressed={role === r.id}
                    className={cx(
                      "flex w-full items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left transition",
                      role === r.id ? "border-moss-600 bg-moss-50 shadow-sm" : "border-line bg-paper hover:border-moss-300"
                    )}
                  >
                    <span className={cx("grid h-4 w-4 shrink-0 place-items-center rounded-full border-2", role === r.id ? "border-moss-700" : "border-inksoft/40")}>
                      {role === r.id && <span className="anim-pop h-2 w-2 rounded-full bg-moss-700" />}
                    </span>
                    <span>
                      <span className="block text-sm font-extrabold text-ink">{r.label}</span>
                      <span className="block text-[11px] font-semibold text-inksoft">{r.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <Field label="Nome do estabelecimento" error={errors.storeName}>
              <input className={fieldCls(!!errors.storeName)} value={f.storeName} onChange={(e) => set("storeName", e.target.value)} placeholder="Mercearia da Esquina" autoComplete="organization" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="CNPJ" error={errors.cnpj}>
                <input className={fieldCls(!!errors.cnpj)} value={f.cnpj} onChange={(e) => set("cnpj", maskCnpj(e.target.value))} placeholder="12.345.678/0001-90" inputMode="numeric" />
              </Field>
              <Field label="Responsável" error={errors.owner}>
                <input className={fieldCls(!!errors.owner)} value={f.owner} onChange={(e) => set("owner", e.target.value)} placeholder="Nome do titular" autoComplete="name" />
              </Field>
            </div>
            <Field label="Bairro de atuação" hint="depois você amplia o raio no painel">
              <div className="relative">
                <select className={cx(inputCls, "appearance-none pr-9")} value={f.neighborhood} onChange={(e) => set("neighborhood", e.target.value)}>
                  {NEIGHBORHOODS.map((n) => (
                    <option key={n.id} value={n.id}>{n.name} — {n.zone}</option>
                  ))}
                </select>
                <IPin className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-moss-600" />
              </div>
            </Field>
            <Field label="E-mail" error={errors.email}>
              <input className={fieldCls(!!errors.email)} value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="contato@loja.com.br" inputMode="email" autoComplete="email" />
            </Field>
            <Field label="Senha" error={errors.password}>
              <PasswordInput value={f.password} onChange={(v) => set("password", v)} invalid={!!errors.password} autoComplete="new-password" />
            </Field>
            <CheckLine checked={agree} onChange={setAgree} error={errors.agree}>
              Li e aceito os{" "}
              <button type="button" className="font-extrabold text-moss-700 underline underline-offset-2" onClick={(e) => { e.preventDefault(); setLegal({ open: true, tab: "termos" }); }}>
                Termos de Uso do Vendedor
              </button>{" "}
              e a{" "}
              <button type="button" className="font-extrabold text-moss-700 underline underline-offset-2" onClick={(e) => { e.preventDefault(); setLegal({ open: true, tab: "privacidade" }); }}>
                Política de Privacidade
              </button>
              , ciente da comissão por venda e da blindagem dos meus dados comerciais (LGPD).
            </CheckLine>
          </>
        )}

        <Btn type="submit" kind={tab === "entrar" ? "primary" : "sun"} disabled={busy} className="w-full">
          {busy ? (
            <>
              <Spinner /> {tab === "entrar" ? "Validando sessão…" : "Enviando cadastro…"}
            </>
          ) : tab === "entrar" ? "Entrar no painel" : "Enviar cadastro — R$ 0,00"}
        </Btn>

        {tab === "entrar" && (
          <button
            type="button"
            onClick={demo}
            disabled={busy}
            className="w-full rounded-lg border border-dashed border-moss-400 bg-moss-50/60 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-moss-700 transition hover:-translate-y-0.5 hover:bg-moss-100"
          >
            Entrar como Mercadinho do Zé — perfil Gerente
          </button>
        )}
      </form>

      <p className="mt-5 flex items-start gap-2 rounded-lg border border-sun-300 bg-sun-100/70 px-3.5 py-3 text-[11px] font-semibold leading-relaxed text-sun-700">
        <IShield className="mt-0.5 h-4 w-4 shrink-0" />
        Contas de repasse são criptografadas (AES-256) e revalidadas a cada alteração. Atendentes e entregadores nunca
        enxergam dados bancários ou relatórios de comissão.
      </p>
      <LegalNote />
      <LegalModal open={legal.open} tab={legal.tab} onClose={() => setLegal((l) => ({ ...l, open: false }))} setTab={(t) => setLegal((l) => ({ ...l, tab: t }))} />
    </AuthFrame>
  );
}
