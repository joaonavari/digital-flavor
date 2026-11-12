import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import { BarraTopo } from "../components/BarraTopo";
import { TabBar } from "../components/TabBar";
import type { ContextoAluno } from "./contextoAluno";
import estilos from "./LayoutAluno.module.css";

/** Largura do conteúdo no computador: o cardápio usa a tela toda; Meus pedidos abre lista + detalhe. */
function largura(caminho: string): "cheia" | "pedidos" | "estreita" {
  if (caminho === "/") return "cheia";
  if (caminho === "/pedidos") return "pedidos";
  return "estreita";
}

/**
 * Layout do aluno. Celular: coluna de até 480px com tab bar translúcida.
 * Computador (≥ 900px): barra superior com navegação em pílula. A troca é só por CSS,
 * então a página não é recriada ao redimensionar a janela.
 */
export function LayoutAluno() {
  const [acessorio, setAcessorio] = useState<HTMLDivElement | null>(null);
  const { pathname } = useLocation();
  const contexto: ContextoAluno = { acessorio };

  return (
    <div className={estilos.app} data-recuo="">
      <div className={estilos.topo}>
        <BarraTopo />
      </div>
      <main className={estilos.rolagem} data-largura={largura(pathname)}>
        <Outlet context={contexto} />
      </main>
      <div ref={setAcessorio} className={estilos.acessorio} />
      <div className={estilos.abas}>
        <TabBar />
      </div>
    </div>
  );
}
