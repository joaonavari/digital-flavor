import { useState } from "react";
import { Outlet } from "react-router";
import { TabBar } from "../components/TabBar";
import type { ContextoAluno } from "./contextoAluno";
import estilos from "./LayoutAluno.module.css";

/** Layout de celular do aluno: coluna de até 480px e tab bar translúcida. */
export function LayoutAluno() {
  const [acessorio, setAcessorio] = useState<HTMLDivElement | null>(null);
  const contexto: ContextoAluno = { acessorio };

  return (
    <div className={estilos.app} data-recuo="">
      <main className={estilos.rolagem}>
        <Outlet context={contexto} />
      </main>
      <div ref={setAcessorio} className={estilos.acessorio} />
      <TabBar />
    </div>
  );
}
