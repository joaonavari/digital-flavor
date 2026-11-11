package br.com.digitalflavor.dto;

public record LoginResponse(String token, UsuarioResponse usuario) {
}
