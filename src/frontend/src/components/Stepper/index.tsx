import estilos from "./Stepper.module.css";

interface Props {
  quantidade: number;
  /** Nome do produto, para os rótulos dos botões no leitor de tela. */
  nome: string;
  aoMais: () => void;
  aoMenos: () => void;
  /** Estoque disponível: o "+" desliga ao chegar nele. */
  maximo?: number;
  /** "cardapio": + azul (mockup 01); "carrinho": os dois neutros (mockup 02). */
  variante?: "cardapio" | "carrinho";
  /** Botões de 30px, para caber ao lado do nome sem espremê-lo. */
  compacto?: boolean;
}

/** Controle "− qtd +". */
export function Stepper({ quantidade, nome, aoMais, aoMenos, maximo, variante = "cardapio", compacto = false }: Props) {
  const noLimite = maximo !== undefined && quantidade >= maximo;
  return (
    <div className={`${estilos.stepper} ${compacto ? estilos.compacto : ""}`} role="group" aria-label={`Quantidade de ${nome}`}>
      <button type="button" className={estilos.botao} onClick={aoMenos} aria-label={`Remover um ${nome}`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" aria-hidden="true">
          <path d="M5 12h14" />
        </svg>
      </button>
      <span className={estilos.quantidade} aria-live="polite" aria-atomic="true">
        {quantidade}
      </span>
      <button
        type="button"
        className={`${estilos.botao} ${variante === "cardapio" ? estilos.mais : ""}`}
        onClick={aoMais}
        disabled={noLimite}
        aria-label={noLimite ? `Sem mais ${nome} em estoque` : `Adicionar mais um ${nome}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}
