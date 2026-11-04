import { useState } from "react";
import { useNavigate } from "react-router";
import { ErroApi } from "../../api/http";
import { confirmarPedido } from "../../api/pedidos";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { SegmentedControl } from "../../components/SegmentedControl";
import { Sheet } from "../../components/Sheet";
import { Stepper } from "../../components/Stepper";
import { TextField } from "../../components/TextField";
import { useCarrinho } from "../../contexts/useCarrinho";
import { digitosCartao, mascararCartao, validarCartao } from "../../lib/cartao";
import { formatarPreco } from "../../lib/formatar";
import { notificar } from "../../lib/notificar";
import type { MetodoPagamento } from "../../types";
import estilos from "./Carrinho.module.css";

interface Props {
  aberto: boolean;
  aoFechar: () => void;
  /** Chamado quando o back recusa por estoque (422): o cardápio recarrega o estoque. */
  aoEstoqueMudar: () => void;
}

export function CarrinhoSheet({ aberto, aoFechar, aoEstoqueMudar }: Props) {
  const { itens, total, adicionar, remover, limpar } = useCarrinho();
  const navegar = useNavigate();
  const [metodo, setMetodo] = useState<MetodoPagamento>("PIX");
  const [cartao, setCartao] = useState("");
  const [cartaoTocado, setCartaoTocado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const erroCartao = metodo === "CARTAO" && cartaoTocado ? validarCartao(cartao) : null;
  const vazio = itens.length === 0;

  async function confirmar() {
    if (metodo === "CARTAO" && validarCartao(cartao)) {
      setCartaoTocado(true);
      document.getElementById("numero-cartao")?.focus();
      return;
    }
    setEnviando(true);
    try {
      const pedido = await confirmarPedido({
        itens: itens.map((i) => ({ produtoId: i.produto.id, quantidade: i.quantidade })),
        pagamento: metodo === "PIX" ? { metodo: "PIX" } : { metodo: "CARTAO", numeroCartao: digitosCartao(cartao) },
      });
      limpar();
      setCartao("");
      setCartaoTocado(false);
      aoFechar();
      notificar.sucesso("Pedido confirmado", `Pedido #${pedido.id} · ${formatarPreco(pedido.total)}`);
      navegar(`/pedidos/${pedido.id}`);
    } catch (erro) {
      if (erro instanceof ErroApi && erro.status === 422) {
        // Estoque mudou: mostra a mensagem do back e mantém o carrinho.
        notificar.erro(erro, "Não deu para confirmar");
        aoEstoqueMudar();
      } else if (erro instanceof ErroApi && erro.ehErroDeRede) {
        notificar.erro(erro, "Sem conexão");
      } else {
        notificar.erro(erro);
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Sheet
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Seu pedido"
      rodape={
        vazio ? undefined : (
          <>
            <div className={estilos.total}>
              <span className={estilos.totalRotulo}>Total · retirar no balcão</span>
              <span className={estilos.totalValor}>{formatarPreco(total)}</span>
            </div>
            <Button tamanho="grande" larguraTotal carregando={enviando} onClick={confirmar}>
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
          acao={{ rotulo: "Ver cardápio", aoClicar: aoFechar }}
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

          <div className={estilos.pagamento}>
            <span className="section-label" id="rotulo-pagamento">
              Forma de pagamento
            </span>
            <SegmentedControl
              rotulo="Forma de pagamento"
              tamanho="grande"
              opcoes={[
                { valor: "PIX", rotulo: "PIX" },
                { valor: "CARTAO", rotulo: "Cartão" },
              ]}
              valor={metodo}
              aoMudar={setMetodo}
            />
            {metodo === "CARTAO" ? (
              <>
                <TextField
                  id="numero-cartao"
                  className={estilos.campoCartao}
                  rotulo="Número do cartão"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="0000 0000 0000 0000"
                  maxLength={23}
                  value={cartao}
                  onChange={(e) => setCartao(mascararCartao(e.target.value))}
                  onBlur={() => cartao && setCartaoTocado(true)}
                  erro={erroCartao}
                />
                <p className={estilos.nota}>Guardamos só os 4 últimos dígitos.</p>
              </>
            ) : (
              <p className={estilos.nota}>O código PIX aparece depois de confirmar.</p>
            )}
          </div>
        </>
      )}
    </Sheet>
  );
}
