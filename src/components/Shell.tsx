import React, { useState } from "react";
import { useApp, Module, STATUS_META } from "../state";
import { cx, IBasket, IChart, IShield, IStore, Modal, ISplit, ILock, IX, IPin, ILogOut, Monogram } from "./ui";

const ROLE_LABEL_PT: Record<string, string> = { gerente: "Gerente", atendente: "Atendente", entregador: "Entregador" };
const initialsOf = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";

const MODULES: { id: Module; label: string; icon: (p: { className?: string }) => React.ReactElement }[] = [
  { id: "client", label: "App do Cliente", icon: IBasket },
  { id: "vendor", label: "Painel do Vendedor", icon: IStore },
  { id: "admin", label: "Console Admin", icon: IChart },
];

function BrandMark() {
  return (
    <svg viewBox="0 0 44 44" className="h-10 w-10 shrink-0" aria-hidden="true">
      <rect width="44" height="44" rx="10" fill="#0e3a21" />
      <rect x="6" y="7" width="8" height="9" fill="#ffc41f" />
      <rect x="14" y="7" width="8" height="9" fill="#fcfbf4" />
      <rect x="22" y="7" width="8" height="9" fill="#ffc41f" />
      <rect x="30" y="7" width="8" height="9" fill="#fcfbf4" />
      <rect x="9" y="21" width="26" height="16" rx="3" fill="#fcfbf4" />
      <rect x="13" y="25" width="8" height="8" rx="1.5" fill="#ffc41f" />
      <rect x="24" y="25" width="8" height="8" rx="1.5" fill="#35794a" />
    </svg>
  );
}

export const LEGAL: Record<string, { title: string; body: string[] }> = {
  termos: {
    title: "Termos de Uso",
    body: [
      "O Mercadinho da Rua é um marketplace de delivery de bairro que conecta clientes a mercadinhos, mercearias e padarias independentes. A adesão do vendedor é gratuita, sem taxa de setup: a plataforma remunera-se exclusivamente via revshare — uma comissão percentual aplicada a cada transação.",
      "A logística de entrega é de responsabilidade do próprio vendedor, que utiliza sua estrutura local (motoboy, bicicleta ou entregador a pé), definindo livremente raio de atendimento, horários e taxa de entrega.",
      "Pagamentos são processados por gateway certificado com split automático: a parcela do vendedor e a comissão da plataforma são separadas no ato da transação, sem intermedição manual de valores.",
      "O descumprimento dos prazos de entrega informados, a venda de itens indisponíveis ou condutas que prejudiquem a confiança da rede podem resultar em suspensão do estabelecimento.",
    ],
  },
  privacidade: {
    title: "Política de Privacidade",
    body: [
      "Coletamos apenas o estritamente necessário (minimização de dados): nome, endereço de entrega e contato mascarado. Não exigimos CPF do cliente para pedidos sem nota fiscal.",
      "O vendedor enxerga o endereço completo do cliente somente durante o processamento da entrega. Concluído o pedido, o endereço é automaticamente mascarado no histórico (Rua •••••, •••).",
      "Telefones nunca são exibidos em texto claro entre as partes: toda comunicação acontece por chat interno ou número mascarado no formato (11) 9••••-••00.",
      "Dados de cartão e contas bancárias jamais tocam nossos servidores: todo processamento é delegado a gateway com certificação PCI-DSS, e credenciais de repasse são criptografadas (AES-256) em repouso.",
      "Todo tráfego da plataforma trafega sob HTTPS/TLS 1.3. Relatórios de faturamento de um vendedor nunca são expostos a outros estabelecimentos — blindagem comercial contratual.",
    ],
  },
  lgpd: {
    title: "Portal LGPD",
    body: [
      "Base legal: os dados são tratados para execução de contrato (art. 7º, V) e mediante consentimento específico no cadastro (art. 7º, I), com termos separados para clientes e vendedores.",
      "Titulares podem solicitar, direto nas configurações do app: acesso a todos os dados armazenados (exportação em JSON), correção de dados incompletos, portabilidade e eliminação total da conta.",
      "Pedidos de exclusão são atendidos em até 15 dias, com anonimização irreversível do histórico transacional, preservando apenas registros fiscais exigidos por lei.",
      "Operadores do painel do vendedor possuem acesso por perfil (gerente, atendente, entregador), impedindo que funcionários visualizem dados bancários ou relatórios de comissão.",
      "Encarregado de dados (DPO): dpo@mercadinhodarua.com.br. Incidentes de segurança são comunicados à ANPD e aos titulares no prazo legal.",
    ],
  },
};

