package br.com.digitalflavor.service;

import br.com.digitalflavor.domain.exception.RecursoNaoEncontradoException;
import br.com.digitalflavor.domain.produto.Produto;
import br.com.digitalflavor.domain.usuario.Acao;
import br.com.digitalflavor.dto.EstoqueRequest;
import br.com.digitalflavor.dto.ProdutoResponse;
import br.com.digitalflavor.repository.ProdutoRepository;
import br.com.digitalflavor.seguranca.UsuarioLogado;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ProdutoServiceTest {

    private ProdutoRepository produtos;
    private UsuarioLogado usuarioLogado;
    private ProdutoService service;

    @BeforeEach
    void preparar() {
        produtos = mock(ProdutoRepository.class);
        usuarioLogado = mock(UsuarioLogado.class);
        service = new ProdutoService(produtos, usuarioLogado);
    }

    private static Produto suco() {
        return new Produto("Suco", "Laranja", new BigDecimal("5.00"), "Bebidas", 10);
    }

    @Test
    void excluirApagaProdutoNuncaVendido() {
        Produto produto = suco();
        when(produtos.findById(1L)).thenReturn(Optional.of(produto));
        when(produtos.estaEmPedido(1L)).thenReturn(false);

        service.excluir(1L);

        verify(produtos).delete(produto);
    }

    @Test
    void excluirApenasDesativaProdutoJaVendido() {
        Produto produto = suco();
        when(produtos.findById(1L)).thenReturn(Optional.of(produto));
        when(produtos.estaEmPedido(1L)).thenReturn(true);

        service.excluir(1L);

        verify(produtos, never()).delete(any());
        assertThat(produto.isAtivo()).isFalse();
    }

    @Test
    void excluirExigePermissaoDeGerenciarProdutos() {
        doThrow(new AccessDeniedException("Sem permissao para esta acao."))
                .when(usuarioLogado).exigir(Acao.GERENCIAR_PRODUTOS);

        assertThatThrownBy(() -> service.excluir(1L)).isInstanceOf(AccessDeniedException.class);
        verify(produtos, never()).delete(any());
    }

    @Test
    void ajustarEstoqueDefineQuantidadeFinal() {
        Produto produto = suco();
        when(produtos.buscarParaAtualizarEstoque(1L)).thenReturn(Optional.of(produto));

        ProdutoResponse resposta = service.ajustarEstoque(1L, new EstoqueRequest(3));

        verify(usuarioLogado).exigir(Acao.AJUSTAR_ESTOQUE);
        assertThat(resposta.quantidadeEstoque()).isEqualTo(3);
    }

    @Test
    void buscarProdutoInexistenteLancaNaoEncontrado() {
        when(produtos.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscar(99L)).isInstanceOf(RecursoNaoEncontradoException.class);
    }
}
