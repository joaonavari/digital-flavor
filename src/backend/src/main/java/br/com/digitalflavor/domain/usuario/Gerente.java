package br.com.digitalflavor.domain.usuario;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

import java.util.EnumSet;
import java.util.Set;

@Entity
@Table(name = "gerente")
@DiscriminatorValue("GERENTE")
@PrimaryKeyJoinColumn(name = "usuario_id")
public class Gerente extends Usuario {

    private static final Set<Acao> PERMISSOES = EnumSet.of(
            Acao.ATENDER_PEDIDOS,
            Acao.GERENCIAR_PRODUTOS,
            Acao.AJUSTAR_ESTOQUE,
            Acao.CONSULTAR_VENDAS);

    @Column(length = 60)
    private String setor;

    protected Gerente() {
    }

    public Gerente(String nome, String email, String senhaHash, String telefone, String setor) {
        super(nome, email, senhaHash, telefone);
        this.setor = setor;
    }

    @Override
    public TipoUsuario getTipo() {
        return TipoUsuario.GERENTE;
    }

    @Override
    protected boolean permite(Acao acao) {
        return PERMISSOES.contains(acao);
    }

    public String getSetor() {
        return setor;
    }
}
