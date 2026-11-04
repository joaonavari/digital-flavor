/*
 * Dados de exemplo do modo mock (VITE_USE_MOCK=true).
 * Servem só para desenvolver sem o back. Na entrega tudo vem da API real.
 */
import type { Pedido, Produto, TipoUsuario } from "../../types";

export interface UsuarioMock {
  id: number;
  nome: string;
  email: string;
  senha: string;
  tipo: TipoUsuario;
  ativo: boolean;
  telefone?: string;
  matricula?: string;
  turma?: string;
  // Campos extras por tipo (POST /api/usuarios)
  matriculaFuncional?: string;
  turno?: string;
  setor?: string;
  nivelAcesso?: string;
}

export interface BancoMock {
  usuarios: UsuarioMock[];
  produtos: Produto[];
  pedidos: Pedido[];
  /** Dono de cada pedido (id do pedido → id do aluno). Só o mock precisa disso. */
  donos: Record<number, number>;
  proximoId: { usuario: number; produto: number; pedido: number };
}

function minutosAtras(min: number): string {
  return new Date(Date.now() - min * 60_000).toISOString();
}

function diasAtras(dias: number, hora = 10): string {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  d.setHours(hora, 15, 0, 0);
  return d.toISOString();
}

export function criarBancoInicial(): BancoMock {
  const produtos: Produto[] = [
    { id: 1, nome: "Coxinha de frango", descricao: "Massa leve, recheio cremoso", preco: 6.5, categoria: "Salgados", quantidadeEstoque: 24, ativo: true, imagemUrl: null },
    { id: 2, nome: "Pão de queijo", descricao: "Porção com 3 unidades", preco: 5, categoria: "Salgados", quantidadeEstoque: 4, ativo: true, imagemUrl: null },
    { id: 3, nome: "Esfiha de carne", descricao: "Assada, massa fina", preco: 6, categoria: "Salgados", quantidadeEstoque: 15, ativo: true, imagemUrl: null },
    { id: 4, nome: "Suco de laranja", descricao: "Natural, 300 ml", preco: 4, categoria: "Bebidas", quantidadeEstoque: 18, ativo: true, imagemUrl: null },
    { id: 5, nome: "Água mineral", descricao: "Sem gás, 500 ml", preco: 3, categoria: "Bebidas", quantidadeEstoque: 40, ativo: true, imagemUrl: null },
    { id: 6, nome: "Brownie", descricao: "Chocolate meio amargo", preco: 5.5, categoria: "Doces", quantidadeEstoque: 9, ativo: true, imagemUrl: null },
    { id: 7, nome: "Bolo de cenoura", descricao: "Fatia com cobertura de chocolate", preco: 5, categoria: "Doces", quantidadeEstoque: 0, ativo: true, imagemUrl: null },
    { id: 8, nome: "Refrigerante lata", descricao: "350 ml", preco: 5, categoria: "Bebidas", quantidadeEstoque: 30, ativo: false, imagemUrl: null },
  ];

  const pedidos: Pedido[] = [
    {
      id: 104, alunoNome: "Ana P. · 2º A", dataHora: minutosAtras(6), status: "PRONTO", total: 15,
      itens: [{ produtoId: 2, nome: "Pão de queijo", quantidade: 3, precoUnitario: 5, subtotal: 15 }],
      pagamento: { metodo: "PIX", status: "APROVADO" },
    },
    {
      id: 105, alunoNome: "Lucas M. · 3º A", dataHora: minutosAtras(4), status: "EM_PREPARO", total: 9.5,
      itens: [
        { produtoId: 6, nome: "Brownie", quantidade: 1, precoUnitario: 5.5, subtotal: 5.5 },
        { produtoId: 4, nome: "Suco de laranja", quantidade: 1, precoUnitario: 4, subtotal: 4 },
      ],
      pagamento: { metodo: "CARTAO", status: "APROVADO", numeroMascarado: "•••• 4821" },
    },
    {
      id: 106, alunoNome: "Júlia R. · 1º C", dataHora: minutosAtras(3), status: "EM_PREPARO", total: 6,
      itens: [{ produtoId: 3, nome: "Esfiha de carne", quantidade: 1, precoUnitario: 6, subtotal: 6 }],
      pagamento: { metodo: "PIX", status: "APROVADO" },
    },
    {
      id: 107, alunoNome: "Pedro A. · 2º B", dataHora: minutosAtras(1), status: "RECEBIDO", total: 8,
      itens: [
        { produtoId: 2, nome: "Pão de queijo", quantidade: 1, precoUnitario: 5, subtotal: 5 },
        { produtoId: 5, nome: "Água mineral", quantidade: 1, precoUnitario: 3, subtotal: 3 },
      ],
      pagamento: { metodo: "PIX", status: "APROVADO" },
    },
    // Pedidos da aluna de exemplo (Maria, id 1)
    {
      id: 101, alunoNome: "Maria S. · 3º A", dataHora: diasAtras(1, 9), status: "ENTREGUE", total: 17,
      itens: [
        { produtoId: 1, nome: "Coxinha de frango", quantidade: 2, precoUnitario: 6.5, subtotal: 13 },
        { produtoId: 4, nome: "Suco de laranja", quantidade: 1, precoUnitario: 4, subtotal: 4 },
      ],
      pagamento: { metodo: "PIX", status: "APROVADO" },
    },
    {
      id: 92, alunoNome: "Maria S. · 3º A", dataHora: diasAtras(5, 10), status: "CANCELADO", total: 5.5,
      itens: [{ produtoId: 6, nome: "Brownie", quantidade: 1, precoUnitario: 5.5, subtotal: 5.5 }],
      pagamento: { metodo: "CARTAO", status: "ESTORNADO", numeroMascarado: "•••• 1234" },
    },
    {
      id: 80, alunoNome: "Maria S. · 3º A", dataHora: diasAtras(12, 11), status: "ENTREGUE", total: 9,
      itens: [
        { produtoId: 3, nome: "Esfiha de carne", quantidade: 1, precoUnitario: 6, subtotal: 6 },
        { produtoId: 5, nome: "Água mineral", quantidade: 1, precoUnitario: 3, subtotal: 3 },
      ],
      pagamento: { metodo: "PIX", status: "APROVADO" },
    },
  ];

  const usuarios: UsuarioMock[] = [
    { id: 1, nome: "Maria Souza", email: "aluno@escola.com", senha: "123456", tipo: "ALUNO", ativo: true, telefone: "44999998888", matricula: "2025001", turma: "3º A" },
    { id: 2, nome: "Carlos Lima", email: "funcionario@escola.com", senha: "123456", tipo: "FUNCIONARIO", ativo: true, matriculaFuncional: "F-0012", turno: "Manhã" },
    { id: 3, nome: "Beatriz Rocha", email: "gerente@escola.com", senha: "123456", tipo: "GERENTE", ativo: true, setor: "Cantina" },
    { id: 4, nome: "Admin", email: "admin@escola.com", senha: "123456", tipo: "ADMINISTRADOR", ativo: true, nivelAcesso: "TOTAL" },
  ];

  return { usuarios, produtos, pedidos, donos: { 101: 1, 92: 1, 80: 1 }, proximoId: { usuario: 5, produto: 9, pedido: 109 } };
}

