import { useState } from "react";
import { useNavigate } from "react-router";
import { ErroApi } from "../../api/http";
import { confirmarPedido } from "../../api/pedidos";
import { useCarrinho } from "../../contexts/useCarrinho";
import { detectarBandeira, digitosCartao, validarCartao } from "../../lib/cartao";
import { formatarPreco } from "../../lib/formatar";
import { notificar } from "../../lib/notificar";
import type { DadosPagamento, MetodoPagamento } from "../../types";

/**
 * Pagamento e confirmação do pedido, usados pela folha do carrinho (celular)
 * e pelo carrinho fixo ao lado do cardápio (computador).
 */
export function useConfirmarPedido({ aoEstoqueMudar, aoConcluir }: { aoEstoqueMudar: () => void; aoConcluir?: () => void }) {
  const { itens, limpar } = useCarrinho();
  const navegar = useNavigate();
  const [metodo, setMetodo] = useState<MetodoPagamento>("PIX");
  const [cartao, setCartao] = useState("");
  const [cartaoTocado, setCartaoTocado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const erroCartao = metodo === "CARTAO" && cartaoTocado ? validarCartao(cartao) : null;

  // O número digitado é descartado da memória.
  function esquecerCartao() {
    setCartao("");
    setCartaoTocado(false);
  }

  async function confirmar() {
    if (metodo === "CARTAO" && validarCartao(cartao)) {
      setCartaoTocado(true);
      document.getElementById("numero-cartao")?.focus();
      return;
    }
    setEnviando(true);
    try {
      // O número do cartão só existe aqui na memória e no corpo deste POST; nunca é salvo.
      const bandeira = detectarBandeira(cartao);
      const pagamento: DadosPagamento =
        metodo === "PIX"
          ? { metodo: "PIX" }
          : { metodo: "CARTAO", numeroCartao: digitosCartao(cartao), parcelas: 1, ...(bandeira ? { bandeira } : {}) };
      const pedido = await confirmarPedido({
        itens: itens.map((i) => ({ produtoId: i.produto.id, quantidade: i.quantidade })),
        pagamento,
      });
      limpar();
      esquecerCartao();
      aoConcluir?.();
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

  return {
    metodo,
    setMetodo,
    cartao,
    setCartao,
    setCartaoTocado,
    erroCartao,
    enviando,
    confirmar,
    esquecerCartao,
  };
}
