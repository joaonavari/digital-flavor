import { useEffect, useRef, useState } from "react";
import { ajustarEstoque } from "../../api/produtos";
import { notificar } from "../../lib/notificar";
import { LIMITES_PRODUTO } from "../../lib/produto";
import type { Produto } from "../../types";
import estilos from "./Produtos.module.css";

interface Props {
  produto: Produto;
  aoAtualizar: (produto: Produto) => void;
}

const ESPERA_MS = 500;

/**
 * Ajuste rápido de estoque: − / número / +.
 * A tela muda na hora; o PATCH sai só quando a pessoa para de mexer (vários cliques = uma requisição).
 */
export function AjusteEstoque({ produto, aoAtualizar }: Props) {
  const [rascunho, setRascunho] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const temporizador = useRef<number | undefined>(undefined);
  const confirmado = useRef(produto.quantidadeEstoque);

  useEffect(() => {
    confirmado.current = produto.quantidadeEstoque;
  }, [produto.quantidadeEstoque]);

  useEffect(() => () => window.clearTimeout(temporizador.current), []);

  const valor = rascunho ?? String(produto.quantidadeEstoque);
  const numero = Number(valor);

  async function enviar(quantidade: number) {
    if (quantidade === confirmado.current) {
      setRascunho(null);
      return;
    }
    setSalvando(true);
    try {
      const atualizado = await ajustarEstoque(produto.id, quantidade);
      confirmado.current = atualizado.quantidadeEstoque;
      aoAtualizar(atualizado);
    } catch (erro) {
      notificar.erro(erro, `Não deu para mudar o estoque de ${produto.nome}`);
    } finally {
      setRascunho(null);
      setSalvando(false);
    }
  }

  function agendar(quantidade: number) {
    const limitado = Math.max(0, Math.min(LIMITES_PRODUTO.estoqueMax, quantidade));
    setRascunho(String(limitado));
    window.clearTimeout(temporizador.current);
    temporizador.current = window.setTimeout(() => void enviar(limitado), ESPERA_MS);
  }

  function confirmarDigitado() {
    window.clearTimeout(temporizador.current);
    if (rascunho === null) return;
    if (!/^\d+$/.test(rascunho)) {
      setRascunho(null); // valor inválido: volta ao que estava
      return;
    }
    void enviar(Math.min(LIMITES_PRODUTO.estoqueMax, Number(rascunho)));
  }

  return (
    <div className={estilos.ajuste} role="group" aria-label={`Estoque de ${produto.nome}`} aria-busy={salvando}>
      <button
        type="button"
        className={estilos.ajusteBotao}
        onClick={() => agendar((Number.isFinite(numero) ? numero : 0) - 1)}
        disabled={numero <= 0}
        aria-label={`Tirar 1 do estoque de ${produto.nome}`}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
          <path d="M5 12h14" />
        </svg>
      </button>
      <input
        className={estilos.ajusteNumero}
        inputMode="numeric"
        aria-label={`Quantidade em estoque de ${produto.nome}`}
        value={valor}
        onChange={(e) => {
          window.clearTimeout(temporizador.current);
          setRascunho(e.target.value.replace(/\D/g, "").slice(0, 5));
        }}
        onBlur={confirmarDigitado}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            setRascunho(null);
            e.currentTarget.blur();
          }
        }}
        onFocus={(e) => e.currentTarget.select()}
      />
      <button
        type="button"
        className={estilos.ajusteBotao}
        onClick={() => agendar((Number.isFinite(numero) ? numero : 0) + 1)}
        aria-label={`Somar 1 ao estoque de ${produto.nome}`}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}
