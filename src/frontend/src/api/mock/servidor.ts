/*
 * Servidor falso para desenvolver sem o back (VITE_USE_MOCK=true).
 * Responde às mesmas rotas, com os mesmos formatos e códigos de erro do contrato.
 * Os dados ficam no localStorage do navegador só para facilitar o desenvolvimento.
 */
import type {
  DadosCadastro,
  DadosLogin,
  DadosNovoPedido,
  DadosNovoUsuario,
  DadosProduto,
  Pedido,
  Produto,
  RelatorioVendas,
  StatusPedido,
  TipoUsuario,
  Usuario,
  UsuarioLogado,
} from "../../types";
import { ErroApi, type Metodo } from "../http";
import { criarBancoInicial, type BancoMock, type UsuarioMock } from "./dados";

const CHAVE_BANCO = "df.mock.banco";
const PREFIXO_TOKEN = "mock-token-";

/* ---------- Banco em localStorage ---------- */

function carregarBanco(): BancoMock {
  try {
    const salvo = localStorage.getItem(CHAVE_BANCO);
    if (salvo) return JSON.parse(salvo) as BancoMock;
  } catch {
    /* ignora e recomeça */
  }
  return criarBancoInicial();
}

let banco = carregarBanco();

function salvarBanco(): void {
  try {
    localStorage.setItem(CHAVE_BANCO, JSON.stringify(banco));
  } catch {
    /* sem armazenamento: dados ficam só em memória */
  }
}

/** Volta os dados de exemplo ao estado inicial (útil no console: dfResetarMock()). */
export function resetarMock(): void {
  banco = criarBancoInicial();
  salvarBanco();
}

/** Muda o estoque "por fora", como se outro aluno tivesse comprado (no console: dfAjustarEstoque(2, 1)). */
export function ajustarEstoqueMock(produtoId: number, quantidade: number): void {
  const produto = banco.produtos.find((p) => p.id === produtoId);
  if (!produto) return;
  produto.quantidadeEstoque = quantidade;
  salvarBanco();
}

Object.assign(globalThis, { dfResetarMock: resetarMock, dfAjustarEstoque: ajustarEstoqueMock });

/* ---------- Utilidades ---------- */

const esperar = (ms: number) => new Promise((resolver) => setTimeout(resolver, ms));

const copiar = <T>(valor: T): T => structuredClone(valor);

const erro = (status: number, mensagem: string) => new ErroApi(status, mensagem);

const arredondar = (valor: number) => Math.round(valor * 100) / 100;

/** Login devolve o básico; /me devolve também telefone e, para ALUNO, matrícula e turma. */
function paraUsuarioLogado(u: UsuarioMock): UsuarioLogado {
  return { id: u.id, nome: u.nome, email: u.email, tipo: u.tipo };
}

function paraMe(u: UsuarioMock): UsuarioLogado {
  return {
    ...paraUsuarioLogado(u),
    telefone: u.telefone ?? null,
    ...(u.tipo === "ALUNO" ? { matricula: u.matricula ?? null, turma: u.turma ?? null } : {}),
  };
}

function paraUsuario(u: UsuarioMock): Usuario {
  return { id: u.id, nome: u.nome, email: u.email, tipo: u.tipo, ativo: u.ativo };
}

function usuarioDoToken(token: string | null): UsuarioMock {
  const id = token?.startsWith(PREFIXO_TOKEN) ? Number(token.slice(PREFIXO_TOKEN.length)) : NaN;
  const usuario = banco.usuarios.find((u) => u.id === id && u.ativo);
  if (!usuario) throw erro(401, "Sua sessão expirou. Entre de novo.");
  return usuario;
}

function exigirPerfil(usuario: UsuarioMock, perfis: TipoUsuario[]): void {
  if (!perfis.includes(usuario.tipo)) throw erro(403, "Você não tem permissão para fazer isso.");
}

function acharProduto(id: number): Produto {
  const produto = banco.produtos.find((p) => p.id === id);
  if (!produto) throw erro(404, "Produto não encontrado.");
  return produto;
}

function acharPedido(id: number): Pedido {
  const pedido = banco.pedidos.find((p) => p.id === id);
  if (!pedido) throw erro(404, "Pedido não encontrado.");
  return pedido;
}

