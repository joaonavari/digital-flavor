import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router";
import { mensagemDeErro } from "../../api/http";
import { listarMeusPedidos } from "../../api/pedidos";
import { EmptyState, EstadoErro } from "../../components/EmptyState";
import { IconePedidos } from "../../components/Icones";
import { SeloStatus } from "../../components/SeloStatus";
import { Carregando, Skeleton } from "../../components/Skeleton";
import { TituloCompacto } from "../../components/TituloCompacto";
import { useComputador, useTelaLarga } from "../../hooks/useLargura";
import { useRecurso } from "../../hooks/useRecurso";
import { formatarPreco } from "../../lib/formatar";
import { emAndamento, formatarDataPedido } from "../../lib/pedidos";
import type { Pedido } from "../../types";
import { AcompanharPedido } from "../AcompanharPedido";
import estilos from "./Pedidos.module.css";

const ATUALIZAR_MS = 10_000;

export function MeusPedidos() {
  const navegar = useNavigate();
  const { dados, erro, carregando, tentandoDeNovo, tentarDeNovo, recarregar } = useRecurso(listarMeusPedidos);

  const pedidos = [...(dados ?? [])].sort((a, b) => b.dataHora.localeCompare(a.dataHora));
  const andamento = pedidos.filter((p) => emAndamento(p.status));
  const anteriores = pedidos.filter((p) => !emAndamento(p.status));

  // A partir de 1100px: lista à esquerda e o pedido escolhido à direita (como no app Mail).
  const telaLarga = useTelaLarga();
  const computador = useComputador();
  const tituloGrande = useRef<HTMLHeadingElement>(null);
  const [escolhido, setEscolhido] = useState<number | null>(null);
  const ordenados = [...andamento, ...anteriores];
  const selecionado = ordenados.find((p) => p.id === escolhido)?.id ?? ordenados[0]?.id ?? null;
  const dividir = telaLarga && selecionado !== null;
  const escolher = dividir ? (id: number) => setEscolhido(id) : undefined;

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
        <h1 ref={tituloGrande} className={estilos.titulo}>
          Pedidos
        </h1>
      </header>
      {!computador && <TituloCompacto titulo="Pedidos" alvo={tituloGrande} />}

      <div className={`${estilos.corpo} ${dividir ? estilos.dividido : ""}`}>
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
            <div className={estilos.listaPedidos}>
              {andamento.length > 0 && (
                <Secao titulo="Em andamento" pedidos={andamento} selecionado={dividir ? selecionado : null} aoEscolher={escolher} />
              )}
              {anteriores.length > 0 && (
                <Secao titulo="Anteriores" pedidos={anteriores} selecionado={dividir ? selecionado : null} aoEscolher={escolher} />
              )}
            </div>
            {dividir && (
              <section className={estilos.detalhe} aria-label={`Pedido #${selecionado}`}>
                <AcompanharPedido key={selecionado} idPedido={selecionado} />
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
}

function resumoItens(pedido: Pedido): string {
  return pedido.itens.map((i) => `${i.quantidade}× ${i.nome}`).join(", ");
}

interface PropsSecao {
  titulo: string;
  pedidos: Pedido[];
  /** Pedido aberto no detalhe ao lado (só na tela larga). */
  selecionado: number | null;
  aoEscolher?: (id: number) => void;
}

function Secao({ titulo, pedidos, selecionado, aoEscolher }: PropsSecao) {
  // Na tela larga o clique abre o pedido ao lado; o link continua valendo para abrir em nova aba.
  const clicar = (id: number) => (evento: MouseEvent) => {
    if (!aoEscolher || evento.metaKey || evento.ctrlKey || evento.shiftKey) return;
    evento.preventDefault();
    aoEscolher(id);
  };
  return (
    <section className={estilos.secao} aria-label={titulo}>
      <span className="section-label">{titulo}</span>
      <ul className={estilos.grupo}>
        {pedidos.map((pedido) => (
          <li key={pedido.id}>
            <Link
              to={`/pedidos/${pedido.id}`}
              className={`${estilos.linhaPedido} ${pedido.id === selecionado ? estilos.linhaSelecionada : ""}`}
              aria-current={pedido.id === selecionado ? "true" : undefined}
              onClick={clicar(pedido.id)}
            >
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
