import type { StatusPedido } from "../../types";
import estilos from "./StatusTimeline.module.css";

type Estado = "feito" | "atual" | "futuro" | "cancelado";

interface Passo {
  status: StatusPedido;
  titulo: string;
  /** Texto enquanto ainda não chegou / quando é o passo atual ou já passou. */
  antes?: string;
  agora?: string;
}

const RECEBIDO: Passo = { status: "RECEBIDO", titulo: "Recebido", antes: "Estoque reservado para você", agora: "Estoque reservado para você" };

const FLUXO: Passo[] = [
  RECEBIDO,
  { status: "EM_PREPARO", titulo: "Em preparo", antes: "A cantina vai montar seu pedido", agora: "A cantina está montando seu pedido" },
  { status: "PRONTO", titulo: "Pronto", antes: "Avisamos quando puder retirar", agora: "Pode retirar no balcão" },
  { status: "ENTREGUE", titulo: "Entregue", agora: "Bom lanche!" },
];

const ORDEM: StatusPedido[] = ["RECEBIDO", "EM_PREPARO", "PRONTO", "ENTREGUE"];

const LEITOR: Record<Estado, string> = {
  feito: "concluído",
  atual: "etapa atual",
  futuro: "ainda não",
  cancelado: "cancelado",
};

/** Linha do tempo do pedido: RECEBIDO → EM_PREPARO → PRONTO → ENTREGUE (ou CANCELADO). */
export function StatusTimeline({ status }: { status: StatusPedido }) {
  const cancelado = status === "CANCELADO";
  // Cancelado: só pode ter vindo de RECEBIDO (regra do cancelamento), então mostra Recebido → Cancelado.
  const passos: Array<Passo & { estado: Estado }> = cancelado
    ? [
        { ...RECEBIDO, estado: "feito" },
        { status: "CANCELADO", titulo: "Cancelado", agora: "O valor volta para você e os itens voltam ao estoque", estado: "cancelado" },
      ]
    : FLUXO.map((passo) => {
        const atual = ORDEM.indexOf(status);
        const meu = ORDEM.indexOf(passo.status);
        // Entregue é o fim: aparece como concluído, não como "em andamento".
        const estado: Estado = meu < atual || status === "ENTREGUE" ? "feito" : meu === atual ? "atual" : "futuro";
        return { ...passo, estado };
      });

  return (
    <ol className={estilos.linha} aria-label="Andamento do pedido">
      {passos.map((passo, i) => {
        const ultimo = i === passos.length - 1;
        const descricao = passo.estado === "futuro" ? passo.antes : passo.agora;
        return (
          <li
            key={passo.status}
            className={`${estilos.passo} ${estilos[passo.estado]}`}
            aria-current={passo.estado === "atual" ? "step" : undefined}
          >
            <div className={estilos.trilho} aria-hidden="true">
              <div className={estilos.ponto}>
                {passo.estado === "feito" && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                )}
                {passo.estado === "cancelado" && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round">
                    <path d="M7 7l10 10M17 7L7 17" />
                  </svg>
                )}
              </div>
              {!ultimo && <div className={estilos.conector} />}
            </div>
            <div className={estilos.texto}>
              <span className={estilos.titulo}>
                {passo.titulo}
                <span className="sr-only">, {LEITOR[passo.estado]}</span>
              </span>
              {descricao && <span className={estilos.descricao}>{descricao}</span>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
