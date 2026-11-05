package br.com.digitalflavor.seguranca;

import br.com.digitalflavor.domain.usuario.Usuario;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

/** Emite e valida tokens JWT (HS256). O subject do token e o id do usuario. */
@Service
public class JwtService {

    private static final int MINIMO_BYTES_SEGREDO = 32;

    private final SecretKey chave;
    private final Duration expiracao;

    public JwtService(@Value("${app.jwt.segredo}") String segredo,
                      @Value("${app.jwt.expiracao-horas:8}") long expiracaoHoras) {
        if (segredo == null || segredo.getBytes(StandardCharsets.UTF_8).length < MINIMO_BYTES_SEGREDO) {
            throw new IllegalStateException(
                    "Defina JWT_SECRET com pelo menos 32 bytes antes de subir a aplicacao.");
        }
        this.chave = Keys.hmacShaKeyFor(segredo.getBytes(StandardCharsets.UTF_8));
        this.expiracao = Duration.ofHours(expiracaoHoras);
    }

    public String gerarToken(Usuario usuario) {
        Instant agora = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(usuario.getId()))
                .claim("tipo", usuario.getTipo().name())
                .issuedAt(Date.from(agora))
                .expiration(Date.from(agora.plus(expiracao)))
                .signWith(chave)
                .compact();
    }

    /** Retorna o id do usuario se o token for valido e nao expirado. */
    public Optional<Long> lerUsuarioId(String token) {
        try {
            String subject = Jwts.parser()
                    .verifyWith(chave)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
            return Optional.of(Long.parseLong(subject));
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
