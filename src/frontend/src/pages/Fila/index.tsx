import { AnimatePresence, LayoutGroup, motion, MotionConfig } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ErroApi, mensagemDeErro } from "../../api/http";
import { alterarStatusPedido, listarFila } from "../../api/pedidos";
import { Button } from "../../components/Button";
import { EstadoErro } from "../../components/EmptyState";
import { Carregando, Skeleton } from "../../components/Skeleton";
import { useRecurso } from "../../hooks/useRecurso";
import { notificar } from "../../lib/notificar";
import { plural } from "../../lib/texto";
import type { Pedido, StatusPedido } from "../../types";
import estilos from "./Fila.module.css";

const ATUALIZAR_MS = 5_000;
/** A partir de quantos minutos o tempo de espera fica em destaque. */
const MINUTOS_ATRASO = 10;

type StatusFila = "RECEBIDO" | "EM_PREPARO" | "PRONTO";

const COLUNAS: Array<{
  status: StatusFila;
  titulo: string;
  acao: string;
  proximo: StatusPedido;
  ponto: string;
  variante: "neutro" | "primario" | "sucesso";
}> = [
  { status: "RECEBIDO", titulo: "Recebidos", acao: "Iniciar preparo", proximo: "EM_PREPARO", ponto: "var(--text-secondary)", variante: "neutro" },
  { status: "EM_PREPARO", titulo: "Em preparo", acao: "Marcar como pronto", proximo: "PRONTO", ponto: "var(--accent)", variante: "primario" },
  { status: "PRONTO", titulo: "Prontos para retirar", acao: "Entregar", proximo: "ENTREGUE", ponto: "var(--success)", variante: "sucesso" },
];

/** Uma única mola para tudo que se move na fila: o card trocando de coluna e os vizinhos fechando o espaço. */
const MOLA = { type: "spring", bounce: 0.1, duration: 0.4 } as const;

function tempoDeEspera(iso: string, agora: number): { texto: string; atrasado: boolean } {
  const minutos = Math.max(0, Math.floor((agora - new Date(iso).getTime()) / 60_000));
  if (minutos < 1) return { texto: "agora", atrasado: false };
  if (minutos < 60) return { texto: `há ${minutos} min`, atrasado: minutos >= MINUTOS_ATRASO };
  const horas = Math.floor(minutos / 60);
  return { texto: `há ${horas} h${minutos % 60 ? ` ${minutos % 60} min` : ""}`, atrasado: true };
}

