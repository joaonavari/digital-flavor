package br.com.digitalflavor.domain.pagamento;

import br.com.digitalflavor.domain.exception.RegraNegocioException;
import br.com.digitalflavor.domain.pedido.Pedido;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "pagamento_cartao")
@DiscriminatorValue("CARTAO")
@PrimaryKeyJoinColumn(name = "pagamento_id")
public class PagamentoCartao extends Pagamento {

    public static final int MAX_PARCELAS = 12;
    static final String FINAL_CARTAO_RECUSADO = "0000";

    /** Somente os 4 ultimos digitos ficam visiveis. O numero completo nunca e guardado. */
    @Column(name = "numero_mascarado", nullable = false, length = 24)
    private String numeroMascarado;

    @Column(length = 30)
    private String bandeira;

    @Column(nullable = false)
    private int parcelas = 1;

    protected PagamentoCartao() {
    }

    /**
     * @param numeroCartao numero digitado pelo aluno; e mascarado aqui e descartado
     */
    public PagamentoCartao(Pedido pedido, String numeroCartao, String bandeira, int parcelas) {
        super(pedido);
        if (parcelas < 1 || parcelas > MAX_PARCELAS) {
            throw new RegraNegocioException("O numero de parcelas deve estar entre 1 e " + MAX_PARCELAS + ".");
        }
        this.numeroMascarado = mascarar(numeroCartao);
        this.bandeira = bandeira;
        this.parcelas = parcelas;
    }

    @Override
    public MetodoPagamento getMetodo() {
        return MetodoPagamento.CARTAO;
    }

    /**
     * Simulacao de autorizacao da operadora: cartoes terminados em 0000 sao
     * recusados (para demonstrar o fluxo de recusa); os demais sao aprovados.
     */
    @Override
    public boolean processar() {
        exigirPendente();
        if (numeroMascarado.endsWith(FINAL_CARTAO_RECUSADO)) {
            return recusar();
        }
        return aprovar();
    }

    static String mascarar(String numeroCartao) {
        String digitos = numeroCartao == null ? "" : numeroCartao.replaceAll("\\D", "");
        if (digitos.length() < 13 || digitos.length() > 19) {
            throw new RegraNegocioException("Numero de cartao invalido.");
        }
        return "**** **** **** " + digitos.substring(digitos.length() - 4);
    }

    public String getNumeroMascarado() {
        return numeroMascarado;
    }

    public String getBandeira() {
        return bandeira;
    }

    public int getParcelas() {
        return parcelas;
    }
}
