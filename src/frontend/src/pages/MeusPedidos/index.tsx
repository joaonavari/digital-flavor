import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { mensagemDeErro } from "../../api/http";
import { listarMeusPedidos } from "../../api/pedidos";
import { EmptyState, EstadoErro } from "../../components/EmptyState";
import { IconePedidos } from "../../components/Icones";
import { SeloStatus } from "../../components/SeloStatus";
import { Carregando, Skeleton } from "../../components/Skeleton";
import { useRecurso } from "../../hooks/useRecurso";
import { formatarPreco } from "../../lib/formatar";
import { emAndamento, formatarDataPedido } from "../../lib/pedidos";
import type { Pedido } from "../../types";
import estilos from "./Pedidos.module.css";

const ATUALIZAR_MS = 10_000;

export function MeusPedidos() {
  const navegar = useNavigate();
  const { dados, erro, carregando, tentandoDeNovo, tentarDeNovo, recarregar } = useRecurso(listarMeusPedidos);

  const pedidos = [...(dados ?? [])].sort((a, b) => b.dataHora.localeCompare(a.dataHora));
  const andamento = pedidos.filter((p) => emAndamento(p.status));
  const anteriores = pedidos.filter((p) => !emAndamento(p.status));

  // Com pedido em andamento, a lista se atualiza sozinha.
  const temAndamento = andamento.length > 0;
  useEffect(() => {
    if (!temAndamento) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void recarregar();
    }, ATUALIZAR_MS);
    return () => window.clearInterval(id);
  }, [temAndamento, recarregar]);

  return (
    <>
      <header className={estilos.cabecalho}>
        <h1 className={estilos.titulo}>Pedidos</h1>
      </header>

      <div className={estilos.corpo}>
        {carregando ? (
          <Carregando rotulo="Carregando seus pedidos…">
            <div className={estilos.esqueleto}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6, paddingBlock: 6 }}>
                  <Skeleton largura={`${46 - i * 6}%`} altura={17} />
                  <Skeleton largura="62%" altura={13} />
                </div>
              ))}
            </div>
          </Carregando>
        ) : erro && !dados ? (
          <div className={estilos.estado}>
            <EstadoErro mensagem={mensagemDeErro(erro)} aoTentarDeNovo={tentarDeNovo} tentando={tentandoDeNovo} />
          </div>
        ) : pedidos.length === 0 ? (
          <div className={estilos.estado}>
            <EmptyState
              icone={<IconePedidos tamanho={26} />}
              titulo="Nenhum pedido ainda"
              descricao="Quando você pedir algo no cardápio, ele aparece aqui."
              acao={{ rotulo: "Ver cardápio", aoClicar: () => navegar("/") }}
            />
          </div>
        ) : (
          <>
            {andamento.length > 0 && <Secao titulo="Em andamento" pedidos={andamento} />}
            {anteriores.length > 0 && <Secao titulo="Anteriores" pedidos={anteriores} />}
          </>
        )}
      </div>
    </>
  );
}

function resumoItens(pedido: Pedido): string {
  return pedido.itens.map((i) => `${i.quantidade}× ${i.nome}`).join(", ");
}

function Secao({ titulo, pedidos }: { titulo: string; pedidos: Pedido[] }) {
  return (
    <section className={estilos.secao} aria-label={titulo}>
      <span className="section-label">{titulo}</span>
      <ul className={estilos.grupo}>
        {pedidos.map((pedido) => (
          <li key={pedido.id}>
            <Link to={`/pedidos/${pedido.id}`} className={estilos.linhaPedido}>
              <span className={estilos.linhaTexto}>
                <span className={estilos.numero}>Pedido #{pedido.id}</span>
                <span className={estilos.meta}>{formatarDataPedido(pedido.dataHora)}</span>
                <span className={estilos.resumoItens} title={resumoItens(pedido)}>
                  {resumoItens(pedido)}
                </span>
              </span>
              <span className={estilos.linhaDireita}>
                <span className={estilos.valor}>{formatarPreco(pedido.total)}</span>
                <SeloStatus status={pedido.status} />
              </span>
              <svg className={estilos.chevron} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
