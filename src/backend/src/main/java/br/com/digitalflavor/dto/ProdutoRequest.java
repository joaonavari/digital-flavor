package br.com.digitalflavor.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/** Cadastro de um produto novo, com estoque inicial. */
public record ProdutoRequest(
        @NotBlank @Size(max = 120) String nome,
        String descricao,
        @NotNull @DecimalMin("0.00") BigDecimal preco,
        @Size(max = 60) String categoria,
        @NotNull @Min(0) Integer quantidadeEstoque,
        @Size(max = 500) String imagemUrl) {
}
