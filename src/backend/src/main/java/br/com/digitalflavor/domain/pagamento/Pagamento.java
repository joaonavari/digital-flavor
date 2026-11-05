package br.com.digitalflavor.domain.pagamento;

import br.com.digitalflavor.domain.exception.RegraNegocioException;
import br.com.digitalflavor.domain.pedido.Pedido;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.DiscriminatorType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Pagamento de um pedido (RF09). Classe abstrata: o comportamento de
 * {@link #processar()} muda conforme a forma de pagamento (polimorfismo).
 * <p>
 * Importante: o pagamento e <b>registrado e simulado</b>. Nao ha integracao
 * com gateway, banco ou operadora de cartao.
 */
@Entity
@Table(name = "pagamento")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "metodo", discriminatorType = DiscriminatorType.STRING)
public abstract class Pagamento {

    private static final DateTimeFormatter FORMATO_DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pedido_id", nullable = false, unique = true)
    private Pedido pedido;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusPagamento status = StatusPagamento.PENDENTE;

    protected Pagamento() {
    }

    protected Pagamento(Pedido pedido) {
        if (pedido == null || !pedido.isConfirmado()) {
            throw new RegraNegocioException("So e possivel pagar um pedido confirmado.");
        }
        this.pedido = pedido;
        this.valor = pedido.getTotal();
        this.dataHora = LocalDateTime.now();
    }

    /** Forma de pagamento, igual ao valor da coluna {@code metodo}. */
    public abstract MetodoPagamento getMetodo();

    /**
     * Processa (simula) o pagamento. Cada subclasse aplica a sua validacao
     * e termina chamando {@link #aprovar()} ou {@link #recusar()}.
     *
     * @return true se o pagamento foi aprovado
     */
    public abstract boolean processar();

    public String gerarComprovante() {
        return String.format("Digital Flavor | Pedido #%d | %s | R$ %s | %s | %s",
                pedido.getId(), getMetodo(), valor.toPlainString(), status, dataHora.format(FORMATO_DATA));
    }

    /** Usado quando um pedido ja pago e cancelado. */
    public void estornar() {
        if (status != StatusPagamento.APROVADO) {
            throw new RegraNegocioException("So e possivel estornar um pagamento aprovado.");
        }
        this.status = StatusPagamento.ESTORNADO;
    }

    protected void exigirPendente() {
        if (status != StatusPagamento.PENDENTE) {
            throw new RegraNegocioException("Este pagamento ja foi processado.");
        }
    }

    protected boolean aprovar() {
        this.status = StatusPagamento.APROVADO;
        return true;
    }

    protected boolean recusar() {
        this.status = StatusPagamento.RECUSADO;
        return false;
    }

    public Long getId() {
        return id;
    }

    public Pedido getPedido() {
        return pedido;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public StatusPagamento getStatus() {
        return status;
    }
}
