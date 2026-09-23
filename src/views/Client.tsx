import React, { useMemo, useState } from "react";
import {
  useApp, brl, Category, CATEGORIES, Order, OrderStatus, Payment, Product, STATUS_META,
  maskAddress, timeAgo, PAY_LABEL, nextId,
} from "../state";
import {
  cx, Btn, Chip, EmptyState, Field, inputCls, Modal, Monogram, Reveal,
  IBasket, IBike, ICard, ICheck, IChevron, IClock, ILock, IMinus, IArrowLeft, IPin, IPlus,
  ISearch, ISplit, IStar, IX, ISpinner, ICash, IPix, CATEGORY_ICON, CATEGORY_TONE, IShield, IStore, IReceipt,
} from "../components/ui";

/* ---------------- cena ilustrada (SVG próprio) ---------------- */

export function MarketScene({ className }: { className?: string }) {
  const scallops: React.ReactElement[] = [];
  for (let i = 0; i < 13; i++) {
    scallops.push(
      <path
        key={i}
        d={`M${560 + i * 40} 168 a20 20 0 0 0 40 0 Z`}
        fill={i % 2 === 0 ? "#ffc41f" : "#184e2e"}
      />
    );
  }
  const stripes: React.ReactElement[] = [];
  for (let i = 0; i < 13; i++) {
    stripes.push(<rect key={i} x={560 + i * 40} y={118} width={40} height={50} fill={i % 2 === 0 ? "#ffc41f" : "#184e2e"} />);
  }
  const crate = (x: number, produce: string, leaf?: boolean) => (
    <g key={x}>
      <rect x={x} y={316} width={120} height={62} rx={6} fill="#b5791c" />
      <rect x={x} y={316} width={120} height={10} rx={5} fill="#8a5a06" />
      <rect x={x + 8} y={336} width={104} height={8} rx={4} fill="#8a5a06" opacity="0.55" />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={x + 20 + i * 21} cy={314} r={13} fill={produce} />
      ))}
      {leaf &&
        [0, 1, 2, 3, 4].map((i) => (
          <path key={`l${i}`} d={`M${x + 16 + i * 21} 302 q4 -10 10 -2 q-2 8 -10 2Z`} fill="#2f7a48" />
        ))}
    </g>
  );
  return (
    <svg viewBox="0 0 1200 420" className={className} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <circle cx="1020" cy="120" r="86" fill="#ffc41f" opacity="0.9" />
      <path d="M120 84 q10 -10 20 0 M160 64 q10 -10 20 0" stroke="#92b98f" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* prédio */}
      <rect x="580" y="90" width="500" height="330" rx="10" fill="#fcfbf4" />
      <rect x="620" y="230" width="120" height="190" rx="6" fill="#0e3a21" />
      <rect x="636" y="252" width="88" height="60" rx="4" fill="#184e2e" />
      <circle cx="722" cy="330" r="6" fill="#ffc41f" />
      {/* vitrine com prateleiras */}
      <rect x="780" y="230" width="260" height="130" rx="6" fill="#dce9d9" />
      {[0, 1, 2].map((r) => (
        <rect key={r} x={796} y={248 + r * 38} width={228} height={7} rx={3.5} fill="#92b98f" />
      ))}
      {["#c24e2e", "#ffc41f", "#5f9763", "#33688a", "#c24e2e", "#efad00", "#2f7a48", "#c24e2e", "#ffc41f"].map((c, i) => (
        <rect key={i} x={800 + (i % 3) * 78 + Math.floor(i / 3) * 6} y={216 + Math.floor(i / 3) * 38} width={26} height={30} rx={5} fill={c} />
      ))}
      {/* toldo */}
      {stripes}
      {scallops}
      {/* placa pendurada */}
      <path d="M880 188 v26 M940 188 v26" stroke="#0e3a21" strokeWidth="4" />
      <rect x="852" y="214" width="116" height="52" rx="10" fill="#ffc41f" stroke="#0e3a21" strokeWidth="3" />
      <circle cx="874" cy="240" r="9" fill="#0e3a21" />
      <rect x="892" y="230" width="58" height="8" rx="4" fill="#0e3a21" />
      <rect x="892" y="244" width="40" height="8" rx="4" fill="#0e3a21" opacity="0.55" />
      {/* caixotes */}
      {crate(620, "#c24e2e", true)}
      {crate(760, "#ffd44d")}
      {crate(900, "#5f9763", true)}
      {/* bicicleta */}
      <g stroke="#fcfbf4" strokeWidth="7" fill="none" strokeLinecap="round">
        <circle cx="220" cy="330" r="52" />
        <circle cx="420" cy="330" r="52" />
        <path d="M220 330 300 220 h70 l50 110 M300 220 l40 110 h-140 M340 200 h48 M300 220 l-30 -28 h-40" />
      </g>
      <rect x="252" y="262" width="96" height="56" rx="10" fill="#b5791c" stroke="#8a5a06" strokeWidth="5" />
      <circle cx="272" cy="256" r="10" fill="#c24e2e" />
      <circle cx="296" cy="250" r="10" fill="#ffd44d" />
      <circle cx="320" cy="256" r="10" fill="#5f9763" />
      <rect x="80" y="382" width="1060" height="8" rx="4" fill="#184e2e" />
    </svg>
  );
}

