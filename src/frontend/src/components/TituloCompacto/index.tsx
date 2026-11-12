import { useEffect, useRef, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useContextoAluno } from "../../layouts/contextoAluno";
import estilos from "./TituloCompacto.module.css";

/**
 * Título grande no estilo iOS (só no celular): ao rolar, o título grande passa por baixo
 * de uma barra translúcida que aparece aos poucos, com o título pequeno centralizado.
 * A opacidade acompanha a rolagem; a barra é decorativa (o h1 da página continua sendo o título).
 */
export function TituloCompacto({ titulo, alvo }: { titulo: string; alvo: RefObject<HTMLElement | null> }) {
  const { topoCelular, rolagem } = useContextoAluno();
  const barra = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rolagem) return;
    let quadro = 0;
    const atualizar = () => {
      quadro = 0;
      const el = barra.current;
      const tituloGrande = alvo.current;
      if (!el || !tituloGrande) return;
      const altura = el.offsetHeight;
      const caixa = tituloGrande.getBoundingClientRect();
      const topo = rolagem.getBoundingClientRect().top;
      // 0 enquanto o título grande está inteiro abaixo da barra; 1 quando ele some por baixo dela.
      const progresso = Math.min(1, Math.max(0, (topo + altura - caixa.top) / Math.max(caixa.height, 1)));
      el.style.opacity = String(progresso);
      el.dataset.visivel = progresso > 0.01 ? "true" : "false";
    };
    const agendar = () => {
      if (!quadro) quadro = requestAnimationFrame(atualizar);
    };
    atualizar();
    rolagem.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar);
    return () => {
      cancelAnimationFrame(quadro);
      rolagem.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", agendar);
    };
  }, [rolagem, alvo]);

  if (!topoCelular) return null;
  return createPortal(
    <div ref={barra} className={`${estilos.barra} material-bar`} aria-hidden="true" data-visivel="false">
      <span className={estilos.titulo}>{titulo}</span>
    </div>,
    topoCelular,
  );
}
