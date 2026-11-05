package br.com.digitalflavor.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Dados para o aluno se cadastrar. A senha tem limite de 72 bytes imposto pelo BCrypt. */
public record CadastroAlunoRequest(
        @NotBlank @Size(max = 120) String nome,
        @NotBlank @Email @Size(max = 160) String email,
        @NotBlank @Size(min = 8, max = 72) String senha,
        @Size(max = 20) String telefone,
        @NotBlank @Size(max = 20) String matricula,
        @Size(max = 30) String turma) {
}
