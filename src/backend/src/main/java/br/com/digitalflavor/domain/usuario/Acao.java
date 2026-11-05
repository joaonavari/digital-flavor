package br.com.digitalflavor.domain.usuario;

/**
 * Acoes do sistema sujeitas a controle de acesso (RF02 / RN03).
 * Cada subclasse de {@link Usuario} decide quais pode executar.
 */
public enum Acao {
    FAZER_PEDIDO,
    ATENDER_PEDIDOS,
    GERENCIAR_PRODUTOS,
    AJUSTAR_ESTOQUE,
    CONSULTAR_VENDAS,
    GERENCIAR_USUARIOS
}
