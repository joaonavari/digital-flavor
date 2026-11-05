import type { ReactNode } from "react";
import { NOME_STATUS } from "../../lib/pedidos";
import type { StatusPedido } from "../../types";
import estilos from "./SeloStatus.module.css";

type Cor = "neutro" | "azul" | "verde" | "vermelho" | "laranja";

/** Selo em pílula. O texto sempre diz o estado (a cor só reforça). */
export function Selo({ cor = "neutro", children }: { cor?: Cor; children: ReactNode }) {
  return (
    <span className={`${estilos.selo} ${estilos[cor]}`} title={typeof children === "string" ? children : undefined}>
      {children}
    </span>
  );
}

const COR_STATUS: Record<StatusPedido, Cor> = {
  RECEBIDO: "neutro",
  EM_PREPARO: "azul",
  PRONTO: "verde",
  ENTREGUE: "neutro",
  CANCELADO: "vermelho",
};

export function SeloStatus({ status }: { status: StatusPedido }) {
  return <Selo cor={COR_STATUS[status]}>{NOME_STATUS[status]}</Selo>;
}
