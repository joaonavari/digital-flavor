package br.com.digitalflavor.domain;

import br.com.digitalflavor.domain.exception.RegraNegocioException;
import br.com.digitalflavor.domain.pagamento.Pagamento;
import br.com.digitalflavor.domain.pagamento.PagamentoCartao;
import br.com.digitalflavor.domain.pagamento.PagamentoPix;
import br.com.digitalflavor.domain.pagamento.StatusPagamento;
import br.com.digitalflavor.domain.pedido.Pedido;
import br.com.digitalflavor.domain.produto.Produto;
import br.com.digitalflavor.domain.usuario.Acao;
import br.com.digitalflavor.domain.usuario.Administrador;
import br.com.digitalflavor.domain.usuario.Aluno;
import br.com.digitalflavor.domain.usuario.Funcionario;
import br.com.digitalflavor.domain.usuario.Gerente;
import br.com.digitalflavor.domain.usuario.Usuario;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Demonstra o polimorfismo de Usuario (permissoes) e de Pagamento (processar). */
class PolimorfismoTest {

    private final Aluno aluno = new Aluno("Maria", "maria@escola.com", "hash", null, "2026001", "3A");

    @Test
    void cadaPerfilRespondeDoSeuJeitoAPermissao() {
        Usuario funcionario = new Funcionario("Jose", "jose@cantina.com", "hash", null, "F01", "Manha");
        Usuario gerente = new Gerente("Ana", "ana@cantina.com", "hash", null, "Cantina");
        Usuario admin = new Administrador("Admin", "admin@cantina.com", "hash", null, 1);

        assertTrue(aluno.possuiPermissao(Acao.FAZER_PEDIDO));
        assertFalse(aluno.possuiPermissao(Acao.GERENCIAR_PRODUTOS));

        assertTrue(funcionario.possuiPermissao(Acao.ATENDER_PEDIDOS));
        assertFalse(funcionario.possuiPermissao(Acao.AJUSTAR_ESTOQUE));

        assertTrue(gerente.possuiPermissao(Acao.CONSULTAR_VENDAS));
        assertFalse(gerente.possuiPermissao(Acao.GERENCIAR_USUARIOS));

        assertTrue(admin.possuiPermissao(Acao.GERENCIAR_USUARIOS));
        assertFalse(admin.possuiPermissao(Acao.FAZER_PEDIDO));
    }

    @Test
    void usuarioInativoNaoTemPermissao() {
        aluno.desativar();
        assertFalse(aluno.possuiPermissao(Acao.FAZER_PEDIDO));
    }

    @Test
    void cadaFormaDePagamentoProcessaDoSeuJeito() {
        List<Pagamento> pagamentos = List.of(
                new PagamentoPix(pedidoConfirmado(), "cantina@escola.com"),
                new PagamentoCartao(pedidoConfirmado(), "4111 1111 1111 1111", "VISA", 1),
                new PagamentoCartao(pedidoConfirmado(), "4111 1111 1111 0000", "VISA", 1));

        pagamentos.forEach(Pagamento::processar); // mesma chamada, comportamentos diferentes

        assertEquals(StatusPagamento.APROVADO, pagamentos.get(0).getStatus());
        assertNotNull(((PagamentoPix) pagamentos.get(0)).getCodigoQr());
        assertEquals(StatusPagamento.APROVADO, pagamentos.get(1).getStatus());
        assertEquals(StatusPagamento.RECUSADO, pagamentos.get(2).getStatus());
    }

    @Test
    void cartaoGuardaSomenteONumeroMascarado() {
        PagamentoCartao cartao = new PagamentoCartao(pedidoConfirmado(), "4111111111111234", "VISA", 2);
        assertEquals("**** **** **** 1234", cartao.getNumeroMascarado());
    }

    @Test
    void naoPagaPedidoNaoConfirmado() {
        Pedido rascunho = new Pedido(aluno);
        assertThrows(RegraNegocioException.class, () -> new PagamentoPix(rascunho, "chave"));
    }

    @Test
    void naoProcessaDuasVezes() {
        Pagamento pix = new PagamentoPix(pedidoConfirmado(), "chave");
        pix.processar();
        assertThrows(RegraNegocioException.class, pix::processar);
    }

    private Pedido pedidoConfirmado() {
        Produto produto = new Produto("Coxinha", null, new BigDecimal("6.50"), "Salgados", 10);
        Pedido pedido = new Pedido(aluno);
        pedido.adicionarItem(produto, 1);
        pedido.confirmar();
        return pedido;
    }
}
