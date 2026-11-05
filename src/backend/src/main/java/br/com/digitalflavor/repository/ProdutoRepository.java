package br.com.digitalflavor.repository;

import br.com.digitalflavor.domain.produto.Produto;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    /** RN04: o cardapio do aluno mostra apenas produtos ativos e com estoque. */
    List<Produto> findByAtivoTrueAndQuantidadeEstoqueGreaterThanOrderByNomeAsc(int quantidadeMinima);

    default List<Produto> listarDisponiveis() {
        return findByAtivoTrueAndQuantidadeEstoqueGreaterThanOrderByNomeAsc(0);
    }

    /**
     * Busca o produto bloqueando a linha (SELECT ... FOR UPDATE) ate o fim da transacao.
     * Evita que dois alunos comprem a ultima unidade ao mesmo tempo.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Produto p where p.id = :id")
    Optional<Produto> buscarParaAtualizarEstoque(@Param("id") Long id);

    /**
     * Produto ja vendido nao pode ser apagado. Consulta a tabela item_pedido
     * diretamente, sem depender da entidade de pedido.
     */
    default boolean estaEmPedido(Long produtoId) {
        return contarItensDePedido(produtoId).longValue() > 0;
    }

    @Query(value = "select count(*) from item_pedido where produto_id = :produtoId", nativeQuery = true)
    Number contarItensDePedido(@Param("produtoId") Long produtoId);
}
