import type { DadosProduto, Produto } from "../types";
import { requisicao } from "./http";

/** Cardápio: a API já devolve só os ativos com estoque (RN04). */
export const listarCardapio = () => requisicao<Produto[]>("GET", "/api/produtos");

/** Gestão: todos os produtos, inclusive inativos e sem estoque. */
export const listarTodosProdutos = () => requisicao<Produto[]>("GET", "/api/produtos/todos");

export const buscarProduto = (id: number) => requisicao<Produto>("GET", `/api/produtos/${id}`);

export const criarProduto = (dados: DadosProduto) => requisicao<Produto>("POST", "/api/produtos", dados);

export const editarProduto = (id: number, dados: DadosProduto) =>
  requisicao<Produto>("PUT", `/api/produtos/${id}`, dados);

/**
 * 204 (null): o produto nunca foi vendido e foi apagado de verdade.
 * 200 (Produto com ativo: false): já está em algum pedido, então o back só desativa.
 */
export const excluirProduto = (id: number) => requisicao<Produto | null>("DELETE", `/api/produtos/${id}`);

/** Liga/desliga o produto no cardápio (switch "No cardápio"). */
export const alterarProdutoAtivo = (id: number, ativo: boolean) =>
  requisicao<Produto>("PATCH", `/api/produtos/${id}/ativo`, { ativo });

export const ajustarEstoque = (id: number, quantidade: number) =>
  requisicao<Produto>("PATCH", `/api/produtos/${id}/estoque`, { quantidade });
