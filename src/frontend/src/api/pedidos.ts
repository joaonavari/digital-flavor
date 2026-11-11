import type { DadosNovoPedido, Pedido, StatusPedido } from "../types";
import { requisicao } from "./http";

export const confirmarPedido = (dados: DadosNovoPedido) => requisicao<Pedido>("POST", "/api/pedidos", dados);

/** ALUNO só vê o próprio pedido (403 se não for dele); a cantina vê qualquer um. */
export const buscarPedido = (id: number) => requisicao<Pedido>("GET", `/api/pedidos/${id}`);

export const listarMeusPedidos = () => requisicao<Pedido[]>("GET", "/api/pedidos/meus");

export const listarFila = () => requisicao<Pedido[]>("GET", "/api/pedidos/fila");

export const alterarStatusPedido = (id: number, status: StatusPedido) =>
  requisicao<Pedido>("PATCH", `/api/pedidos/${id}/status`, { status });

export const cancelarPedido = (id: number) => requisicao<Pedido>("POST", `/api/pedidos/${id}/cancelar`);
