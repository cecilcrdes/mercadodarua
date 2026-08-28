import React, { useMemo, useState } from "react";
import {
  useApp, brl, Category, CATEGORIES, maskAddress, nextId, Order, PAY_LABEL, Product, Role,
  STATUS_META, timeAgo, OrderStatus,
} from "../state";
import {
  cx, Btn, Chip, EmptyState, Field, HBars, inputCls, MiniBars, Modal, Monogram, Reveal, Stat, Toggle,
  IBike, IBox, ICheck, IChevron, IClock, IGear, ILock, IMinus, IPhone, IPlus, IRadar, IReceipt,
  ISearch, IShield, ISplit, IStar, ITrash, IUsers, IX, CATEGORY_ICON, CATEGORY_TONE, IDownload, IAlert, IStore,
} from "../components/ui";

const TABS = [
  { id: "geral", label: "Visão geral", icon: IReceipt },
  { id: "pedidos", label: "Pedidos", icon: IBox },
  { id: "produtos", label: "Produtos", icon: IStore },
  { id: "entrega", label: "Entrega & Equipe", icon: IBike },
  { id: "privacidade", label: "Privacidade", icon: IShield },
] as const;

const ROLE_LABEL: Record<Role, string> = { gerente: "Gerente", atendente: "Atendente", entregador: "Entregador" };

/* ---------------- formulário de produto ---------------- */

function ProductForm({ open, onClose, initial }: { open: boolean; onClose: () => void; initial: Product | null }) {
  const { state, upsertProduct, toast } = useApp();
  const [f, setF] = useState(() => ({
    name: initial?.name ?? "",
    category: initial?.category ?? ("Mercearia" as Category),
    price: initial ? String(initial.price.toFixed(2)).replace(".", ",") : "",
    stock: initial ? String(initial.stock) : "10",
    unit: initial?.unit ?? "un",
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (open) {
      setF({
        name: initial?.name ?? "",
        category: initial?.category ?? "Mercearia",
        price: initial ? initial.price.toFixed(2).replace(".", ",") : "",
        stock: initial ? String(initial.stock) : "10",
        unit: initial?.unit ?? "un",
      });
      setErrors({});
    }
  }, [open, initial]);

  const save = () => {
    const e: Record<string, string> = {};
    const price = parseFloat(f.price.replace(",", "."));
    const stock = parseInt(f.stock, 10);
    if (f.name.trim().length < 3) e.name = "Nome muito curto.";
    if (!price || price <= 0) e.price = "Preço inválido.";
    if (isNaN(stock) || stock < 0) e.stock = "Estoque inválido.";
    setErrors(e);
    if (Object.keys(e).length) return;
    upsertProduct({
      id: initial?.id ?? nextId(),
      storeId: state.vendorStoreId,
      name: f.name.trim(),
      category: f.category,
      price,
      stock,
      unit: f.unit,
      active: initial?.active ?? true,
    });
    toast(initial ? `"${f.name.trim()}" atualizado` : `"${f.name.trim()}" entrou na vitrine`, "ok");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="awning-thin rounded-t-2xl" />
      <div className="p-6">
        <h3 className="font-display text-xl font-extrabold text-ink">{initial ? "Editar produto" : "Novo produto"}</h3>
        <p className="mt-1 text-xs text-inksoft">Cadastro rápido — aparece na hora no app dos clientes do bairro.</p>
        <div className="mt-4 space-y-3">
          <Field label="Nome do produto" error={errors.name}>
            <input className={inputCls} placeholder="Ex.: Pão de queijo 400 g" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Categoria">
              <div className="relative">
                <select className={cx(inputCls, "appearance-none pr-8")} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as Category })}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <IChevron className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-inksoft" />
              </div>
            </Field>
            <Field label="Unidade">
              <div className="relative">
                <select className={cx(inputCls, "appearance-none pr-8")} value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })}>
                  {["un", "kg", "dz", "pct", "L", "10 un"].map((u) => <option key={u}>{u}</option>)}
                </select>
                <IChevron className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-inksoft" />
              </div>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Preço (R$)" error={errors.price}>
              <input className={inputCls} placeholder="12,90" inputMode="decimal" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
            </Field>
            <Field label="Estoque" error={errors.stock}>
              <input className={inputCls} inputMode="numeric" value={f.stock} onChange={(e) => setF({ ...f, stock: e.target.value })} />
            </Field>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Btn kind="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn onClick={save}>{initial ? "Salvar alterações" : "Publicar produto"}</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ---------------- radar de entrega ---------------- */

