import { SegmentedControl } from "../../components/SegmentedControl";
import { TextField } from "../../components/TextField";
import { mascararCartao } from "../../lib/cartao";
import type { useConfirmarPedido } from "./useConfirmarPedido";
import estilos from "./Carrinho.module.css";

type Checkout = ReturnType<typeof useConfirmarPedido>;

/** Forma de pagamento (PIX ou cartão), igual na folha e no carrinho lateral. */
export function Pagamento({ checkout, tamanho = "grande" }: { checkout: Checkout; tamanho?: "grande" | "medio" }) {
  const { metodo, setMetodo, cartao, setCartao, setCartaoTocado, erroCartao } = checkout;
  return (
    <div className={estilos.pagamento}>
      <span className="section-label" id="rotulo-pagamento">
        Forma de pagamento
      </span>
      <SegmentedControl
        rotulo="Forma de pagamento"
        tamanho={tamanho}
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
  );
}
