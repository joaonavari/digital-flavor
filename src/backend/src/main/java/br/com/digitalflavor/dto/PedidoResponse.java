package br.com.digitalflavor.dto;

import br.com.digitalflavor.domain.pagamento.Pagamento;
import br.com.digitalflavor.domain.pagamento.PagamentoCartao;
import br.com.digitalflavor.domain.pagamento.PagamentoPix;
import br.com.digitalflavor.domain.pedido.ItemPedido;
import br.com.digitalflavor.domain.pedido.Pedido;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** Formato do tipo Pedido do front (src/frontend/src/types). */
public record PedidoResponse(
        Long id,
        String alunoNome,
        LocalDateTime dataHora,
        String status,
        BigDecimal total,
        List<Item> itens,
        PagamentoResponse pagamento) {

    public record Item(Long produtoId, String nome, int quantidade, BigDecimal precoUnitario, BigDecimal subtotal) {

        static Item de(ItemPedido item) {
            return new Item(item.getProduto().getId(), item.getProduto().getNome(), item.getQuantidade(),
                    item.getPrecoUnitario(), item.calcularSubtotal());
        }
    }

    /** O numero do cartao so aparece mascarado; o codigo PIX so existe para PIX. */
    public record PagamentoResponse(String metodo, String status, String numeroMascarado, String codigoQr) {

        static PagamentoResponse de(Pagamento pagamento) {
            if (pagamento == null) {
                return null;
            }
            return new PagamentoResponse(
                    pagamento.getMetodo().name(),
                    pagamento.getStatus().name(),
                    pagamento instanceof PagamentoCartao cartao ? cartao.getNumeroMascarado() : null,
                    pagamento instanceof PagamentoPix pix ? pix.getCodigoQr() : null);
        }
    }

    public static PedidoResponse de(Pedido pedido, Pagamento pagamento) {
        return new PedidoResponse(
                pedido.getId(),
                pedido.getAluno().getNome(),
                pedido.getDataHora(),
                pedido.getStatus().name(),
                pedido.getTotal(),
                pedido.getItens().stream().map(Item::de).toList(),
                PagamentoResponse.de(pagamento));
    }
}
