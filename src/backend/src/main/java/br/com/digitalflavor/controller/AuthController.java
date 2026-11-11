package br.com.digitalflavor.controller;

import br.com.digitalflavor.domain.usuario.Usuario;
import br.com.digitalflavor.dto.CadastroAlunoRequest;
import br.com.digitalflavor.dto.LoginRequest;
import br.com.digitalflavor.dto.LoginResponse;
import br.com.digitalflavor.dto.UsuarioResponse;
import br.com.digitalflavor.seguranca.UsuarioLogado;
import br.com.digitalflavor.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UsuarioLogado usuarioLogado;

    public AuthController(AuthService authService, UsuarioLogado usuarioLogado) {
        this.authService = authService;
        this.usuarioLogado = usuarioLogado;
    }

    @PostMapping("/cadastro")
    @ResponseStatus(HttpStatus.CREATED)
    public LoginResponse cadastrar(@Valid @RequestBody CadastroAlunoRequest pedido) {
        return authService.cadastrarAluno(pedido);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest pedido) {
        return authService.login(pedido);
    }

    @GetMapping("/me")
    public UsuarioResponse me() {
        Usuario atual = usuarioLogado.obter();
        return UsuarioResponse.de(atual);
    }
}
