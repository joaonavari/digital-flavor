package br.com.digitalflavor.seguranca;

import br.com.digitalflavor.domain.usuario.Acao;
import br.com.digitalflavor.domain.usuario.Usuario;
import br.com.digitalflavor.repository.UsuarioRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Ponto unico de controle de acesso dos services: a permissao sempre passa por
 * {@link Usuario#possuiPermissao(Acao)} (RN03).
 */
@Component
public class UsuarioLogado {

    private final UsuarioRepository usuarios;

    public UsuarioLogado(UsuarioRepository usuarios) {
        this.usuarios = usuarios;
    }

    public Usuario obter() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof Long id)) {
            throw new AccessDeniedException("Usuario nao autenticado.");
        }
        return usuarios.findById(id)
                .orElseThrow(() -> new AccessDeniedException("Usuario nao encontrado."));
    }

    /** Lanca AccessDeniedException (HTTP 403) se o usuario logado nao puder executar a acao. */
    public void exigir(Acao acao) {
        if (!obter().possuiPermissao(acao)) {
            throw new AccessDeniedException("Sem permissao para esta acao.");
        }
    }
}
