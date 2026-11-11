package br.com.digitalflavor.service;

import br.com.digitalflavor.domain.exception.RecursoNaoEncontradoException;
import br.com.digitalflavor.domain.exception.RegraNegocioException;
import br.com.digitalflavor.domain.pagamento.Pagamento;
import br.com.digitalflavor.domain.pagamento.PagamentoCartao;
import br.com.digitalflavor.domain.pagamento.PagamentoPix;
import br.com.digitalflavor.domain.pagamento.StatusPagamento;
import br.com.digitalflavor.domain.pedido.ItemPedido;
import br.com.digitalflavor.domain.pedido.Pedido;
import br.com.digitalflavor.domain.pedido.StatusPedido;
import br.com.digitalflavor.domain.produto.Produto;
import br.com.digitalflavor.domain.usuario.Acao;
import br.com.digitalflavor.domain.usuario.Aluno;
import br.com.digitalflavor.domain.usuario.Usuario;
import br.com.digitalflavor.dto.PedidoRequest;
import br.com.digitalflavor.dto.PedidoResponse;
import br.com.digitalflavor.dto.RelatorioVendasResponse;
import br.com.digitalflavor.repository.PagamentoRepository;
import br.com.digitalflavor.repository.PedidoRepository;
import br.com.digitalflavor.repository.ProdutoRepository;
import br.com.digitalflavor.seguranca.UsuarioLogado;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * Casos de uso de pedido, pagamento e vendas (RF05, RF07 a RF10).
 * As regras de estoque ficam nas entidades de Pedido; aqui ficam permissao, trava e transacao.
 */
@Service
public class PedidoService {

    /** Chave PIX ficticia da cantina (pagamento simulado). */
    static final String CHAVE_PIX_CANTINA = "pix@digitalflavor.com.br";

    private static final EnumSet<StatusPedido> EM_ANDAMENTO =
            EnumSet.of(StatusPedido.RECEBIDO, StatusPedido.EM_PREPARO, StatusPedido.PRONTO);

    private final PedidoRepository pedidos;
    private final PagamentoRepository pagamentos;
    private final ProdutoRepository produtos;
    private final UsuarioLogado usuarioLogado;

    public PedidoService(PedidoRepository pedidos, PagamentoRepository pagamentos, ProdutoRepository produtos,
                         UsuarioLogado usuarioLogado) {
        this.pedidos = pedidos;
        this.pagamentos = pagamentos;
        this.produtos = produtos;
        this.usuarioLogado = usuarioLogado;
    }

    /**
     * Confirma o carrinho: trava os produtos, valida e baixa o estoque (RN01, RN02, RN05)
     * e processa o pagamento. Se o pagamento for recusado, a transacao inteira e desfeita.
     */
    @Transactional
    public PedidoResponse criar(PedidoRequest requisicao) {
        Aluno aluno = alunoLogado();

        // Soma itens repetidos e trava em ordem de id, para dois pedidos nao se travarem mutuamente.
        Map<Long, Integer> quantidades = new TreeMap<>();
        requisicao.itens().forEach(item -> quantidades.merge(item.produtoId(), item.quantidade(), Integer::sum));

        Pedido pedido = new Pedido(aluno);
        quantidades.forEach((id, quantidade) -> pedido.adicionarItem(travarProduto(id), quantidade));
        pedido.confirmar();
        pedidos.save(pedido);

        Pagamento pagamento = criarPagamento(pedido, requisicao.pagamento());
        if (!pagamento.processar()) {
            throw new RegraNegocioException("Pagamento recusado. Confira os dados do cartao ou pague com PIX.");
        }
        pagamentos.save(pagamento);
        return PedidoResponse.de(pedido, pagamento);
    }

    @Transactional(readOnly = true)
    public List<PedidoResponse> meusPedidos() {
        Aluno aluno = alunoLogado();
        return responder(pedidos.findByAlunoIdOrderByDataHoraDesc(aluno.getId()));
    }

    /** ALUNO so ve o proprio pedido; a equipe da cantina ve qualquer um. */
    @Transactional(readOnly = true)
    public PedidoResponse buscar(Long id) {
        Usuario usuario = usuarioLogado.obter();
        Pedido pedido = encontrar(id);
        if (!usuario.possuiPermissao(Acao.ATENDER_PEDIDOS) && !ehDono(pedido, usuario)) {
            throw new AccessDeniedException("Este pedido nao e seu.");
        }
        return responder(pedido);
    }

    @Transactional(readOnly = true)
    public List<PedidoResponse> fila() {
        usuarioLogado.exigir(Acao.ATENDER_PEDIDOS);
        return responder(pedidos.findByStatusInOrderByDataHoraAsc(EM_ANDAMENTO));
    }

