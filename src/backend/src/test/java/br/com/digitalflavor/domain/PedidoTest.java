package br.com.digitalflavor.domain;

import br.com.digitalflavor.domain.exception.RegraNegocioException;
import br.com.digitalflavor.domain.pedido.Pedido;
import br.com.digitalflavor.domain.pedido.StatusPedido;
import br.com.digitalflavor.domain.produto.Produto;
import br.com.digitalflavor.domain.usuario.Aluno;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Testes das regras de negocio do pedido, sem banco e sem Spring. */
class PedidoTest {

    private Aluno aluno;
    private Produto coxinha;
    private Produto suco;

    @BeforeEach
    void setUp() {
        aluno = new Aluno("Maria", "maria@escola.com", "hash", null, "2026001", "3A");
        coxinha = new Produto("Coxinha", null, new BigDecimal("6.50"), "Salgados", 5);
        suco = new Produto("Suco de laranja", null, new BigDecimal("4.00"), "Bebidas", 2);
    }

    @Test
    void calculaTotalSomandoOsSubtotais() {
        Pedido pedido = new Pedido(aluno);
        pedido.adicionarItem(coxinha, 2);
        pedido.adicionarItem(suco, 1);

        assertEquals(new BigDecimal("17.00"), pedido.calcularTotal());
    }

    @Test
    void mesmoProdutoAdicionadoDuasVezesViraUmItemSo() {
        Pedido pedido = new Pedido(aluno);
        pedido.adicionarItem(coxinha, 1);
        pedido.adicionarItem(coxinha, 2);

        assertEquals(1, pedido.getItens().size());
        assertEquals(3, pedido.getItens().get(0).getQuantidade());
    }

    @Test
    void rn01NaoAdicionaMaisDoQueOEstoque() {
        Pedido pedido = new Pedido(aluno);
        assertThrows(RegraNegocioException.class, () -> pedido.adicionarItem(suco, 3));
    }

    @Test
    void rn01SomaOQueJaEstaNoPedidoAntesDeValidar() {
        Pedido pedido = new Pedido(aluno);
        pedido.adicionarItem(suco, 2);
        assertThrows(RegraNegocioException.class, () -> pedido.adicionarItem(suco, 1));
    }

    @Test
    void rn02ConfirmarBaixaOEstoque() {
        Pedido pedido = new Pedido(aluno);
        pedido.adicionarItem(coxinha, 2);
        pedido.confirmar();

        assertEquals(StatusPedido.RECEBIDO, pedido.getStatus());
        assertEquals(3, coxinha.getQuantidadeEstoque());
    }

    @Test
    void rn05NaoConfirmaSeAlgumItemFicouSemEstoqueENaoMexeNoEstoqueDosOutros() {
        Pedido pedido = new Pedido(aluno);
        pedido.adicionarItem(coxinha, 2);
        pedido.adicionarItem(suco, 2);
        suco.ajustarEstoque(1); // outro aluno comprou antes

        assertThrows(RegraNegocioException.class, pedido::confirmar);
        assertEquals(5, coxinha.getQuantidadeEstoque());
        assertFalse(pedido.isConfirmado());
    }

    @Test
    void naoConfirmaPedidoVazio() {
        assertThrows(RegraNegocioException.class, () -> new Pedido(aluno).confirmar());
    }

    @Test
    void cancelarDevolveOEstoque() {
        Pedido pedido = new Pedido(aluno);
        pedido.adicionarItem(coxinha, 2);
        pedido.confirmar();
        pedido.cancelar();

        assertEquals(StatusPedido.CANCELADO, pedido.getStatus());
        assertEquals(5, coxinha.getQuantidadeEstoque());
    }

    @Test
    void naoCancelaPedidoQueJaEstaEmPreparo() {
        Pedido pedido = new Pedido(aluno);
        pedido.adicionarItem(coxinha, 1);
        pedido.confirmar();
        pedido.atualizarStatus(StatusPedido.EM_PREPARO);

        assertThrows(RegraNegocioException.class, pedido::cancelar);
    }

    @Test
    void segueOFluxoDeStatusEBloqueiaSaltos() {
        Pedido pedido = new Pedido(aluno);
        pedido.adicionarItem(coxinha, 1);
        pedido.confirmar();

        assertThrows(RegraNegocioException.class, () -> pedido.atualizarStatus(StatusPedido.ENTREGUE));

        pedido.atualizarStatus(StatusPedido.EM_PREPARO);
        pedido.atualizarStatus(StatusPedido.PRONTO);
        pedido.atualizarStatus(StatusPedido.ENTREGUE);
        assertEquals(StatusPedido.ENTREGUE, pedido.getStatus());
    }

    @Test
    void pedidoConfirmadoNaoPodeSerAlterado() {
        Pedido pedido = new Pedido(aluno);
        pedido.adicionarItem(coxinha, 1);
        pedido.confirmar();

        assertThrows(RegraNegocioException.class, () -> pedido.adicionarItem(suco, 1));
    }

    @Test
    void rn04ProdutoInativoOuSemEstoqueNaoEstaDisponivel() {
        Produto esgotado = new Produto("Pao de queijo", null, new BigDecimal("3.00"), "Salgados", 0);
        assertFalse(esgotado.estaDisponivel(1));

        coxinha.desativar();
        assertFalse(coxinha.estaDisponivel(1));

        assertTrue(suco.estaDisponivel(2));
    }
}
