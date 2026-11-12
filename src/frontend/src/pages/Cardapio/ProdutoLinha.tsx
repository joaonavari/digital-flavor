import { useState, type CSSProperties } from "react";
import { BotaoIcone } from "../../components/Button";
import { ProdutoFoto } from "../../components/ProdutoFoto";
import { Stepper } from "../../components/Stepper";
import { formatarPreco } from "../../lib/formatar";
import { POUCAS_UNIDADES } from "../../lib/produto";
import type { Produto } from "../../types";
import estilos from "./Cardapio.module.css";


interface Props {
  produto: Produto;
  quantidade: number;
  aoAdicionar: () => void;
  aoRemover: () => void;
  /** Atraso da entrada em cascata; ausente = sem animação. */
  atrasoEntrada?: number;
}

export function ProdutoLinha({ produto, quantidade, aoAdicionar, aoRemover, atrasoEntrada }: Props) {
  const animar = atrasoEntrada !== undefined;
  // O stepper só anima quando nasce de um toque no "+", nunca ao filtrar a lista.
  const [tocouMais, setTocouMais] = useState(false);
  return (
    <li
      className={`${estilos.produto} ${animar ? estilos.entrada : ""} ${quantidade > 0 ? estilos.comStepper : ""}`}
      style={animar ? ({ "--atraso": `${atrasoEntrada}ms` } as CSSProperties) : undefined}
    >
      <ProdutoFoto nome={produto.nome} imagemUrl={produto.imagemUrl} />
      <div className={estilos.texto}>
        <span className={estilos.nome}>{produto.nome}</span>
        {produto.descricao && <span className={estilos.descricao}>{produto.descricao}</span>}
        <span className={estilos.linhaPreco}>
          <span className={estilos.preco}>{formatarPreco(produto.preco)}</span>
          {produto.quantidadeEstoque <= POUCAS_UNIDADES && (
            <span className={estilos.ultimas}>
              {produto.quantidadeEstoque === 1 ? "Última unidade" : `Últimas ${produto.quantidadeEstoque} unidades`}
            </span>
          )}
        </span>
      </div>
      <div className={estilos.acao}>
        {quantidade > 0 ? (
          <div key="stepper" className={tocouMais ? estilos.troca : undefined}>
            <Stepper
              quantidade={quantidade}
              nome={produto.nome}
              maximo={produto.quantidadeEstoque}
              aoMais={aoAdicionar}
              aoMenos={aoRemover}
            />
          </div>
        ) : (
          <BotaoIcone key="mais" rotulo={`Adicionar ${produto.nome}`} variante="primario" tamanho={44} onClick={() => {
              setTocouMais(true);
              aoAdicionar();
            }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </BotaoIcone>
        )}
      </div>
    </li>
  );
}