/* ---------------- timeline de status ---------------- */

const FLOW: OrderStatus[] = ["novo", "preparando", "entrega", "entregue"];
const FLOW_LABEL = ["Recebido", "Em preparo", "A caminho", "Entregue"];

function Timeline({ status }: { status: OrderStatus }) {
  if (status === "cancelado")
    return <span className="rounded-full bg-ink/5 px-3 py-1 text-xs font-bold text-inksoft">Pedido cancelado — estorno via gateway em até 2 dias úteis</span>;
  const idx = FLOW.indexOf(status);
  return (
    <div className="flex items-center">
      {FLOW_LABEL.map((l, i) => (
        <React.Fragment key={l}>
          <div className="flex flex-col items-center gap-1">
            <span
              className={cx(
                "grid h-6 w-6 place-items-center rounded-full border-2 text-[10px] font-extrabold transition",
                i < idx && "border-moss-600 bg-moss-600 text-card",
                i === idx && (status === "entregue" ? "border-moss-600 bg-moss-600 text-card" : "dot-live border-sun-500 bg-sun-200 text-ink"),
                i > idx && "border-line bg-card text-inksoft"
              )}
            >
              {i < idx || status === "entregue" ? <ICheck className="h-3 w-3" sw={3} /> : i + 1}
            </span>
            <span className={cx("whitespace-nowrap text-[10px] font-bold", i <= idx ? "text-moss-700" : "text-inksoft")}>{l}</span>
          </div>
          {i < FLOW_LABEL.length - 1 && (
            <div className={cx("mx-1 mb-4 h-0.5 flex-1 rounded", i < idx ? "bg-moss-600" : "bg-line")} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ---------------- checkout ---------------- */

function CheckoutModal({
  open,
  onClose,
  groups,
  grandTotal,
}: {
  open: boolean;
  onClose: () => void;
  groups: { storeId: string; lines: { product: Product; qty: number }[]; subtotal: number; fee: number; commission: number; net: number }[];
  grandTotal: number;
}) {
  const { state, placeOrder, toast, nbName } = useApp();
  const [form, setForm] = useState({ name: "", phone: "", street: "", number: "", comp: "" });
  const [payment, setPayment] = useState<Payment>("pix");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Order[] | null>(null);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 3) e.name = "Informe seu nome completo.";
    if (form.street.trim().length < 4) e.street = "Rua ou avenida é obrigatória.";
    if (!form.number.trim()) e.number = "Nº";
    if (!consent) e.consent = "Para continuar é preciso aceitar os Termos e a Política de Privacidade (LGPD).";
    setErrors(e);
    if (Object.keys(e).length) return;
    const address = `${form.street.trim()}, ${form.number.trim()}${form.comp.trim() ? ` — ${form.comp.trim()}` : ""}`;
    const orders = placeOrder({ name: form.name.trim(), address, neighborhood: state.neighborhood ?? "vm" }, payment);
    setDone(orders);
    toast(orders.length > 1 ? `Split aplicado: ${orders.length} pedidos confirmados (${orders.map((o) => o.code).join(", ")})` : `Pedido ${orders[0].code} confirmado`, "ok");
  };

  const close = () => {
    setDone(null);
    setForm({ name: "", phone: "", street: "", number: "", comp: "" });
    setConsent(false);
    setErrors({});
    onClose();
  };

  return (
    <Modal open={open} onClose={close} wide>
      <div className="awning rounded-t-2xl" />
      {done ? (
        <div className="anim-fadeUp p-8 text-center">
          <span className="anim-pop mx-auto grid h-16 w-16 place-items-center rounded-full bg-moss-100 text-moss-700">
            <ICheck className="h-8 w-8" sw={2.4} />
          </span>
          <h3 className="mt-4 font-display text-2xl font-extrabold text-ink">
            {done.length > 1 ? "Pedidos confirmados!" : `Pedido ${done[0].code} confirmado!`}
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-inksoft">
            {done.map((o) => o.code).join(" + ")} • pagamento via {PAY_LABEL[payment]} • o vendedor do seu bairro já foi notificado.
          </p>
          <div className="mx-auto mt-5 max-w-sm space-y-2 rounded-xl border border-line bg-paper p-4 text-left text-sm">
            {done.map((o) => {
              const st = state.stores.find((s) => s.id === o.storeId);
              return (
                <div key={o.id} className="flex items-center justify-between">
                  <span className="font-semibold text-ink">{st?.name}</span>
                  <span className="font-bold text-moss-700">{o.code}</span>
                </div>
              );
            })}
            <div className="flex items-center justify-between border-t border-line pt-2">
              <span className="text-inksoft">Split processado</span>
              <span className="flex items-center gap-1.5 font-bold text-moss-700">
                <ISplit className="h-4 w-4" /> repasses D+1
              </span>
            </div>
          </div>
          <Btn className="mt-6" onClick={close}>Acompanhar meus pedidos</Btn>
        </div>
      ) : (
        <div className="p-6 sm:p-8">
          <h3 className="font-display text-2xl font-extrabold text-ink">Finalizar pedido</h3>
          <p className="mt-1 text-sm text-inksoft">Entrega em {state.neighborhood ? nbName(state.neighborhood) : "seu bairro"} • pagamento único com split automático entre lojas e plataforma.</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Nome" error={errors.name}>
                <input className={inputCls} placeholder="Como no interfone" value={form.name} onChange={(e) => set("name", e.target.value)} />
              </Field>
            </div>
            <Field label="Endereço (rua/avenida)" error={errors.street}>
              <input className={inputCls} placeholder="Rua Harmonia" value={form.street} onChange={(e) => set("street", e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Número" error={errors.number}>
                <input className={inputCls} placeholder="456" value={form.number} onChange={(e) => set("number", e.target.value)} />
              </Field>
              <Field label="Compl.">
                <input className={inputCls} placeholder="apto 12" value={form.comp} onChange={(e) => set("comp", e.target.value)} />
              </Field>
            </div>
            <Field label="Telefone" hint="exibido mascarado à loja">
              <input className={inputCls} placeholder="(11) 98765-4321" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </Field>
            <Field label="Bairro">
              <input className={cx(inputCls, "bg-moss-50 font-semibold text-moss-800")} disabled value={state.neighborhood ? nbName(state.neighborhood) : "—"} />
            </Field>
          </div>

          <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-inksoft">Pagamento</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {([
              { id: "pix", label: "Pix", icon: IPix },
              { id: "cartao", label: "Cartão", icon: ICard },
              { id: "dinheiro", label: "Dinheiro", icon: ICash },
            ] as { id: Payment; label: string; icon: (p: { className?: string }) => React.ReactElement }[]).map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setPayment(m.id)}
                  className={cx(
                    "flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-sm font-bold transition",
                    payment === m.id ? "border-moss-700 bg-moss-50 text-moss-800" : "border-line bg-card text-inksoft hover:border-moss-300"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {m.label}
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-xl border border-moss-300 bg-moss-50 p-4">
            <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-moss-700">
              <ISplit className="h-4 w-4" /> Split automático no gateway
            </p>
            <div className="mt-2 space-y-1.5 text-sm">
              {groups.map((g) => {
                const st = state.stores.find((s) => s.id === g.storeId);
                return (
                  <div key={g.storeId} className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-ink">{st?.name}</span>
                    <span className="text-xs text-inksoft">
                      repasse <strong className="text-moss-700">{brl(g.net)}</strong> + taxa entrega {brl(g.fee)} • plataforma {brl(g.commission)}
                    </span>
                  </div>
                );
              })}
              <div className="flex items-baseline justify-between border-t border-moss-200 pt-2">
                <span className="font-bold text-ink">Total a pagar</span>
                <span className="font-display text-xl font-extrabold text-moss-800">{brl(grandTotal)}</span>
              </div>
            </div>
          </div>

          <label className={cx("mt-4 flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-sm transition", errors.consent ? "border-clay-500 bg-clay-100/40" : "border-line bg-card")}>
            <span
              className={cx(
                "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition",
                consent ? "border-moss-700 bg-moss-700 text-sun-200" : "border-line bg-paper"
              )}
              onClick={() => setConsent(!consent)}
            >
              {consent && <ICheck className="h-3.5 w-3.5" sw={3} />}
            </span>
            <span onClick={() => setConsent(!consent)} className="text-ink/85">
              Li e aceito os <strong>Termos de Uso</strong> e a <strong>Política de Privacidade</strong>, e autorizo o tratamento dos meus dados de entrega nos termos da LGPD. Meu endereço só ficará visível ao vendedor durante a entrega.
            </span>
          </label>
          {errors.consent && <p className="mt-1.5 text-xs font-semibold text-clay-600">{errors.consent}</p>}

          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-inksoft">
              <ILock className="h-4 w-4 text-moss-600" /> Checkout seguro • cartão processado fora do app
            </p>
            <Btn onClick={submit} kind="sun" className="px-6 text-base">
              Pagar {brl(grandTotal)}
            </Btn>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ---------------- sacola ---------------- */

function CartDrawer() {
  const { state, setCartOpen, cartSet, nbName } = useApp();
  const [checkout, setCheckout] = useState(false);

  const groups = useMemo(() => {
    const map = new Map<string, { product: Product; qty: number }[]>();
    for (const line of state.cart) {
      const p = state.products.find((pr) => pr.id === line.productId);
      if (!p) continue;
      map.set(p.storeId, [...(map.get(p.storeId) ?? []), { product: p, qty: line.qty }]);
    }
    return Array.from(map.entries()).map(([storeId, lines]) => {
      const store = state.stores.find((s) => s.id === storeId)!;
      const subtotal = lines.reduce((a, l) => a + l.product.price * l.qty, 0);
      const commission = subtotal * (store.commissionRate / 100);
      return { storeId, lines, subtotal, fee: store.deliveryFee, commission, net: subtotal - commission };
    });
  }, [state.cart, state.products, state.stores]);

  const grandTotal = groups.reduce((a, g) => a + g.subtotal + g.fee, 0);
  const count = state.cart.reduce((a, l) => a + l.qty, 0);

  if (!state.cartOpen && !checkout) return null;

  return (
    <>
      {state.cartOpen && <div className="fixed inset-0 z-[60] bg-moss-900/55 backdrop-blur-[2px]" onClick={() => setCartOpen(false)} />}
      <aside className={cx("fixed inset-y-0 right-0 z-[61] flex w-full max-w-md flex-col bg-card shadow-lift", state.cartOpen ? "anim-slide-left" : "hidden")}>
        <div className="awning-thin" />
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="font-display text-xl font-extrabold text-ink">Sua sacola</h2>
            <p className="text-xs font-semibold text-inksoft">{count} {count === 1 ? "item" : "itens"} • entrega em {state.neighborhood ? nbName(state.neighborhood) : "—"}</p>
          </div>
          <button onClick={() => setCartOpen(false)} className="rounded-lg border border-line p-2 text-inksoft transition hover:bg-moss-50" aria-label="Fechar sacola">
            <IX className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {groups.length === 0 && (
            <EmptyState
              icon={<IBasket className="h-7 w-7" />}
              title="Sacola vazia"
              sub="Escolha um mercadinho do seu bairro e encha a sacola — a entrega sai da loja mais próxima."
              action={<Btn onClick={() => setCartOpen(false)}>Explorar mercados</Btn>}
            />
          )}
          {groups.map((g) => {
            const store = state.stores.find((s) => s.id === g.storeId)!;
            return (
              <div key={g.storeId} className="overflow-hidden rounded-xl border border-line">
                <div className="flex items-center gap-2.5 border-b border-line bg-paper px-3.5 py-2.5">
                  <Monogram initials={store.initials} className="h-8 w-8 rounded-lg text-xs" />
                  <div className="flex-1">
                    <p className="text-sm font-extrabold text-ink">{store.name}</p>
                    <p className="text-[11px] font-semibold text-inksoft">entrega {brl(g.fee)} • {store.eta[0]}–{store.eta[1]} min</p>
                  </div>
                  <span className="font-display font-extrabold text-moss-800">{brl(g.subtotal)}</span>
                </div>
                <ul className="divide-y divide-line/70 px-3.5">
                  {g.lines.map((l) => (
                    <li key={l.product.id} className="flex items-center gap-3 py-2.5">
                      <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-lg", CATEGORY_TONE[l.product.category])}>
                        {React.createElement(CATEGORY_ICON[l.product.category], { className: "h-5 w-5" })}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-ink">{l.product.name}</p>
                        <p className="text-xs text-inksoft">{brl(l.product.price)} / {l.product.unit}</p>
                      </div>
                      <div className="flex items-center gap-1 rounded-full border border-line bg-paper p-0.5">
                        <button onClick={() => cartSet(l.product.id, l.qty - 1)} className="grid h-6 w-6 place-items-center rounded-full text-inksoft transition hover:bg-moss-100 hover:text-ink" aria-label="Diminuir">
                          <IMinus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-5 text-center text-sm font-extrabold">{l.qty}</span>
                        <button
                          onClick={() => cartSet(l.product.id, l.qty + 1)}
                          disabled={l.qty >= l.product.stock}
                          className="grid h-6 w-6 place-items-center rounded-full text-inksoft transition hover:bg-moss-100 hover:text-ink disabled:opacity-30"
                          aria-label="Aumentar"
                        >
                          <IPlus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="flex items-center gap-1.5 border-t border-dashed border-line bg-moss-50/70 px-3.5 py-2 text-[11px] font-semibold text-moss-700">
                  <ISplit className="h-3.5 w-3.5" /> Split: loja recebe {brl(g.net)} • plataforma {brl(g.commission)} ({store.commissionRate}%)
                </p>
              </div>
            );
          })}
        </div>

        {groups.length > 0 && (
          <div className="border-t border-line bg-paper p-5">
            <div className="space-y-1 text-sm">
              {groups.map((g) => (
                <div key={g.storeId} className="flex justify-between text-inksoft">
                  <span>Taxa de entrega</span>
                  <span>{brl(g.fee)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-line pt-2 text-base">
                <span className="font-extrabold text-ink">Total</span>
                <span className="font-display text-xl font-extrabold text-moss-800">{brl(grandTotal)}</span>
              </div>
            </div>
            <Btn kind="sun" className="mt-3 w-full py-3 text-base" onClick={() => setCheckout(true)}>
              Ir para pagamento <ISplit className="h-4 w-4" />
            </Btn>
          </div>
        )}
      </aside>
      <CheckoutModal open={checkout} onClose={() => setCheckout(false)} groups={groups} grandTotal={grandTotal} />
    </>
  );
}

/* ---------------- card de produto ---------------- */

function ProductCard({ product, delay }: { product: Product; delay: number }) {
  const { state, cartAdd, cartSet } = useApp();
  const inCart = state.cart.find((l) => l.productId === product.id);
  const Icon = CATEGORY_ICON[product.category];
  const out = product.stock === 0;
  return (
    <Reveal delay={delay}>
      <div className={cx("group flex flex-col rounded-xl border border-line bg-card p-3.5 transition hover:-translate-y-1 hover:shadow-lift", !product.active && "opacity-50")}>
        <div className={cx("mb-3 grid h-16 place-items-center rounded-lg transition group-hover:scale-[1.03]", CATEGORY_TONE[product.category])}>
          <Icon className="h-8 w-8" />
        </div>
        <p className="text-sm font-extrabold leading-snug text-ink">{product.name}</p>
        <p className="mt-0.5 text-xs font-semibold text-inksoft">por {product.unit} • {product.category}</p>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <p className="font-display text-lg font-extrabold text-moss-800">{brl(product.price)}</p>
            {!out && product.stock <= 5 && <p className="text-[11px] font-bold text-clay-500">só {product.stock} {product.stock === 1 ? "un." : "un."}</p>}
            {out && <p className="text-[11px] font-bold text-inksoft">esgotado hoje</p>}
          </div>
          {out ? (
            <span className="rounded-lg bg-ink/5 px-3 py-2 text-xs font-bold text-inksoft">Indisp.</span>
          ) : inCart ? (
            <div className="anim-pop flex items-center gap-1 rounded-full bg-sun-400 p-1 shadow-[0_2px_0_#c98f00]">
              <button onClick={() => cartSet(product.id, inCart.qty - 1)} className="grid h-7 w-7 place-items-center rounded-full transition hover:bg-sun-300" aria-label="Diminuir">
                <IMinus className="h-4 w-4" sw={2.4} />
              </button>
              <span className="w-5 text-center text-sm font-extrabold">{inCart.qty}</span>
              <button onClick={() => cartSet(product.id, inCart.qty + 1)} disabled={inCart.qty >= product.stock} className="grid h-7 w-7 place-items-center rounded-full transition hover:bg-sun-300 disabled:opacity-40" aria-label="Aumentar">
                <IPlus className="h-4 w-4" sw={2.4} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => cartAdd(product.id)}
              className="btn-hard grid h-10 w-10 place-items-center rounded-lg bg-moss-800 text-sun-200"
              aria-label={`Adicionar ${product.name}`}
            >
              <IPlus className="h-5 w-5" sw={2.4} />
            </button>
          )}
        </div>
      </div>
    </Reveal>
  );
}

/* ---------------- view principal ---------------- */

export function ClientView() {
  const { state, setNeighborhood, detectNeighborhood, cancelOrder, toast, nbName, setCartOpen } = useApp();
  const [view, setView] = useState<"explore" | "orders">("explore");
  const [storeId, setStoreId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<Category | "all">("all");
  const [notified, setNotified] = useState(false);

  const stores = useMemo(
    () => state.stores.filter((s) => !state.neighborhood || s.neighborhoods.includes(state.neighborhood)),
    [state.stores, state.neighborhood]
  );
  const store = storeId ? state.stores.find((s) => s.id === storeId) : null;
  const storeProducts = useMemo(
    () =>
      state.products
        .filter((p) => p.storeId === storeId)
        .filter((p) => (cat === "all" ? true : p.category === cat))
        .filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [state.products, storeId, cat, search]
  );
  const cats = useMemo(() => Array.from(new Set(state.products.filter((p) => p.storeId === storeId).map((p) => p.category))), [state.products, storeId]);

  const myOrders = useMemo(
    () => state.orders.filter((o) => o.mine).sort((a, b) => b.placedAt - a.placedAt),
    [state.orders]
  );
  const activeCount = myOrders.filter((o) => !["entregue", "cancelado"].includes(o.status)).length;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6">
      {/* barra de localização */}
      <section className="anim-fadeUp flex flex-wrap items-center gap-3 rounded-xl border border-line bg-card p-4 shadow-sm">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-moss-800 text-sun-300">
          <IPin className="h-6 w-6" />
        </span>
        <div className="min-w-[180px]">
          <p className="text-[11px] font-bold uppercase tracking-widest text-inksoft">Entregar em</p>
          {state.neighborhood ? (
            <p className="font-display text-xl font-extrabold leading-tight text-ink">
              {nbName(state.neighborhood)}
              <span className="ml-2 text-xs font-semibold text-inksoft">{stores.length} {stores.length === 1 ? "mercado entrega aqui" : "mercados entregam aqui"}</span>
            </p>
          ) : (
            <p className="font-display text-xl font-extrabold text-inksoft">Defina seu bairro</p>
          )}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Btn kind="ghost" onClick={detectNeighborhood} disabled={state.detecting}>
            {state.detecting ? <ISpinner className="h-4 w-4" /> : <IPin className="h-4 w-4" />}
            {state.detecting ? "Localizando…" : "Usar minha localização"}
          </Btn>
          <div className="relative">
            <select
              value={state.neighborhood ?? ""}
              onChange={(e) => setNeighborhood(e.target.value || null)}
              className="appearance-none rounded-lg border border-line bg-card py-2.5 pl-3.5 pr-9 text-sm font-bold text-ink outline-none transition focus:border-moss-500"
              aria-label="Escolher bairro"
            >
              <option value="" disabled>Trocar bairro…</option>
              {["vm", "pi", "la", "mo", "ta", "je"].map((id) => (
                <option key={id} value={id}>{nbName(id)}</option>
              ))}
            </select>
            <IChevron className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-inksoft" />
          </div>
        </div>
      </section>

      {/* navegação explorar / pedidos */}
      <div className="mt-5 flex items-center gap-2">
        {([
          { id: "explore", label: "Explorar mercados", icon: IStore },
          { id: "orders", label: `Meus pedidos${activeCount ? ` (${activeCount} ativos)` : ""}`, icon: IReceipt },
        ] as const).map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => { setView(t.id); setStoreId(null); }}
              className={cx(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition",
                view === t.id ? "bg-ink text-paper shadow" : "border border-line bg-card text-inksoft hover:border-moss-400 hover:text-ink"
              )}
            >
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {view === "explore" && !store && (
        <>
          {/* banner ilustrado */}
          <Reveal className="mt-5">
            <section className="relative overflow-hidden rounded-2xl bg-moss-800">
              <MarketScene className="pointer-events-none absolute inset-y-0 right-0 h-full w-[72%] opacity-95" />
              <div className="absolute inset-y-0 left-0 z-[5] w-[65%] bg-gradient-to-r from-moss-800 via-moss-800/85 to-transparent" />
              <div className="relative z-10 max-w-md p-7 sm:p-9">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-sun-300">
                  {state.neighborhood ? `agora em ${nbName(state.neighborhood)}` : "delivery de bairro"}
                </p>
                <h1 className="mt-2 font-display text-3xl font-extrabold leading-[1.05] tracking-tight text-card sm:text-[40px]">
                  Da prateleira do Zé <span className="text-sun-300">pra sua porta.</span>
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-moss-100">
                  Mercadinhos independentes do seu bairro entregam com a própria equipe. Você compra em um checkout só — o split repassa cada loja na hora.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Chip className="border-sun-300/40 bg-moss-900/40 text-sun-200"><IBike className="h-3.5 w-3.5" /> entrega do próprio bairro</Chip>
                  <Chip className="border-sun-300/40 bg-moss-900/40 text-sun-200"><ISplit className="h-3.5 w-3.5" /> checkout unificado</Chip>
                  <Chip className="border-sun-300/40 bg-moss-900/40 text-sun-200"><IShield className="h-3.5 w-3.5" /> endereço mascarado (LGPD)</Chip>
                </div>
              </div>
            </section>
          </Reveal>

          {/* lista de mercados */}
          {state.neighborhood === "je" ? (
            <div className="mt-6">
              <EmptyState
                icon={<IBike className="h-7 w-7" />}
                title="Ainda não chegamos no Jardim Europa"
                sub="Nenhum mercado parceiro entrega nesse bairro por enquanto. A expansão é bairro a bairro — entre na lista e a gente avisa quando o primeiro parceiro ligar o toldo."
                action={
                  notified ? (
                    <span className="flex items-center gap-2 rounded-lg bg-moss-100 px-4 py-2 text-sm font-bold text-moss-700">
                      <ICheck className="h-4 w-4" /> Você está na lista! Avisaremos por push.
                    </span>
                  ) : (
                    <Btn onClick={() => { setNotified(true); toast("Aviso registrado: avisaremos quando Jardim Europa abrir", "ok"); }}>Avise-me quando chegar</Btn>
                  )
                }
              />
            </div>
          ) : (
            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stores.map((s, i) => (
                <Reveal key={s.id} delay={i * 80}>
                  <button
                    onClick={() => { if (s.isOpen) { setStoreId(s.id); setSearch(""); setCat("all"); } else toast(`${s.name} abre amanhã às 7h`, "info"); }}
                    className={cx(
                      "group block w-full overflow-hidden rounded-xl border border-line bg-card text-left transition hover:-translate-y-1 hover:shadow-lift",
                      !s.isOpen && "opacity-75"
                    )}
                  >
                    <div className="awning-thin" />
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <Monogram initials={s.initials} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate font-display text-lg font-extrabold text-ink">{s.name}</h3>
                          </div>
                          <p className="flex items-center gap-1 text-xs font-semibold text-inksoft">
                            <IStar className="h-3.5 w-3.5 text-sun-500" sw={2.2} /> {s.reviews > 0 ? `${s.rating.toFixed(1)} (${s.reviews})` : "novo no bairro"} • {s.tags.slice(0, 2).join(" • ")}
                          </p>
                        </div>
                        <span className={cx("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold", s.isOpen ? "bg-moss-100 text-moss-700" : "bg-ink/5 text-inksoft")}>
                          <span className={cx("h-2 w-2 rounded-full", s.isOpen ? "dot-live bg-moss-500" : "bg-inksoft/50")} />
                          {s.isOpen ? "Aberto" : "Fechado"}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-inksoft">
                        <span className="flex items-center gap-1"><IClock className="h-3.5 w-3.5" /> {s.eta[0]}–{s.eta[1]} min</span>
                        <span className="flex items-center gap-1"><IBike className="h-3.5 w-3.5" /> {brl(s.deliveryFee)}</span>
                        <span className="flex items-center gap-1"><IPin className="h-3.5 w-3.5" /> {s.distanceKm.toFixed(1)} km</span>
                      </div>
                      {!s.isOpen && <p className="mt-2 text-xs font-bold text-clay-500">Abre amanhã às 7h — a entrega é feita pela própria loja</p>}
                    </div>
                  </button>
                </Reveal>
              ))}
            </section>
          )}
        </>
      )}

      {view === "explore" && store && (
        <section className="anim-fadeUp mt-5">
          {/* cabeçalho da loja */}
          <div className="overflow-hidden rounded-xl border border-line bg-card">
            <div className="awning-thin" />
            <div className="flex flex-wrap items-center gap-4 p-5">
              <button onClick={() => setStoreId(null)} className="btn-hard grid h-10 w-10 place-items-center rounded-lg bg-moss-800 text-sun-200" aria-label="Voltar aos mercados">
                <IArrowLeft className="h-5 w-5" />
              </button>
              <Monogram initials={store.initials} className="h-14 w-14 text-xl" />
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-2xl font-extrabold text-ink">{store.name}</h2>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-inksoft">
                  <span className="flex items-center gap-1"><IStar className="h-3.5 w-3.5 text-sun-500" sw={2.2} /> {store.reviews > 0 ? `${store.rating.toFixed(1)} (${store.reviews} avaliações)` : "parceiro recém-chegado"}</span>
                  <span className="flex items-center gap-1"><IClock className="h-3.5 w-3.5" /> {store.eta[0]}–{store.eta[1]} min</span>
                  <span className="flex items-center gap-1"><IBike className="h-3.5 w-3.5" /> entrega própria {brl(store.deliveryFee)}</span>
                  <span className="flex items-center gap-1 text-moss-700"><IShield className="h-3.5 w-3.5" /> seu endereço aparece só durante a entrega</span>
                </p>
              </div>
            </div>
            {/* busca + categorias */}
            <div className="border-t border-line bg-paper p-4">
              <div className="relative max-w-sm">
                <ISearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-inksoft" />
                <input className={cx(inputCls, "pl-9")} placeholder="Buscar no mercadinho…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setCat("all")}
                  className={cx("whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition", cat === "all" ? "bg-moss-800 text-sun-200" : "border border-line bg-card text-inksoft hover:border-moss-400")}
                >
                  Tudo
                </button>
                {cats.map((c) => {
                  const Icon = CATEGORY_ICON[c];
                  return (
                    <button
                      key={c}
                      onClick={() => setCat(c)}
                      className={cx("flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition", cat === c ? "bg-moss-800 text-sun-200" : "border border-line bg-card text-inksoft hover:border-moss-400")}
                    >
                      <Icon className="h-3.5 w-3.5" /> {c}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {storeProducts.length ? (
            <div className="mt-5 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
              {storeProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} delay={(i % 8) * 60} />
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState icon={<ISearch className="h-6 w-6" />} title="Nada por aqui" sub={`Nenhum produto de ${store.name} bate com "${search || cat}". Tente outra busca ou categoria.`} />
            </div>
          )}
        </section>
      )}

      {view === "orders" && (
        <section className="mt-5 space-y-4">
          {myOrders.length === 0 && (
            <EmptyState
              icon={<IReceipt className="h-7 w-7" />}
              title="Nenhum pedido ainda"
              sub="Seu histórico aparece aqui com rastreamento ao vivo — do balcão até a campainha."
              action={<Btn onClick={() => setView("explore")}>Explorar mercados</Btn>}
            />
          )}
          {myOrders.map((o) => {
            const st = state.stores.find((s) => s.id === o.storeId);
            return (
              <article key={o.id} className="anim-fadeUp overflow-hidden rounded-xl border border-line bg-card">
                <div className="flex flex-wrap items-center gap-3 border-b border-line bg-paper px-4 py-3">
                  <Monogram initials={st?.initials ?? "?"} className="h-9 w-9 rounded-lg text-xs" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-ink">{st?.name} <span className="font-display text-moss-700">{o.code}</span></p>
                    <p className="text-xs font-semibold text-inksoft">há {timeAgo(o.placedAt)} • {PAY_LABEL[o.payment]} • {o.items.length} {o.items.length === 1 ? "item" : "itens"}</p>
                  </div>
                  <span className={cx("rounded-full px-3 py-1 text-xs font-extrabold", STATUS_META[o.status].pill)}>{STATUS_META[o.status].label}</span>
                  {["novo", "preparando"].includes(o.status) && (
                    <Btn kind="ghost" className="px-3 py-1.5 text-xs" onClick={() => { cancelOrder(o.id); toast(`Pedido ${o.code} cancelado — estorno em processamento`, "warn"); }}>
                      Cancelar
                    </Btn>
                  )}
                </div>
                <div className="grid gap-4 p-4 sm:grid-cols-[1fr_260px]">
                  <div>
                    <Timeline status={o.status} />
                    <ul className="mt-4 space-y-1 text-sm text-ink/85">
                      {o.items.map((it) => (
                        <li key={it.productId} className="flex justify-between gap-3">
                          <span>{it.qty}× {it.name}</span>
                          <span className="font-semibold">{brl(it.price * it.qty)}</span>
                        </li>
                      ))}
                      <li className="flex justify-between border-t border-dashed border-line pt-1.5 text-inksoft">
                        <span>Taxa de entrega (fica 100% com a loja)</span><span>{brl(o.deliveryFee)}</span>
                      </li>
                      <li className="flex justify-between font-extrabold text-ink">
                        <span>Total</span><span className="font-display">{brl(o.total)}</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-2 rounded-lg bg-moss-50/70 p-3.5 text-xs">
                    <p className="font-extrabold uppercase tracking-wider text-moss-700">Entrega</p>
                    <p className="font-semibold text-ink">{o.address}</p>
                    <p className="text-inksoft">{nbName(o.neighborhood)}</p>
                    <p className="flex items-center gap-1.5 pt-1 font-semibold text-moss-700">
                      <ILock className="h-3.5 w-3.5" /> Após a entrega, a loja só verá "{maskAddress(o.address)}"
                    </p>
                    <p className="flex items-center gap-1.5 font-semibold text-moss-700">
                      <IShield className="h-3.5 w-3.5" /> Contato via chat interno — telefone mascarado
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <CartDrawer />

      {/* CTA flutuante da sacola */}
      {state.cart.length > 0 && !state.cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          className="anim-pop fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full bg-moss-800 py-3 pl-5 pr-6 font-bold text-sun-200 shadow-lift transition hover:bg-moss-700"
        >
          <IBasket className="h-5 w-5" />
          <span>{state.cart.reduce((a, l) => a + l.qty, 0)} itens</span>
          <span className="rounded-full bg-sun-400 px-3 py-1 font-display text-sm font-extrabold text-ink">
            ver sacola
          </span>
        </button>
      )}
    </div>
  );
}
