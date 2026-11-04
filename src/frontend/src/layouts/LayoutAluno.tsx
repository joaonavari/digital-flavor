import { Outlet } from "react-router";
import { TabBar } from "../components/TabBar";
import estilos from "./LayoutAluno.module.css";

/** Layout de celular do aluno: coluna de até 480px e tab bar translúcida. */
export function LayoutAluno() {
  return (
    <div className={estilos.app}>
      <main className={estilos.conteudo}>
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}
