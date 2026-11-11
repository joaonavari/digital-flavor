import { useContext } from "react";
import { CarrinhoContexto, type ValorCarrinho } from "./carrinhoContexto";

export function useCarrinho(): ValorCarrinho {
  const valor = useContext(CarrinhoContexto);
  if (!valor) throw new Error("useCarrinho precisa estar dentro de <CartProvider>.");
  return valor;
}
