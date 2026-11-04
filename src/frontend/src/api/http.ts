import type { ErroResposta } from "../types";

export const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8080").replace(/\/$/, "");
export const USA_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const CHAVE_TOKEN = "df.token";

export type Metodo = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** Erro vindo da API (status HTTP + mensagem do back) ou de rede (status 0). */
export class ErroApi extends Error {
  readonly status: number;

  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.name = "ErroApi";
    this.status = status;
  }

  get ehErroDeRede(): boolean {
    return this.status === 0;
  }
}

/* ---------- Sessão ---------- */

export function lerToken(): string | null {
  try {
    return localStorage.getItem(CHAVE_TOKEN);
  } catch {
    return null;
  }
}

export function salvarToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(CHAVE_TOKEN, token);
    else localStorage.removeItem(CHAVE_TOKEN);
  } catch {
    /* armazenamento indisponível: a sessão vale só até recarregar */
  }
}

let aoNaoAutorizado: () => void = () => {};

/** O AuthContext registra aqui o que fazer quando a API responde 401. */
export function definirAoNaoAutorizado(acao: () => void): void {
  aoNaoAutorizado = acao;
}

/* ---------- Requisição ---------- */

function ehErroResposta(valor: unknown): valor is ErroResposta {
  return (
    typeof valor === "object" &&
    valor !== null &&
    "mensagem" in valor &&
    typeof (valor as { mensagem: unknown }).mensagem === "string"
  );
}

function mensagemPadrao(status: number): string {
  switch (status) {
    case 400:
      return "Confira os dados e tente de novo.";
    case 403:
      return "Você não tem permissão para fazer isso.";
    case 404:
      return "Não encontramos o que você procurou.";
    case 422:
      return "Não foi possível concluir com os dados enviados.";
    default:
      return "Algo deu errado no servidor. Tente de novo.";
  }
}

export async function requisicao<T>(metodo: Metodo, caminho: string, corpo?: unknown): Promise<T> {
  const token = lerToken();

  if (USA_MOCK) {
    // Import dinâmico: o mock não entra no pacote quando VITE_USE_MOCK=false.
    const { requisicaoMock } = await import("./mock/servidor");
    try {
      return (await requisicaoMock(metodo, caminho, corpo, token)) as T;
    } catch (erro) {
      if (erro instanceof ErroApi && erro.status === 401) {
        salvarToken(null);
        aoNaoAutorizado();
      }
      throw erro;
    }
  }

  const cabecalhos: Record<string, string> = { Accept: "application/json" };
  if (corpo !== undefined) cabecalhos["Content-Type"] = "application/json";
  if (token) cabecalhos.Authorization = `Bearer ${token}`;

  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method: metodo,
      headers: cabecalhos,
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
  } catch {
    throw new ErroApi(0, "Sem conexão com o servidor. Verifique sua internet e tente de novo.");
  }

  if (resposta.status === 401) {
    salvarToken(null);
    aoNaoAutorizado();
    throw new ErroApi(401, "Sua sessão expirou. Entre de novo.");
  }

  const texto = await resposta.text();
  let dados: unknown = null;
  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = null;
    }
  }

  if (!resposta.ok) {
    const mensagem = ehErroResposta(dados) ? dados.mensagem : mensagemPadrao(resposta.status);
    throw new ErroApi(resposta.status, mensagem);
  }

  return dados as T;
}

/** Mensagem amigável para qualquer erro capturado num catch. */
export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof ErroApi) return erro.message;
  return "Algo deu errado. Tente de novo.";
}
