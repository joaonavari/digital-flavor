const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Preço em reais: 6.5 → "R$ 6,50". */
export const formatarPreco = (valor: number): string => moeda.format(valor);