    /** A cantina avanca o pedido uma etapa por vez. Cancelar e pelo endpoint proprio, pelo aluno. */
    @Transactional
    public PedidoResponse alterarStatus(Long id, StatusPedido novoStatus) {
        usuarioLogado.exigir(Acao.ATENDER_PEDIDOS);
        if (novoStatus == StatusPedido.CANCELADO) {
            throw new RegraNegocioException("O cancelamento e feito pelo aluno, enquanto o pedido estiver RECEBIDO.");
        }
        Pedido pedido = encontrar(id);
        pedido.atualizarStatus(novoStatus);
        return responder(pedido);
    }

    /** So o dono cancela, e so enquanto RECEBIDO: devolve o estoque e estorna o pagamento. */
    @Transactional
    public PedidoResponse cancelar(Long id) {
        Usuario usuario = usuarioLogado.obter();
        Pedido pedido = encontrar(id);
        if (!ehDono(pedido, usuario)) {
            throw new AccessDeniedException("Este pedido nao e seu.");
        }
        pedido.getItens().stream().map(ItemPedido::getProduto).map(Produto::getId)
                .distinct().sorted().forEach(this::travarProduto);
        pedido.cancelar();

        Pagamento pagamento = pagamentos.findByPedidoId(pedido.getId()).orElse(null);
        if (pagamento != null && pagamento.getStatus() == StatusPagamento.APROVADO) {
            pagamento.estornar();
        }
        return PedidoResponse.de(pedido, pagamento);
    }

    /** RF10: periodo com datas inclusivas, sem pedidos cancelados. */
    @Transactional(readOnly = true)
    public RelatorioVendasResponse vendas(LocalDate inicio, LocalDate fim) {
        usuarioLogado.exigir(Acao.CONSULTAR_VENDAS);
        if (fim.isBefore(inicio)) {
            throw new RegraNegocioException("A data final deve ser igual ou posterior a inicial.");
        }
        List<Pedido> vendidos = pedidos
                .findByDataHoraBetweenOrderByDataHoraDesc(inicio.atStartOfDay(), fim.plusDays(1).atStartOfDay().minusNanos(1))
                .stream()
                .filter(pedido -> pedido.getStatus() != StatusPedido.CANCELADO)
                .toList();

        Map<Long, RelatorioVendasResponse.PorProduto> porProduto = new LinkedHashMap<>();
        BigDecimal totalVendido = BigDecimal.ZERO;
        for (Pedido pedido : vendidos) {
            totalVendido = totalVendido.add(pedido.getTotal());
            for (ItemPedido item : pedido.getItens()) {
                Produto produto = item.getProduto();
                porProduto.merge(produto.getId(),
                        new RelatorioVendasResponse.PorProduto(produto.getId(), produto.getNome(),
                                item.getQuantidade(), item.calcularSubtotal()),
                        (atual, novo) -> new RelatorioVendasResponse.PorProduto(atual.produtoId(), atual.nome(),
                                atual.quantidade() + novo.quantidade(), atual.total().add(novo.total())));
            }
        }
        List<RelatorioVendasResponse.PorProduto> ranking = porProduto.values().stream()
                .sorted(Comparator.comparingInt(RelatorioVendasResponse.PorProduto::quantidade).reversed())
                .toList();
        return new RelatorioVendasResponse(totalVendido, vendidos.size(), ranking);
    }

    private Aluno alunoLogado() {
        usuarioLogado.exigir(Acao.FAZER_PEDIDO);
        if (!(usuarioLogado.obter() instanceof Aluno aluno)) {
            throw new AccessDeniedException("Somente alunos podem realizar pedidos.");
        }
        return aluno;
    }

    private static boolean ehDono(Pedido pedido, Usuario usuario) {
        return usuario instanceof Aluno aluno && pedido.pertenceA(aluno);
    }

    private static Pagamento criarPagamento(Pedido pedido, PedidoRequest.Pagamento dados) {
        return switch (dados.metodo()) {
            case PIX -> new PagamentoPix(pedido, CHAVE_PIX_CANTINA);
            case CARTAO -> new PagamentoCartao(pedido, dados.numeroCartao(), dados.bandeira(),
                    dados.parcelas() == null ? 1 : dados.parcelas());
        };
    }

    private Produto travarProduto(Long id) {
        return produtos.buscarParaAtualizarEstoque(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto " + id + " nao encontrado."));
    }

    private Pedido encontrar(Long id) {
        return pedidos.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Pedido nao encontrado."));
    }

    // shortcut: busca o pagamento de cada pedido (N+1); suficiente para o volume de uma cantina.
    private PedidoResponse responder(Pedido pedido) {
        return PedidoResponse.de(pedido, pagamentos.findByPedidoId(pedido.getId()).orElse(null));
    }

    private List<PedidoResponse> responder(List<Pedido> lista) {
        return lista.stream().map(this::responder).toList();
    }
}
