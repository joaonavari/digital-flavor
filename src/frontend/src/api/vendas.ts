import type { RelatorioVendas } from "../types";
import { requisicao } from "./http";

/** Datas no formato AAAA-MM-DD. */
export const buscarRelatorioVendas = (inicio: string, fim: string) =>
  requisicao<RelatorioVendas>(
    "GET",
    `/api/vendas?inicio=${encodeURIComponent(inicio)}&fim=${encodeURIComponent(fim)}`,
  );
