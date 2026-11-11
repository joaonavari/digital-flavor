package br.com.digitalflavor.service;

import br.com.digitalflavor.domain.exception.RecursoNaoEncontradoException;
import br.com.digitalflavor.domain.exception.RegraNegocioException;
import br.com.digitalflavor.domain.usuario.Acao;
import br.com.digitalflavor.domain.usuario.Administrador;
import br.com.digitalflavor.domain.usuario.Funcionario;
import br.com.digitalflavor.domain.usuario.Gerente;
import br.com.digitalflavor.domain.usuario.TipoUsuario;
import br.com.digitalflavor.domain.usuario.Usuario;
import br.com.digitalflavor.dto.CriarUsuarioRequest;
import br.com.digitalflavor.dto.UsuarioResponse;
import br.com.digitalflavor.repository.UsuarioRepository;
import br.com.digitalflavor.seguranca.UsuarioLogado;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Gestao de usuarios feita pelo administrador. Alunos se cadastram pelo /api/auth/cadastro. */
@Service
public class UsuarioService {

    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;
    private final UsuarioLogado usuarioLogado;

    public UsuarioService(UsuarioRepository usuarios, PasswordEncoder encoder, UsuarioLogado usuarioLogado) {
        this.usuarios = usuarios;
        this.encoder = encoder;
        this.usuarioLogado = usuarioLogado;
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar() {
        usuarioLogado.exigir(Acao.GERENCIAR_USUARIOS);
        return usuarios.findAll(Sort.by("nome")).stream().map(UsuarioResponse::de).toList();
    }

    @Transactional
    public UsuarioResponse criar(CriarUsuarioRequest pedido) {
        usuarioLogado.exigir(Acao.GERENCIAR_USUARIOS);
        if (pedido.tipo() == TipoUsuario.ALUNO) {
            throw new RegraNegocioException("Alunos se cadastram pelo endpoint /api/auth/cadastro.");
        }
        if (usuarios.existsByEmailIgnoreCase(pedido.email())) {
            throw new RegraNegocioException("Ja existe um usuario com este email.");
        }

        String hash = encoder.encode(pedido.senha());
        Usuario novo = switch (pedido.tipo()) {
            case FUNCIONARIO -> new Funcionario(
                    pedido.nome(), pedido.email(), hash, pedido.telefone(),
                    exigir(pedido.matricula(), "matricula"), pedido.turno());
            case GERENTE -> new Gerente(
                    pedido.nome(), pedido.email(), hash, pedido.telefone(), pedido.setor());
            case ADMINISTRADOR -> new Administrador(
                    pedido.nome(), pedido.email(), hash, pedido.telefone(),
                    pedido.nivelAcesso() == null ? 1 : pedido.nivelAcesso());
            case ALUNO -> throw new RegraNegocioException("Alunos se cadastram pelo endpoint /api/auth/cadastro.");
        };
        return UsuarioResponse.de(usuarios.save(novo));
    }

    /** Ativa ou desativa um usuario. Ninguem desativa a propria conta. */
    @Transactional
    public UsuarioResponse definirAtivo(Long id, boolean ativo) {
        usuarioLogado.exigir(Acao.GERENCIAR_USUARIOS);
        Usuario alvo = usuarios.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuario nao encontrado."));
        if (!ativo && alvo.getId().equals(usuarioLogado.obter().getId())) {
            throw new RegraNegocioException("Voce nao pode desativar a propria conta.");
        }
        if (ativo) {
            alvo.ativar();
        } else {
            alvo.desativar();
        }
        return UsuarioResponse.de(alvo);
    }

    private static String exigir(String valor, String campo) {
        if (valor == null || valor.isBlank()) {
            throw new RegraNegocioException("O campo " + campo + " e obrigatorio para este perfil.");
        }
        return valor;
    }
}
