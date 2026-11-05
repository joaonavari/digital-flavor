import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Produto } from "../types";
import { CarrinhoContexto, type ItemCarrinho, type ValorCarrinho } from "./carrinhoContexto";
import { useAuth } from "./useAuth";

/** O carrinho fica só no front: em memória e no localStorage, um por usuário. */
const chave = (usuarioId: number) => `df.carrinho.${usuarioId}`;

function ler(usuarioId: number | null): ItemCarrinho[] {
  if (usuarioId === null) return [];
  try {
    const salvo = localStorage.getItem(chave(usuarioId));
    const itens = salvo ? (JSON.parse(salvo) as ItemCarrinho[]) : [];
    return Array.isArray(itens) ? itens.filter((i) => i?.produto && i.quantidade > 0) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { estado } = useAuth();
  const usuarioId = estado.usuario?.id ?? null;

  // Troca de usuário (ou logout) recarrega o carrinho certo.
  const [dono, setDono] = useState(usuarioId);
  const [itens, setItens] = useState<ItemCarrinho[]>(() => ler(usuarioId));
  if (dono !== usuarioId) {
    setDono(usuarioId);
    setItens(ler(usuarioId));
  }

  // Leitura estável dos itens para o sincronizar (sem recriar a função a cada mudança).
  const itensRef = useRef(itens);
  useEffect(() => {
    itensRef.current = itens;
  }, [itens]);

  useEffect(() => {
    if (usuarioId === null) return;
    try {
      if (itens.length) localStorage.setItem(chave(usuarioId), JSON.stringify(itens));
      else localStorage.removeItem(chave(usuarioId));
    } catch {
      /* sem armazenamento: o carrinho vale só nesta aba */
    }
  }, [itens, usuarioId]);

  const adicionar = useCallback((produto: Produto) => {
    setItens((atual) => {
      const existente = atual.find((i) => i.produto.id === produto.id);
      if (!existente) return produto.quantidadeEstoque > 0 ? [...atual, { produto, quantidade: 1 }] : atual;
      if (existente.quantidade >= produto.quantidadeEstoque) return atual;
      return atual.map((i) => (i.produto.id === produto.id ? { produto, quantidade: i.quantidade + 1 } : i));
    });
  }, []);

  const remover = useCallback((produtoId: number) => {
    setItens((atual) =>
      atual
        .map((i) => (i.produto.id === produtoId ? { ...i, quantidade: i.quantidade - 1 } : i))
        .filter((i) => i.quantidade > 0),
    );
  }, []);

  const limpar = useCallback(() => setItens([]), []);

  const sincronizar = useCallback(
    (produtos: Produto[]) => {
      const porId = new Map(produtos.map((p) => [p.id, p]));
      const removidos: string[] = [];
      const reduzidos: string[] = [];
      const novos: ItemCarrinho[] = [];
      for (const item of itensRef.current) {
        const atual = porId.get(item.produto.id);
        if (!atual || atual.quantidadeEstoque <= 0) {
          removidos.push(item.produto.nome);
          continue;
        }
        const quantidade = Math.min(item.quantidade, atual.quantidadeEstoque);
        if (quantidade < item.quantidade) reduzidos.push(atual.nome);
        novos.push({ produto: atual, quantidade });
      }
      itensRef.current = novos;
      setItens(novos);
      return { removidos, reduzidos };
    },
    [],
  );

  const valor = useMemo<ValorCarrinho>(() => {
    const totalItens = itens.reduce((s, i) => s + i.quantidade, 0);
    const total = Math.round(itens.reduce((s, i) => s + i.produto.preco * i.quantidade, 0) * 100) / 100;
    return {
      itens,
      totalItens,
      total,
      quantidadeDe: (id) => itens.find((i) => i.produto.id === id)?.quantidade ?? 0,
      adicionar,
      remover,
      limpar,
      sincronizar,
    };
  }, [itens, adicionar, remover, limpar, sincronizar]);

  return <CarrinhoContexto.Provider value={valor}>{children}</CarrinhoContexto.Provider>;
}
