import type { DadosCadastro, DadosLogin, RespostaLogin, UsuarioLogado } from "../types";
import { requisicao } from "./http";

export const entrar = (dados: DadosLogin) => requisicao<RespostaLogin>("POST", "/api/auth/login", dados);

export const cadastrar = (dados: DadosCadastro) => requisicao<unknown>("POST", "/api/auth/cadastro", dados);

export const buscarUsuarioLogado = () => requisicao<UsuarioLogado>("GET", "/api/auth/me");
