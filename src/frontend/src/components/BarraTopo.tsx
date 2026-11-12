import { type CSSProperties } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { useAuth } from "../contexts/useAuth";
import { inicial } from "../lib/texto";
import { IconeDoApp } from "./MarcaApp";
import estilos from "./BarraTopo.module.css";

const ABAS = [
  { para: "/", rotulo: "Cardápio", fim: true },
  { para: "/pedidos", rotulo: "Meus pedidos", fim: false },
  { para: "/perfil", rotulo: "Perfil", fim: false },
];

function abaAtual(caminho: string): number {
  if (caminho === "/") return 0;
  return ABAS.findIndex((a, i) => i > 0 && (caminho === a.para || caminho.startsWith(`${a.para}/`)));
}

/** Barra do aluno no computador (≥ 900px): marca, navegação em pílula e o aluno. */
export function BarraTopo() {
  const { estado } = useAuth();
  const { pathname } = useLocation();
  const indice = abaAtual(pathname);
  const nome = estado.usuario?.nome ?? "";

  return (
    <header className={`${estilos.barra} material-bar`}>
      <Link to="/" className={estilos.marca} aria-label="Digital Flavor, ir para o cardápio">
        <IconeDoApp tamanho={32} />
        <span aria-hidden="true">Digital Flavor</span>
      </Link>

      <nav aria-label="Navegação principal" className={estilos.nav} style={{ "--quantidade": ABAS.length } as CSSProperties}>
        {/* Destaque branco que desliza até a página atual, como no SegmentedControl. */}
        {indice >= 0 && (
          <span className={estilos.destaque} style={{ transform: `translateX(${indice * 100}%)` }} aria-hidden="true" />
        )}
        {ABAS.map(({ para, rotulo, fim }, i) => (
          <NavLink
            key={para}
            to={para}
            end={fim}
            aria-current={i === indice ? "page" : undefined}
            className={`${estilos.aba} ${i === indice ? estilos.ativa : ""}`}
          >
            <span className={estilos.rotulo} data-texto={rotulo}>
              <span>{rotulo}</span>
            </span>
          </NavLink>
        ))}
      </nav>

      <Link to="/perfil" className={estilos.aluno} title={nome}>
        <span className={estilos.nome}>{nome}</span>
        <span className={estilos.avatar} aria-hidden="true">
          {inicial(nome)}
        </span>
      </Link>
    </header>
  );
}
