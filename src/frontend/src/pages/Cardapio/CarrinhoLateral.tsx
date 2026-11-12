import { Button } from "../../components/Button";
import { Stepper } from "../../components/Stepper";
import { useCarrinho } from "../../contexts/useCarrinho";
import { formatarPreco } from "../../lib/formatar";
import { Pagamento } from "./Pagamento";
import { useConfirmarPedido } from "./useConfirmarPedido";
import estilos from "./Carrinho.module.css";

/** Carrinho do computador: coluna fixa à direita do cardápio, sempre visível. */
export function CarrinhoLateral({ aoEstoqueMudar }: { aoEstoqueMudar: () => void }) {
  const { itens, total, adicionar, remover } = useCarrinho();
  const checkout = useConfirmarPedido({ aoEstoqueMudar });
  const vazio = itens.length === 0;

  return (
    <aside className={estilos.lateral} aria-labelledby="titulo-carrinho">
      <h2 id="titulo-carrinho" className={estilos.lateralTitulo}>
        Seu pedido
      </h2>

      {vazio ? (
        <p className={estilos.lateralVazio}>Adicione itens do cardápio.</p>
      ) : (
        <>
          <ul className={estilos.lateralItens} aria-label="Itens do pedido">
            {itens.map(({ produto, quantidade }) => (
              <li key={produto.id} className={estilos.lateralItem}>
                <div className={estilos.lateralLinha}>
                  <span className={estilos.lateralNome}>{produto.nome}</span>
                  <span className={estilos.itemSubtotal}>{formatarPreco(produto.preco * quantidade)}</span>
                </div>
                <div className={estilos.lateralLinha}>
                  <span className={estilos.itemUnitario}>{formatarPreco(produto.preco)} cada</span>
                  <Stepper
                    compacto
                    variante="carrinho"
                    quantidade={quantidade}
                    nome={produto.nome}
                    maximo={produto.quantidadeEstoque}
                    aoMais={() => adicionar(produto)}
                    aoMenos={() => remover(produto.id)}
                  />
                </div>
              </li>
            ))}
          </ul>
          <Pagamento checkout={checkout} tamanho="medio" />
        </>
      )}

      <div className={estilos.lateralRodape}>
        <div className={`${estilos.total} ${estilos.lateralTotal}`}>
          <span className={estilos.totalRotulo}>Total · retirar no balcão</span>
          <span className={estilos.totalValor}>{formatarPreco(total)}</span>
        </div>
        <Button
          tamanho="grande"
          larguraTotal
          disabled={vazio}
          carregando={checkout.enviando}
          onClick={checkout.confirmar}
        >
          Confirmar pedido
        </Button>
      </div>
    </aside>
  );
}
