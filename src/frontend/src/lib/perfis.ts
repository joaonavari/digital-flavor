import type { TipoUsuario } from "../types";

export const NOME_PERFIL: Record<TipoUsuario, string> = {
  ALUNO: "Aluno",
  FUNCIONARIO: "Funcionário",
  GERENTE: "Gerente",
  ADMINISTRADOR: "Administrador",
};

export const PERFIS_CANTINA: TipoUsuario[] = ["FUNCIONARIO", "GERENTE", "ADMINISTRADOR"];
export const PERFIS_GESTAO: TipoUsuario[] = ["GERENTE", "ADMINISTRADOR"];
export const PERFIS_ADMIN: TipoUsuario[] = ["ADMINISTRADOR"];

/** Tela inicial de cada perfil. */
export function rotaInicial(tipo: TipoUsuario): string {
  return tipo === "ALUNO" ? "/" : "/cantina/fila";
}