export function Fila() {
  const { dados, setDados, erro, carregando, tentandoDeNovo, tentarDeNovo, recarregar } = useRecurso(listarFila);
  // Pedidos com ação em andamento: a atualização automática não desfaz o que a pessoa acabou de fazer.
  const pendentes = useRef(new Map<number, StatusPedido>());
  const [enviando, setEnviando] = useState<Set<number>>(new Set());
  const [falhouAtualizar, setFalhouAtualizar] = useState(false);
  const [agora, setAgora] = useState(() => Date.now());

  // Atualiza a fila a cada 5s, mantendo as ações otimistas que ainda não voltaram do servidor.
  const atualizar = useCallback(async () => {
    try {
      const lista = await listarFila();
      setFalhouAtualizar(false);
      setAgora(Date.now());
      setDados(
        lista
          .map((p) => {
            const local = pendentes.current.get(p.id);
            return local ? { ...p, status: local } : p;
          })
          .filter((p) => p.status !== "ENTREGUE"),
      );
    } catch {
      setFalhouAtualizar(true);
    }
  }, [setDados]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void atualizar();
    }, ATUALIZAR_MS);
    return () => window.clearInterval(id);
  }, [atualizar]);

  async function avancar(pedido: Pedido, proximo: StatusPedido) {
    const anterior = pedido.status;
    pendentes.current.set(pedido.id, proximo);
    setEnviando((s) => new Set(s).add(pedido.id));
    // Otimista: o card já muda de coluna (ou sai, se foi entregue).
    setDados((lista) =>
      (lista ?? [])
        .map((p) => (p.id === pedido.id ? { ...p, status: proximo } : p))
        .filter((p) => p.status !== "ENTREGUE"),
    );
    try {
      await alterarStatusPedido(pedido.id, proximo);
      if (proximo === "ENTREGUE") notificar.sucesso(`Pedido #${pedido.id} entregue`);
    } catch (e) {
      // Desfaz e mostra o motivo (ex.: outro funcionário já avançou o pedido).
      setDados((lista) => {
        const semEle = (lista ?? []).filter((p) => p.id !== pedido.id);
        return [...semEle, { ...pedido, status: anterior }].sort((a, b) => a.dataHora.localeCompare(b.dataHora));
      });
      notificar.erro(e, e instanceof ErroApi && e.ehErroDeRede ? "Sem conexão" : `Não deu para atualizar o pedido #${pedido.id}`);
      void recarregar();
    } finally {
      pendentes.current.delete(pedido.id);
      setEnviando((s) => {
        const novo = new Set(s);
        novo.delete(pedido.id);
        return novo;
      });
    }
  }

  const pedidos = dados ?? [];
  const idsPresentes = new Set(pedidos.map((p) => p.id));
  const recebidos = pedidos.filter((p) => p.status === "RECEBIDO").length;

  return (
    <MotionConfig reducedMotion="user" transition={MOLA}>
      <header className={estilos.cabecalho}>
        <h1 className={estilos.titulo}>Fila de pedidos</h1>
        <p className={estilos.subtitulo}>
          <span className={estilos.aoVivo} data-erro={falhouAtualizar} aria-hidden="true" />
          {falhouAtualizar ? "Sem conexão: tentando atualizar…" : "Atualiza sozinha a cada 5 segundos"}
        </p>
        {/* Leitor de tela ouve quando chega pedido novo. */}
        <span className="sr-only" aria-live="polite">
          {dados ? plural(recebidos, "pedido recebido", "pedidos recebidos") : ""}
        </span>
      </header>

      {carregando ? (
        <Carregando rotulo="Carregando a fila…">
          <div className={estilos.area}>
          <div className={estilos.colunas}>
            {COLUNAS.map((c) => (
              <div key={c.status} className={estilos.esqueleto}>
                <Skeleton largura="55%" altura={18} />
                {[0, 1].map((i) => (
                  <div key={i} className={estilos.esqueletoCard}>
                    <Skeleton largura="35%" altura={17} />
                    <Skeleton largura="60%" altura={14} />
                    <Skeleton largura="80%" altura={14} />
                    <Skeleton altura={38} raio={999} />
                  </div>
                ))}
              </div>
            ))}
          </div>
          </div>
        </Carregando>
      ) : erro && !dados ? (
        <div className={estilos.estado}>
          <EstadoErro mensagem={mensagemDeErro(erro)} aoTentarDeNovo={tentarDeNovo} tentando={tentandoDeNovo} />
        </div>
      ) : (
        <LayoutGroup>
          <div className={estilos.area}>
          <div className={estilos.colunas}>
            {COLUNAS.map((coluna) => {
              const cards = pedidos
                .filter((p) => p.status === coluna.status)
                .sort((a, b) => a.dataHora.localeCompare(b.dataHora));
              return (
                <section key={coluna.status} className={estilos.coluna} aria-label={`${coluna.titulo}: ${cards.length}`}>
                  <div className={estilos.colunaTopo}>
                    <h2 className={estilos.colunaTitulo}>
                      <span className={estilos.ponto} style={{ background: coluna.ponto }} aria-hidden="true" />
                      {coluna.titulo}
                    </h2>
                    <span className={estilos.contagem} aria-hidden="true">
                      {cards.length}
                    </span>
                  </div>

                  {cards.length === 0 && <p className={estilos.vazia}>Nenhum pedido aqui</p>}

                  <ul className={estilos.lista}>
                    <AnimatePresence mode="popLayout" initial={false} custom={idsPresentes}>
                      {cards.map((pedido) => {
                        const espera = tempoDeEspera(pedido.dataHora, agora);
                        return (
                          <motion.li
                            key={pedido.id}
                            layoutId={`pedido-${pedido.id}`}
                            className={estilos.card}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            variants={{
                              // Saindo porque mudou de coluna: some na hora (o "outro" card voa até o lugar).
                              // Saindo porque foi entregue: encolhe um pouco e some.
                              sair: (presentes: Set<number>) =>
                                presentes.has(pedido.id)
                                  ? { opacity: 0, transition: { duration: 0 } }
                                  : { opacity: 0, scale: 0.96, transition: { duration: 0.15, ease: [0.23, 1, 0.32, 1] } },
                            }}
                            exit="sair"
                          >
                            <div className={estilos.cardTopo}>
                              <span className={estilos.numero}>#{pedido.id}</span>
                              <span className={estilos.tempo} data-atrasado={coluna.status !== "PRONTO" && espera.atrasado}>
                                {espera.texto}
                              </span>
                            </div>
                            <span className={estilos.aluno}>{pedido.alunoNome}</span>
                            <ul className={estilos.itens}>
                              {pedido.itens.map((item) => (
                                <li key={item.produtoId}>
                                  {item.quantidade}× {item.nome}
                                </li>
                              ))}
                            </ul>
                            <Button
                              className={estilos.acao}
                              variante={coluna.variante}
                              tamanho="pequeno"
                              larguraTotal
                              carregando={enviando.has(pedido.id)}
                              onClick={() => void avancar(pedido, coluna.proximo)}
                              aria-label={`${coluna.acao}: pedido ${pedido.id}`}
                            >
                              {coluna.acao}
                            </Button>
                          </motion.li>
                        );
                      })}
                    </AnimatePresence>
                  </ul>
                </section>
              );
            })}
          </div>
          </div>
        </LayoutGroup>
      )}
    </MotionConfig>
  );
}
