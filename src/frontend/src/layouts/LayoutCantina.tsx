import { Outlet } from "react-router";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../contexts/useAuth";
import estilos from "./LayoutCantina.module.css";

/** Layout de computador da cantina: sidebar + conteúdo (empilha no celular). */
export function LayoutCantina() {
  const { estado } = useAuth();
  if (estado.status !== "autenticado") return null;

  return (
    <div className={estilos.painel}>
      <Sidebar tipo={estado.usuario.tipo} nome={estado.usuario.nome} />
      <main className={estilos.conteudo}>
        <Outlet />
      </main>
    </div>
  );
}
