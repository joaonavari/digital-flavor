import type { DadosNovoUsuario, Usuario } from "../types";
import { requisicao } from "./http";

export const listarUsuarios = () => requisicao<Usuario[]>("GET", "/api/usuarios");

export const criarUsuario = (dados: DadosNovoUsuario) => requisicao<Usuario>("POST", "/api/usuarios", dados);

export const alterarUsuarioAtivo = (id: number, ativo: boolean) =>
  requisicao<Usuario>("PATCH", `/api/usuarios/${id}/ativo`, { ativo });
