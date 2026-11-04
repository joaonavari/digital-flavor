import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { ErroApi, mensagemDeErro } from "../../api/http";
import { buscarPedido, cancelarPedido } from "../../api/pedidos";
import { AlertDialog } from "../../components/AlertDialog";
import { BotaoIcone, Button } from "../../components/Button";
import { EmptyState, EstadoErro } from "../../components/EmptyState";
import { Selo } from "../../components/SeloStatus";
import { Carregando, Skeleton } from "../../components/Skeleton";
import { StatusTimeline } from "../../components/StatusTimeline";
import { useRecurso } from "../../hooks/useRecurso";
import { formatarPreco } from "../../lib/formatar";
import { notificar } from "../../lib/notificar";
import { descricaoPagamento, emAndamento, NOME_STATUS, nomeStatusPagamento } from "../../lib/pedidos";
import type { Pedido, StatusPedido } from "../../types";
import estilos from "../MeusPedidos/Pedidos.module.css";

const ATUALIZAR_MS = 10_000;

const NOTA: Partial<Record<StatusPedido, string>> = {
  EM_PREPARO: "Como o pedido já está em preparo, não é mais possível cancelar.",
  PRONTO: "Como o pedido já está pronto, não é mais possível cancelar.",
  ENTREGUE: "Pedido entregue, não é mais possível cancelar.",
  CANCELADO: "Pedido cancelado. O pagamento é estornado e os itens voltam ao estoque.",
};

function corPagamento(status: string): "verde" | "laranja" | "vermelho" | "neutro" {
  const s = status.toUpperCase();
  if (s === "APROVADO") return "verde";
  if (s === "PENDENTE") return "laranja";
  if (s === "RECUSADO") return "vermelho";
  return "neutro";
}

const Voltar = () => (
  <Link to="/pedidos" className={estilos.voltar}>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
    Pedidos
  </Link>
);

