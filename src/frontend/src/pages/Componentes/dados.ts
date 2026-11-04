/*
 * Dados da vitrine de componentes (só em desenvolvimento).
 * "pior" usa valores reais e plausíveis que costumam quebrar layout.
 */
export type Conjunto = "demo" | "pior";

export interface DadosVitrine {
  categorias: string[];
  tituloFolha: string;
  itensFolha: Array<{ nome: string; preco: number; quantidade: number }>;
  rotuloBotao: string;
  rotuloCampo: string;
  valorCampo: string;
  erroCampo: string;
  tituloVazio: string;
  descricaoVazio: string;
  erroRede: string;
  toastSucesso: string;
  toastErro: string;
  nomeProduto: string;
}

export const DADOS: Record<Conjunto, DadosVitrine> = {
  demo: {
    categorias: ["Todos", "Salgados", "Bebidas", "Doces"],
    tituloFolha: "Seu pedido",
    itensFolha: [
      { nome: "Coxinha de frango", preco: 6.5, quantidade: 2 },
      { nome: "Suco de laranja", preco: 4, quantidade: 1 },
    ],
    rotuloBotao: "Confirmar pedido",
    rotuloCampo: "Número do cartão",
    valorCampo: "",
    erroCampo: "Número do cartão inválido.",
    tituloVazio: "Nenhum pedido ainda",
    descricaoVazio: "Quando você pedir algo no cardápio, ele aparece aqui.",
    erroRede: "Sem conexão com o servidor. Verifique sua internet e tente de novo.",
    toastSucesso: "Pedido confirmado",
    toastErro: "Estoque insuficiente: só restam 2 unidades de Pão de queijo.",
    nomeProduto: "Coxinha de frango",
  },
  pior: {
    // Categorias livres no back (sem limite no contrato): nomes compostos reais.
    categorias: ["Todos", "Salgados assados", "Bebidas geladas", "Sobremesas e doces", "Lanches naturais"],
    tituloFolha: "Seu pedido para retirar no intervalo",
    itensFolha: [
      { nome: "Sanduíche natural de frango com cenoura ralada e requeijão", preco: 12.5, quantidade: 12 },
      { nome: "Água", preco: 3, quantidade: 1 },
      { nome: "Pão de queijo mineiro tradicional (porção com 3 unidades)", preco: 1234.9, quantidade: 99 },
      { nome: "Suco de maracujá com hortelã, sem açúcar, 300 ml", preco: 7, quantidade: 3 },
      { nome: "Brownie", preco: 5.5, quantidade: 1 },
      { nome: "Esfiha", preco: 6, quantidade: 2 },
    ],
    rotuloBotao: "Confirmar pedido e pagar com cartão de crédito",
    rotuloCampo: "Número do cartão de crédito ou débito (somente números)",
    valorCampo: "4111 1111 1111 1111 123",
    erroCampo:
      "Número do cartão inválido. Confira se você digitou todos os 16 dígitos que aparecem na frente do cartão.",
    tituloVazio: "Nenhum produto encontrado para “sanduíche natural de frango”",
    descricaoVazio:
      "Tente buscar por outro nome, como bartholomew.fitzgerald@northwind-industries-holdings.example.com, ou limpe a busca.",
    erroRede:
      "Não foi possível conectar ao servidor em http://localhost:8080/api/produtos. Verifique se o back-end está rodando e tente de novo.",
    toastSucesso: "Pedido #10482 confirmado. Retire no balcão quando estiver pronto.",
    toastErro:
      "Estoque insuficiente: só resta 1 unidade de Sanduíche natural de frango com cenoura ralada e requeijão.",
    nomeProduto: "Sanduíche natural de frango com cenoura ralada e requeijão",
  },
};
