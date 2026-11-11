/*
 * Tipos que espelham os DTOs da API (docs: CONTRATO_API.md, combinado com o back-end).
 * Se o back mudar algum formato, ajuste aqui.
 */

export type TipoUsuario = "ALUNO" | "FUNCIONARIO" | "GERENTE" | "ADMINISTRADOR";

export type StatusPedido = "RECEBIDO" | "EM_PREPARO" | "CANCELADO" | "PRONTO" | "ENTREGUE";

export type MetodoPagamento = "PIX" | "CARTAO";

export type StatusPagamento = "PENDENTE" | "RECUSADO" | "APROVADO" | "ESTORNADO";

/**
 * Usuário retornado por /api/auth/login e /api/auth/me.
 * matricula e turma só vêm para ALUNO.
 */
export interface UsuarioLogado {
  id: number;
  nome: string;
  email: string;
  tipo: TipoUsuario;
  telefone?: string | null;
  matricula?: string | null;
  turma?: string | null;
}

export interface RespostaLogin {
  token: string;
  usuario: UsuarioLogado;
}

export interface DadosLogin {
  email: string;
  senha: string;
}

export interface DadosCadastro {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  matricula: string;
  turma?: string;
}

export interface Produto {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number;
  categoria: string | null;
  quantidadeEstoque: number;
  ativo: boolean;
  imagemUrl: string | null;
}

export interface DadosProduto {
  nome: string;
  descricao?: string;
  preco: number;
  categoria?: string;
  quantidadeEstoque: number;
  imagemUrl?: string;
}

export interface ItemPedido {
  produtoId: number;
  nome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface Pagamento {
  metodo: MetodoPagamento;
  status: StatusPagamento;
  numeroMascarado?: string;
  codigoQr?: string;
}

export interface Pedido {
  id: number;
  alunoNome: string;
  dataHora: string;
  status: StatusPedido;
  total: number;
  itens: ItemPedido[];
  pagamento: Pagamento;
}

export interface ItemNovoPedido {
  produtoId: number;
  quantidade: number;
}

export interface DadosPagamento {
  metodo: MetodoPagamento;
  numeroCartao?: string;
  bandeira?: string;
  parcelas?: number;
}

export interface DadosNovoPedido {
  itens: ItemNovoPedido[];
  pagamento: DadosPagamento;
}

export interface VendaPorProduto {
  produtoId: number;
  nome: string;
  quantidade: number;
  total: number;
}

export interface RelatorioVendas {
  totalVendido: number;
  quantidadePedidos: number;
  porProduto: VendaPorProduto[];
}

/** Item de GET /api/usuarios. */
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: TipoUsuario;
  ativo: boolean;
}

interface BaseNovoUsuario {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
}

/** Corpo de POST /api/usuarios: os campos extras dependem do tipo. */
export type DadosNovoUsuario = BaseNovoUsuario &
  (
    | { tipo: "FUNCIONARIO"; matriculaFuncional: string; turno?: string }
    | { tipo: "GERENTE"; setor?: string }
    | { tipo: "ADMINISTRADOR"; nivelAcesso?: number }
  );

/** Corpo de erro da API. */
export interface ErroResposta {
  mensagem: string;
}
