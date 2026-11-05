package br.com.digitalflavor.seguranca;

import br.com.digitalflavor.domain.usuario.Aluno;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private static final String SEGREDO = "segredo-de-teste-com-mais-de-32-bytes-0123456789";

    @Test
    void tokenGeradoDevolveOIdDoUsuario() {
        JwtService jwt = new JwtService(SEGREDO, 1);
        Aluno aluno = new Aluno("Ana", "ana@escola.br", "hash", null, "RA123", "3A");
        ReflectionTestUtils.setField(aluno, "id", 7L);

        assertThat(jwt.lerUsuarioId(jwt.gerarToken(aluno))).contains(7L);
    }

    @Test
    void tokenAssinadoComOutroSegredoERecusado() {
        Aluno aluno = new Aluno("Ana", "ana@escola.br", "hash", null, "RA123", "3A");
        ReflectionTestUtils.setField(aluno, "id", 7L);
        String token = new JwtService("outro-segredo-tambem-com-mais-de-32-bytes-xyz", 1).gerarToken(aluno);

        assertThat(new JwtService(SEGREDO, 1).lerUsuarioId(token)).isEmpty();
    }

    @Test
    void segredoCurtoImpedeASubida() {
        assertThatThrownBy(() -> new JwtService("curto", 1)).isInstanceOf(IllegalStateException.class);
    }
}