function DeliveryRadar({ radius, served }: { radius: number; served: string[] }) {
  const { nbName } = useApp();
  const spots: { id: string; x: number; y: number }[] = [
    { id: "vm", x: 150, y: 96 },
    { id: "pi", x: 92, y: 128 },
    { id: "la", x: 214, y: 70 },
    { id: "mo", x: 226, y: 150 },
    { id: "ta", x: 76, y: 58 },
    { id: "je", x: 178, y: 172 },
  ];
  return (
    <svg viewBox="0 0 300 210" className="w-full">
      {[90, 62, 34].map((r) => (
        <circle key={r} cx="150" cy="105" r={r} fill="none" stroke="#184e2e" strokeOpacity={r === 90 ? 0.12 : 0.2} strokeDasharray="4 5" />
      ))}
      <circle cx="150" cy="105" r={22 + radius * 13} fill="#35794a" fillOpacity="0.14" stroke="#35794a" strokeWidth="2" />
      <circle cx="150" cy="105" r="7" fill="#0e3a21" />
      <circle cx="150" cy="105" r="12" fill="none" stroke="#ffc41f" strokeWidth="3" className="dot-live" />
      {spots.map((s) => {
        const on = served.includes(s.id);
        const d = Math.hypot(s.x - 150, s.y - 105);
        const covered = d <= 22 + radius * 13;
        return (
          <g key={s.id}>
            <circle cx={s.x} cy={s.y} r="4.5" fill={on ? "#ffc41f" : "#5c6b58"} stroke="#0e3a21" strokeWidth="1.4" opacity={covered || on ? 1 : 0.45} />
            <text x={s.x} y={s.y - 9} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={on ? "#184e2e" : "#5c6b58"}>
              {nbName(s.id)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------------- view principal ---------------- */

export function VendorView() {
  const app = useApp();
  const { state, patchStore, advanceOrder, cancelOrder, toast, nbName, toggleProduct, deleteProduct } = app;
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("geral");
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [invite, setInvite] = useState({ name: "", role: "atendente" as Role });
  const [exclusion, setExclusion] = useState(false);
  const [exclusionDone, setExclusionDone] = useState(false);

  const store = state.stores.find((s) => s.id === state.vendorStoreId)!;
  const orders = useMemo(
    () => state.orders.filter((o) => o.storeId === store.id).sort((a, b) => b.placedAt - a.placedAt),
    [state.orders, store.id]
  );
  const active = orders.filter((o) => ["novo", "preparando", "entrega"].includes(o.status));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter((o) => o.placedAt >= today.getTime() && o.status !== "cancelado");
  const gmvToday = todayOrders.reduce((a, o) => a + o.total, 0);
  const commToday = todayOrders.reduce((a, o) => a + o.commissionValue, 0);

  const days = useMemo(() => {
    const labels: string[] = [];
    const values: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
      const next = d.getTime() + 24 * 3600 * 1000;
      labels.push(["dom", "seg", "ter", "qua", "qui", "sex", "sáb"][d.getDay()]);
      values.push(orders.filter((o) => o.placedAt >= d.getTime() && o.placedAt < next && o.status !== "cancelado").reduce((a, o) => a + o.total, 0));
    }
    return { labels, values };
  }, [orders]);

  const products = useMemo(
    () => state.products.filter((p) => p.storeId === store.id).filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [state.products, store.id, search]
  );

  const filteredOrders = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const countBy = (s: OrderStatus | "all") => (s === "all" ? orders.length : orders.filter((o) => o.status === s).length);

  const advance = (o: Order) => {
    const next: Record<string, string> = { novo: "Pedido aceito — cozinha avisada", preparando: "Pedido despachado com o entregador", entrega: "Entrega concluída — endereço do cliente agora mascarado" };
    advanceOrder(o.id);
    toast(`${o.code}: ${next[o.status] ?? ""}`, "ok");
  };

  const exportData = () => {
    const payload = {
      exportadoEm: new Date().toISOString(),
      titular: store.name,
      cadastro: { bairros: store.neighborhoods.map(nbName), raioKm: store.radiusKm },
      produtos: state.products.filter((p) => p.storeId === store.id).map(({ name, category, price, unit }) => ({ name, category, price, unit })),
      equipe: store.operators.map((o) => ({ name: o.name, role: o.role })),
      pedidos: { total: orders.length, faturamento7d: days.values.reduce((a, b) => a + b, 0) },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "meus-dados-mercadinho-do-ze.json";
    a.click();
    URL.revokeObjectURL(a.href);
    toast("Exportação LGPD gerada (art. 18) — confira seus downloads", "ok");
  };

  const MATRIX: { label: string; g: boolean; a: boolean; e: boolean }[] = [
    { label: "Receber e despachar pedidos", g: true, a: true, e: true },
    { label: "Cadastrar produtos e estoque", g: true, a: true, e: false },
    { label: "Configurar raio e bairros", g: true, a: false, e: false },
    { label: "Ver repasses e dados bancários", g: true, a: false, e: false },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6">
      {/* cabeçalho do parceiro */}
      <section className="anim-fadeUp overflow-hidden rounded-xl border border-line bg-card">
        <div className="awning-thin" />
        <div className="flex flex-wrap items-center gap-4 p-5">
          <Monogram initials={store.initials} className="h-14 w-14 text-xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-extrabold text-ink">{store.name}</h1>
              <Chip className="border-sun-300 bg-sun-100 text-sun-700">parceiro desde 2025 • adesão R$ 0</Chip>
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 text-xs font-semibold text-inksoft">
              <span className="flex items-center gap-1"><IStar className="h-3.5 w-3.5 text-sun-500" sw={2.2} /> {store.rating.toFixed(1)} ({store.reviews})</span>
              <span className="flex items-center gap-1"><IBike className="h-3.5 w-3.5" /> entrega própria: {store.operators.filter((o) => o.role === "entregador").length} entregador(es)</span>
              <span className="flex items-center gap-1"><ILock className="h-3.5 w-3.5 text-moss-600" /> {store.maskedAccount}</span>
            </p>
          </div>
          <label className="flex items-center gap-2.5 rounded-xl border border-line bg-paper px-3.5 py-2.5">
            <span className="text-sm font-extrabold text-ink">{store.isOpen ? "Loja aberta" : "Loja fechada"}</span>
            <Toggle on={store.isOpen} onChange={(v) => { patchStore(store.id, { isOpen: v }); toast(v ? "Loja aberta — você já aparece no app do bairro" : "Loja pausada — pedidos novos suspensos", v ? "ok" : "warn"); }} label="abrir ou fechar loja" />
          </label>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto border-t border-line bg-paper p-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            const badge = t.id === "pedidos" ? orders.filter((o) => o.status === "novo").length : 0;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cx(
                  "flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-bold transition",
                  tab === t.id ? "bg-moss-800 text-sun-200 shadow-sm" : "text-inksoft hover:bg-moss-100 hover:text-ink"
                )}
              >
                <Icon className="h-4 w-4" /> {t.label}
                {badge > 0 && <span className="anim-pop grid h-5 w-5 place-items-center rounded-full bg-sun-400 text-[11px] font-extrabold text-ink">{badge}</span>}
              </button>
            );
          })}
        </nav>
      </section>

      {/* ================= visão geral ================= */}
      {tab === "geral" && (
        <section className="anim-fadeUp mt-6 space-y-5">
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Vendas hoje (GMV)" value={brl(gmvToday)} sub={`${todayOrders.length} pedidos`} tone="dark" icon={<IReceipt className="h-5 w-5" />} />
            <Stat label="Comissão da plataforma" value={brl(commToday)} sub={`${store.commissionRate}% retidos no split`} icon={<ISplit className="h-5 w-5" />} />
            <Stat label="Líquido a receber (D+1)" value={brl(gmvToday - commToday)} sub="repasse via gateway" icon={<ICheck className="h-5 w-5" />} />
            <Stat label="Ticket médio" value={brl(todayOrders.length ? gmvToday / todayOrders.length : 0)} sub="hoje" icon={<IBox className="h-5 w-5" />} />
          </div>

          <p className="flex items-center gap-2 rounded-lg border border-moss-200 bg-moss-50 px-4 py-3 text-xs font-semibold text-moss-700">
            <ILock className="h-4 w-4 shrink-0" />
            Blindagem comercial: faturamento, comissões e repasses são visíveis apenas para o perfil Gerente — nenhum concorrente do bairro acessa estes números.
          </p>

          <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
            <Reveal>
              <div className="h-full rounded-xl border border-line bg-card p-5">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-lg font-extrabold text-ink">Últimos 7 dias</h3>
                  <span className="font-display text-sm font-extrabold text-moss-700">{brl(days.values.reduce((a, b) => a + b, 0))}</span>
                </div>
                <div className="mt-4 h-40">
                  <MiniBars data={days.values} labels={days.labels} className="h-full" />
                </div>
              </div>
            </Reveal>
            <Reveal delay={90}>
              <div className="h-full rounded-xl border border-line bg-card p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-extrabold text-ink">Agora na loja</h3>
                  <button onClick={() => setTab("pedidos")} className="text-xs font-bold text-moss-700 underline-offset-4 hover:underline">ver fila completa</button>
                </div>
                {active.length === 0 ? (
                  <p className="mt-4 rounded-lg border border-dashed border-moss-300 bg-moss-50/60 px-4 py-6 text-center text-sm font-semibold text-inksoft">
                    Nenhum pedido em andamento — assim que chegar, toca aqui e no app do entregador.
                  </p>
                ) : (
                  <ul className="mt-3 divide-y divide-line/70">
                    {active.slice(0, 4).map((o) => (
                      <li key={o.id} className="flex items-center gap-3 py-2.5">
                        <span className={cx("h-2.5 w-2.5 shrink-0 rounded-full", STATUS_META[o.status].bar, o.status === "novo" && "dot-live")} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-extrabold text-ink">{o.code} • {o.customerName} <span className="font-semibold text-inksoft">— {o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</span></p>
                          <p className="text-xs font-semibold text-inksoft">{nbName(o.neighborhood)} • há {timeAgo(o.placedAt)} • {PAY_LABEL[o.payment]}</p>
                        </div>
                        <span className="font-display font-extrabold text-moss-800">{brl(o.total)}</span>
                        <Btn kind="sun" className="px-3 py-1.5 text-xs" onClick={() => advance(o)}>
                          {o.status === "novo" ? "Aceitar" : o.status === "preparando" ? "Despachar" : "Concluir"}
                        </Btn>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ================= pedidos ================= */}
      {tab === "pedidos" && (
        <section className="anim-fadeUp mt-6">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {([["all", "Todos"], ["novo", "Novos"], ["preparando", "Em preparo"], ["entrega", "Em entrega"], ["entregue", "Concluídos"], ["cancelado", "Cancelados"]] as [OrderStatus | "all", string][]).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={cx(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition",
                  filter === id ? "bg-ink text-paper" : "border border-line bg-card text-inksoft hover:border-moss-400"
                )}
              >
                {label}
                <span className={cx("rounded-full px-1.5 text-[11px]", filter === id ? "bg-paper/20" : "bg-moss-100 text-moss-700")}>{countBy(id)}</span>
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="mt-4">
              <EmptyState icon={<IBox className="h-6 w-6" />} title="Nada por aqui" sub="Nenhum pedido com esse status no momento." />
            </div>
          ) : (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {filteredOrders.map((o) => {
                const done = ["entregue", "cancelado"].includes(o.status);
                return (
                  <article key={o.id} className="anim-fadeUp flex flex-col rounded-xl border border-line bg-card">
                    <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
                      <span className="font-display text-lg font-extrabold text-ink">{o.code}</span>
                      <span className={cx("rounded-full px-2.5 py-0.5 text-[11px] font-extrabold", STATUS_META[o.status].pill)}>{STATUS_META[o.status].label}</span>
                      <span className="ml-auto text-xs font-semibold text-inksoft">há {timeAgo(o.placedAt)}</span>
                    </div>
                    <div className="grid flex-1 gap-3 p-4 sm:grid-cols-[1fr_200px]">
                      <ul className="space-y-1 text-sm text-ink/85">
                        {o.items.map((it) => (
                          <li key={it.productId} className="flex justify-between gap-2">
                            <span>{it.qty}× {it.name}</span><span className="font-semibold">{brl(it.price * it.qty)}</span>
                          </li>
                        ))}
                        <li className="flex justify-between border-t border-dashed border-line pt-1.5 text-xs text-inksoft">
                          <span>Taxa de entrega (sua, integral)</span><span>{brl(o.deliveryFee)}</span>
                        </li>
                        <li className="flex justify-between text-xs text-inksoft">
                          <span>Comissão plataforma ({o.commissionRate}%)</span><span>− {brl(o.commissionValue)}</span>
                        </li>
                        <li className="flex justify-between font-extrabold text-ink">
                          <span>Você recebe</span><span className="font-display text-moss-700">{brl(o.storeNet + o.deliveryFee)}</span>
                        </li>
                      </ul>
                      <div className="rounded-lg bg-paper p-3 text-xs">
                        <p className="font-extrabold uppercase tracking-wider text-inksoft">Cliente</p>
                        <p className="mt-1 font-bold text-ink">{o.customerName}</p>
                        <p className="mt-1 flex items-center gap-1.5 font-semibold text-inksoft"><IPhone className="h-3.5 w-3.5" /> {o.maskedPhone}</p>
                        <p className="mt-1 font-semibold text-inksoft">{PAY_LABEL[o.payment]}</p>
                        <div className="mt-2 border-t border-line pt-2">
                          {done ? (
                            <p className="flex items-start gap-1.5 font-semibold text-inksoft">
                              <ILock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-moss-600" />
                              {maskAddress(o.address)} — {nbName(o.neighborhood)}<br />
                            </p>
                          ) : (
                            <p className="flex items-start gap-1.5 font-semibold text-ink">
                              <IGear className="mt-0.5 h-3.5 w-3.5 shrink-0 text-moss-600" />
                              {o.address} — {nbName(o.neighborhood)}
                            </p>
                          )}
                          <p className="mt-1.5 text-[10.5px] font-semibold text-moss-700">
                            {done ? "Endereço anonimizado após a entrega (LGPD)" : "Endereço visível só durante o processamento"}
                          </p>
                        </div>
                      </div>
                    </div>
                    {!done && (
                      <div className="flex items-center gap-2 border-t border-line bg-moss-50/60 px-4 py-3">
                        {o.status === "novo" && (
                          <Btn kind="ghost" className="px-3 py-1.5 text-xs" onClick={() => { cancelOrder(o.id); toast(`${o.code} recusado — cliente notificado e estorno iniciado`, "warn"); }}>
                            <IX className="h-3.5 w-3.5" /> Recusar
                          </Btn>
                        )}
                        <Btn className="ml-auto px-4 py-1.5 text-xs" onClick={() => advance(o)}>
                          {o.status === "novo" ? "Aceitar pedido" : o.status === "preparando" ? "Despachar com entregador" : "Concluir entrega"}
                          {o.status === "novo" ? <ICheck className="h-3.5 w-3.5" /> : <IBike className="h-3.5 w-3.5" />}
                        </Btn>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ================= produtos ================= */}
      {tab === "produtos" && (
        <section className="anim-fadeUp mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
              <ISearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-inksoft" />
              <input className={cx(inputCls, "pl-9")} placeholder="Buscar produto…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <p className="text-xs font-semibold text-inksoft">
              {products.length} produtos • {products.filter((p) => p.stock === 0).length} esgotados • {products.filter((p) => !p.active).length} ocultos
            </p>
            <Btn className="ml-auto" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <IPlus className="h-4 w-4" /> Novo produto
            </Btn>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-line bg-card">
            <div className="hidden grid-cols-[1fr_110px_110px_150px_90px_90px] items-center gap-3 border-b border-line bg-paper px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-wider text-inksoft md:grid">
              <span>Produto</span><span>Categoria</span><span>Preço</span><span>Estoque</span><span>Vitrine</span><span className="text-right">Ações</span>
            </div>
            <ul className="divide-y divide-line/70">
              {products.map((p) => {
                const Icon = CATEGORY_ICON[p.category];
                return (
                  <li key={p.id} className="grid grid-cols-1 gap-3 px-4 py-3 md:grid-cols-[1fr_110px_110px_150px_90px_90px] md:items-center">
                    <div className="flex items-center gap-3">
                      <span className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-lg", CATEGORY_TONE[p.category])}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className={cx("text-sm font-extrabold text-ink", !p.active && "line-through opacity-50")}>{p.name}</p>
                        <p className="text-xs font-semibold text-inksoft">por {p.unit}{p.stock === 0 && <span className="ml-1.5 font-bold text-clay-500">• esgotado</span>}</p>
                      </div>
                    </div>
                    <Chip className="w-fit">{p.category}</Chip>
                    <span className="font-display font-extrabold text-moss-800">{brl(p.price)}</span>
                    <div className="flex items-center gap-1 rounded-full border border-line bg-paper p-0.5 w-fit">
                      <button onClick={() => app.upsertProduct({ ...p, stock: Math.max(0, p.stock - 1) })} className="grid h-7 w-7 place-items-center rounded-full text-inksoft transition hover:bg-moss-100" aria-label="Diminuir estoque">
                        <IMinus className="h-3.5 w-3.5" />
                      </button>
                      <span className={cx("w-8 text-center text-sm font-extrabold", p.stock <= 5 ? "text-clay-500" : "text-ink")}>{p.stock}</span>
                      <button onClick={() => app.upsertProduct({ ...p, stock: p.stock + 1 })} className="grid h-7 w-7 place-items-center rounded-full text-inksoft transition hover:bg-moss-100" aria-label="Aumentar estoque">
                        <IPlus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <Toggle on={p.active} onChange={() => { toggleProduct(p.id); toast(p.active ? `"${p.name}" saiu da vitrine` : `"${p.name}" visível novamente`, "info"); }} label="visibilidade" />
                    <div className="flex justify-start gap-1.5 md:justify-end">
                      <button onClick={() => { setEditing(p); setFormOpen(true); }} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-inksoft transition hover:border-moss-400 hover:text-moss-700" aria-label="Editar">
                        <IGear className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleting(p)} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-inksoft transition hover:border-clay-500 hover:text-clay-500" aria-label="Excluir">
                        <ITrash className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            {products.length === 0 && <p className="px-4 py-10 text-center text-sm font-semibold text-inksoft">Nenhum produto encontrado.</p>}
          </div>
        </section>
      )}

      {/* ================= entrega & equipe ================= */}
      {tab === "entrega" && (
        <section className="anim-fadeUp mt-6 grid gap-5 lg:grid-cols-2">
          <Reveal>
            <div className="rounded-xl border border-line bg-card p-5">
              <h3 className="flex items-center gap-2 font-display text-lg font-extrabold text-ink"><IRadar className="h-5 w-5 text-moss-600" /> Raio e bairros de atendimento</h3>
              <p className="mt-1 text-xs font-semibold text-inksoft">Clientes fora da área não enxergam sua loja no app.</p>
              <DeliveryRadar radius={store.radiusKm} served={store.neighborhoods} />
              <div className="mt-2">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-bold text-ink">Raio de entrega</span>
                  <span className="font-display text-xl font-extrabold text-moss-800">{store.radiusKm.toFixed(1)} km</span>
                </div>
                <input
                  type="range" min={1} max={5} step={0.5} value={store.radiusKm}
                  onChange={(e) => patchStore(store.id, { radiusKm: parseFloat(e.target.value) })}
                  className="mt-2 w-full"
                  aria-label="Raio de entrega em quilômetros"
                />
              </div>
              <p className="mt-4 text-[11px] font-extrabold uppercase tracking-wider text-inksoft">Bairros atendidos</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["vm", "pi", "la", "mo", "ta", "je"].map((id) => {
                  const on = store.neighborhoods.includes(id);
                  const locked = id === "vm";
                  return (
                    <button
                      key={id}
                      disabled={locked}
                      onClick={() => {
                        const next = on ? store.neighborhoods.filter((n) => n !== id) : [...store.neighborhoods, id];
                        patchStore(store.id, { neighborhoods: next });
                        toast(on ? `${nbName(id)} removido da área de entrega` : `Agora entregando em ${nbName(id)}`, "ok");
                      }}
                      className={cx(
                        "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed",
                        on ? "bg-moss-800 text-sun-200" : "border border-line bg-card text-inksoft hover:border-moss-400"
                      )}
                    >
                      {locked ? <ILock className="h-3.5 w-3.5" /> : on ? <ICheck className="h-3.5 w-3.5" /> : <IPlus className="h-3.5 w-3.5" />}
                      {nbName(id)}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] font-semibold text-inksoft">O bairro da loja (Vila Madalena) é fixo — é dali que a entrega sai.</p>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <div className="space-y-5">
              <div className="rounded-xl border border-line bg-card p-5">
                <h3 className="flex items-center gap-2 font-display text-lg font-extrabold text-ink"><IUsers className="h-5 w-5 text-moss-600" /> Equipe e níveis de acesso</h3>
                <ul className="mt-3 divide-y divide-line/70">
                  {store.operators.map((op) => (
                    <li key={op.id} className="flex items-center gap-3 py-2.5">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-moss-100 font-display text-xs font-extrabold text-moss-700">
                        {op.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-extrabold text-ink">{op.name}</span>
                      <div className="relative">
                        <select
                          value={op.role}
                          onChange={(e) => { app.setOperatorRole(store.id, op.id, e.target.value as Role); toast(`Acesso de ${op.name} agora é ${ROLE_LABEL[e.target.value as Role]}`, "info"); }}
                          className="appearance-none rounded-lg border border-line bg-paper py-1.5 pl-3 pr-8 text-xs font-bold text-ink outline-none focus:border-moss-500"
                          aria-label={`Perfil de ${op.name}`}
                        >
                          {(Object.keys(ROLE_LABEL) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                        </select>
                        <IChevron className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-inksoft" />
                      </div>
                      <button onClick={() => { app.removeOperator(store.id, op.id); toast(`${op.name} removido da equipe`, "warn"); }} className="grid h-8 w-8 place-items-center rounded-lg border border-line text-inksoft transition hover:border-clay-500 hover:text-clay-500" aria-label={`Remover ${op.name}`}>
                        <ITrash className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex gap-2">
                  <input className={inputCls} placeholder="Convidar operador (nome)" value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value })} />
                  <Btn kind="ghost" onClick={() => { if (invite.name.trim().length < 3) { toast("Digite o nome do operador", "warn"); return; } app.addOperator(store.id, invite.name.trim(), invite.role); toast(`Convite enviado para ${invite.name.trim()} (${ROLE_LABEL[invite.role]})`, "ok"); setInvite({ name: "", role: "atendente" }); }}>
                    <IPlus className="h-4 w-4" /> Convidar
                  </Btn>
                </div>
                <div className="mt-4 overflow-x-auto rounded-lg border border-line">
                  <table className="w-full min-w-[420px] text-left text-xs">
                    <thead className="bg-paper text-[10.5px] font-extrabold uppercase tracking-wider text-inksoft">
                      <tr><th className="px-3 py-2">Permissão</th><th className="px-3 py-2 text-center">Gerente</th><th className="px-3 py-2 text-center">Atendente</th><th className="px-3 py-2 text-center">Entregador</th></tr>
                    </thead>
                    <tbody className="divide-y divide-line/70">
                      {MATRIX.map((m) => (
                        <tr key={m.label}>
                          <td className="px-3 py-2 font-bold text-ink">{m.label}</td>
                          {[m.g, m.a, m.e].map((v, i) => (
                            <td key={i} className="px-3 py-2 text-center">
                              {v ? <ICheck className="mx-auto h-4 w-4 text-moss-600" sw={2.6} /> : <IX className="mx-auto h-4 w-4 text-inksoft/50" />}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl border border-line bg-card p-5">
                <h3 className="flex items-center gap-2 font-display text-lg font-extrabold text-ink"><ILock className="h-5 w-5 text-moss-600" /> Conta de repasse</h3>
                <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-moss-900 px-4 py-3.5 text-sun-100">
                  <ISplit className="h-6 w-6 text-sun-300" />
                  <div className="flex-1">
                    <p className="text-sm font-extrabold">{store.maskedAccount}</p>
                    <p className="text-[11px] font-semibold text-sun-200/70">criptografada (AES-256) • validada via gateway</p>
                  </div>
                  <Btn kind="sun" className="px-3 py-1.5 text-xs" onClick={() => toast("Link de revalidação bancária enviado ao e-mail do titular", "info")}>Revalidar</Btn>
                </div>
                <p className="mt-2.5 text-[11px] font-semibold text-inksoft">Alterações de conta exigem revalidação do titular — proteção contra fraude de redirecionamento de repasse.</p>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* ================= privacidade ================= */}
      {tab === "privacidade" && (
        <section className="anim-fadeUp mt-6 grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-line bg-card p-5">
            <h3 className="flex items-center gap-2 font-display text-lg font-extrabold text-ink"><IShield className="h-5 w-5 text-moss-600" /> Seu tratamento de dados</h3>
            <ul className="mt-3 space-y-3 text-sm text-ink/85">
              {[
                { t: "Endereços de clientes", d: "Visíveis apenas durante o processamento; mascarados automaticamente após a conclusão (Rua •••••, •••)." },
                { t: "Contato", d: "Telefone do cliente chega mascarado — a conversa acontece no chat interno do app." },
                { t: "Blindagem comercial", d: "Seu faturamento nunca é exposto a outros estabelecimentos da rede." },
                { t: "Acesso por perfil", d: "Atendentes e entregadores não veem dados bancários nem relatórios de comissão." },
              ].map((i) => (
                <li key={i.t} className="flex gap-3">
                  <ICheck className="mt-0.5 h-4 w-4 shrink-0 text-moss-600" sw={2.6} />
                  <span><strong className="text-ink">{i.t}.</strong> {i.d}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-lg bg-moss-50 px-4 py-3 text-xs font-semibold text-moss-700">
              Consentimentos registrados: Termos do Parceiro v2.3 (12/01/2026) • Política de Privacidade v2.3 • Política de Split
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-line bg-card p-5">
              <h3 className="font-display text-lg font-extrabold text-ink">Seus direitos (art. 18, LGPD)</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <Btn kind="ghost" onClick={exportData}><IDownload className="h-4 w-4" /> Exportar meus dados (JSON)</Btn>
                <Btn kind="danger" onClick={() => setExclusion(true)}><IAlert className="h-4 w-4" /> Solicitar exclusão da conta</Btn>
              </div>
              {exclusionDone && (
                <p className="anim-fadeUp mt-3 flex items-center gap-2 rounded-lg bg-sun-100 px-3.5 py-2.5 text-xs font-bold text-sun-700">
                  <IClock className="h-4 w-4" /> Solicitação #LGPD-221 registrada — dados eliminados em até 15 dias, mantendo registros fiscais legais.
                </p>
              )}
            </div>
            <div className="rounded-xl border border-line bg-card p-5">
              <h3 className="font-display text-lg font-extrabold text-ink">Segurança da plataforma</h3>
              <ul className="mt-2.5 space-y-1.5 text-sm text-ink/85">
                <li className="flex items-center gap-2"><ILock className="h-4 w-4 text-moss-600" /> HTTPS/TLS 1.3 em todo o tráfego</li>
                <li className="flex items-center gap-2"><ISplit className="h-4 w-4 text-moss-600" /> Split em gateway PCI-DSS — cartão nunca toca nosso servidor</li>
                <li className="flex items-center gap-2"><IShield className="h-4 w-4 text-moss-600" /> Criptografia em repouso (AES-256) para dados sensíveis</li>
              </ul>
            </div>
          </div>

          <Modal open={exclusion} onClose={() => setExclusion(false)}>
            <div className="p-6">
              <h3 className="font-display text-xl font-extrabold text-clay-600">Excluir conta da loja?</h3>
              <p className="mt-2 text-sm text-ink/85">
                Produtos, equipe e histórico operacional serão eliminados em até 15 dias. Repasses pendentes são liquidados antes da exclusão. Ação irreversível.
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <Btn kind="ghost" onClick={() => setExclusion(false)}>Manter conta</Btn>
                <Btn kind="danger" onClick={() => { setExclusion(false); setExclusionDone(true); toast("Solicitação #LGPD-221 registrada junto ao DPO", "warn"); }}>Confirmar solicitação</Btn>
              </div>
            </div>
          </Modal>
        </section>
      )}

      <ProductForm open={formOpen} onClose={() => setFormOpen(false)} initial={editing} />

      <Modal open={!!deleting} onClose={() => setDeleting(null)}>
        <div className="p-6">
          <h3 className="font-display text-xl font-extrabold text-ink">Remover "{deleting?.name}"?</h3>
          <p className="mt-2 text-sm text-ink/85">O produto sai imediatamente da vitrine no app dos clientes. Você pode recadastrá-lo depois.</p>
          <div className="mt-5 flex justify-end gap-2">
            <Btn kind="ghost" onClick={() => setDeleting(null)}>Cancelar</Btn>
            <Btn kind="danger" onClick={() => { if (deleting) { deleteProduct(deleting.id); toast(`"${deleting.name}" removido do catálogo`, "warn"); } setDeleting(null); }}>
              <ITrash className="h-4 w-4" /> Remover
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
