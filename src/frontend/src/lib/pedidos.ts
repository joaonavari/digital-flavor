import type { Pagamento, StatusPagamento, StatusPedido } from "../types";

export const NOME_STATUS: Record<StatusPedido, string> = {
  RECEBIDO: "Recebido",
  EM_PREPARO: "Em preparo",
  PRONTO: "Pronto",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

/** Pedido ainda andando na cantina (atualiza sozinho). */
export const emAndamento = (status: StatusPedido) =>
  status === "RECEBIDO" || status === "EM_PREPARO" || status === "PRONTO";

const NOME_STATUS_PAGAMENTO: Record<StatusPagamento, string> = {
  APROVADO: "Aprovado",
  PENDENTE: "Pendente",
  RECUSADO: "Recusado",
  ESTORNADO: "Estornado",
};

/** O contrato não fixa os valores de pagamento.status: traduz os conhecidos e mostra o resto como veio. */
export function nomeStatusPagamento(status: string): string {
  const conhecido = (NOME_STATUS_PAGAMENTO as Record<string, string | undefined>)[status.toUpperCase()];
  if (conhecido) return conhecido;
  const texto = status.replace(/_/g, " ").toLowerCase();
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** O back guarda "**** **** **** 1234"; na tela mostramos só "Cartão •••• 1234". */
export function descricaoPagamento(pagamento: Pagamento): string {
  if (pagamento.metodo === "PIX") return "PIX";
  const finais = pagamento.numeroMascarado?.match(/(\d{4})\s*$/)?.[1];
  return finais ? `Cartão •••• ${finais}` : "Cartão";
}

const hora = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
const diaMes = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" });
const diaMesAno = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", year: "numeric" });

/** "Hoje, 10:15", "Ontem, 09:00", "12 de out., 11:15" (com o ano se for de outro ano). */
export function formatarDataPedido(iso: string, agora = new Date()): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "";
  const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()).getTime();
  const dia = 24 * 60 * 60 * 1000;
  const t = data.getTime();
  if (t >= inicioHoje) return `Hoje, ${hora.format(data)}`;
  if (t >= inicioHoje - dia) return `Ontem, ${hora.format(data)}`;
  const formato = data.getFullYear() === agora.getFullYear() ? diaMes : diaMesAno;
  return `${formato.format(data)}, ${hora.format(data)}`;
}
