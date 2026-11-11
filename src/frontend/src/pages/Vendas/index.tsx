import { useCallback, useEffect, useState } from "react";
import { mensagemDeErro } from "../../api/http";
import { buscarRelatorioVendas } from "../../api/vendas";
import { EmptyState, EstadoErro } from "../../components/EmptyState";
import { IconeVendas } from "../../components/Icones";
import { SegmentedControl } from "../../components/SegmentedControl";
import { Carregando, Skeleton } from "../../components/Skeleton";
import { descreverPeriodo, ultimosDias } from "../../lib/datas";
import { formatarPreco } from "../../lib/formatar";
import type { RelatorioVendas } from "../../types";
import estilos from "./Vendas.module.css";

type Periodo = "1" | "7" | "30";

const PERIODOS: Array<{ valor: Periodo; rotulo: string }> = [
  { valor: "1", rotulo: "Hoje" },
  { valor: "7", rotulo: "7 dias" },
  { valor: "30", rotulo: "30 dias" },
];

const numero = new Intl.NumberFormat("pt-BR");

export function Vendas() {
  const [periodo, setPeriodo] = useState<Periodo>("7");
  const [relatorio, setRelatorio] = useState<RelatorioVendas | null>(null);
  const [erro, setErro] = useState<unknown>(null);
  const [atualizando, setAtualizando] = useState(true);
  const [tentativa, setTentativa] = useState(0);
  const { inicio, fim } = ultimosDias(Number(periodo));

  // Busca ao abrir e a cada troca de período (os números antigos ficam na tela, apagados, até chegar o novo).
  useEffect(() => {
    let ativo = true;
    buscarRelatorioVendas(inicio, fim).then(
      (r) => {
        if (!ativo) return;
        setRelatorio(r);
        setErro(null);
        setAtualizando(false);
      },
      (e: unknown) => {
        if (!ativo) return;
        setErro(e);
        setAtualizando(false);
      },
    );
    return () => {
      ativo = false;
    };
  }, [inicio, fim, tentativa]);

  const escolher = useCallback((p: Periodo) => {
    setPeriodo(p);
    setAtualizando(true);
  }, []);

  const tentarDeNovo = () => {
    setAtualizando(true);
    setTentativa((t) => t + 1);
  };

  const porProduto = [...(relatorio?.porProduto ?? [])].sort((a, b) => b.quantidade - a.quantidade);
  const maior = Math.max(1, ...porProduto.map((p) => p.quantidade));
  const ticketMedio = relatorio && relatorio.quantidadePedidos > 0 ? relatorio.totalVendido / relatorio.quantidadePedidos : null;

  return (
    <>
      <div className={estilos.topo}>
        <header className={estilos.cabecalho}>
          <h1 className={estilos.titulo}>Vendas</h1>
          <p className={estilos.subtitulo}>{descreverPeriodo(inicio, fim)} · pedidos cancelados não entram</p>
        </header>
        <SegmentedControl
          className={estilos.periodo}
          rotulo="Período"
          papel="tablist"
          opcoes={PERIODOS}
          valor={periodo}
          aoMudar={escolher}
        />
      </div>

      {!relatorio && atualizando ? (
        <Carregando rotulo="Carregando vendas…">
          <div className={estilos.indicadores}>
            {[0, 1, 2].map((i) => (
              <div key={i} className={estilos.indicador}>
                <Skeleton largura="50%" altura={13} />
                <Skeleton largura="70%" altura={30} />
              </div>
            ))}
          </div>
        </Carregando>
      ) : erro && !relatorio ? (
        <div className={estilos.estado}>
          <EstadoErro mensagem={mensagemDeErro(erro)} aoTentarDeNovo={tentarDeNovo} tentando={atualizando} />
        </div>
      ) : relatorio ? (
        <div className={estilos.conteudo} aria-busy={atualizando}>
          <dl className={estilos.indicadores}>
            <div className={estilos.indicador}>
              <dt>Total vendido</dt>
              <dd>{formatarPreco(relatorio.totalVendido)}</dd>
            </div>
            <div className={estilos.indicador}>
              <dt>Pedidos</dt>
              <dd>{numero.format(relatorio.quantidadePedidos)}</dd>
            </div>
            <div className={estilos.indicador}>
              <dt>Ticket médio</dt>
              <dd>{ticketMedio === null ? "—" : formatarPreco(ticketMedio)}</dd>
            </div>
          </dl>

          <section className={estilos.secao} aria-labelledby="titulo-por-produto">
            <h2 id="titulo-por-produto" className={estilos.secaoTitulo}>
              Quantidade vendida por produto
            </h2>
            <p className={estilos.secaoDica}>
              Use para planejar a próxima compra: compre mais do que sai e menos do que sobra, evitando desperdício
              (ODS 12).
            </p>
            {porProduto.length === 0 ? (
              <div className={estilos.estado}>
                <EmptyState
                  icone={<IconeVendas tamanho={26} />}
                  titulo="Nenhuma venda neste período"
                  descricao="Escolha um período maior para ver os produtos vendidos."
                />
              </div>
            ) : (
              <div className={estilos.tabelaCaixa}>
                <table className={estilos.tabela}>
                  <thead>
                    <tr>
                      <th scope="col">Produto</th>
                      <th scope="col" className={estilos.colunaBarra}>
                        <span className="sr-only">Comparação</span>
                      </th>
                      <th scope="col" className={estilos.numero}>
                        Quantidade
                      </th>
                      <th scope="col" className={`${estilos.numero} ${estilos.colunaTotal}`}>
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {porProduto.map((item) => (
                      <tr key={item.produtoId}>
                        <td className={estilos.nome}>
                          {item.nome}
                          <span className={estilos.totalMovel}>{formatarPreco(item.total)}</span>
                        </td>
                        <td className={estilos.colunaBarra} aria-hidden="true">
                          <span className={estilos.barra} style={{ width: `${(item.quantidade / maior) * 100}%` }} />
                        </td>
                        <td className={`${estilos.numero} ${estilos.quantidade}`}>{numero.format(item.quantidade)}</td>
                        <td className={`${estilos.numero} ${estilos.colunaTotal}`}>{formatarPreco(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}
