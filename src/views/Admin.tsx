import React, { useMemo, useState } from "react";
import { useApp, brl, PAY_LABEL, STATUS_META, timeAgo } from "../state";
import {
  cx, AreaChart, Btn, Chip, HBars, inputCls, Monogram, Reveal, Stat,
  IBox, IChart, ICheck, IClock, IDownload, IReceipt, IShield, ISplit, IStar, IStore, IUsers,
} from "../components/ui";

const TABS = [
  { id: "geral", label: "Visão geral", icon: IChart },
  { id: "comissoes", label: "Comissões", icon: ISplit },
  { id: "relatorios", label: "Relatórios", icon: IReceipt },
  { id: "parceiros", label: "Parceiros", icon: IStore },
] as const;

function StoreCommRow({ storeId }: { storeId: string }) {
  const { state, patchStore, toast, nbName } = useApp();
  const store = state.stores.find((s) => s.id === storeId)!;
  const [draft, setDraft] = useState(String(store.commissionRate));
  const dirty = draft !== String(store.commissionRate);
  const tierRate = store.monthlyVolume > 15000 ? 8 : store.monthlyVolume >= 5000 ? 10 : 12;

  return (
    <li className="grid grid-cols-1 items-center gap-3 px-4 py-3 md:grid-cols-[1.3fr_1fr_0.7fr_1fr_auto]">
      <div className="flex items-center gap-3">
        <Monogram initials={store.initials} className="h-9 w-9 rounded-lg text-xs" />
        <div>
          <p className="text-sm font-extrabold text-ink">{store.name}</p>
          <p className="text-xs font-semibold text-inksoft">{store.neighborhoods.map(nbName).join(" • ")}</p>
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-inksoft">volume mensal</p>
        <p className="font-display font-extrabold text-ink">{brl(store.monthlyVolume)}</p>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-moss-100">
          <div className="h-full rounded-full bg-sun-500" style={{ width: `${Math.min(100, (store.monthlyVolume / 30000) * 100)}%` }} />
        </div>
      </div>
      <Chip className="w-fit border-sun-300 bg-sun-100 text-sun-700">faixa sugere {tierRate}%</Chip>
      <div className="flex items-center gap-2">
        <input
          className={cx(inputCls, "w-20 text-center font-extrabold")}
          value={draft}
          inputMode="decimal"
          onChange={(e) => setDraft(e.target.value.replace(",", "."))}
          aria-label={`Comissão de ${store.name}`}
        />
        <span className="text-sm font-bold text-inksoft">%</span>
      </div>
      <Btn
        kind={dirty ? "sun" : "ghost"}
        disabled={!dirty}
        className="px-3.5 py-2 text-xs"
        onClick={() => {
          const v = parseFloat(draft);
          if (!v || v <= 0 || v > 30) { toast("Comissão deve ficar entre 0 e 30%", "warn"); return; }
          patchStore(storeId, { commissionRate: v });
          toast(`Comissão de ${store.name} atualizada para ${v}% — vale para as próximas vendas`, "ok");
        }}
      >
        {dirty ? "Aplicar" : "Vigente"}
      </Btn>
    </li>
  );
}

