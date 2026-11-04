import type { ReactNode } from "react";
import { Button } from "../Button";
import estilos from "./EmptyState.module.css";

interface Props {
  titulo: string;
  descricao?: ReactNode;
  icone?: ReactNode;
  acao?: { rotulo: string; aoClicar: () => void; carregando?: boolean };
  variante?: "vazio" | "erro";
  className?: string;
}

/** Mensagem amigável para lista vazia ou erro, com uma ação opcional. */
export function EmptyState({ titulo, descricao, icone, acao, variante = "vazio", className }: Props) {
  return (
    <div
      className={`${estilos.estado} ${variante === "erro" ? estilos.erro : ""} ${className ?? ""}`}
      role={variante === "erro" ? "alert" : undefined}
    >
      {icone && (
        <div className={estilos.icone} aria-hidden="true">
          {icone}
        </div>
      )}
      <p className={estilos.titulo}>{titulo}</p>
      {descricao && <p className={estilos.descricao}>{descricao}</p>}
      {acao && (
        <Button
          className={estilos.acao}
          variante={variante === "erro" ? "secundario" : "primario"}
          onClick={acao.aoClicar}
          carregando={acao.carregando}
        >
          {acao.rotulo}
        </Button>
      )}
    </div>
  );
}

const IconeAviso = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5v5.5M12 16.5v.01" />
  </svg>
);

/** Estado de erro padrão com "Tentar de novo". */
export function EstadoErro({
  mensagem,
  aoTentarDeNovo,
  tentando = false,
}: {
  mensagem: string;
  aoTentarDeNovo: () => void;
  tentando?: boolean;
}) {
  return (
    <EmptyState
      variante="erro"
      icone={<IconeAviso />}
      titulo="Não foi possível carregar"
      descricao={mensagem}
      acao={{ rotulo: "Tentar de novo", aoClicar: aoTentarDeNovo, carregando: tentando }}
    />
  );
}
