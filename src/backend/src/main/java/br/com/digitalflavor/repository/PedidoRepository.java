package br.com.digitalflavor.repository;

import br.com.digitalflavor.domain.pedido.Pedido;
import br.com.digitalflavor.domain.pedido.StatusPedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    /** Historico do aluno. */
    List<Pedido> findByAlunoIdOrderByDataHoraDesc(Long alunoId);

    /** Fila de atendimento da cantina. */
    List<Pedido> findByStatusInOrderByDataHoraAsc(Collection<StatusPedido> status);

    /** RF10: consulta de vendas por periodo. */
    List<Pedido> findByDataHoraBetweenOrderByDataHoraDesc(LocalDateTime inicio, LocalDateTime fim);
}
