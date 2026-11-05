import { createContext } from "react";
import type { RespostaLogin, UsuarioLogado } from "../types";

export type EstadoAuth =
  | { status: "carregando"; usuario: null }
  | { status: "anonimo"; usuario: null }
  | { status: "autenticado"; usuario: UsuarioLogado };

export interface ValorAuth {
  estado: EstadoAuth;
  entrar: (email: string, senha: string) => Promise<UsuarioLogado>;
  /** Começa a sessão com uma resposta { token, usuario } (login ou cadastro). */
  iniciarSessao: (resposta: RespostaLogin) => UsuarioLogado;
  sair: () => void;
}

export const AuthContexto = createContext<ValorAuth | null>(null);
