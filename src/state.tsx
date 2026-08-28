import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from "react";

/* ============================= tipos ============================= */

export type Module = "client" | "vendor" | "admin";
export type OrderStatus = "novo" | "preparando" | "entrega" | "entregue" | "cancelado";
export type Payment = "pix" | "cartao" | "dinheiro";
export type Category =
  | "Hortifruti"
  | "Padaria"
  | "Açougue"
  | "Laticínios"
  | "Bebidas"
  | "Mercearia"
  | "Limpeza"
  | "Higiene";

export interface Neighborhood {
  id: string;
  name: string;
  zone: string;
}
export type Role = "gerente" | "atendente" | "entregador";
export interface Operator {
  id: string;
  name: string;
  role: Role;
}
export interface Store {
  id: string;
  name: string;
  owner: string;
  initials: string;
  neighborhoods: string[];
  radiusKm: number;
  rating: number;
  reviews: number;
  eta: [number, number];
  distanceKm: number;
  tags: string[];
  isOpen: boolean;
  deliveryFee: number;
  commissionRate: number;
  monthlyVolume: number;
  maskedAccount: string;
  operators: Operator[];
  onboarding: "ativo" | "validacao";
}
export interface Product {
  id: string;
  storeId: string;
  name: string;
  category: Category;
  price: number;
  stock: number;
  unit: string;
  active: boolean;
}
export interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
  unit: string;
}
export interface Order {
  id: string;
  code: string;
  storeId: string;
  customerName: string;
  maskedPhone: string;
  address: string;
  neighborhood: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  commissionRate: number;
  commissionValue: number;
  storeNet: number;
  total: number;
  status: OrderStatus;
  placedAt: number;
  payment: Payment;
  mine: boolean;
}
export interface Toast {
  id: number;
  msg: string;
  kind: "ok" | "info" | "warn";
}
export interface CartLine {
  productId: string;
  qty: number;
}
export interface AppState {
  module: Module;
  neighborhood: string | null;
  detecting: boolean;
  stores: Store[];
  products: Product[];
  orders: Order[];
  cart: CartLine[];
  cartOpen: boolean;
  toasts: Toast[];
  vendorStoreId: string;
  commissionDefault: number;
  seq: number;
}

/* ============================= helpers ============================= */

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const maskAddress = (addr: string) => {
  const first = addr.split(" ")[0];
  return `${first} •••••, •••`;
};

