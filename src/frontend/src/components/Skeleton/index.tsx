import type { CSSProperties, ReactNode } from "react";
import estilos from "./Skeleton.module.css";

interface Props {
  largura?: CSSProperties["width"];
  altura?: CSSProperties["height"];
  raio?: CSSProperties["borderRadius"];
  className?: string;
}

/** Bloco cinza que pulsa enquanto o conteúdo carrega. Sempre decorativo. */
export function Skeleton({ largura = "100%", altura = 16, raio, className }: Props) {
  return (
    <span
      aria-hidden="true"
      className={`${estilos.bloco} ${className ?? ""}`}
      style={{ width: largura, height: altura, borderRadius: raio }}
    />
  );
}

/** Envolve um conjunto de skeletons e avisa o leitor de tela que está carregando. */
export function Carregando({ children, rotulo = "Carregando…" }: { children: ReactNode; rotulo?: string }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">{rotulo}</span>
      {children}
    </div>
  );
}
