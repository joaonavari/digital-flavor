package br.com.digitalflavor.service;

import br.com.digitalflavor.domain.exception.RegraNegocioException;
import br.com.digitalflavor.domain.usuario.Acao;
import br.com.digitalflavor.domain.usuario.Administrador;
import br.com.digitalflavor.domain.usuario.Funcionario;
import br.com.digitalflavor.domain.usuario.TipoUsuario;
import br.com.digitalflavor.domain.usuario.Usuario;
import br.com.digitalflavor.dto.CriarUsuarioRequest;
import br.com.digitalflavor.dto.UsuarioResponse;
import br.com.digitalflavor.repository.UsuarioRepository;
import br.com.digitalflavor.seguranca.UsuarioLogado;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class UsuarioServiceTest {

    private UsuarioRepository usuarios;
    private UsuarioLogado usuarioLogado;
    private UsuarioService service;

    @BeforeEach
    void preparar() {
        usuarios = mock(UsuarioRepository.class);
        usuarioLogado = mock(UsuarioLogado.class);
        service = new UsuarioService(usuarios, new BCryptPasswordEncoder(4), usuarioLogado);
    }

    private static CriarUsuarioRequest pedido(TipoUsuario tipo, String matricula) {
        return new CriarUsuarioRequest(tipo, "Bia", "bia@escola.br", "senhaSegura1",
                null, matricula, "manha", "cozinha", null);
    }

    @Test
    void criaFuncionarioComMatricula() {
        when(usuarios.save(any(Usuario.class))).thenAnswer(chamada -> chamada.getArgument(0));

        UsuarioResponse resposta = service.criar(pedido(TipoUsuario.FUNCIONARIO, "F001"));

        assertThat(resposta.tipo()).isEqualTo("FUNCIONARIO");
    }

    @Test
    void funcionarioSemMatriculaERecusado() {
        assertThatThrownBy(() -> service.criar(pedido(TipoUsuario.FUNCIONARIO, null)))
                .isInstanceOf(RegraNegocioException.class);
        verify(usuarios, never()).save(any());
    }

    @Test
    void naoCriaAlunoPorEsteEndpoint() {
        assertThatThrownBy(() -> service.criar(pedido(TipoUsuario.ALUNO, null)))
                .isInstanceOf(RegraNegocioException.class);
    }

    @Test
    void somenteQuemGerenciaUsuariosPodeCriar() {
        doThrow(new AccessDeniedException("Sem permissao para esta acao."))
                .when(usuarioLogado).exigir(Acao.GERENCIAR_USUARIOS);

        assertThatThrownBy(() -> service.criar(pedido(TipoUsuario.GERENTE, null)))
                .isInstanceOf(AccessDeniedException.class);
        verify(usuarios, never()).save(any());
    }

    @Test
    void administradorNaoDesativaAPropriaConta() {
        Administrador admin = new Administrador("Admin", "admin@escola.br", "hash", null, 1);
        ReflectionTestUtils.setField(admin, "id", 1L);
        when(usuarios.findById(1L)).thenReturn(Optional.of(admin));
        when(usuarioLogado.obter()).thenReturn(admin);

        assertThatThrownBy(() -> service.definirAtivo(1L, false)).isInstanceOf(RegraNegocioException.class);
        assertThat(admin.isAtivo()).isTrue();
    }

    @Test
    void desativaOutroUsuario() {
        Administrador admin = new Administrador("Admin", "admin@escola.br", "hash", null, 1);
        ReflectionTestUtils.setField(admin, "id", 1L);
        Funcionario funcionario = new Funcionario("Caio", "caio@escola.br", "hash", null, "F002", "tarde");
        ReflectionTestUtils.setField(funcionario, "id", 2L);
        when(usuarios.findById(2L)).thenReturn(Optional.of(funcionario));
        when(usuarioLogado.obter()).thenReturn(admin);

        service.definirAtivo(2L, false);

        assertThat(funcionario.isAtivo()).isFalse();
    }
}