export const timeAgo = (t: number) => {
  const m = Math.max(1, Math.round((Date.now() - t) / 60000));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h`;
  return `${Math.floor(h / 24)} d`;
};

let uid = 0;
export const nextId = () => `id-${Date.now().toString(36)}-${uid++}`;

export const CATEGORIES: Category[] = [
  "Hortifruti",
  "Padaria",
  "Açougue",
  "Laticínios",
  "Bebidas",
  "Mercearia",
  "Limpeza",
  "Higiene",
];

export const STATUS_META: Record<OrderStatus, { label: string; pill: string; bar: string }> = {
  novo: { label: "Novo", pill: "bg-sun-100 text-sun-700 border border-sun-300", bar: "bg-sun-400" },
  preparando: { label: "Em preparo", pill: "bg-teal-100 text-teal-700 border border-teal-600/25", bar: "bg-teal-600" },
  entrega: { label: "Em entrega", pill: "bg-clay-100 text-clay-600 border border-clay-500/25", bar: "bg-clay-500" },
  entregue: { label: "Entregue", pill: "bg-moss-100 text-moss-700 border border-moss-300", bar: "bg-moss-500" },
  cancelado: { label: "Cancelado", pill: "bg-ink/5 text-inksoft border border-line", bar: "bg-inksoft" },
};

export const PAY_LABEL: Record<Payment, string> = {
  pix: "Pix",
  cartao: "Cartão",
  dinheiro: "Dinheiro",
};

/* ============================= seed ============================= */

export const NEIGHBORHOODS: Neighborhood[] = [
  { id: "vm", name: "Vila Madalena", zone: "Zona Oeste" },
  { id: "pi", name: "Pinheiros", zone: "Zona Oeste" },
  { id: "la", name: "Lapa", zone: "Zona Oeste" },
  { id: "mo", name: "Moema", zone: "Zona Sul" },
  { id: "ta", name: "Tatuapé", zone: "Zona Leste" },
  { id: "je", name: "Jardim Europa", zone: "Zona Oeste" },
];

const nbName = (id: string) => NEIGHBORHOODS.find((n) => n.id === id)?.name ?? id;

const STORES: Store[] = [
  {
    id: "ze",
    name: "Mercadinho do Zé",
    owner: "José Almeida",
    initials: "MZ",
    neighborhoods: ["vm", "pi"],
    radiusKm: 3,
    rating: 4.8,
    reviews: 342,
    eta: [25, 40],
    distanceKm: 0.8,
    tags: ["Hortifruti", "Padaria", "Açougue"],
    isOpen: true,
    deliveryFee: 5.9,
    commissionRate: 12,
    monthlyVolume: 18420,
    maskedAccount: "Banco 341 • Ag •••• • C/C •••••-4",
    operators: [
      { id: "op1", name: "Zé Almeida", role: "gerente" },
      { id: "op2", name: "Marta Souza", role: "atendente" },
      { id: "op3", name: "Duda Ferreira", role: "entregador" },
    ],
    onboarding: "ativo",
  },
  {
    id: "sj",
    name: "Mercearia São Jorge",
    owner: "Jorge Batista",
    initials: "SJ",
    neighborhoods: ["pi", "la"],
    radiusKm: 2.5,
    rating: 4.6,
    reviews: 198,
    eta: [20, 35],
    distanceKm: 1.2,
    tags: ["Mercearia", "Bebidas", "Limpeza"],
    isOpen: true,
    deliveryFee: 4.9,
    commissionRate: 10,
    monthlyVolume: 9870,
    maskedAccount: "Banco 001 • Ag •••• • C/C •••••-9",
    operators: [
      { id: "op4", name: "Jorge Batista", role: "gerente" },
      { id: "op5", name: "Caio Lima", role: "entregador" },
    ],
    onboarding: "ativo",
  },
  {
    id: "sc",
    name: "Empório Santa Clara",
    owner: "Clara Mendes",
    initials: "SC",
    neighborhoods: ["mo"],
    radiusKm: 2,
    rating: 4.9,
    reviews: 256,
    eta: [30, 45],
    distanceKm: 0.6,
    tags: ["Orgânicos", "Hortifruti", "Artesanais"],
    isOpen: true,
    deliveryFee: 6.9,
    commissionRate: 12,
    monthlyVolume: 13240,
    maskedAccount: "Banco 033 • Ag •••• • C/C •••••-1",
    operators: [{ id: "op6", name: "Clara Mendes", role: "gerente" }],
    onboarding: "ativo",
  },
  {
    id: "bp",
    name: "Mercado Bom Preço",
    owner: "Sérgio Tavares",
    initials: "BP",
    neighborhoods: ["ta"],
    radiusKm: 4,
    rating: 4.3,
    reviews: 511,
    eta: [35, 55],
    distanceKm: 1.9,
    tags: ["Atacarejo", "Mercearia", "Ofertas"],
    isOpen: true,
    deliveryFee: 3.9,
    commissionRate: 8,
    monthlyVolume: 27630,
    maskedAccount: "Banco 237 • Ag •••• • C/C •••••-7",
    operators: [
      { id: "op7", name: "Sérgio Tavares", role: "gerente" },
      { id: "op8", name: "Beto Nunes", role: "atendente" },
    ],
    onboarding: "ativo",
  },
  {
    id: "pv",
    name: "Padaria & Mercado da Vila",
    owner: "Helena Duarte",
    initials: "PV",
    neighborhoods: ["vm", "la"],
    radiusKm: 2,
    rating: 4.7,
    reviews: 164,
    eta: [15, 30],
    distanceKm: 0.5,
    tags: ["Padaria", "Laticínios", "Café"],
    isOpen: false,
    deliveryFee: 4.5,
    commissionRate: 10,
    monthlyVolume: 4310,
    maskedAccount: "Banco 341 • Ag •••• • C/C •••••-2",
    operators: [{ id: "op9", name: "Helena Duarte", role: "gerente" }],
    onboarding: "validacao",
  },
];

let pid = 0;
const P = (storeId: string, name: string, category: Category, price: number, stock: number, unit: string): Product => ({
  id: `p${++pid}`,
  storeId,
  name,
  category,
  price,
  stock,
  unit,
  active: true,
});

const PRODUCTS: Product[] = [
  // Mercadinho do Zé
  P("ze", "Pão francês artesanal", "Padaria", 18.9, 24, "kg"),
  P("ze", "Queijo minas frescal", "Laticínios", 34.9, 8, "kg"),
  P("ze", "Leite integral 1L", "Laticínios", 5.49, 30, "un"),
  P("ze", "Ovos caipiras", "Laticínios", 16.9, 18, "dz"),
  P("ze", "Banana nanica", "Hortifruti", 6.9, 40, "kg"),
  P("ze", "Tomate italiano", "Hortifruti", 9.8, 26, "kg"),
  P("ze", "Alface crespa", "Hortifruti", 3.5, 15, "un"),
  P("ze", "Cheiro-verde", "Hortifruti", 2.5, 4, "un"),
  P("ze", "Peito de frango", "Açougue", 17.9, 18, "kg"),
  P("ze", "Patinho moído", "Açougue", 32.9, 12, "kg"),
  P("ze", "Arroz agulhinha 5 kg", "Mercearia", 27.9, 20, "pct"),
  P("ze", "Feijão carioca 1 kg", "Mercearia", 8.99, 25, "pct"),
  P("ze", "Café torrado 500 g", "Mercearia", 16.5, 22, "un"),
  P("ze", "Refrigerante cola 2L", "Bebidas", 9.99, 28, "un"),
  P("ze", "Suco de uva integral 1L", "Bebidas", 12.9, 14, "un"),
  P("ze", "Detergente neutro", "Limpeza", 2.99, 40, "un"),
  P("ze", "Sabão em pó 1 kg", "Limpeza", 14.9, 16, "un"),
  P("ze", "Papel higiênico 12 rolos", "Higiene", 19.9, 5, "pct"),
  // Mercearia São Jorge
  P("sj", "Azeite extravirgem 500 ml", "Mercearia", 24.9, 14, "un"),
  P("sj", "Espaguete 500 g", "Mercearia", 4.79, 36, "un"),
  P("sj", "Molho de tomate 340 g", "Mercearia", 3.49, 42, "un"),
  P("sj", "Cerveja lager 350 ml (6 un)", "Bebidas", 26.9, 20, "pct"),
  P("sj", "Água mineral 1,5L", "Bebidas", 3.29, 48, "un"),
  P("sj", "Achocolatado 400 g", "Mercearia", 8.99, 26, "un"),
  P("sj", "Cream cracker", "Mercearia", 5.49, 31, "un"),
  P("sj", "Amaciante 2L", "Limpeza", 9.9, 19, "un"),
  P("sj", "Shampoo 350 ml", "Higiene", 13.9, 11, "un"),
  P("sj", "Linguiça toscana", "Açougue", 21.9, 9, "kg"),
  // Empório Santa Clara
  P("sc", "Cesta orgânica da semana", "Hortifruti", 59.9, 10, "un"),
  P("sc", "Alface orgânica", "Hortifruti", 5.9, 16, "un"),
  P("sc", "Cenoura orgânica", "Hortifruti", 8.4, 21, "kg"),
  P("sc", "Ovos orgânicos", "Laticínios", 18.9, 13, "10 un"),
  P("sc", "Queijo canastra 500 g", "Laticínios", 49.9, 6, "un"),
  P("sc", "Granola artesanal 400 g", "Mercearia", 21.9, 15, "un"),
  P("sc", "Mel silvestre 280 g", "Mercearia", 29.9, 12, "un"),
  P("sc", "Kombucha de gengibre 350 ml", "Bebidas", 12.5, 3, "un"),
  // Mercado Bom Preço
  P("bp", "Arroz tipo 1 5 kg", "Mercearia", 24.9, 44, "pct"),
  P("bp", "Feijão carioca 1 kg", "Mercearia", 7.99, 52, "pct"),
  P("bp", "Óleo de soja 900 ml", "Mercearia", 6.99, 38, "un"),
  P("bp", "Açúcar cristal 1 kg", "Mercearia", 4.49, 47, "un"),
  P("bp", "Café tradicional 500 g", "Mercearia", 13.9, 33, "un"),
  P("bp", "Refrigerante guaraná 2L", "Bebidas", 8.49, 29, "un"),
  P("bp", "Papel higiênico 12 rolos", "Higiene", 17.9, 24, "pct"),
  P("bp", "Sabonete 90 g", "Higiene", 2.49, 60, "un"),
  // Padaria & Mercado da Vila
  P("pv", "Pão de queijo 400 g", "Padaria", 14.9, 17, "un"),
  P("pv", "Bolo de fubá com goiabada", "Padaria", 24.9, 7, "un"),
  P("pv", "Rosca caseira", "Padaria", 12.9, 9, "un"),
  P("pv", "Sonho de doce de leite", "Padaria", 5.5, 22, "un"),
  P("pv", "Torta salgada (fatia)", "Padaria", 9.9, 14, "un"),
  P("pv", "Requeijão cremoso 200 g", "Laticínios", 9.49, 20, "un"),
  P("pv", "Mussarela fatiada", "Laticínios", 44.9, 8, "kg"),
  P("pv", "Presunto cozido", "Açougue", 24.9, 10, "kg"),
];

/* -------- histórico determinístico (7 dias) -------- */

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CUSTOMERS = [
  "Ana Beatriz", "Carlos Menezes", "Fernanda Lopes", "João Pedro", "Luiza Andrade",
  "Marcos Vinícius", "Patrícia Ramos", "Rafael Duarte", "Sofia Teixeira", "Bruno Carvalho",
  "Otávio Freitas", "Camila Rocha",
];
const STREETS: Record<string, string[]> = {
  vm: ["Rua Harmonia", "Rua Aspicuelta", "Rua Fradique Coutinho", "Rua Girassol"],
  pi: ["Rua Artur de Azevedo", "Rua dos Pinheiros", "Rua Teodoro Sampaio"],
  la: ["Rua Clélia", "Rua Roma", "Rua Doze de Outubro"],
  mo: ["Alameda dos Anapurus", "Rua Normandia", "Avenida Sabiá"],
  ta: ["Rua Emília Marengo", "Rua Tuiuti", "Avenida Celso Garcia"],
};

function buildOrders(products: Product[], stores: Store[]): { orders: Order[]; seq: number } {
  const rnd = mulberry32(20260214);
  const now = Date.now();
  const orders: Order[] = [];
  let seq = 1001;

  const push = (storeId: string, status: OrderStatus, placedAt: number, mine = false) => {
    const store = stores.find((s) => s.id === storeId)!;
    const storeProducts = products.filter((p) => p.storeId === storeId);
    const nItems = 1 + Math.floor(rnd() * 3);
    const picked: OrderItem[] = [];
    const used = new Set<number>();
    for (let i = 0; i < nItems; i++) {
      let idx = Math.floor(rnd() * storeProducts.length);
      if (used.has(idx)) continue;
      used.add(idx);
      const p = storeProducts[idx];
      picked.push({ productId: p.id, name: p.name, qty: 1 + Math.floor(rnd() * 2), price: p.price, unit: p.unit });
    }
    const nb = store.neighborhoods[Math.floor(rnd() * store.neighborhoods.length)];
    const street = (STREETS[nb] ?? ["Rua do Bairro"])[Math.floor(rnd() * (STREETS[nb] ?? ["x"]).length)];
    const num = 10 + Math.floor(rnd() * 900);
    const subtotal = picked.reduce((a, i) => a + i.price * i.qty, 0);
    const commissionValue = subtotal * (store.commissionRate / 100);
    const d = 1 + Math.floor(rnd() * 9);
    orders.push({
      id: nextId(),
      code: `#${seq++}`,
      storeId,
      customerName: CUSTOMERS[Math.floor(rnd() * CUSTOMERS.length)],
      maskedPhone: `(11) 9••••-••${10 + d}`,
      address: `${street}, ${num} — apto ${10 + Math.floor(rnd() * 90)}`,
      neighborhood: nb,
      items: picked,
      subtotal,
      deliveryFee: store.deliveryFee,
      commissionRate: store.commissionRate,
      commissionValue,
      storeNet: subtotal - commissionValue,
      total: subtotal + store.deliveryFee,
      status,
      placedAt,
      payment: (["pix", "pix", "cartao", "dinheiro"] as Payment[])[Math.floor(rnd() * 4)],
      mine,
    });
  };

  // histórico entregue — volume por loja
  const historyCount: Record<string, number> = { ze: 11, sj: 8, sc: 7, bp: 12, pv: 5 };
  for (const st of stores) {
    for (let i = 0; i < historyCount[st.id]; i++) {
      const placed = now - rnd() * 7 * 24 * 3600 * 1000;
      push(st.id, "entregue", placed);
    }
  }
  orders.sort((a, b) => a.placedAt - b.placedAt);

  // pedidos ativos de demonstração (agora)
  push("ze", "entregue", now - 2 * 3600 * 1000);
  push("ze", "entrega", now - 21 * 60 * 1000);
  push("ze", "preparando", now - 9 * 60 * 1000);
  push("ze", "novo", now - 2 * 60 * 1000);
  push("sj", "novo", now - 4 * 60 * 1000);
  push("sc", "entrega", now - 16 * 60 * 1000);

  return { orders, seq };
}

