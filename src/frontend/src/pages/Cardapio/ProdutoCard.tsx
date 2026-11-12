import { useState, type CSSProperties } from "react";
import { BotaoIcone } from "../../components/Button";
import { Stepper } from "../../components/Stepper";
import { formatarPreco } from "../../lib/formatar";
import { POUCAS_UNIDADES } from "../../lib/produto";
import { inicial } from "../../lib/texto";
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

/** Produto em card, na grade do cardápio do computador. */
export function ProdutoCard({ produto, quantidade, aoAdicionar, aoRemover, atrasoEntrada }: Props) {
  const animar = atrasoEntrada !== undefined;
  const [tocouMais, setTocouMais] = useState(false);
  const [falhou, setFalhou] = useState<string | null>(null);
  const foto = produto.imagemUrl && falhou !== produto.imagemUrl ? produto.imagemUrl : null;

  return (
    <li
      className={`${estilos.card} ${animar ? estilos.entrada : ""}`}
      style={animar ? ({ "--atraso": `${atrasoEntrada}ms` } as CSSProperties) : undefined}
    >
      <div className={estilos.cardFoto} aria-hidden="true">
        {foto ? (
          <img src={foto} alt="" loading="lazy" decoding="async" onError={() => setFalhou(foto)} />
        ) : (
          inicial(produto.nome)
        )}
      </div>
      <div className={estilos.cardTexto}>
        <span className={estilos.cardNome}>{produto.nome}</span>
        {produto.descricao && <span className={estilos.descricao}>{produto.descricao}</span>}
        {produto.quantidadeEstoque <= POUCAS_UNIDADES && (
          <span className={estilos.ultimas}>
            {produto.quantidadeEstoque === 1 ? "Última unidade" : `Últimas ${produto.quantidadeEstoque} unidades`}
          </span>
        )}
      </div>
      <div className={estilos.cardRodape}>
        <span className={estilos.cardPreco}>{formatarPreco(produto.preco)}</span>
        {quantidade > 0 ? (
          <div key="stepper" className={tocouMais ? estilos.troca : undefined}>
            <Stepper
              compacto
              quantidade={quantidade}
              nome={produto.nome}
              maximo={produto.quantidadeEstoque}
              aoMais={aoAdicionar}
              aoMenos={aoRemover}
            />
          </div>
        ) : (
          <BotaoIcone
            key="mais"
            rotulo={`Adicionar ${produto.nome}`}
            variante="primario"
            tamanho={36}
            onClick={() => {
              setTocouMais(true);
              aoAdicionar();
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </BotaoIcone>
        )}
      </div>
    </li>
  );
}
