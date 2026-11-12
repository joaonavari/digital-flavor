import { useOutletContext } from "react-router";

export interface ContextoAluno {
  /** Espaço fixo acima da tab bar (fora da rolagem) para barras flutuantes, como "Ver carrinho". */
  acessorio: HTMLElement | null;
  /** Espaço fixo no topo (fora da rolagem) para a barra do título pequeno. */
  topoCelular: HTMLElement | null;
  /** Área que rola no celular. */
  rolagem: HTMLElement | null;
}

export const useContextoAluno = () => useOutletContext<ContextoAluno>();
