package br.com.digitalflavor.dto;

import br.com.digitalflavor.domain.pedido.StatusPedido;
import jakarta.validation.constraints.NotNull;

public record StatusPedidoRequest(@NotNull StatusPedido status) {
}
