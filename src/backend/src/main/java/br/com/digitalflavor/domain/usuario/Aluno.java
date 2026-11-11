package br.com.digitalflavor.domain.usuario;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "aluno")
@DiscriminatorValue("ALUNO")
@PrimaryKeyJoinColumn(name = "usuario_id")
public class Aluno extends Usuario {

    @Column(nullable = false, unique = true, length = 20)
    private String matricula;

    @Column(length = 30)
    private String turma;

    protected Aluno() {
    }

    public Aluno(String nome, String email, String senhaHash, String telefone, String matricula, String turma) {
        super(nome, email, senhaHash, telefone);
        this.matricula = matricula;
        this.turma = turma;
    }

    @Override
    public TipoUsuario getTipo() {
        return TipoUsuario.ALUNO;
    }

    @Override
    protected boolean permite(Acao acao) {
        return acao == Acao.FAZER_PEDIDO;
    }

    public String getMatricula() {
        return matricula;
    }

    public String getTurma() {
        return turma;
    }
}
