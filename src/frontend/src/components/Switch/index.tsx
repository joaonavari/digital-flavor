import type { ButtonHTMLAttributes } from "react";
import estilos from "./Switch.module.css";

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "aria-label" | "role"> {
  ligado: boolean;
  aoMudar: (ligado: boolean) => void;
  /** Texto para o leitor de tela quando não há <label> visível. */
  rotulo?: string;
}

/** Interruptor no estilo iOS. Espaço e Enter funcionam porque é um <button>. */
export function Switch({ ligado, aoMudar, rotulo, className, ...resto }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      aria-label={rotulo}
      className={`${estilos.switch} ${className ?? ""}`}
      onClick={() => aoMudar(!ligado)}
      {...resto}
    >
      <span className={estilos.botao} aria-hidden="true" />
    </button>
  );
}
