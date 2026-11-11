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
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarios, PasswordEncoder encoder, JwtService jwtService) {
        this.usuarios = usuarios;
        this.encoder = encoder;
        this.jwtService = jwtService;
    }

    /** Cadastro publico: sempre cria um Aluno, que ja sai logado (o front espera { token, usuario }). */
    @Transactional
    public LoginResponse cadastrarAluno(CadastroAlunoRequest pedido) {
        if (usuarios.existsByEmailIgnoreCase(pedido.email())) {
            throw new RegraNegocioException("Ja existe um usuario com este email.");
        }
        Aluno aluno = new Aluno(
                pedido.nome(),
                pedido.email(),
                encoder.encode(pedido.senha()),
                pedido.telefone(),
                pedido.matricula(),
                pedido.turma());
        Aluno salvo = usuarios.save(aluno);
        return new LoginResponse(jwtService.gerarToken(salvo), UsuarioResponse.de(salvo));
    }

    /** Mensagem generica para email inexistente, senha errada ou usuario inativo. */
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest pedido) {
        Usuario usuario = usuarios.findByEmailIgnoreCase(pedido.email())
                .filter(candidato -> encoder.matches(pedido.senha(), candidato.getSenha()))
                .filter(Usuario::isAtivo)
                .orElseThrow(() -> new BadCredentialsException("Email ou senha invalidos."));
        return new LoginResponse(jwtService.gerarToken(usuario), UsuarioResponse.de(usuario));
    }
}
