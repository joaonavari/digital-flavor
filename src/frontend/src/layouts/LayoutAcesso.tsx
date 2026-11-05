import type { ReactNode } from "react";
import estilos from "./LayoutAcesso.module.css";

const IconeApp = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 10.5h16l-1.4 8.1a2 2 0 01-2 1.4H7.4a2 2 0 01-2-1.4z" />
    <path d="M8 10.5V8a4 4 0 018 0v2.5" />
  </svg>
);

/** Moldura das telas de login e cadastro. */
export function LayoutAcesso({ titulo, subtitulo, children }: { titulo: string; subtitulo: string; children: ReactNode }) {
  return (
    <main className={estilos.tela}>
      <header className={estilos.cabecalho}>
        <div className={estilos.marca} aria-hidden="true">
          <IconeApp />
        </div>
        <h1 className={estilos.titulo}>{titulo}</h1>
        <p className={estilos.subtitulo}>{subtitulo}</p>
      </header>
      <div className={estilos.conteudo}>{children}</div>
    </main>
  );
}
