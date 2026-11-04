import { createContext } from "react";
import type { UsuarioLogado } from "../types";

export type EstadoAuth =
  | { status: "carregando"; usuario: null }
  | { status: "anonimo"; usuario: null }
  | { status: "autenticado"; usuario: UsuarioLogado };

export interface ValorAuth {
  estado: EstadoAuth;
  entrar: (email: string, senha: string) => Promise<UsuarioLogado>;
  sair: () => void;
}

export const AuthContexto = createContext<ValorAuth | null>(null);
