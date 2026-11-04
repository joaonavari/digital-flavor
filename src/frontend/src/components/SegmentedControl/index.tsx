import { useRef, type CSSProperties, type KeyboardEvent } from "react";
import estilos from "./SegmentedControl.module.css";

export interface OpcaoSegmento<T extends string> {
  valor: T;
  rotulo: string;
}

interface Props<T extends string> {
  opcoes: OpcaoSegmento<T>[];
  valor: T;
  aoMudar: (valor: T) => void;
  /** Nome do grupo lido pelo leitor de tela (ex.: "Categorias"). */
  rotulo: string;
  /** "tablist" quando troca o conteúdo da tela; "radiogroup" quando é uma escolha de formulário. */
  papel?: "tablist" | "radiogroup";
  tamanho?: "grande" | "medio" | "pequeno";
  className?: string;
}

export function SegmentedControl<T extends string>({
  opcoes,
  valor,
  aoMudar,
  rotulo,
  papel = "radiogroup",
  tamanho = "medio",
  className,
}: Props<T>) {
  const botoes = useRef<Array<HTMLButtonElement | null>>([]);
  const indice = Math.max(
    0,
    opcoes.findIndex((o) => o.valor === valor),
  );
  const ehAba = papel === "tablist";

  function escolher(novoIndice: number) {
    const opcao = opcoes[novoIndice];
    if (!opcao) return;
    aoMudar(opcao.valor);
    botoes.current[novoIndice]?.focus();
  }

  // Setas, Home e End movem a seleção (padrão WAI-ARIA para radiogroup/tablist).
  function teclar(evento: KeyboardEvent<HTMLDivElement>) {
    const ultimo = opcoes.length - 1;
    const mapa: Record<string, number> = {
      ArrowRight: indice === ultimo ? 0 : indice + 1,
      ArrowDown: indice === ultimo ? 0 : indice + 1,
      ArrowLeft: indice === 0 ? ultimo : indice - 1,
      ArrowUp: indice === 0 ? ultimo : indice - 1,
      Home: 0,
      End: ultimo,
    };
    const destino = mapa[evento.key];
    if (destino === undefined) return;
    evento.preventDefault();
    escolher(destino);
  }

  const variaveis = { "--quantidade": opcoes.length } as CSSProperties;

  return (
    <div
      role={papel}
      aria-label={rotulo}
      className={`${estilos.controle} ${estilos[tamanho]} ${className ?? ""}`}
      style={variaveis}
      onKeyDown={teclar}
    >
      <div
        className={estilos.destaque}
        style={{ transform: `translateX(${indice * 100}%)` }}
        aria-hidden="true"
      />
      {opcoes.map((opcao, i) => {
        const selecionada = i === indice;
        return (
          <button
            key={opcao.valor}
            ref={(el) => {
              botoes.current[i] = el;
            }}
            type="button"
            role={ehAba ? "tab" : "radio"}
            aria-selected={ehAba ? selecionada : undefined}
            aria-checked={ehAba ? undefined : selecionada}
            tabIndex={selecionada ? 0 : -1}
            className={`${estilos.opcao} ${selecionada ? estilos.selecionada : ""}`}
            onClick={() => aoMudar(opcao.valor)}
            title={opcao.rotulo}
          >
            <span className={estilos.rotulo} data-texto={opcao.rotulo}>
              <span>{opcao.rotulo}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
