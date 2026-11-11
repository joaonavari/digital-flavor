package br.com.digitalflavor.dto;

import br.com.digitalflavor.domain.usuario.Aluno;
import br.com.digitalflavor.domain.usuario.Usuario;

/**
 * Visao publica de um usuario. Nunca inclui a senha nem o hash.
 * matricula e turma so vem preenchidas para ALUNO (o Perfil do front usa esses campos).
 */
public record UsuarioResponse(Long id, String nome, String email, String tipo, boolean ativo,
                              String telefone, String matricula, String turma) {

    public static UsuarioResponse de(Usuario usuario) {
        Aluno aluno = usuario instanceof Aluno a ? a : null;
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTipo().name(),
                usuario.isAtivo(),
                usuario.getTelefone(),
                aluno == null ? null : aluno.getMatricula(),
                aluno == null ? null : aluno.getTurma());
    }
}