const seedBuilt = buildOrders(PRODUCTS, STORES);

const initialState: AppState = {
  module: "client",
  neighborhood: "vm",
  detecting: false,
  stores: STORES,
  products: PRODUCTS,
  orders: seedBuilt.orders,
  cart: [],
  cartOpen: false,
  toasts: [],
  vendorStoreId: "ze",
  commissionDefault: 12,
  seq: seedBuilt.seq,
};

/* ============================= actions / reducer ============================= */

type Action =
  | { type: "SET_MODULE"; module: Module }
  | { type: "SET_NEIGHBORHOOD"; id: string | null }
  | { type: "SET_DETECTING"; v: boolean }
  | { type: "SET_CART_OPEN"; v: boolean }
  | { type: "CART_ADD"; productId: string }
  | { type: "CART_SET"; productId: string; qty: number }
  | { type: "CART_CLEAR" }
  | { type: "ADD_ORDERS"; orders: Order[]; clearCart?: boolean }
  | { type: "ADVANCE_ORDER"; id: string }
  | { type: "CANCEL_ORDER"; id: string }
  | { type: "UPSERT_PRODUCT"; product: Product }
  | { type: "DELETE_PRODUCT"; id: string }
  | { type: "TOGGLE_PRODUCT"; id: string }
  | { type: "PATCH_STORE"; id: string; patch: Partial<Store> }
  | { type: "OPERATOR_ADD"; storeId: string; op: Operator }
  | { type: "OPERATOR_REMOVE"; storeId: string; opId: string }
  | { type: "OPERATOR_ROLE"; storeId: string; opId: string; role: Role }
  | { type: "SET_DEFAULT_COMMISSION"; rate: number }
  | { type: "TOAST_ADD"; toast: Toast }
  | { type: "TOAST_REMOVE"; id: number };