export function AcompanharPedido() {
  const { id } = useParams();
  const idPedido = Number(id);
  const buscar = useCallback(() => buscarPedido(idPedido), [idPedido]);
  const { dados: pedido, setDados, erro, carregando, tentandoDeNovo, tentarDeNovo, recarregar } = useRecurso(buscar);
  // 403 (pedido de outro aluno) e 404 aparecem do mesmo jeito: "não encontrado".
  const naoEncontrado = erro instanceof ErroApi && (erro.status === 403 || erro.status === 404);

  const [confirmando, setConfirmando] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  // Atualiza a cada 10s enquanto o pedido anda na cantina.
  const status = pedido?.status;
  const andando = status ? emAndamento(status) : false;
  useEffect(() => {
    if (!andando) return;
    const intervalo = window.setInterval(() => {
      if (document.visibilityState === "visible") void recarregar();
    }, ATUALIZAR_MS);
    return () => window.clearInterval(intervalo);
  }, [andando, recarregar]);

  // Avisa quando fica pronto enquanto a pessoa está nesta tela.
  const statusAnterior = useRef<StatusPedido | undefined>(undefined);
  useEffect(() => {
    if (status === "PRONTO" && statusAnterior.current && statusAnterior.current !== "PRONTO") {
      notificar.sucesso("Seu pedido está pronto", "Pode retirar no balcão.");
    }
    statusAnterior.current = status;
  }, [status]);

  async function cancelar() {
    if (!pedido) return;
    setCancelando(true);
    try {
      const atualizado = await cancelarPedido(pedido.id);
      setDados(atualizado);
      setConfirmando(false);
      notificar.sucesso("Pedido cancelado", "O valor será estornado.");
    } catch (e) {
      setConfirmando(false);
      notificar.erro(e, e instanceof ErroApi && e.ehErroDeRede ? "Sem conexão" : "Não deu para cancelar");
      void recarregar();
    } finally {
      setCancelando(false);
    }
  }

  if (carregando) {
    return (
      <>
        <header className={`${estilos.cabecalho} ${estilos.cabecalhoComVoltar}`}>
          <Voltar />
          <Skeleton largura={170} altura={15} />
          <Skeleton largura={200} altura={37} raio={10} />
        </header>
        <div className={estilos.corpo}>
          <Carregando rotulo="Carregando o pedido…">
            <div className={estilos.esqueleto}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <Skeleton largura={24} altura={24} raio={999} />
                  <Skeleton largura={`${50 - i * 5}%`} altura={17} />
                </div>
              ))}
            </div>
          </Carregando>
        </div>
      </>
    );
  }

  if (!pedido) {
    return (
      <>
        <header className={`${estilos.cabecalho} ${estilos.cabecalhoComVoltar}`}>
          <Voltar />
        </header>
        <div className={estilos.corpo}>
          <div className={estilos.estado}>
            {erro && !naoEncontrado ? (
              <EstadoErro mensagem={mensagemDeErro(erro)} aoTentarDeNovo={tentarDeNovo} tentando={tentandoDeNovo} />
            ) : (
              <EmptyState titulo="Pedido não encontrado" descricao="Confira na sua lista de pedidos." />
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <header className={`${estilos.cabecalho} ${estilos.cabecalhoComVoltar}`}>
        <Voltar />
        <p className={estilos.sobretitulo}>Pedido #{pedido.id} · retirar no balcão</p>
        <h1 className={estilos.titulo}>{NOME_STATUS[pedido.status]}</h1>
        {/* Leitores de tela ouvem quando o status muda. */}
        <span className="sr-only" aria-live="polite">
          Status: {NOME_STATUS[pedido.status]}
        </span>
      </header>

      <div className={estilos.corpo}>
        <StatusTimeline status={pedido.status} />

        <CodigoPix pedido={pedido} />

        <section className={estilos.secao} aria-label="Resumo do pedido">
          <span className="section-label">Resumo</span>
          <ul className={estilos.grupo}>
            {pedido.itens.map((item) => (
              <li key={item.produtoId}>
                <div className={estilos.linhaResumo}>
                  <span>
                    {item.quantidade}× {item.nome}
                  </span>
                  <span>{formatarPreco(item.subtotal)}</span>
                </div>
              </li>
            ))}
            <li>
              <div className={`${estilos.linhaResumo} ${estilos.linhaPagamento}`}>
                <span className={estilos.pagamento}>
                  {descricaoPagamento(pedido.pagamento)}
                  <Selo cor={corPagamento(pedido.pagamento.status)}>{nomeStatusPagamento(pedido.pagamento.status)}</Selo>
                </span>
                <span className={estilos.total}>{formatarPreco(pedido.total)}</span>
              </div>
            </li>
          </ul>
          {NOTA[pedido.status] && <p className={estilos.nota}>{NOTA[pedido.status]}</p>}
        </section>

        {pedido.status === "RECEBIDO" && (
          <Button variante="perigo" tamanho="grande" larguraTotal onClick={() => setConfirmando(true)}>
            Cancelar pedido
          </Button>
        )}
      </div>

      <AlertDialog
        aberto={confirmando}
        titulo={`Cancelar o pedido #${pedido.id}?`}
        mensagem="O pagamento é estornado e os itens voltam ao estoque. Não dá para desfazer."
        rotuloConfirmar="Cancelar pedido"
        rotuloVoltar="Manter pedido"
        destrutivo
        carregando={cancelando}
        aoConfirmar={cancelar}
        aoFechar={() => setConfirmando(false)}
      />
    </>
  );
}

/** PIX copia e cola, enquanto o pedido ainda está valendo. */
function CodigoPix({ pedido }: { pedido: Pedido }) {
  const [copiado, setCopiado] = useState(false);
  const codigo = pedido.pagamento.codigoQr;
  if (pedido.pagamento.metodo !== "PIX" || !codigo || !emAndamento(pedido.status)) return null;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo ?? "");
      setCopiado(true);
      notificar.sucesso("Código PIX copiado");
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      notificar.erro(null, "Não deu para copiar. Selecione o código e copie à mão.");
    }
  }

  return (
    <div className={estilos.pix}>
      <div className={estilos.pixTexto}>
        <span className={estilos.pixRotulo}>PIX copia e cola</span>
        <span className={estilos.pixCodigo} title={codigo}>
          {codigo}
        </span>
      </div>
      <BotaoIcone rotulo={copiado ? "Código copiado" : "Copiar código PIX"} variante="neutro" tamanho={44} onClick={copiar}>
        {copiado ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
            <path d="M15.5 8.5V6.5a2 2 0 00-2-2h-7a2 2 0 00-2 2v7a2 2 0 002 2h2" />
          </svg>
        )}
      </BotaoIcone>
    </div>
  );
}
