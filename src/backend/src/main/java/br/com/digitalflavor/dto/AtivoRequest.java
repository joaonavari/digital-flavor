package br.com.digitalflavor.dto;

import jakarta.validation.constraints.NotNull;

public record AtivoRequest(@NotNull Boolean ativo) {
}
