package br.com.digitalflavor.domain.usuario;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "funcionario")
@DiscriminatorValue("FUNCIONARIO")
@PrimaryKeyJoinColumn(name = "usuario_id")
public class Funcionario extends Usuario {

    @Column(name = "matricula_funcional", nullable = false, unique = true, length = 20)
    private String matriculaFuncional;

    @Column(length = 20)
    private String turno;

    protected Funcionario() {
    }

    public Funcionario(String nome, String email, String senhaHash, String telefone,
                       String matriculaFuncional, String turno) {
        super(nome, email, senhaHash, telefone);
        this.matriculaFuncional = matriculaFuncional;
        this.turno = turno;
    }

    @Override
    public TipoUsuario getTipo() {
        return TipoUsuario.FUNCIONARIO;
    }

    @Override
    protected boolean permite(Acao acao) {
        return acao == Acao.ATENDER_PEDIDOS;
    }

    public String getMatriculaFuncional() {
        return matriculaFuncional;
    }

    public String getTurno() {
        return turno;
    }
}
