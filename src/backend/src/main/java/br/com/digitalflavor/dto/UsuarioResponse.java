package br.com.digitalflavor.dto;

import br.com.digitalflavor.domain.usuario.Usuario;

/** Visao publica de um usuario. Nunca inclui a senha nem o hash. */
public record UsuarioResponse(Long id, String nome, String email, String tipo) {

    public static UsuarioResponse de(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTipo().name());
    }
}
