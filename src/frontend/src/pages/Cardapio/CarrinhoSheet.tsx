import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { Sheet } from "../../components/Sheet";
import { Stepper } from "../../components/Stepper";
import { useCarrinho } from "../../contexts/useCarrinho";
import { formatarPreco } from "../../lib/formatar";
import { Pagamento } from "./Pagamento";
import { useConfirmarPedido } from "./useConfirmarPedido";
import estilos from "./Carrinho.module.css";

interface Props {
  aberto: boolean;
  aoFechar: () => void;
  /** Chamado quando o back recusa por estoque (422): o cardápio recarrega o estoque. */
  aoEstoqueMudar: () => void;
}

/** Carrinho do celular: folha que sobe da barra "Ver carrinho". */
export function CarrinhoSheet({ aberto, aoFechar, aoEstoqueMudar }: Props) {
  const { itens, total, adicionar, remover } = useCarrinho();
  const checkout = useConfirmarPedido({ aoEstoqueMudar, aoConcluir: aoFechar });

  // Fechou a folha: o número digitado é descartado da memória.
  function fechar() {
    checkout.esquecerCartao();
    aoFechar();
  }
  const vazio = itens.length === 0;

  return (
    <Sheet
      aberto={aberto}
      aoFechar={fechar}
      titulo="Seu pedido"
      rodape={
        vazio ? undefined : (
          <>
            <div className={estilos.total}>
              <span className={estilos.totalRotulo}>Total · retirar no balcão</span>
              <span className={estilos.totalValor}>{formatarPreco(total)}</span>
            </div>
            <Button tamanho="grande" larguraTotal carregando={checkout.enviando} onClick={checkout.confirmar}>
              Confirmar pedido
            </Button>
          </>
        )
      }
    >
      {vazio ? (
        <EmptyState
          titulo="Seu carrinho está vazio"
          descricao="Toque no + de um produto para adicioná-lo."
          acao={{ rotulo: "Ver cardápio", aoClicar: fechar }}
        />
      ) : (
        <>
          <ul className={estilos.itens} aria-label="Itens do pedido">
            {itens.map(({ produto, quantidade }) => (
              <li key={produto.id} className={estilos.item}>
                <div className={estilos.itemTexto}>
                  <span className={estilos.itemNome}>{produto.nome}</span>
                  <span className={estilos.itemUnitario}>{formatarPreco(produto.preco)} cada</span>
                </div>
                <Stepper
                  variante="carrinho"
                  quantidade={quantidade}
                  nome={produto.nome}
                  maximo={produto.quantidadeEstoque}
                  aoMais={() => adicionar(produto)}
                  aoMenos={() => remover(produto.id)}
                />
                <span className={estilos.itemSubtotal}>{formatarPreco(produto.preco * quantidade)}</span>
              </li>
            ))}
          </ul>

          <Pagamento checkout={checkout} />
        </>
      )}
    </Sheet>
  );
}