const FLOW: OrderStatus[] = ["novo", "preparando", "entrega", "entregue"];

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_MODULE":
      return { ...state, module: action.module, cartOpen: false };
    case "SET_NEIGHBORHOOD":
      return { ...state, neighborhood: action.id, detecting: false };
    case "SET_DETECTING":
      return { ...state, detecting: action.v };
    case "SET_CART_OPEN":
      return { ...state, cartOpen: action.v };
    case "CART_ADD": {
      const product = state.products.find((p) => p.id === action.productId);
      if (!product) return state;
      const line = state.cart.find((l) => l.productId === action.productId);
      const qty = line ? line.qty : 0;
      if (qty >= product.stock) return state;
      const cart = line
        ? state.cart.map((l) => (l.productId === action.productId ? { ...l, qty: l.qty + 1 } : l))
        : [...state.cart, { productId: action.productId, qty: 1 }];
      return { ...state, cart };
    }
    case "CART_SET": {
      if (action.qty <= 0)
        return { ...state, cart: state.cart.filter((l) => l.productId !== action.productId) };
      const product = state.products.find((p) => p.id === action.productId);
      const qty = product ? Math.min(action.qty, product.stock) : action.qty;
      return {
        ...state,
        cart: state.cart.map((l) => (l.productId === action.productId ? { ...l, qty } : l)),
      };
    }
    case "CART_CLEAR":
      return { ...state, cart: [] };
    case "ADD_ORDERS": {
      const products = state.products.map((p) => {
        let stock = p.stock;
        for (const o of action.orders)
          for (const it of o.items) if (it.productId === p.id) stock = Math.max(0, stock - it.qty);
        return stock === p.stock ? p : { ...p, stock };
      });
      return {
        ...state,
        orders: [...state.orders, ...action.orders],
        seq: state.seq + action.orders.length,
        products,
        cart: action.clearCart ? [] : state.cart,
        cartOpen: action.clearCart ? false : state.cartOpen,
      };
    }
    case "ADVANCE_ORDER": {
      const orders = state.orders.map((o) => {
        if (o.id !== action.id) return o;
        const i = FLOW.indexOf(o.status);
        return i >= 0 && i < FLOW.length - 1 ? { ...o, status: FLOW[i + 1] } : o;
      });
      return { ...state, orders };
    }
    case "CANCEL_ORDER":
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.id && (o.status === "novo" || o.status === "preparando")
            ? { ...o, status: "cancelado" }
            : o
        ),
      };
    case "UPSERT_PRODUCT": {
      const exists = state.products.some((p) => p.id === action.product.id);
      return {
        ...state,
        products: exists
          ? state.products.map((p) => (p.id === action.product.id ? action.product : p))
          : [action.product, ...state.products],
      };
    }
    case "DELETE_PRODUCT":
      return { ...state, products: state.products.filter((p) => p.id !== action.id) };
    case "TOGGLE_PRODUCT":
      return {
        ...state,
        products: state.products.map((p) => (p.id === action.id ? { ...p, active: !p.active } : p)),
      };
    case "PATCH_STORE":
      return {
        ...state,
        stores: state.stores.map((s) => (s.id === action.id ? { ...s, ...action.patch } : s)),
      };
    case "OPERATOR_ADD":
      return {
        ...state,
        stores: state.stores.map((s) =>
          s.id === action.storeId ? { ...s, operators: [...s.operators, action.op] } : s
        ),
      };
    case "OPERATOR_REMOVE":
      return {
        ...state,
        stores: state.stores.map((s) =>
          s.id === action.storeId
            ? { ...s, operators: s.operators.filter((o) => o.id !== action.opId) }
            : s
        ),
      };
    case "OPERATOR_ROLE":
      return {
        ...state,
        stores: state.stores.map((s) =>
          s.id === action.storeId
            ? { ...s, operators: s.operators.map((o) => (o.id === action.opId ? { ...o, role: action.role } : o)) }
            : s
        ),
      };
    case "SET_DEFAULT_COMMISSION":
      return { ...state, commissionDefault: action.rate };
    case "TOAST_ADD":
      return { ...state, toasts: [...state.toasts.slice(-3), action.toast] };
    case "TOAST_REMOVE":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    default:
      return state;
  }
}

