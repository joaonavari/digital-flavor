package br.com.digitalflavor.domain.pagamento;

import br.com.digitalflavor.domain.pedido.Pedido;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "pagamento_pix")
@DiscriminatorValue("PIX")
@PrimaryKeyJoinColumn(name = "pagamento_id")
public class PagamentoPix extends Pagamento {

    /** Chave PIX da cantina que recebe o pagamento. */
    @Column(name = "chave_pix", length = 140)
    private String chavePix;

    @Column(name = "codigo_qr", columnDefinition = "TEXT")
    private String codigoQr;

    protected PagamentoPix() {
    }

    public PagamentoPix(Pedido pedido, String chavePix) {
        super(pedido);
        this.chavePix = chavePix;
    }

    @Override
    public MetodoPagamento getMetodo() {
        return MetodoPagamento.PIX;
    }

    /**
     * Simulacao: gera um codigo "copia e cola" ficticio e aprova na hora.
     * Num sistema real, a aprovacao viria da confirmacao do banco (webhook).
     */
    @Override
    public boolean processar() {
        exigirPendente();
        this.codigoQr = "DIGITALFLAVOR-PIX|" + chavePix + "|" + getValor().toPlainString();
        return aprovar();
    }

    public String getChavePix() {
        return chavePix;
    }

    public String getCodigoQr() {
        return codigoQr;
    }
}
