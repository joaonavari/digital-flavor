import type { ReactNode } from "react";
import estilos from "./EmConstrucao.module.css";

interface Props {
  titulo: string;
  etapa: number;
  /** "aluno" usa título grande de celular; "cantina" usa o título do painel. */
  variante?: "aluno" | "cantina";
  saudacao?: string;
  children?: ReactNode;
}

/** Marcador temporário das telas que ainda serão construídas. */
export function EmConstrucao({ titulo, etapa, variante = "aluno", saudacao, children }: Props) {
  if (variante === "cantina") {
    return (
      <>
        <header className={estilos.cabecalhoPainel}>
          <h1 className={estilos.tituloPainel}>{titulo}</h1>
        </header>
        <p className={estilos.avisoPainel}>Esta tela será construída na etapa {etapa}.</p>
        {children}
      </>
    );
  }

  return (
    <>
      <header className={estilos.cabecalho}>
        {saudacao && <p className={estilos.saudacao}>{saudacao}</p>}
        <h1 className={estilos.tituloGrande}>{titulo}</h1>
      </header>
      <p className={estilos.aviso}>Esta tela será construída na etapa {etapa}.</p>
      {children}
    </>
  );
}