/* ============================= contexto ============================= */

export interface CustomerInfo {
  name: string;
  address: string;
  neighborhood: string;
}

export interface AppApi {
  state: AppState;
  setModule: (m: Module) => void;
  setNeighborhood: (id: string | null) => void;
  detectNeighborhood: () => void;
  setCartOpen: (v: boolean) => void;
  cartAdd: (productId: string) => void;
  cartSet: (productId: string, qty: number) => void;
  placeOrder: (info: CustomerInfo, payment: Payment) => Order[];
  advanceOrder: (id: string) => void;
  cancelOrder: (id: string) => void;
  upsertProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  toggleProduct: (id: string) => void;
  patchStore: (id: string, patch: Partial<Store>) => void;
  addOperator: (storeId: string, name: string, role: Role) => void;
  removeOperator: (storeId: string, opId: string) => void;
  setOperatorRole: (storeId: string, opId: string, role: Role) => void;
  setDefaultCommission: (rate: number) => void;
  toast: (msg: string, kind?: Toast["kind"]) => void;
  nbName: (id: string) => string;
}

const Ctx = createContext<AppApi | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const toast = (msg: string, kind: Toast["kind"] = "ok") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    dispatch({ type: "TOAST_ADD", toast: { id, msg, kind } });
    window.setTimeout(() => dispatch({ type: "TOAST_REMOVE", id }), 4200);
  };

  const buildStoreOrder = (
    storeId: string,
    items: OrderItem[],
    info: CustomerInfo,
    payment: Payment,
    mine: boolean,
    seq: number
  ): Order => {
    const s = stateRef.current;
    const store = s.stores.find((st) => st.id === storeId)!;
    const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
    const commissionValue = subtotal * (store.commissionRate / 100);
    return {
      id: nextId(),
      code: `#${seq}`,
      storeId,
      customerName: info.name,
      maskedPhone: "(11) 9••••-••34",
      address: info.address,
      neighborhood: info.neighborhood,
      items,
      subtotal,
      deliveryFee: store.deliveryFee,
      commissionRate: store.commissionRate,
      commissionValue,
      storeNet: subtotal - commissionValue,
      total: subtotal + store.deliveryFee,
      status: "novo",
      placedAt: Date.now(),
      payment,
      mine,
    };
  };
  const api = useMemo<AppApi>(() => {
    const placeOrder = (info: CustomerInfo, payment: Payment): Order[] => {
      const s = stateRef.current;
      const byStore = new Map<string, OrderItem[]>();
      for (const line of s.cart) {
        const p = s.products.find((pr) => pr.id === line.productId);
        if (!p) continue;
        const arr = byStore.get(p.storeId) ?? [];
        arr.push({ productId: p.id, name: p.name, qty: line.qty, price: p.price, unit: p.unit });
        byStore.set(p.storeId, arr);
      }
      const orders = Array.from(byStore.entries()).map(([storeId, items], i) =>
        buildStoreOrder(storeId, items, info, payment, true, s.seq + i)
      );
      if (orders.length) dispatch({ type: "ADD_ORDERS", orders, clearCart: true });
      return orders;
    };

    return {
      state,
      setModule: (m) => dispatch({ type: "SET_MODULE", module: m }),
      setNeighborhood: (id) => dispatch({ type: "SET_NEIGHBORHOOD", id }),
      detectNeighborhood: () => {
        dispatch({ type: "SET_DETECTING", v: true });
        window.setTimeout(() => {
          dispatch({ type: "SET_NEIGHBORHOOD", id: "vm" });
          toast("Localização confirmada: Vila Madalena", "ok");
        }, 1400);
      },
      setCartOpen: (v) => dispatch({ type: "SET_CART_OPEN", v }),
      cartAdd: (productId) => dispatch({ type: "CART_ADD", productId }),
      cartSet: (productId, qty) => dispatch({ type: "CART_SET", productId, qty }),
      placeOrder,
      advanceOrder: (id) => dispatch({ type: "ADVANCE_ORDER", id }),
      cancelOrder: (id) => dispatch({ type: "CANCEL_ORDER", id }),
      upsertProduct: (p) => dispatch({ type: "UPSERT_PRODUCT", product: p }),
      deleteProduct: (id) => dispatch({ type: "DELETE_PRODUCT", id }),
      toggleProduct: (id) => dispatch({ type: "TOGGLE_PRODUCT", id }),
      patchStore: (id, patch) => dispatch({ type: "PATCH_STORE", id, patch }),
      addOperator: (storeId, name, role) =>
        dispatch({ type: "OPERATOR_ADD", storeId, op: { id: nextId(), name, role } }),
      removeOperator: (storeId, opId) => dispatch({ type: "OPERATOR_REMOVE", storeId, opId }),
      setOperatorRole: (storeId, opId, role) =>
        dispatch({ type: "OPERATOR_ROLE", storeId, opId, role }),
      setDefaultCommission: (rate) => dispatch({ type: "SET_DEFAULT_COMMISSION", rate }),
      toast,
      nbName,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // simulação viva: novos pedidos chegando na rede
  useEffect(() => {
    const t = window.setInterval(() => {
      const s = stateRef.current;
      const openStores = s.stores.filter((st) => st.isOpen);
      const store = openStores[Math.floor(Math.random() * openStores.length)];
      if (!store) return;
      const pool = s.products.filter((p) => p.storeId === store.id && p.active && p.stock > 0);
      if (!pool.length) return;
      const n = 1 + Math.floor(Math.random() * 2);
      const items: OrderItem[] = [];
      const used = new Set<string>();
      for (let i = 0; i < n; i++) {
        const p = pool[Math.floor(Math.random() * pool.length)];
        if (used.has(p.id)) continue;
        used.add(p.id);
        items.push({ productId: p.id, name: p.name, qty: 1 + Math.floor(Math.random() * 2), price: p.price, unit: p.unit });
      }
      const nb = store.neighborhoods[Math.floor(Math.random() * store.neighborhoods.length)];
      const street = (STREETS[nb] ?? ["Rua do Bairro"])[0];
      const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
      const commissionValue = subtotal * (store.commissionRate / 100);
      const order: Order = {
        id: nextId(),
        code: `#${s.seq}`,
        storeId: store.id,
        customerName: CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)],
        maskedPhone: `(11) 9••••-••${10 + Math.floor(Math.random() * 89)}`,
        address: `${street}, ${10 + Math.floor(Math.random() * 900)}`,
        neighborhood: nb,
        items,
        subtotal,
        deliveryFee: store.deliveryFee,
        commissionRate: store.commissionRate,
        commissionValue,
        storeNet: subtotal - commissionValue,
        total: subtotal + store.deliveryFee,
        status: "novo",
        placedAt: Date.now(),
        payment: Math.random() > 0.4 ? "pix" : "cartao",
        mine: false,
      };
      dispatch({ type: "ADD_ORDERS", orders: [order] });
      toast(`Novo pedido ${order.code} na rede — ${store.name}`, "info");
    }, 34000);
    return () => window.clearInterval(t);
  }, []);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useApp(): AppApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp fora do AppProvider");
  return ctx;
}
