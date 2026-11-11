package br.com.digitalflavor.domain.usuario;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "administrador")
@DiscriminatorValue("ADMINISTRADOR")
@PrimaryKeyJoinColumn(name = "usuario_id")
public class Administrador extends Usuario {

    @Column(name = "nivel_acesso", nullable = false)
    private int nivelAcesso = 1;

    protected Administrador() {
    }

    public Administrador(String nome, String email, String senhaHash, String telefone, int nivelAcesso) {
        super(nome, email, senhaHash, telefone);
        this.nivelAcesso = nivelAcesso;
    }

    @Override
    public TipoUsuario getTipo() {
        return TipoUsuario.ADMINISTRADOR;
    }

    /** O administrador pode tudo, exceto fazer pedidos como aluno. */
    @Override
    protected boolean permite(Acao acao) {
        return acao != Acao.FAZER_PEDIDO;
    }

    public int getNivelAcesso() {
        return nivelAcesso;
    }
}
