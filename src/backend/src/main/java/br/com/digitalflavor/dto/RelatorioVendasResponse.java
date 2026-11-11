package br.com.digitalflavor.dto;

import java.math.BigDecimal;
import java.util.List;

/** RF10: vendas do periodo (pedidos nao cancelados), no formato RelatorioVendas do front. */
public record RelatorioVendasResponse(
        BigDecimal totalVendido,
        int quantidadePedidos,
        List<PorProduto> porProduto) {

    public record PorProduto(Long produtoId, String nome, int quantidade, BigDecimal total) {
    }
}