function nomeCurto(usuario: UsuarioMock): string {
  const [primeiro = "", ...resto] = usuario.nome.trim().split(/\s+/);
  const inicial = resto.length > 0 ? ` ${resto[resto.length - 1]?.charAt(0)}.` : "";
  return `${primeiro}${inicial}${usuario.turma ? ` · ${usuario.turma}` : ""}`;
}

function validarProduto(dados: DadosProduto): void {
  if (!dados.nome?.trim()) throw erro(400, "Informe o nome do produto.");
  if (!(typeof dados.preco === "number") || dados.preco <= 0) throw erro(400, "O preço precisa ser maior que zero.");
  if (!Number.isInteger(dados.quantidadeEstoque) || dados.quantidadeEstoque < 0)
    throw erro(400, "O estoque precisa ser um número inteiro, zero ou maior.");
}

function dataLocal(iso: string): string {
  const d = new Date(iso);
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

const PROXIMO_STATUS: Partial<Record<StatusPedido, StatusPedido>> = {
  RECEBIDO: "EM_PREPARO",
  EM_PREPARO: "PRONTO",
  PRONTO: "ENTREGUE",
};

const GESTAO: TipoUsuario[] = ["GERENTE", "ADMINISTRADOR"];
const CANTINA: TipoUsuario[] = ["FUNCIONARIO", "GERENTE", "ADMINISTRADOR"];

/* ---------- Rotas ---------- */

type Manipulador = (ctx: { params: string[]; corpo: unknown; token: string | null; busca: URLSearchParams }) => unknown;

const rotas: Array<[Metodo, RegExp, Manipulador]> = [
  /* Autenticação */
  ["POST", /^\/api\/auth\/login$/, ({ corpo }) => {
    const { email, senha } = corpo as DadosLogin;
    const usuario = banco.usuarios.find((u) => u.email.toLowerCase() === email?.trim().toLowerCase());
    if (!usuario || usuario.senha !== senha) throw erro(400, "E-mail ou senha incorretos.");
    if (!usuario.ativo) throw erro(403, "Este usuário está desativado. Procure a cantina.");
    return { token: `${PREFIXO_TOKEN}${usuario.id}`, usuario: paraUsuarioLogado(usuario) };
  }],
  ["POST", /^\/api\/auth\/cadastro$/, ({ corpo }) => {
    const dados = corpo as DadosCadastro;
    if (!dados.nome?.trim() || !dados.email?.trim() || !dados.senha || !dados.matricula?.trim())
      throw erro(400, "Preencha nome, e-mail, senha e matrícula.");
    if (banco.usuarios.some((u) => u.email.toLowerCase() === dados.email.trim().toLowerCase()))
      throw erro(400, "Já existe uma conta com este e-mail.");
    const novo: UsuarioMock = {
      id: banco.proximoId.usuario++,
      nome: dados.nome.trim(),
      email: dados.email.trim(),
      senha: dados.senha,
      tipo: "ALUNO",
      ativo: true,
      telefone: dados.telefone || undefined,
      matricula: dados.matricula.trim(),
      turma: dados.turma || undefined,
    };
    banco.usuarios.push(novo);
    return paraUsuarioLogado(novo);
  }],
  ["GET", /^\/api\/auth\/me$/, ({ token }) => paraMe(usuarioDoToken(token))],

  /* Produtos */
  ["GET", /^\/api\/produtos$/, ({ token }) => {
    usuarioDoToken(token);
    return banco.produtos.filter((p) => p.ativo && p.quantidadeEstoque > 0);
  }],
  ["GET", /^\/api\/produtos\/todos$/, ({ token }) => {
    exigirPerfil(usuarioDoToken(token), GESTAO);
    return banco.produtos;
  }],
  ["GET", /^\/api\/produtos\/(\d+)$/, ({ token, params }) => {
    usuarioDoToken(token);
    return acharProduto(Number(params[0]));
  }],
  ["POST", /^\/api\/produtos$/, ({ token, corpo }) => {
    exigirPerfil(usuarioDoToken(token), GESTAO);
    const dados = corpo as DadosProduto;
    validarProduto(dados);
    const novo: Produto = {
      id: banco.proximoId.produto++,
      nome: dados.nome.trim(),
      descricao: dados.descricao?.trim() || null,
      preco: dados.preco,
      categoria: dados.categoria?.trim() || null,
      quantidadeEstoque: dados.quantidadeEstoque,
      ativo: true,
      imagemUrl: dados.imagemUrl?.trim() || null,
    };
    banco.produtos.push(novo);
    return novo;
  }],
  ["PUT", /^\/api\/produtos\/(\d+)$/, ({ token, params, corpo }) => {
    exigirPerfil(usuarioDoToken(token), GESTAO);
    const produto = acharProduto(Number(params[0]));
    const dados = corpo as DadosProduto;
    validarProduto(dados);
    Object.assign(produto, {
      nome: dados.nome.trim(),
      descricao: dados.descricao?.trim() || null,
      preco: dados.preco,
      categoria: dados.categoria?.trim() || null,
      quantidadeEstoque: dados.quantidadeEstoque,
      imagemUrl: dados.imagemUrl?.trim() || null,
    });
    return produto;
  }],
  ["DELETE", /^\/api\/produtos\/(\d+)$/, ({ token, params }) => {
    exigirPerfil(usuarioDoToken(token), GESTAO);
    const produto = acharProduto(Number(params[0]));
    // Já vendido (está em algum pedido): só desativa e devolve o produto (200).
    if (banco.pedidos.some((pedido) => pedido.itens.some((i) => i.produtoId === produto.id))) {
      produto.ativo = false;
      return produto;
    }
    // Nunca vendido: apaga de verdade (204, sem corpo).
    banco.produtos = banco.produtos.filter((p) => p.id !== produto.id);
    return null;
  }],
  ["PATCH", /^\/api\/produtos\/(\d+)\/ativo$/, ({ token, params, corpo }) => {
    exigirPerfil(usuarioDoToken(token), GESTAO);
    const produto = acharProduto(Number(params[0]));
    const { ativo } = corpo as { ativo: boolean };
    if (typeof ativo !== "boolean") throw erro(400, "Informe se o produto fica no cardápio.");
    produto.ativo = ativo;
    return produto;
  }],
  ["PATCH", /^\/api\/produtos\/(\d+)\/estoque$/, ({ token, params, corpo }) => {
    exigirPerfil(usuarioDoToken(token), GESTAO);
    const produto = acharProduto(Number(params[0]));
    const { quantidade } = corpo as { quantidade: number };
    if (!Number.isInteger(quantidade) || quantidade < 0)
      throw erro(400, "O estoque precisa ser um número inteiro, zero ou maior.");
    produto.quantidadeEstoque = quantidade;
    return produto;
  }],

  /* Pedidos */
  ["POST", /^\/api\/pedidos$/, ({ token, corpo }) => {
    const aluno = usuarioDoToken(token);
    exigirPerfil(aluno, ["ALUNO"]);
    const dados = corpo as DadosNovoPedido;
    if (!dados.itens?.length) throw erro(400, "O carrinho está vazio.");

    // RN01/RN05: confere todo o estoque antes de mexer em qualquer coisa.
    const itens = dados.itens.map(({ produtoId, quantidade }) => {
      const produto = banco.produtos.find((p) => p.id === produtoId);
      if (!produto || !produto.ativo) throw erro(422, "Um dos produtos não está mais disponível.");
      if (!Number.isInteger(quantidade) || quantidade <= 0) throw erro(400, "Quantidade inválida.");
      if (produto.quantidadeEstoque < quantidade) {
        const resta = produto.quantidadeEstoque;
        throw erro(422, resta === 0
          ? `${produto.nome} acabou.`
          : `Estoque insuficiente: só ${resta === 1 ? "resta 1 unidade" : `restam ${resta} unidades`} de ${produto.nome}.`);
      }
      return { produto, quantidade };
    });

    const { pagamento } = dados;
    if (pagamento?.metodo !== "PIX" && pagamento?.metodo !== "CARTAO") throw erro(400, "Escolha a forma de pagamento.");
    let numeroMascarado: string | undefined;
    if (pagamento.metodo === "CARTAO") {
      const digitos = (pagamento.numeroCartao ?? "").replace(/\D/g, "");
      if (digitos.length < 13 || digitos.length > 19) throw erro(400, "Número do cartão inválido.");
      numeroMascarado = `•••• ${digitos.slice(-4)}`;
    }

    // RN02: baixa o estoque.
    itens.forEach(({ produto, quantidade }) => { produto.quantidadeEstoque -= quantidade; });

    const id = banco.proximoId.pedido++;
    const pedido: Pedido = {
      id,
      alunoNome: nomeCurto(aluno),
      dataHora: new Date().toISOString(),
      status: "RECEBIDO",
      total: arredondar(itens.reduce((s, { produto, quantidade }) => s + produto.preco * quantidade, 0)),
      itens: itens.map(({ produto, quantidade }) => ({
        produtoId: produto.id,
        nome: produto.nome,
        quantidade,
        precoUnitario: produto.preco,
        subtotal: arredondar(produto.preco * quantidade),
      })),
      pagamento: pagamento.metodo === "PIX"
        ? { metodo: "PIX", status: "APROVADO", codigoQr: `00020126DIGITALFLAVOR${id}5204000053039865802BR` }
        : { metodo: "CARTAO", status: "APROVADO", numeroMascarado },
    };
    banco.pedidos.push(pedido);
    banco.donos[id] = aluno.id; // RN06
    return pedido;
  }],
  ["GET", /^\/api\/pedidos\/meus$/, ({ token }) => {
    const aluno = usuarioDoToken(token);
    return banco.pedidos
      .filter((p) => banco.donos[p.id] === aluno.id)
      .sort((a, b) => b.dataHora.localeCompare(a.dataHora));
  }],
  ["GET", /^\/api\/pedidos\/fila$/, ({ token }) => {
    exigirPerfil(usuarioDoToken(token), CANTINA);
    return banco.pedidos
      .filter((p) => p.status === "RECEBIDO" || p.status === "EM_PREPARO" || p.status === "PRONTO")
      .sort((a, b) => a.dataHora.localeCompare(b.dataHora));
  }],
  ["PATCH", /^\/api\/pedidos\/(\d+)\/status$/, ({ token, params, corpo }) => {
    exigirPerfil(usuarioDoToken(token), CANTINA);
    const pedido = acharPedido(Number(params[0]));
    const { status } = corpo as { status: StatusPedido };
    if (PROXIMO_STATUS[pedido.status] !== status)
      throw erro(422, `Não é possível mudar o pedido #${pedido.id} para esse status.`);
    pedido.status = status;
    return pedido;
  }],
  ["POST", /^\/api\/pedidos\/(\d+)\/cancelar$/, ({ token, params }) => {
    const aluno = usuarioDoToken(token);
    const pedido = acharPedido(Number(params[0]));
    if (banco.donos[pedido.id] !== aluno.id) throw erro(403, "Este pedido não é seu.");
    if (pedido.status !== "RECEBIDO") throw erro(422, "Este pedido já está em preparo e não pode mais ser cancelado.");
    pedido.status = "CANCELADO";
    pedido.pagamento.status = "ESTORNADO";
    pedido.itens.forEach((item) => {
      const produto = banco.produtos.find((p) => p.id === item.produtoId);
      if (produto) produto.quantidadeEstoque += item.quantidade;
    });
    return pedido;
  }],

  ["GET", /^\/api\/pedidos\/(\d+)$/, ({ token, params }) => {
    const usuario = usuarioDoToken(token);
    const pedido = acharPedido(Number(params[0]));
    // ALUNO só vê o próprio pedido; a cantina vê qualquer um.
    if (usuario.tipo === "ALUNO" && banco.donos[pedido.id] !== usuario.id) throw erro(403, "Este pedido não é seu.");
    return pedido;
  }],

  /* Vendas */
  ["GET", /^\/api\/vendas$/, ({ token, busca }) => {
    exigirPerfil(usuarioDoToken(token), GESTAO);
    const inicio = busca.get("inicio") ?? "";
    const fim = busca.get("fim") ?? "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(inicio) || !/^\d{4}-\d{2}-\d{2}$/.test(fim))
      throw erro(400, "Informe o período no formato AAAA-MM-DD.");
    const pedidos = banco.pedidos.filter((p) => {
      const dia = dataLocal(p.dataHora);
      return p.status !== "CANCELADO" && dia >= inicio && dia <= fim;
    });
    const mapa = new Map<number, { produtoId: number; nome: string; quantidade: number; total: number }>();
    pedidos.forEach((p) => p.itens.forEach((i) => {
      const atual = mapa.get(i.produtoId) ?? { produtoId: i.produtoId, nome: i.nome, quantidade: 0, total: 0 };
      atual.quantidade += i.quantidade;
      atual.total = arredondar(atual.total + i.subtotal);
      mapa.set(i.produtoId, atual);
    }));
    const relatorio: RelatorioVendas = {
      totalVendido: arredondar(pedidos.reduce((s, p) => s + p.total, 0)),
      quantidadePedidos: pedidos.length,
      porProduto: [...mapa.values()].sort((a, b) => b.quantidade - a.quantidade),
    };
    return relatorio;
  }],

  /* Usuários */
  ["GET", /^\/api\/usuarios$/, ({ token }) => {
    exigirPerfil(usuarioDoToken(token), ["ADMINISTRADOR"]);
    return banco.usuarios.map(paraUsuario);
  }],
  ["POST", /^\/api\/usuarios$/, ({ token, corpo }) => {
    exigirPerfil(usuarioDoToken(token), ["ADMINISTRADOR"]);
    const dados = corpo as DadosNovoUsuario;
    if (!dados.nome?.trim() || !dados.email?.trim() || !dados.senha) throw erro(400, "Preencha nome, e-mail e senha.");
    if (!["FUNCIONARIO", "GERENTE", "ADMINISTRADOR"].includes(dados.tipo)) throw erro(400, "Perfil inválido.");
    if (dados.tipo === "FUNCIONARIO" && !dados.matriculaFuncional?.trim())
      throw erro(400, "Informe a matrícula funcional do funcionário.");
    if (banco.usuarios.some((u) => u.email.toLowerCase() === dados.email.trim().toLowerCase()))
      throw erro(400, "Já existe uma conta com este e-mail.");
    const novo: UsuarioMock = {
      id: banco.proximoId.usuario++,
      nome: dados.nome.trim(),
      email: dados.email.trim(),
      senha: dados.senha,
      tipo: dados.tipo,
      ativo: true,
      telefone: dados.telefone || undefined,
      ...(dados.tipo === "FUNCIONARIO" ? { matriculaFuncional: dados.matriculaFuncional.trim(), turno: dados.turno } : {}),
      ...(dados.tipo === "GERENTE" ? { setor: dados.setor } : {}),
      ...(dados.tipo === "ADMINISTRADOR" ? { nivelAcesso: dados.nivelAcesso } : {}),
    };
    banco.usuarios.push(novo);
    return paraUsuario(novo);
  }],
  ["PATCH", /^\/api\/usuarios\/(\d+)\/ativo$/, ({ token, params, corpo }) => {
    const admin = usuarioDoToken(token);
    exigirPerfil(admin, ["ADMINISTRADOR"]);
    const usuario = banco.usuarios.find((u) => u.id === Number(params[0]));
    if (!usuario) throw erro(404, "Usuário não encontrado.");
    const { ativo } = corpo as { ativo: boolean };
    if (usuario.id === admin.id && !ativo) throw erro(422, "Você não pode desativar a própria conta.");
    usuario.ativo = Boolean(ativo);
    return paraUsuario(usuario);
  }],
];

/* ---------- Entrada ---------- */

export async function requisicaoMock(
  metodo: Metodo,
  caminhoCompleto: string,
  corpo: unknown,
  token: string | null,
): Promise<unknown> {
  // Simula a latência da rede para os estados de carregamento aparecerem.
  await esperar(250 + Math.random() * 350);

  const [caminho = "", consulta = ""] = caminhoCompleto.split("?");
  for (const [m, padrao, manipulador] of rotas) {
    if (m !== metodo) continue;
    const achou = padrao.exec(caminho);
    if (!achou) continue;
    const resposta = manipulador({
      params: achou.slice(1),
      corpo: corpo === undefined ? undefined : copiar(corpo),
      token,
      busca: new URLSearchParams(consulta),
    });
    if (metodo !== "GET") salvarBanco();
    return copiar(resposta);
  }
  throw erro(404, `Rota não existe no mock: ${metodo} ${caminho}`);
}
