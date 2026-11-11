package br.com.digitalflavor.service;

import br.com.digitalflavor.domain.exception.RegraNegocioException;
import br.com.digitalflavor.domain.pagamento.MetodoPagamento;
import br.com.digitalflavor.domain.pagamento.Pagamento;
import br.com.digitalflavor.domain.pagamento.PagamentoPix;
import br.com.digitalflavor.domain.pagamento.StatusPagamento;
import br.com.digitalflavor.domain.pedido.Pedido;
import br.com.digitalflavor.domain.pedido.StatusPedido;
import br.com.digitalflavor.domain.produto.Produto;
import br.com.digitalflavor.domain.usuario.Acao;
import br.com.digitalflavor.domain.usuario.Aluno;
import br.com.digitalflavor.domain.usuario.Funcionario;
import br.com.digitalflavor.domain.usuario.Gerente;
import br.com.digitalflavor.dto.PedidoRequest;
import br.com.digitalflavor.dto.PedidoResponse;
import br.com.digitalflavor.dto.RelatorioVendasResponse;
import br.com.digitalflavor.repository.PagamentoRepository;
import br.com.digitalflavor.repository.PedidoRepository;
import br.com.digitalflavor.repository.ProdutoRepository;
import br.com.digitalflavor.seguranca.UsuarioLogado;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PedidoServiceTest {

    private PedidoRepository pedidos;
    private PagamentoRepository pagamentos;
    private ProdutoRepository produtos;
    private UsuarioLogado usuarioLogado;
    private PedidoService service;
    private Aluno maria;

    @BeforeEach
    void preparar() {
        pedidos = mock(PedidoRepository.class);
        pagamentos = mock(PagamentoRepository.class);
        produtos = mock(ProdutoRepository.class);
        usuarioLogado = mock(UsuarioLogado.class);
        service = new PedidoService(pedidos, pagamentos, produtos, usuarioLogado);
        maria = aluno(1L, "Maria");
        when(pedidos.save(any(Pedido.class))).thenAnswer(chamada -> {
            Pedido pedido = chamada.getArgument(0);
            ReflectionTestUtils.setField(pedido, "id", 100L);
            return pedido;
        });
    }

    private static Aluno aluno(long id, String nome) {
        Aluno aluno = new Aluno(nome, nome.toLowerCase() + "@escola.com", "hash", null, "RA" + id, "3A");
        ReflectionTestUtils.setField(aluno, "id", id);
        return aluno;
    }

    private Produto produto(long id, String preco, int estoque) {
        Produto produto = new Produto("Produto " + id, null, new BigDecimal(preco), "Salgados", estoque);
        ReflectionTestUtils.setField(produto, "id", id);
        when(produtos.buscarParaAtualizarEstoque(id)).thenReturn(Optional.of(produto));
        return produto;
    }

    private static PedidoRequest pedido(MetodoPagamento metodo, String cartao, PedidoRequest.Item... itens) {
        return new PedidoRequest(List.of(itens), new PedidoRequest.Pagamento(metodo, cartao, null, null));
    }

    private Pedido pedidoConfirmado(Aluno dono, Produto produto, int quantidade) {
        Pedido pedido = new Pedido(dono);
        pedido.adicionarItem(produto, quantidade);
        pedido.confirmar();
        ReflectionTestUtils.setField(pedido, "id", 50L);
        return pedido;
    }

    @Test
    void alunoConfirmaPedidoPixSomandoItensRepetidos() {
        when(usuarioLogado.obter()).thenReturn(maria);
        Produto coxinha = produto(1L, "6.50", 10);

        PedidoResponse resposta = service.criar(pedido(MetodoPagamento.PIX, null,
                new PedidoRequest.Item(1L, 2), new PedidoRequest.Item(1L, 1)));

        assertThat(resposta.status()).isEqualTo("RECEBIDO");
        assertThat(resposta.itens()).hasSize(1);
        assertThat(resposta.total()).isEqualByComparingTo("19.50");
        assertThat(resposta.pagamento().status()).isEqualTo("APROVADO");
        assertThat(resposta.pagamento().codigoQr()).startsWith("DIGITALFLAVOR-PIX");
        assertThat(coxinha.getQuantidadeEstoque()).isEqualTo(7);
        verify(pagamentos).save(any(Pagamento.class));
    }

    @Test
    void cartaoRecusadoNaoGravaPagamento() {
        when(usuarioLogado.obter()).thenReturn(maria);
        produto(1L, "6.50", 10);

        assertThatThrownBy(() -> service.criar(pedido(MetodoPagamento.CARTAO, "4111111111110000",
                new PedidoRequest.Item(1L, 1))))
                .isInstanceOf(RegraNegocioException.class)
                .hasMessageContaining("recusado");
        verify(pagamentos, never()).save(any());
    }

    @Test
    void estoqueInsuficienteRecusaOPedido() {
        when(usuarioLogado.obter()).thenReturn(maria);
        produto(1L, "6.50", 1);

        assertThatThrownBy(() -> service.criar(pedido(MetodoPagamento.PIX, null, new PedidoRequest.Item(1L, 2))))
                .isInstanceOf(RegraNegocioException.class);
        verify(pedidos, never()).save(any());
    }

    @Test
    void quemNaoPodeFazerPedidoRecebe403() {
        doThrow(new AccessDeniedException("x")).when(usuarioLogado).exigir(Acao.FAZER_PEDIDO);

        assertThatThrownBy(() -> service.criar(pedido(MetodoPagamento.PIX, null, new PedidoRequest.Item(1L, 1))))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void donoCancelaDevolveEstoqueEEstorna() {
        Produto coxinha = produto(1L, "6.50", 5);
        Pedido pedido = pedidoConfirmado(maria, coxinha, 2);
        PagamentoPix pix = new PagamentoPix(pedido, "pix@teste");
        pix.processar();
        when(pedidos.findById(50L)).thenReturn(Optional.of(pedido));
        when(pagamentos.findByPedidoId(50L)).thenReturn(Optional.of(pix));
        when(usuarioLogado.obter()).thenReturn(maria);

        PedidoResponse resposta = service.cancelar(50L);

        assertThat(resposta.status()).isEqualTo("CANCELADO");
        assertThat(coxinha.getQuantidadeEstoque()).isEqualTo(5);
        assertThat(pix.getStatus()).isEqualTo(StatusPagamento.ESTORNADO);
    }

    @Test
    void outroAlunoNaoCancelaNemVePedidoAlheio() {
        Pedido pedido = pedidoConfirmado(maria, produto(1L, "6.50", 5), 1);
        when(pedidos.findById(50L)).thenReturn(Optional.of(pedido));
        when(usuarioLogado.obter()).thenReturn(aluno(2L, "Beto"));

        assertThatThrownBy(() -> service.cancelar(50L)).isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> service.buscar(50L)).isInstanceOf(AccessDeniedException.class);
        assertThat(pedido.getStatus()).isEqualTo(StatusPedido.RECEBIDO);
    }

    @Test
    void cantinaAvancaStatusMasNaoCancela() {
        Pedido pedido = pedidoConfirmado(maria, produto(1L, "6.50", 5), 1);
        when(pedidos.findById(50L)).thenReturn(Optional.of(pedido));
        when(usuarioLogado.obter()).thenReturn(new Funcionario("Carlos", "c@escola.com", "h", null, "F1", "Manha"));

        assertThat(service.alterarStatus(50L, StatusPedido.EM_PREPARO).status()).isEqualTo("EM_PREPARO");
        assertThatThrownBy(() -> service.alterarStatus(50L, StatusPedido.ENTREGUE))
                .isInstanceOf(RegraNegocioException.class);
        assertThatThrownBy(() -> service.alterarStatus(50L, StatusPedido.CANCELADO))
                .isInstanceOf(RegraNegocioException.class);
    }

    @Test
    void vendasIgnoramCanceladosEAgrupamPorProduto() {
        Produto coxinha = produto(1L, "6.50", 20);
        Pedido vendido = pedidoConfirmado(maria, coxinha, 2);
        Pedido cancelado = pedidoConfirmado(maria, coxinha, 1);
        cancelado.cancelar();
        when(pedidos.findByDataHoraBetweenOrderByDataHoraDesc(any(), any())).thenReturn(List.of(vendido, cancelado));
        when(usuarioLogado.obter()).thenReturn(new Gerente("Bia", "b@escola.com", "h", null, "Cantina"));

        RelatorioVendasResponse relatorio = service.vendas(LocalDate.now(), LocalDate.now());

        assertThat(relatorio.quantidadePedidos()).isEqualTo(1);
        assertThat(relatorio.totalVendido()).isEqualByComparingTo("13.00");
        assertThat(relatorio.porProduto()).singleElement()
                .satisfies(item -> assertThat(item.quantidade()).isEqualTo(2));
    }

    @Test
    void periodoInvertidoERecusado() {
        assertThatThrownBy(() -> service.vendas(LocalDate.of(2026, 11, 10), LocalDate.of(2026, 11, 1)))
                .isInstanceOf(RegraNegocioException.class);
    }
}
