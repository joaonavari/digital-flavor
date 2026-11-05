import { createContext } from "react";
import type { Produto } from "../types";

export interface ItemCarrinho {
  /** Cópia do produto no momento em que entrou no carrinho (atualizada ao recarregar o cardápio). */
  produto: Produto;
  quantidade: number;
}

export interface ValorCarrinho {
  itens: ItemCarrinho[];
  totalItens: number;
  total: number;
  quantidadeDe: (produtoId: number) => number;
  /** Soma 1. Não passa do estoque disponível (RN01). */
  adicionar: (produto: Produto) => void;
  /** Tira 1; com 0 o item sai do carrinho. */
  remover: (produtoId: number) => void;
  limpar: () => void;
  /**
   * Atualiza preços e estoque com o cardápio recém-carregado.
   * Devolve os nomes dos itens que saíram (indisponíveis) ou foram reduzidos.
   */
  sincronizar: (produtos: Produto[]) => { removidos: string[]; reduzidos: string[] };
}

export const CarrinhoContexto = createContext<ValorCarrinho | null>(null);
