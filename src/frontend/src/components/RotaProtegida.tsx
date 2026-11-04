import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../contexts/useAuth";
import { rotaInicial } from "../lib/perfis";
import type { TipoUsuario } from "../types";

interface Props {
  /** Perfis que podem abrir estas rotas. Sem a lista, basta estar logado. */
  perfis?: TipoUsuario[];
}

/** Sem login vai para /login; com perfil errado volta para a tela inicial do perfil. */
export function RotaProtegida({ perfis }: Props) {
  const { estado } = useAuth();
  const local = useLocation();

  if (estado.status === "carregando") return null;
  if (estado.status === "anonimo") return <Navigate to="/login" replace state={{ de: local.pathname }} />;
  if (perfis && !perfis.includes(estado.usuario.tipo)) return <Navigate to={rotaInicial(estado.usuario.tipo)} replace />;

  return <Outlet />;
}

/** Login e cadastro: quem já está logado vai direto para a tela inicial. */
export function RotaPublica() {
  const { estado } = useAuth();
  if (estado.status === "carregando") return null;
  if (estado.status === "autenticado") return <Navigate to={rotaInicial(estado.usuario.tipo)} replace />;
  return <Outlet />;
}
