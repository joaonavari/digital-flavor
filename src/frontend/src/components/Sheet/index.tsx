import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  usePresence,
  useReducedMotion,
  useTransform,
} from "motion/react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { BotaoIcone } from "../Button";
import estilos from "./Sheet.module.css";

interface SheetProps {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  children: ReactNode;
  /** Barra fixa no fim da folha (total, botão de confirmar...). */
  rodape?: ReactNode;
  /** Largura do painel lateral no computador, em px. */
  larguraLateral?: number;
}

/** Spring da Apple: abre sem quique; ao soltar o gesto, um quique leve. */
const MOLA_ABRIR = { type: "spring", bounce: 0, duration: 0.35 } as const;
const MOLA_SOLTAR = { type: "spring", bounce: 0.15, duration: 0.35 } as const;

/** Arrastar além de 30% da altura, ou uma puxada rápida, fecha a folha. */
const FRACAO_PARA_FECHAR = 0.3;
const VELOCIDADE_PARA_FECHAR = 0.5; // px/ms

/**
 * Folha que sobe de baixo no celular e vira painel lateral no computador.
 * Fecha arrastando para baixo, pelo X, tocando fora ou com Esc.
 */
export function Sheet(props: SheetProps) {
  return createPortal(
    <AnimatePresence>{props.aberto && <Painel key="folha" {...props} />}</AnimatePresence>,
    document.body,
  );
}

function Painel({ aoFechar, titulo, children, rodape, larguraLateral }: SheetProps) {
  const lateral = useMediaQuery("(min-width: 768px)");
  const reduzirMovimento = useReducedMotion() ?? false;
  const [presente, remover] = usePresence();
  const idTitulo = useId();

  const painelRef = useRef<HTMLDivElement>(null);

  // Guarda sempre o aoFechar mais recente sem refazer os efeitos a cada render.
  const aoFecharRef = useRef(aoFechar);
  useLayoutEffect(() => {
    aoFecharRef.current = aoFechar;
  });
  const deslocamento = useMotionValue(0); // px no eixo da folha (y embaixo, x na lateral)
  const tamanho = useMotionValue(1); // distância até sumir da tela
  const opacidade = useMotionValue(reduzirMovimento ? 0 : 1);
  const opacidadeFundo = useTransform(() => {
    const t = tamanho.get();
    return Math.min(opacidade.get(), Math.max(0, 1 - deslocamento.get() / t));
  });

  /* ---------- Abrir ---------- */
  useLayoutEffect(() => {
    const painel = painelRef.current;
    if (!painel) return;
    const distancia = lateral ? painel.offsetWidth + 24 : painel.offsetHeight;
    tamanho.set(distancia);
    if (reduzirMovimento) {
      animate(opacidade, 1, { duration: 0.2, ease: "easeOut" });
    } else {
      deslocamento.set(distancia);
      animate(deslocamento, 0, MOLA_ABRIR);
    }
    // Só na montagem: a folha abre uma vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Fechar (saída) ---------- */
  useEffect(() => {
    if (presente) return;
    const saida = reduzirMovimento
      ? animate(opacidade, 0, { duration: 0.15, ease: "easeOut" })
      : animate(deslocamento, tamanho.get(), MOLA_SOLTAR);
    saida.then(() => remover?.());
  }, [presente, reduzirMovimento, deslocamento, opacidade, tamanho, remover]);

  /* ---------- Fundo recuado, app inerte, rolagem travada, foco ---------- */
  useEffect(() => {
    if (!presente) return;
    const raizApp = document.getElementById("root");
    const focoAnterior = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const html = document.documentElement;
    const overflowAnterior = html.style.overflow;

    if (!lateral) document.body.dataset.folha = "aberta";
    raizApp?.setAttribute("inert", "");
    html.style.overflow = "hidden";
    painelRef.current?.focus({ preventScroll: true });

    function teclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") aoFecharRef.current();
    }
    document.addEventListener("keydown", teclar);

    return () => {
      document.removeEventListener("keydown", teclar);
      delete document.body.dataset.folha;
      raizApp?.removeAttribute("inert");
      html.style.overflow = overflowAnterior;
      focoAnterior?.focus({ preventScroll: true });
    };
  }, [presente, lateral]);

  /* ---------- Arrastar para fechar (só no celular) ---------- */
  const arraste = useRef<{ id: number; inicioY: number; amostras: Array<{ t: number; y: number }> } | null>(null);

  function comecar(evento: PointerEvent<HTMLElement>) {
    if (lateral || arraste.current || evento.button !== 0) return; // ignora segundo dedo
    if ((evento.target as HTMLElement).closest("button, a, input, textarea, select")) return;
    deslocamento.stop();
    try {
      // Continua o arraste mesmo se o dedo sair da alça.
      evento.currentTarget.setPointerCapture(evento.pointerId);
    } catch {
      /* ponteiro sem captura (raro): o arraste segue sem ela */
    }
    arraste.current = { id: evento.pointerId, inicioY: evento.clientY - deslocamento.get(), amostras: [] };
  }

  function mover(evento: PointerEvent<HTMLElement>) {
    const a = arraste.current;
    if (!a || evento.pointerId !== a.id) return;
    const dy = evento.clientY - a.inicioY;
    // Para cima há resistência crescente em vez de uma parede.
    const y = dy >= 0 ? dy : -Math.sqrt(-dy) * 2;
    deslocamento.set(y);
    a.amostras.push({ t: evento.timeStamp, y });
    if (a.amostras.length > 6) a.amostras.shift();
  }

  function soltar(evento: PointerEvent<HTMLElement>) {
    const a = arraste.current;
    if (!a || evento.pointerId !== a.id) return;
    arraste.current = null;

    const ultima = a.amostras[a.amostras.length - 1];
    const recente = a.amostras.find((s) => ultima && ultima.t - s.t <= 100);
    const velocidade =
      ultima && recente && ultima.t > recente.t ? (ultima.y - recente.y) / (ultima.t - recente.t) : 0;
    const y = deslocamento.get();

    if (y > tamanho.get() * FRACAO_PARA_FECHAR || (velocidade > VELOCIDADE_PARA_FECHAR && y > 0)) {
      aoFechar();
    } else {
      animate(deslocamento, 0, MOLA_SOLTAR);
    }
  }

  const estiloPainel = lateral ? { x: deslocamento, opacity: opacidade } : { y: deslocamento, opacity: opacidade };
  const variaveis = larguraLateral ? ({ "--largura-lateral": `${larguraLateral}px` } as CSSProperties) : undefined;

  return (
    <div className={`${estilos.raiz} ${presente ? "" : estilos.saindo}`}>
      <motion.div className={estilos.fundo} style={{ opacity: opacidadeFundo }} onClick={aoFechar} aria-hidden="true" />
      <motion.div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
        className={`${estilos.painel} ${lateral ? estilos.lateral : estilos.inferior}`}
        style={{ ...estiloPainel, ...variaveis }}
      >
        <header
          className={estilos.cabecalho}
          onPointerDown={comecar}
          onPointerMove={mover}
          onPointerUp={soltar}
          onPointerCancel={soltar}
        >
          {!lateral && <div className={estilos.alca} aria-hidden="true" />}
          <div className={estilos.linhaTitulo}>
            <h2 id={idTitulo} className={estilos.titulo}>
              {titulo}
            </h2>
            <BotaoIcone rotulo="Fechar" onClick={aoFechar}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </BotaoIcone>
          </div>
        </header>
        <div className={estilos.corpo}>{children}</div>
        {rodape && <div className={estilos.rodape}>{rodape}</div>}
      </motion.div>
    </div>
  );
}
