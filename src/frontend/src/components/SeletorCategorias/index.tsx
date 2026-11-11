import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { SegmentedControl } from "../SegmentedControl";
import estilos from "./SeletorCategorias.module.css";

interface Props {
  categorias: string[];
  valor: string;
  aoMudar: (categoria: string) => void;
}

/**
 * Regra aprovada: segmentado com até 4 categorias curtas; acima disso, ou quando algum nome
 * não cabe inteiro no seu segmento (medido na largura real da tela), pílulas que rolam.
 */
const MAX_SEGMENTOS = 4;
const FONTE_SEGMENTO = '600 14px -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, "Segoe UI", Roboto, sans-serif';
const FOLGA_SEGMENTO = 20; // padding do botão + respiro
const PADDING_TRILHO = 6;

let contexto: CanvasRenderingContext2D | null | undefined;
function larguraTexto(texto: string): number {
  if (contexto === undefined) contexto = document.createElement("canvas").getContext("2d");
  if (!contexto) return texto.length * 8.5;
  contexto.font = FONTE_SEGMENTO;
  return contexto.measureText(texto).width;
}

export function SeletorCategorias({ categorias, valor, aoMudar }: Props) {
  const caixa = useRef<HTMLDivElement>(null);
  const [largura, setLargura] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = caixa.current;
    if (!el) return;
    const observador = new ResizeObserver(([entrada]) => {
      if (entrada) setLargura(entrada.contentRect.width);
    });
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  const segmento = largura === null ? 0 : (largura - PADDING_TRILHO) / categorias.length;
  const cabeNoSegmentado =
    largura !== null &&
    categorias.length <= MAX_SEGMENTOS &&
    categorias.every((c) => larguraTexto(c) + FOLGA_SEGMENTO <= segmento);

  return (
    <div ref={caixa} style={largura === null ? { minHeight: 44 } : undefined}>
      {largura === null ? null : cabeNoSegmentado ? (
        <SegmentedControl
          rotulo="Categorias"
          papel="tablist"
          opcoes={categorias.map((c) => ({ valor: c, rotulo: c }))}
          valor={valor}
          aoMudar={aoMudar}
        />
      ) : (
        <Pilulas categorias={categorias} valor={valor} aoMudar={aoMudar} />
      )}
    </div>
  );
}

function Pilulas({ categorias, valor, aoMudar }: Props) {
  const trilho = useRef<HTMLDivElement>(null);
  const botoes = useRef<Array<HTMLButtonElement | null>>([]);
  const [bordas, setBordas] = useState({ inicio: false, fim: false });
  const indice = Math.max(0, categorias.indexOf(valor));

  // Liga o fade de cada borda só quando há mais conteúdo daquele lado.
  useEffect(() => {
    const el = trilho.current;
    if (!el) return;
    const medir = () => {
      const max = el.scrollWidth - el.clientWidth;
      setBordas({ inicio: el.scrollLeft > 1, fim: el.scrollLeft < max - 1 });
    };
    medir();
    el.addEventListener("scroll", medir, { passive: true });
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => {
      el.removeEventListener("scroll", medir);
      observador.disconnect();
    };
  }, [categorias]);

  // A pílula escolhida sempre fica visível.
  useEffect(() => {
    botoes.current[indice]?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [indice]);

  function teclar(evento: KeyboardEvent<HTMLDivElement>) {
    const ultimo = categorias.length - 1;
    const destino = {
      ArrowRight: indice === ultimo ? 0 : indice + 1,
      ArrowLeft: indice === 0 ? ultimo : indice - 1,
      Home: 0,
      End: ultimo,
    }[evento.key];
    if (destino === undefined) return;
    evento.preventDefault();
    const categoria = categorias[destino];
    if (categoria === undefined) return;
    aoMudar(categoria);
    botoes.current[destino]?.focus();
  }

  return (
    <div
      ref={trilho}
      role="tablist"
      aria-label="Categorias"
      className={estilos.trilho}
      data-mais-inicio={bordas.inicio}
      data-mais-fim={bordas.fim}
      onKeyDown={teclar}
    >
      {categorias.map((categoria, i) => (
        <button
          key={categoria}
          ref={(el) => {
            botoes.current[i] = el;
          }}
          type="button"
          role="tab"
          aria-selected={i === indice}
          tabIndex={i === indice ? 0 : -1}
          className={estilos.pilula}
          title={categoria}
          onClick={() => aoMudar(categoria)}
        >
          {categoria}
        </button>
      ))}
    </div>
  );
}
