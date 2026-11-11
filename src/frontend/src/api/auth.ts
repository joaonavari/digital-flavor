import type { DadosCadastro, DadosLogin, RespostaLogin, UsuarioLogado } from "../types";
import { requisicao } from "./http";

export const entrar = (dados: DadosLogin) => requisicao<RespostaLogin>("POST", "/api/auth/login", dados);

/** 201 { token, usuario }: o aluno já sai logado do cadastro. */
export const cadastrar = (dados: DadosCadastro) => requisicao<RespostaLogin>("POST", "/api/auth/cadastro", dados);

export const buscarUsuarioLogado = () => requisicao<UsuarioLogado>("GET", "/api/auth/me");
