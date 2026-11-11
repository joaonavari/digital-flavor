package br.com.digitalflavor.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/** Atualizacao dos dados do produto. O estoque muda pelo endpoint de estoque. */
public record ProdutoAtualizacaoRequest(
        @NotBlank @Size(max = 120) String nome,
        String descricao,
        @NotNull @DecimalMin("0.00") BigDecimal preco,
        @Size(max = 60) String categoria) {
}
