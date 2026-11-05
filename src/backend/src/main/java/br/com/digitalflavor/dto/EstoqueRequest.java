package br.com.digitalflavor.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/** Ajuste de estoque: informa a quantidade final em estoque (inventario). */
public record EstoqueRequest(@NotNull @Min(0) Integer quantidade) {
}
