package br.com.digitalflavor.dto;

import br.com.digitalflavor.domain.usuario.TipoUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Criacao de um usuario pelo administrador. Campos especificos do perfil
 * (matricula, turno, setor, nivelAcesso) so sao usados quando o tipo pedir.
 */
public record CriarUsuarioRequest(
        @NotNull TipoUsuario tipo,
        @NotBlank @Size(max = 120) String nome,
        @NotBlank @Email @Size(max = 160) String email,
        @NotBlank @Size(min = 8, max = 72) String senha,
        @Size(max = 20) String telefone,
        @Size(max = 20) String matricula,
        @Size(max = 20) String turno,
        @Size(max = 60) String setor,
        @Min(1) Integer nivelAcesso) {
}
