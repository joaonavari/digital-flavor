package br.com.digitalflavor.dto;

import br.com.digitalflavor.domain.produto.Produto;

import java.math.BigDecimal;

public record ProdutoResponse(
        Long id,
        String nome,
        String descricao,
        BigDecimal preco,
        String categoria,
        int quantidadeEstoque,
        boolean ativo) {

    public static ProdutoResponse de(Produto produto) {
        return new ProdutoResponse(
                produto.getId(),
                produto.getNome(),
                produto.getDescricao(),
                produto.getPreco(),
                produto.getCategoria(),
                produto.getQuantidadeEstoque(),
                produto.isAtivo());
    }
}
