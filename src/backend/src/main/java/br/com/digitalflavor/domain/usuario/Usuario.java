package br.com.digitalflavor.domain.usuario;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.DiscriminatorType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Table;

/**
 * Classe abstrata base dos perfis do sistema (heranca).
 * <p>
 * Mapeamento JOINED: os dados comuns ficam na tabela {@code usuario} e cada
 * subclasse tem a sua propria tabela ligada pela chave {@code usuario_id},
 * exatamente como no DER. A coluna {@code tipo_usuario} indica a subclasse.
 */
@Entity
@Table(name = "usuario")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "tipo_usuario", discriminatorType = DiscriminatorType.STRING)
public abstract class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, unique = true, length = 160)
    private String email;

    /** Hash BCrypt da senha. A senha em texto puro nunca e armazenada. */
    @Column(nullable = false)
    private String senha;

    @Column(length = 20)
    private String telefone;

    @Column(nullable = false)
    private boolean ativo = true;

    protected Usuario() {
        // exigido pelo JPA
    }

    protected Usuario(String nome, String email, String senhaHash, String telefone) {
        this.nome = nome;
        this.email = email;
        this.senha = senhaHash;
        this.telefone = telefone;
    }

    /** Perfil concreto do usuario. Cada subclasse responde o seu. */
    public abstract TipoUsuario getTipo();

    /**
     * Polimorfismo: cada perfil define as acoes que pode executar (RN03).
     * Usuarios inativos nao podem executar nenhuma acao.
     */
    public final boolean possuiPermissao(Acao acao) {
        return ativo && permite(acao);
    }

    protected abstract boolean permite(Acao acao);

    public void atualizarDados(String nome, String telefone) {
        this.nome = nome;
        this.telefone = telefone;
    }

    public void alterarSenha(String novaSenhaHash) {
        this.senha = novaSenhaHash;
    }

    public void desativar() {
        this.ativo = false;
    }

    public void ativar() {
        this.ativo = true;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getEmail() {
        return email;
    }

    public String getSenha() {
        return senha;
    }

    public String getTelefone() {
        return telefone;
    }

    public boolean isAtivo() {
        return ativo;
    }
}