export function AdminView() {
  const app = useApp();
  const { state, setDefaultCommission, patchStore, toast, nbName } = app;
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("geral");
  const [defaultDraft, setDefaultDraft] = useState(String(state.commissionDefault));
  const [tiers, setTiers] = useState([
    { label: "Até R$ 5 mil / mês", rate: "12" },
    { label: "R$ 5 mil – R$ 15 mil / mês", rate: "10" },
    { label: "Acima de R$ 15 mil / mês", rate: "8" },
  ]);

  const valid = state.orders.filter((o) => o.status !== "cancelado");
  const gmv = valid.reduce((a, o) => a + o.total, 0);
  const commission = valid.reduce((a, o) => a + o.commissionValue, 0);
  const repass = valid.reduce((a, o) => a + o.storeNet + o.deliveryFee, 0);

  const week = useMemo(() => {
    const labels: string[] = [];
    const values: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
      const next = d.getTime() + 86400000;
      labels.push(["dom", "seg", "ter", "qua", "qui", "sex", "sáb"][d.getDay()]);
      values.push(valid.filter((o) => o.placedAt >= d.getTime() && o.placedAt < next).reduce((a, o) => a + o.total, 0));
    }
    return { labels, values };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.orders]);

  const byNeighborhood = useMemo(() => {
    const map = new Map<string, { orders: number; gmv: number; comm: number; repass: number }>();
    for (const o of valid) {
      const cur = map.get(o.neighborhood) ?? { orders: 0, gmv: 0, comm: 0, repass: 0 };
      cur.orders++; cur.gmv += o.total; cur.comm += o.commissionValue; cur.repass += o.storeNet + o.deliveryFee;
      map.set(o.neighborhood, cur);
    }
    return Array.from(map.entries()).map(([id, v]) => ({ id, ...v })).sort((a, b) => b.gmv - a.gmv);
  }, [valid]);

  const payMix = useMemo(() => {
    const counts = { pix: 0, cartao: 0, dinheiro: 0 } as Record<string, number>;
    for (const o of valid) counts[o.payment]++;
    const total = valid.length || 1;
    return [
      { label: "Pix", value: Math.round((counts.pix / total) * 100), sub: `${counts.pix} pedidos` },
      { label: "Cartão (split)", value: Math.round((counts.cartao / total) * 100), sub: `${counts.cartao} pedidos` },
      { label: "Dinheiro na entrega", value: Math.round((counts.dinheiro / total) * 100), sub: `${counts.dinheiro} pedidos` },
    ];
  }, [valid]);

  const exportCsv = () => {
    const rows = [
      ["Bairro", "Pedidos", "GMV", "Comissao_Plataforma", "Repasse_Lojas"],
      ...byNeighborhood.map((n) => [nbName(n.id), n.orders, n.gmv.toFixed(2), n.comm.toFixed(2), n.repass.toFixed(2)]),
    ];
    const csv = "\uFEFF" + rows.map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "relatorio-por-regiao.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    toast("Relatório CSV exportado — consolidação por região", "ok");
  };

  const recent = [...state.orders].sort((a, b) => b.placedAt - a.placedAt).slice(0, 7);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6">
      <section className="anim-fadeUp flex flex-wrap items-center gap-3 rounded-xl border border-line bg-card p-5">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-ink text-sun-300"><IShield className="h-6 w-6" /></span>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-extrabold text-ink">Console da plataforma</h1>
          <p className="text-xs font-semibold text-inksoft">Operação do marketplace • revshare retido no split • {state.stores.length} parceiros na rede</p>
        </div>
        <nav className="no-scrollbar flex w-full gap-1 overflow-x-auto sm:w-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
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
              </button>
            );
          })}
        </nav>
      </section>

      {tab === "geral" && (
        <section className="anim-fadeUp mt-6 space-y-5">
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="GMV (7 dias)" value={brl(gmv)} sub={`${valid.length} transações`} tone="dark" icon={<IChart className="h-5 w-5" />} />
            <Stat label="Receita da plataforma" value={brl(commission)} sub={`${((commission / (gmv || 1)) * 100).toFixed(1)}% take rate efetivo`} icon={<ISplit className="h-5 w-5" />} />
            <Stat label="Repassado às lojas" value={brl(repass)} sub="liquidação D+1 via gateway" icon={<IUsers className="h-5 w-5" />} />
            <Stat label="Ticket médio" value={brl(gmv / (valid.length || 1))} sub="por pedido" icon={<IBox className="h-5 w-5" />} />
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <Reveal>
              <div className="h-full rounded-xl border border-line bg-card p-5">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-lg font-extrabold text-ink">GMV da rede — 7 dias</h3>
                  <span className="font-display font-extrabold text-moss-700">{brl(week.values.reduce((a, b) => a + b, 0))}</span>
                </div>
                <div className="mt-3"><AreaChart data={week.values} labels={week.labels} /></div>
              </div>
            </Reveal>
            <Reveal delay={90}>
              <div className="flex h-full flex-col rounded-xl border border-line bg-card p-5">
                <h3 className="font-display text-lg font-extrabold text-ink">Feed da rede</h3>
                <ul className="mt-2 flex-1 divide-y divide-line/70">
                  {recent.map((o) => {
                    const st = state.stores.find((s) => s.id === o.storeId);
                    return (
                      <li key={o.id} className="flex items-center gap-2.5 py-2">
                        <span className={cx("h-2 w-2 shrink-0 rounded-full", STATUS_META[o.status].bar)} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-extrabold text-ink">{o.code} • {st?.name}</p>
                          <p className="text-[11px] font-semibold text-inksoft">{nbName(o.neighborhood)} • há {timeAgo(o.placedAt)}</p>
                        </div>
                        <span className="text-xs font-extrabold text-moss-700">+{brl(o.commissionValue)}</span>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-2 rounded-lg bg-moss-50 px-3 py-2 text-[11px] font-bold text-moss-700">
                  Cada linha é uma comissão retida automaticamente no split — zero boleto, zero cobrança manual.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal>
            <div className="rounded-xl border border-line bg-card p-5">
              <h3 className="font-display text-lg font-extrabold text-ink">Bairros por GMV</h3>
              <div className="mt-4"><HBars items={byNeighborhood.map((n) => ({ label: nbName(n.id), value: n.gmv, sub: `${n.orders} pedidos` }))} format={brl} /></div>
            </div>
          </Reveal>
        </section>
      )}

      {tab === "comissoes" && (
        <section className="anim-fadeUp mt-6 space-y-5">
          <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
            <div className="rounded-xl border border-line bg-card p-5">
              <h3 className="font-display text-lg font-extrabold text-ink">Comissão padrão</h3>
              <p className="mt-1 text-xs font-semibold text-inksoft">Aplicada a novos parceiros no onboarding (adesão R$ 0).</p>
              <div className="mt-3 flex items-center gap-2">
                <input className={cx(inputCls, "w-24 text-center font-display text-xl font-extrabold")} value={defaultDraft} inputMode="decimal" onChange={(e) => setDefaultDraft(e.target.value.replace(",", "."))} aria-label="Comissão padrão" />
                <span className="font-display text-xl font-extrabold text-inksoft">%</span>
                <Btn
                  disabled={defaultDraft === String(state.commissionDefault)}
                  onClick={() => {
                    const v = parseFloat(defaultDraft);
                    if (!v || v <= 0 || v > 30) { toast("Valor inválido — use entre 0 e 30%", "warn"); return; }
                    setDefaultCommission(v);
                    toast(`Comissão padrão da rede: ${v}%`, "ok");
                  }}
                >
                  Salvar
                </Btn>
              </div>
            </div>
            <div className="rounded-xl border border-line bg-card p-5">
              <h3 className="font-display text-lg font-extrabold text-ink">Tabela escalonada por volume</h3>
              <p className="mt-1 text-xs font-semibold text-inksoft">Quem vende mais, paga menos — incentivo ao crescimento do parceiro.</p>
              <div className="mt-3 space-y-2">
                {tiers.map((t, i) => (
                  <div key={t.label} className="flex items-center justify-between gap-3 rounded-lg bg-paper px-3.5 py-2.5">
                    <span className="text-sm font-bold text-ink">{t.label}</span>
                    <span className="flex items-center gap-1.5">
                      <input
                        className={cx(inputCls, "w-16 py-1.5 text-center font-extrabold")}
                        value={t.rate}
                        inputMode="decimal"
                        onChange={(e) => setTiers(tiers.map((x, j) => (j === i ? { ...x, rate: e.target.value.replace(",", ".") } : x)))}
                        aria-label={`Taxa da faixa ${t.label}`}
                      />
                      <span className="text-sm font-extrabold text-inksoft">%</span>
                    </span>
                  </div>
                ))}
              </div>
              <Btn kind="ghost" className="mt-3 w-full" onClick={() => toast("Tabela escalonada publicada para toda a rede", "ok")}>
                <ICheck className="h-4 w-4" /> Publicar tabela
              </Btn>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-line bg-card">
            <div className="flex items-center justify-between border-b border-line bg-paper px-4 py-3">
              <h3 className="font-display text-lg font-extrabold text-ink">Comissão por parceiro</h3>
              <Chip className="border-sun-300 bg-sun-100 text-sun-700">alteração vale para vendas futuras</Chip>
            </div>
            <ul className="divide-y divide-line/70">
              {state.stores.map((s) => <StoreCommRow key={s.id} storeId={s.id} />)}
            </ul>
          </div>
        </section>
      )}

      {tab === "relatorios" && (
        <section className="anim-fadeUp mt-6 space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-xl border border-line bg-card p-5">
              <h3 className="font-display text-lg font-extrabold text-ink">Vendas por região</h3>
              <div className="mt-4"><HBars items={byNeighborhood.map((n) => ({ label: nbName(n.id), value: n.gmv, sub: `${n.orders} pedidos` }))} format={brl} /></div>
            </div>
            <div className="rounded-xl border border-line bg-card p-5">
              <h3 className="font-display text-lg font-extrabold text-ink">Meios de pagamento</h3>
              <div className="mt-4"><HBars items={payMix} format={(v) => `${v}%`} /></div>
              <p className="mt-4 flex items-center gap-2 rounded-lg bg-moss-50 px-3.5 py-2.5 text-[11px] font-bold text-moss-700">
                <ISplit className="h-4 w-4" /> Pix e cartão passam pelo gateway com split; dinheiro é coletado na entrega pela própria loja.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-line bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper px-4 py-3">
              <h3 className="font-display text-lg font-extrabold text-ink">Consolidação financeira por região</h3>
              <Btn kind="ghost" className="px-3.5 py-2 text-xs" onClick={exportCsv}><IDownload className="h-4 w-4" /> Exportar CSV</Btn>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-[11px] font-extrabold uppercase tracking-wider text-inksoft">
                  <tr className="border-b border-line">
                    <th className="px-4 py-2.5">Região</th>
                    <th className="px-4 py-2.5">Pedidos</th>
                    <th className="px-4 py-2.5">GMV</th>
                    <th className="px-4 py-2.5">Comissão (plataforma)</th>
                    <th className="px-4 py-2.5">Repasse (lojas)</th>
                    <th className="px-4 py-2.5">Take rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {byNeighborhood.map((n) => (
                    <tr key={n.id} className="transition hover:bg-moss-50/50">
                      <td className="px-4 py-3 font-extrabold text-ink">{nbName(n.id)}</td>
                      <td className="px-4 py-3 font-semibold text-inksoft">{n.orders}</td>
                      <td className="px-4 py-3 font-display font-extrabold text-ink">{brl(n.gmv)}</td>
                      <td className="px-4 py-3 font-bold text-moss-700">{brl(n.comm)}</td>
                      <td className="px-4 py-3 font-semibold text-inksoft">{brl(n.repass)}</td>
                      <td className="px-4 py-3"><Chip className="border-sun-300 bg-sun-100 text-sun-700">{((n.comm / (n.gmv || 1)) * 100).toFixed(1)}%</Chip></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-moss-800 bg-moss-50/70 font-extrabold">
                    <td className="px-4 py-3 text-ink">Total da rede</td>
                    <td className="px-4 py-3 text-inksoft">{valid.length}</td>
                    <td className="px-4 py-3 font-display text-moss-800">{brl(gmv)}</td>
                    <td className="px-4 py-3 text-moss-700">{brl(commission)}</td>
                    <td className="px-4 py-3 text-inksoft">{brl(repass)}</td>
                    <td className="px-4 py-3 text-sun-700">{((commission / (gmv || 1)) * 100).toFixed(1)}%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </section>
      )}

      {tab === "parceiros" && (
        <section className="anim-fadeUp mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-inksoft">
              {state.stores.length} parceiros • {state.stores.filter((s) => s.onboarding === "validacao").length} em validação • onboarding sempre R$ 0
            </p>
            <Chip className="border-moss-300 bg-moss-100 text-moss-700"><IClock className="h-3.5 w-3.5" /> ativação média: 26 min</Chip>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {state.stores.map((s, i) => (
              <Reveal key={s.id} delay={i * 70}>
                <article className="rounded-xl border border-line bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
                  <div className="flex items-start gap-3">
                    <Monogram initials={s.initials} />
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg font-extrabold text-ink">{s.name}</p>
                      <p className="text-xs font-semibold text-inksoft">{s.neighborhoods.map(nbName).join(" • ")} • {s.operators.length} operador(es)</p>
                    </div>
                    <span className={cx("rounded-full px-2.5 py-1 text-[11px] font-extrabold", s.onboarding === "ativo" ? "bg-moss-100 text-moss-700" : "bg-sun-100 text-sun-700 border border-sun-300")}>
                      {s.onboarding === "ativo" ? "Ativo" : "Em validação"}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-paper px-2 py-2">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-inksoft">comissão</p>
                      <p className="font-display text-base font-extrabold text-ink">{s.commissionRate}%</p>
                    </div>
                    <div className="rounded-lg bg-paper px-2 py-2">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-inksoft">volume/mês</p>
                      <p className="font-display text-base font-extrabold text-ink">{brl(s.monthlyVolume / 1000).replace(",00", "")}k</p>
                    </div>
                    <div className="rounded-lg bg-paper px-2 py-2">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-inksoft">avaliação</p>
                      <p className="flex items-center justify-center gap-1 font-display text-base font-extrabold text-ink"><IStar className="h-3.5 w-3.5 text-sun-500" sw={2.2} />{s.rating.toFixed(1)}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    {s.onboarding === "validacao" ? (
                      <Btn kind="sun" className="px-3.5 py-2 text-xs" onClick={() => { patchStore(s.id, { onboarding: "ativo" }); toast(`${s.name} aprovado — já pode receber pedidos`, "ok"); }}>
                        <ICheck className="h-4 w-4" /> Aprovar parceiro
                      </Btn>
                    ) : (
                      <Chip className="border-moss-300 bg-moss-50 text-moss-700"><IShield className="h-3.5 w-3.5" /> LGPD: termos v2.3 aceitos</Chip>
                    )}
                    <span className="ml-auto text-[11px] font-bold text-inksoft">documentos: {s.onboarding === "ativo" ? "validados" : "CNPJ em análise"}</span>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
