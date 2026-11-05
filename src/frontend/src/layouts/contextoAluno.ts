import { useOutletContext } from "react-router";

/** Espaço fixo acima da tab bar (fora da rolagem) para barras flutuantes, como "Ver carrinho". */
export interface ContextoAluno {
  acessorio: HTMLElement | null;
}

export const useContextoAluno = () => useOutletContext<ContextoAluno>();
