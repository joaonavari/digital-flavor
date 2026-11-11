package br.com.digitalflavor.dto;

import br.com.digitalflavor.domain.pagamento.MetodoPagamento;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/** Carrinho confirmado pelo aluno (RF05, RF08) com a forma de pagamento (RF09). */
public record PedidoRequest(
        @NotEmpty List<@Valid Item> itens,
        @NotNull @Valid Pagamento pagamento) {

    public record Item(@NotNull Long produtoId, @NotNull @Min(1) Integer quantidade) {
    }

    /** Para CARTAO, numeroCartao e obrigatorio; so os 4 ultimos digitos sao guardados. */
    public record Pagamento(@NotNull MetodoPagamento metodo, String numeroCartao, String bandeira, Integer parcelas) {
    }
}