export function LegalModal({ open, tab, onClose, setTab }: { open: boolean; tab: string; onClose: () => void; setTab: (t: string) => void }) {
  const doc = LEGAL[tab];
  return (
    <Modal open={open} onClose={onClose} wide>
      <div className="awning rounded-t-2xl" />
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-moss-600">Transparência & LGPD</p>
            <h3 className="font-display text-2xl font-extrabold text-ink">{doc.title}</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-line p-2 text-inksoft transition hover:bg-moss-50 hover:text-ink" aria-label="Fechar">
            <IX className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(LEGAL).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={cx(
                "rounded-full px-3.5 py-1.5 text-xs font-bold transition",
                tab === k ? "bg-moss-800 text-sun-200" : "border border-line bg-card text-inksoft hover:border-moss-400"
              )}
            >
              {v.title}
            </button>
          ))}
        </div>
        <div className="mt-5 space-y-3">
          {doc.body.map((p, i) => (
            <p key={i} className="flex gap-3 text-sm leading-relaxed text-ink/85">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md bg-sun-200 font-display text-[11px] font-extrabold text-moss-800">
                {i + 1}
              </span>
              {p}
            </p>
          ))}
        </div>
        <p className="mt-6 flex items-center gap-2 rounded-lg bg-moss-50 px-3 py-2.5 text-xs font-semibold text-moss-700">
          <IShield className="h-4 w-4 shrink-0" />
          Versão 2.3 • vigente desde janeiro de 2026 • consentimentos registrados por usuário no cadastro
        </p>
      </div>
    </Modal>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { state, setModule, setCartOpen, logoutClient, logoutVendor, nbName, toast } = useApp();
  const [legal, setLegal] = useState<{ open: boolean; tab: string }>({ open: false, tab: "lgpd" });
  const vendorStoreName = state.stores.find((s) => s.id === state.vendorStoreId)?.name ?? "Loja";

  const cartCount = state.cart.reduce((a, l) => a + l.qty, 0);

  const tickerItems = [
    ...state.orders.slice(-9).reverse().map((o) => {
      const store = state.stores.find((s) => s.id === o.storeId);
      return `${o.code} ${STATUS_META[o.status].label.toLowerCase()} • ${store?.name ?? ""} • ${useNb(o.neighborhood)}`;
    }),
    "Padaria & Mercado da Vila em validação — adesão R$ 0,00",
    "split automático ativo: comissão retida no gateway a cada venda",
  ];

  function useNb(id: string) {
    const map: Record<string, string> = { vm: "Vila Madalena", pi: "Pinheiros", la: "Lapa", mo: "Moema", ta: "Tatuapé", je: "Jardim Europa" };
    return map[id] ?? id;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <button className="flex items-center gap-2.5 text-left" onClick={() => setModule("client")}>
            <BrandMark />
            <span>
              <span className="block font-display text-lg font-extrabold leading-none tracking-tight text-ink">
                Mercadinho da Rua
              </span>
              <span className="mt-0.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-moss-600">
                delivery de bairro • revshare
              </span>
            </span>
          </button>

          <nav className="order-3 flex w-full gap-1 rounded-xl border border-line bg-card p-1 sm:order-none sm:ml-4 sm:w-auto" aria-label="Módulos">
            {MODULES.map((m) => {
              const Icon = m.icon;
              const active = state.module === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setModule(m.id)}
                  className={cx(
                    "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition sm:flex-none",
                    active ? "bg-moss-800 text-sun-200 shadow-sm" : "text-inksoft hover:bg-moss-50 hover:text-ink"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="whitespace-nowrap">{m.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {state.module === "client" && state.clientUser && (
              <span className="flex items-center gap-2 rounded-xl border border-line bg-card py-1.5 pl-1.5 pr-1.5">
                <Monogram initials={initialsOf(state.clientUser.name)} className="h-8 w-8 rounded-lg text-[11px]" />
                <span className="hidden leading-tight sm:block">
                  <span className="block text-xs font-extrabold text-ink">{state.clientUser.name.split(" ")[0]}</span>
                  <span className="block text-[10px] font-bold text-moss-600">
                    {state.neighborhood ? nbName(state.neighborhood) : "sem bairro definido"}
                  </span>
                </span>
                <button
                  onClick={() => { logoutClient(); toast("Sessão encerrada — até a próxima feira!", "info"); }}
                  className="grid h-8 w-8 place-items-center rounded-lg text-inksoft transition hover:bg-clay-100 hover:text-clay-600"
                  title="Sair da conta"
                  aria-label="Sair da conta de cliente"
                >
                  <ILogOut className="h-4 w-4" />
                </button>
              </span>
            )}
            {state.module === "client" && state.clientUser && (
              <button
                onClick={() => setCartOpen(true)}
                className="relative flex items-center gap-2 rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:border-moss-400 hover:shadow-lift"
                aria-label="Abrir sacola"
              >
                <IBasket className="h-5 w-5 text-moss-700" />
                <span className="hidden sm:inline">Sacola</span>
                {cartCount > 0 && (
                  <span
                    key={cartCount}
                    className="anim-pop absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-sun-400 text-xs font-extrabold text-ink shadow"
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            )}
            {state.module === "vendor" && state.vendorUser && (
              <span className="hidden items-center gap-2 rounded-xl border border-line bg-card py-1.5 pl-3 pr-1.5 text-xs font-bold text-inksoft md:flex">
                <ILock className="h-4 w-4 text-moss-600" />
                {vendorStoreName} — perfil {ROLE_LABEL_PT[state.vendorUser.role] ?? state.vendorUser.role}
                <button
                  onClick={() => { logoutVendor(); toast("Sessão do parceiro encerrada", "info"); }}
                  className="grid h-8 w-8 place-items-center rounded-lg text-inksoft transition hover:bg-clay-100 hover:text-clay-600"
                  title="Sair do painel"
                  aria-label="Sair do painel do vendedor"
                >
                  <ILogOut className="h-4 w-4" />
                </button>
              </span>
            )}
            {state.module === "admin" && (
              <span className="hidden items-center gap-2 rounded-xl border border-line bg-card px-3 py-2.5 text-xs font-bold text-inksoft md:flex">
                <IShield className="h-4 w-4 text-moss-600" />
                Operador: Plataforma (root)
              </span>
            )}
          </div>
        </div>
        <div className="awning" />
      </header>

      <div className="marquee border-b border-moss-900 bg-moss-900 py-1.5 text-sun-200" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center">
              {tickerItems.map((t, i) => (
                <span key={`${dup}-${i}`} className="flex items-center whitespace-nowrap text-[11px] font-bold uppercase tracking-wider">
                  <span className="mx-4 inline-block h-1.5 w-1.5 rounded-full bg-sun-400" />
                  {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 bg-moss-900 text-moss-100">
        <div className="awning-thin" />
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <BrandMark />
              <span className="font-display text-lg font-extrabold text-sun-200">Mercadinho da Rua</span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-moss-200">
              Marketplace de delivery local com foco em bairro. O mercadinho entra de graça, entrega com a própria
              equipe e a plataforma cresce junto — comissão somente quando o parceiro vende.
            </p>
            <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-sun-300">
              <ISplit className="h-4 w-4" />
              Split automático no gateway • PCI-DSS • nenhum dado de cartão em nossos servidores
            </p>
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-sun-300">Modelo</p>
            <ul className="mt-3 space-y-2 text-sm text-moss-200">
              <li>Onboarding do vendedor: <strong className="text-sun-200">R$ 0,00</strong></li>
              <li>Comissão por venda: <strong className="text-sun-200">8–12%</strong></li>
              <li>Entrega: frota do próprio bairro</li>
              <li>Repasse: D+1 via split</li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-sun-300">Legal & LGPD</p>
            <ul className="mt-3 space-y-2 text-sm">
              {Object.entries(LEGAL).map(([k, v]) => (
                <li key={k}>
                  <button onClick={() => setLegal({ open: true, tab: k })} className="text-moss-200 underline-offset-4 transition hover:text-sun-200 hover:underline">
                    {v.title}
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-center gap-2 text-xs text-moss-300">
              <IPin className="h-4 w-4" />
              Feito para o comércio de esquina, São Paulo — BR
            </p>
          </div>
        </div>
        <div className="border-t border-moss-800 py-4 text-center text-xs text-moss-300">
          © 2026 Mercadinho da Rua — protótipo navegável dos três módulos (cliente, vendedor, admin)
        </div>
      </footer>

      <LegalModal open={legal.open} tab={legal.tab} onClose={() => setLegal((l) => ({ ...l, open: false }))} setTab={(t) => setLegal((l) => ({ ...l, tab: t }))} />
    </div>
  );
}
