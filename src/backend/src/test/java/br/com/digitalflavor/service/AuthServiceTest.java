package br.com.digitalflavor.service;

import br.com.digitalflavor.domain.exception.RegraNegocioException;
import br.com.digitalflavor.domain.usuario.Aluno;
import br.com.digitalflavor.domain.usuario.Usuario;
import br.com.digitalflavor.dto.CadastroAlunoRequest;
import br.com.digitalflavor.dto.LoginRequest;
import br.com.digitalflavor.dto.LoginResponse;
import br.com.digitalflavor.dto.UsuarioResponse;
import br.com.digitalflavor.repository.UsuarioRepository;
import br.com.digitalflavor.seguranca.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceTest {

    private static final String SEGREDO = "segredo-de-teste-com-mais-de-32-bytes-0123456789";

    private UsuarioRepository usuarios;
    private PasswordEncoder encoder;
    private JwtService jwtService;
    private AuthService service;

    @BeforeEach
    void preparar() {
        usuarios = mock(UsuarioRepository.class);
        encoder = new BCryptPasswordEncoder(4);
        jwtService = new JwtService(SEGREDO, 1);
        service = new AuthService(usuarios, encoder, jwtService);
    }

    @Test
    void cadastroCriaAlunoComSenhaEmHash() {
        when(usuarios.existsByEmailIgnoreCase("ana@escola.br")).thenReturn(false);
        when(usuarios.save(any(Usuario.class))).thenAnswer(chamada -> {
            Usuario novo = chamada.getArgument(0);
            ReflectionTestUtils.setField(novo, "id", 1L);
            return novo;
        });

        LoginResponse login = service.cadastrarAluno(new CadastroAlunoRequest(
                "Ana", "ana@escola.br", "senhaSegura1", null, "RA123", "3A"));
        UsuarioResponse resposta = login.usuario();

        ArgumentCaptor<Usuario> salvo = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarios).save(salvo.capture());
        assertThat(salvo.getValue()).isInstanceOf(Aluno.class);
        assertThat(salvo.getValue().getSenha()).isNotEqualTo("senhaSegura1");
        assertThat(encoder.matches("senhaSegura1", salvo.getValue().getSenha())).isTrue();
        assertThat(resposta.tipo()).isEqualTo("ALUNO");
        assertThat(resposta.matricula()).isEqualTo("RA123");
        assertThat(login.token()).isNotBlank();
    }

    @Test
    void cadastroRecusaEmailRepetido() {
        when(usuarios.existsByEmailIgnoreCase("ana@escola.br")).thenReturn(true);

        assertThatThrownBy(() -> service.cadastrarAluno(new CadastroAlunoRequest(
                "Ana", "ana@escola.br", "senhaSegura1", null, "RA123", "3A")))
                .isInstanceOf(RegraNegocioException.class);
        verify(usuarios, never()).save(any());
    }

    @Test
    void loginComSenhaCorretaDevolveTokenValido() {
        Aluno aluno = new Aluno("Ana", "ana@escola.br", encoder.encode("senhaSegura1"), null, "RA123", "3A");
        when(usuarios.findByEmailIgnoreCase("ana@escola.br")).thenReturn(Optional.of(aluno));

        LoginResponse resposta = service.login(new LoginRequest("ana@escola.br", "senhaSegura1"));

        assertThat(resposta.token()).isNotBlank();
        assertThat(resposta.usuario().email()).isEqualTo("ana@escola.br");
    }

    @Test
    void loginComSenhaErradaFalha() {
        Aluno aluno = new Aluno("Ana", "ana@escola.br", encoder.encode("senhaSegura1"), null, "RA123", "3A");
        when(usuarios.findByEmailIgnoreCase("ana@escola.br")).thenReturn(Optional.of(aluno));

        assertThatThrownBy(() -> service.login(new LoginRequest("ana@escola.br", "errada")))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void loginDeUsuarioInativoFalha() {
        Aluno aluno = new Aluno("Ana", "ana@escola.br", encoder.encode("senhaSegura1"), null, "RA123", "3A");
        aluno.desativar();
        when(usuarios.findByEmailIgnoreCase("ana@escola.br")).thenReturn(Optional.of(aluno));

        assertThatThrownBy(() -> service.login(new LoginRequest("ana@escola.br", "senhaSegura1")))
                .isInstanceOf(BadCredentialsException.class);
    }
}
