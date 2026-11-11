package br.com.digitalflavor.domain.pedido;

/**
 * Ciclo de vida do pedido:
 * <pre>
 * RECEBIDO -> EM_PREPARO -> PRONTO -> ENTREGUE
 *     \-> CANCELADO (somente enquanto RECEBIDO)
 * </pre>
 * A ordem das constantes segue o DER.
 */
public enum StatusPedido {
    RECEBIDO,
    EM_PREPARO,
    CANCELADO,
    PRONTO,
    ENTREGUE;

    public boolean podeAvancarPara(StatusPedido proximo) {
        return switch (this) {
            case RECEBIDO -> proximo == EM_PREPARO || proximo == CANCELADO;
            case EM_PREPARO -> proximo == PRONTO;
            case PRONTO -> proximo == ENTREGUE;
            case CANCELADO, ENTREGUE -> false;
        };
    }
}
