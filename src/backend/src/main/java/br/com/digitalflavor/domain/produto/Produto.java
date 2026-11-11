package br.com.digitalflavor.domain.produto;

import br.com.digitalflavor.domain.exception.RegraNegocioException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "produto")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;

    @Column(length = 60)
    private String categoria;

    @Column(name = "quantidade_estoque", nullable = false)
    private int quantidadeEstoque;

    @Column(nullable = false)
    private boolean ativo = true;

    protected Produto() {
    }

    public Produto(String nome, String descricao, BigDecimal preco, String categoria, int quantidadeEstoque) {
        atualizarDados(nome, descricao, preco, categoria);
        if (quantidadeEstoque < 0) {
            throw new RegraNegocioException("O estoque inicial nao pode ser negativo.");
        }
        this.quantidadeEstoque = quantidadeEstoque;
    }

    public void atualizarDados(String nome, String descricao, BigDecimal preco, String categoria) {
        if (preco == null || preco.signum() < 0) {
            throw new RegraNegocioException("O preco do produto nao pode ser negativo.");
        }
        this.nome = nome;
        this.descricao = descricao;
        this.preco = preco;
        this.categoria = categoria;
    }

    /** RN01 / RN04: so esta disponivel se estiver ativo e houver estoque suficiente. */
    public boolean estaDisponivel(int quantidade) {
        return ativo && quantidade > 0 && quantidadeEstoque >= quantidade;
    }

    /** RN02: baixa do estoque apos a confirmacao do pedido. */
    public void baixarEstoque(int quantidade) {
        if (!estaDisponivel(quantidade)) {
            throw new RegraNegocioException(
                    "Estoque insuficiente para \"" + nome + "\": disponivel " + quantidadeEstoque
                            + ", solicitado " + quantidade + ".");
        }
        this.quantidadeEstoque -= quantidade;
    }

    /** Reposicao de estoque (entrada de mercadoria ou cancelamento de pedido). */
    public void reporEstoque(int quantidade) {
        if (quantidade <= 0) {
            throw new RegraNegocioException("A quantidade de reposicao deve ser maior que zero.");
        }
        this.quantidadeEstoque += quantidade;
    }

    /** Ajuste manual feito pelo gerente (inventario). */
    public void ajustarEstoque(int novaQuantidade) {
        if (novaQuantidade < 0) {
            throw new RegraNegocioException("O estoque nao pode ser negativo.");
        }
        this.quantidadeEstoque = novaQuantidade;
    }

    /** Exclusao logica: o produto some do cardapio mas continua nos pedidos antigos. */
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

    public String getDescricao() {
        return descricao;
    }

    public BigDecimal getPreco() {
        return preco;
    }

    public String getCategoria() {
        return categoria;
    }

    public int getQuantidadeEstoque() {
        return quantidadeEstoque;
    }

    public boolean isAtivo() {
        return ativo;
    }
}
