package br.com.digitalflavor.service;

import br.com.digitalflavor.domain.exception.RecursoNaoEncontradoException;
import br.com.digitalflavor.domain.produto.Produto;
import br.com.digitalflavor.domain.usuario.Acao;
import br.com.digitalflavor.dto.EstoqueRequest;
import br.com.digitalflavor.dto.ProdutoAtualizacaoRequest;
import br.com.digitalflavor.dto.ProdutoRequest;
import br.com.digitalflavor.dto.ProdutoResponse;
import br.com.digitalflavor.repository.ProdutoRepository;
import br.com.digitalflavor.seguranca.UsuarioLogado;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProdutoService {

    private final ProdutoRepository produtos;
    private final UsuarioLogado usuarioLogado;

    public ProdutoService(ProdutoRepository produtos, UsuarioLogado usuarioLogado) {
        this.produtos = produtos;
        this.usuarioLogado = usuarioLogado;
    }

    /** Cardapio publico: so produtos ativos com estoque (RN04). */
    @Transactional(readOnly = true)
    public List<ProdutoResponse> listarDisponiveis() {
        return produtos.listarDisponiveis().stream().map(ProdutoResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponse> listarTodos() {
        usuarioLogado.exigir(Acao.GERENCIAR_PRODUTOS);
        return produtos.findAll(Sort.by("nome")).stream().map(ProdutoResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public ProdutoResponse buscar(Long id) {
        usuarioLogado.exigir(Acao.GERENCIAR_PRODUTOS);
        return ProdutoResponse.de(encontrar(id));
    }

    @Transactional
    public ProdutoResponse criar(ProdutoRequest pedido) {
        usuarioLogado.exigir(Acao.GERENCIAR_PRODUTOS);
        Produto produto = new Produto(
                pedido.nome(),
                pedido.descricao(),
                pedido.preco(),
                pedido.categoria(),
                pedido.quantidadeEstoque());
        produto.definirImagem(pedido.imagemUrl());
        return ProdutoResponse.de(produtos.save(produto));
    }

    @Transactional
    public ProdutoResponse atualizar(Long id, ProdutoAtualizacaoRequest pedido) {
        usuarioLogado.exigir(Acao.GERENCIAR_PRODUTOS);
        Produto produto;
        if (pedido.quantidadeEstoque() != null) {
            usuarioLogado.exigir(Acao.AJUSTAR_ESTOQUE);
            produto = produtos.buscarParaAtualizarEstoque(id)
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Produto nao encontrado."));
            produto.ajustarEstoque(pedido.quantidadeEstoque());
        } else {
            produto = encontrar(id);
        }
        produto.atualizarDados(pedido.nome(), pedido.descricao(), pedido.preco(), pedido.categoria());
        produto.definirImagem(pedido.imagemUrl());
        return ProdutoResponse.de(produto);
    }

    /**
     * RN07: apaga de fato se nunca foi vendido (retorna vazio, HTTP 204);
     * se ja esta em pedido, so desativa e devolve o produto (HTTP 200).
     */
    @Transactional
    public Optional<ProdutoResponse> excluir(Long id) {
        usuarioLogado.exigir(Acao.GERENCIAR_PRODUTOS);
        Produto produto = encontrar(id);
        if (produtos.estaEmPedido(id)) {
            produto.desativar();
            return Optional.of(ProdutoResponse.de(produto));
        }
        produtos.delete(produto);
        return Optional.empty();
    }

    /** Switch "No cardapio": pausa ou volta a oferecer o produto, sem apagar nada. */
    @Transactional
    public ProdutoResponse definirAtivo(Long id, boolean ativo) {
        usuarioLogado.exigir(Acao.GERENCIAR_PRODUTOS);
        Produto produto = encontrar(id);
        if (ativo) {
            produto.ativar();
        } else {
            produto.desativar();
        }
        return ProdutoResponse.de(produto);
    }

    /** Ajuste de inventario: define a quantidade final em estoque. */
    @Transactional
    public ProdutoResponse ajustarEstoque(Long id, EstoqueRequest pedido) {
        usuarioLogado.exigir(Acao.AJUSTAR_ESTOQUE);
        Produto produto = produtos.buscarParaAtualizarEstoque(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto nao encontrado."));
        produto.ajustarEstoque(pedido.quantidade());
        return ProdutoResponse.de(produto);
    }

    private Produto encontrar(Long id) {
        return produtos.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto nao encontrado."));
    }
}
