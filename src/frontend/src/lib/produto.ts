import type { DadosProduto, Produto } from "../types";

/** Limites do formulário de produto (alinhar com o schema do back se mudarem). */
export const LIMITES_PRODUTO = {
  nome: 120,
  descricao: 255,
  categoria: 60,
  imagemUrl: 500,
  precoMax: 9999.99,
  estoqueMax: 99999,
} as const;

/** Estoque baixo: selo "Acabando". */
export const ESTOQUE_BAIXO = 5;

export interface ValoresProduto extends Record<string, string> {
  nome: string;
  descricao: string;
  preco: string;
  categoria: string;
  quantidadeEstoque: string;
  imagemUrl: string;
}

export const VALORES_VAZIOS: ValoresProduto = {
  nome: "",
  descricao: "",
  preco: "",
  categoria: "",
  quantidadeEstoque: "",
  imagemUrl: "",
};

export function valoresDe(produto: Produto): ValoresProduto {
  return {
    nome: produto.nome,
    descricao: produto.descricao ?? "",
    preco: produto.preco.toFixed(2).replace(".", ","),
    categoria: produto.categoria ?? "",
    quantidadeEstoque: String(produto.quantidadeEstoque),
    imagemUrl: produto.imagemUrl ?? "",
  };
}

/** "6,50", "6.50", "R$ 6,5" → 6.5; inválido → NaN. */
export function lerPreco(texto: string): number {
  const limpo = texto.replace(/[R$\s]/g, "");
  if (!/^\d{1,6}([.,]\d{1,2})?$/.test(limpo)) return NaN;
  return Number(limpo.replace(",", "."));
}

/** Enquanto digita: só dígitos e uma vírgula, no máximo 2 casas. */
export function mascararPreco(texto: string): string {
  const s = texto.replace(".", ",").replace(/[^\d,]/g, "");
  const [inteiro = "", ...resto] = s.split(",");
  return resto.length ? `${inteiro.slice(0, 6)},${resto.join("").slice(0, 2)}` : inteiro.slice(0, 6);
}

export const validarProduto = {
  nome: (v: string) => (v.trim() ? (v.trim().length < 2 ? "O nome está muito curto." : null) : "Informe o nome do produto."),
  preco: (v: string) => {
    if (!v.trim()) return "Informe o preço.";
    const n = lerPreco(v);
    if (Number.isNaN(n)) return "Use só números e vírgula. Ex.: 6,50";
    if (n <= 0) return "O preço precisa ser maior que zero.";
    if (n > LIMITES_PRODUTO.precoMax) return "Preço alto demais. Confira o valor.";
    return null;
  },
  quantidadeEstoque: (v: string) => {
    if (!v.trim()) return "Informe o estoque (pode ser 0).";
    if (!/^\d+$/.test(v.trim())) return "Use um número inteiro, sem vírgula.";
    if (Number(v) > LIMITES_PRODUTO.estoqueMax) return "Estoque alto demais. Confira o valor.";
    return null;
  },
  imagemUrl: (v: string) => {
    if (!v.trim()) return null; // opcional
    try {
      const url = new URL(v.trim());
      return url.protocol === "http:" || url.protocol === "https:" ? null : "Use um endereço que comece com https://";
    } catch {
      return "Endereço inválido. Ex.: https://site.com/foto.jpg";
    }
  },
};

/** Corpo do POST/PUT no formato do contrato (opcionais vazios não são enviados). */
export function paraDadosProduto(v: ValoresProduto): DadosProduto {
  return {
    nome: v.nome.trim(),
    preco: lerPreco(v.preco),
    quantidadeEstoque: Number(v.quantidadeEstoque),
    ...(v.descricao.trim() ? { descricao: v.descricao.trim() } : {}),
    ...(v.categoria.trim() ? { categoria: v.categoria.trim() } : {}),
    ...(v.imagemUrl.trim() ? { imagemUrl: v.imagemUrl.trim() } : {}),
  };
}

/** Busca sem diferenciar acentos nem maiúsculas: "pao" encontra "Pão de queijo". */
export function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("pt-BR");
}

/** Poucas unidades: avisa o aluno para não ser surpreendido no checkout. */
export const POUCAS_UNIDADES = 5;
