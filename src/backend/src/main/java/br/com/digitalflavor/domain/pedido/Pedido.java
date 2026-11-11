package br.com.digitalflavor.domain.pedido;

import br.com.digitalflavor.domain.exception.RegraNegocioException;
import br.com.digitalflavor.domain.produto.Produto;
import br.com.digitalflavor.domain.usuario.Aluno;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

/**
 * Pedido antecipado feito por um aluno.
 * <p>
 * Composicao 1:N com {@link ItemPedido}: os itens so existem dentro do pedido
 * ({@code cascade = ALL} + {@code orphanRemoval}) e so podem ser manipulados
 * por meio dos metodos deste objeto.
 * <p>
 * Enquanto nao confirmado, o pedido e um rascunho em memoria (status nulo) e
 * nao e gravado no banco; o carrinho do front-end vira um Pedido aqui.
 */
@Entity
@Table(name = "pedido")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** RN06: todo pedido pertence ao aluno que o realizou. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "aluno_id", nullable = false)
    private Aluno aluno;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusPedido status;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemPedido> itens = new ArrayList<>();

    protected Pedido() {
    }

    public Pedido(Aluno aluno) {
        this.aluno = Objects.requireNonNull(aluno, "O pedido precisa estar associado a um aluno (RN06).");
    }

    /**
     * RN01: so adiciona se houver estoque para a quantidade total do produto no pedido.
     * Se o produto ja estiver no pedido, soma as quantidades.
     */
    public void adicionarItem(Produto produto, int quantidade) {
        exigirRascunho();
        if (quantidade <= 0) {
            throw new RegraNegocioException("A quantidade deve ser maior que zero.");
        }
        Optional<ItemPedido> existente = buscarItem(produto);
        int quantidadeTotal = quantidade + existente.map(ItemPedido::getQuantidade).orElse(0);

        if (!produto.estaDisponivel(quantidadeTotal)) {
            throw new RegraNegocioException("\"" + produto.getNome() + "\" nao possui estoque suficiente.");
        }

        if (existente.isPresent()) {
            existente.get().alterarQuantidade(quantidadeTotal);
        } else {
            itens.add(new ItemPedido(this, produto, quantidade));
        }
        this.total = calcularTotal();
    }

    public void removerItem(Produto produto) {
        exigirRascunho();
        itens.removeIf(item -> mesmoProduto(item.getProduto(), produto));
        this.total = calcularTotal();
    }

    public BigDecimal calcularTotal() {
        return itens.stream()
                .map(ItemPedido::calcularSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * RN05: valida a disponibilidade de TODOS os itens antes de mexer no estoque;
     * RN02: so entao baixa o estoque de cada produto.
     * Deve ser chamado dentro de uma transacao, com os produtos bloqueados para escrita.
     */
    public void confirmar() {
        exigirRascunho();
        if (itens.isEmpty()) {
            throw new RegraNegocioException("O pedido precisa ter pelo menos um item.");
        }
        for (ItemPedido item : itens) {
            if (!item.getProduto().estaDisponivel(item.getQuantidade())) {
                throw new RegraNegocioException(
                        "\"" + item.getProduto().getNome() + "\" nao possui mais estoque suficiente.");
            }
        }
        itens.forEach(item -> item.getProduto().baixarEstoque(item.getQuantidade()));

        this.total = calcularTotal();
        this.dataHora = LocalDateTime.now();
        this.status = StatusPedido.RECEBIDO;
    }

    /** Cancela o pedido e devolve os produtos ao estoque. So e possivel enquanto RECEBIDO. */
    public void cancelar() {
        mudarStatus(StatusPedido.CANCELADO);
        itens.forEach(item -> item.getProduto().reporEstoque(item.getQuantidade()));
    }

    /** Usado pelo funcionario para avancar o pedido (EM_PREPARO, PRONTO, ENTREGUE). */
    public void atualizarStatus(StatusPedido novoStatus) {
        if (novoStatus == StatusPedido.CANCELADO) {
            cancelar();
            return;
        }
        mudarStatus(novoStatus);
    }

    public boolean isConfirmado() {
        return status != null;
    }

    public boolean pertenceA(Aluno outro) {
        return aluno.getId() != null && aluno.getId().equals(outro.getId());
    }

    private void mudarStatus(StatusPedido novoStatus) {
        if (!isConfirmado()) {
            throw new RegraNegocioException("O pedido ainda nao foi confirmado.");
        }
        if (!status.podeAvancarPara(novoStatus)) {
            throw new RegraNegocioException("Nao e possivel passar o pedido de " + status + " para " + novoStatus + ".");
        }
        this.status = novoStatus;
    }

    private void exigirRascunho() {
        if (isConfirmado()) {
            throw new RegraNegocioException("Um pedido confirmado nao pode ser alterado.");
        }
    }

    private Optional<ItemPedido> buscarItem(Produto produto) {
        return itens.stream().filter(item -> mesmoProduto(item.getProduto(), produto)).findFirst();
    }

    private static boolean mesmoProduto(Produto a, Produto b) {
        if (a == b) {
            return true;
        }
        return a.getId() != null && a.getId().equals(b.getId());
    }

    public Long getId() {
        return id;
    }

    public Aluno getAluno() {
        return aluno;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public StatusPedido getStatus() {
        return status;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public List<ItemPedido> getItens() {
        return Collections.unmodifiableList(itens);
    }
}
