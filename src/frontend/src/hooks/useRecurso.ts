import { useCallback, useEffect, useRef, useState } from "react";

interface Opcoes {
  /** Recarrega em segundo plano a cada N ms (sem voltar para o estado "carregando"). */
  intervaloMs?: number;
}

/**
 * Busca dados da API com os três estados das telas: carregando, erro e pronto.
 * `buscar` deve ser estável (função do módulo de API ou useCallback).
 */
export function useRecurso<T>(buscar: () => Promise<T>, { intervaloMs }: Opcoes = {}) {
  const [dados, setDados] = useState<T | null>(null);
  const [erro, setErro] = useState<unknown>(null);
  const [carregando, setCarregando] = useState(true);
  const [tentandoDeNovo, setTentandoDeNovo] = useState(false);
  const ativo = useRef(true);

  const executar = useCallback(
    async (silencioso: boolean) => {
      try {
        const resultado = await buscar();
        if (!ativo.current) return null;
        setDados(resultado);
        setErro(null);
        return resultado;
      } catch (e) {
        if (!ativo.current) return null;
        // Numa atualização em segundo plano, mantém os dados antigos na tela.
        if (!silencioso) setErro(e);
        return null;
      } finally {
        if (ativo.current) {
          setCarregando(false);
          setTentandoDeNovo(false);
        }
      }
    },
    [buscar],
  );

  // Carga inicial (o estado só muda quando a resposta chega).
  useEffect(() => {
    ativo.current = true;
    buscar()
      .then(
        (resultado) => {
          if (!ativo.current) return;
          setDados(resultado);
          setErro(null);
        },
        (e: unknown) => {
          if (ativo.current) setErro(e);
        },
      )
      .finally(() => {
        if (ativo.current) setCarregando(false);
      });
    return () => {
      ativo.current = false;
    };
  }, [buscar]);

  useEffect(() => {
    if (!intervaloMs) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void executar(true);
    }, intervaloMs);
    return () => window.clearInterval(id);
  }, [executar, intervaloMs]);

  /** Botão "Tentar de novo" (mostra o estado de carregando no botão). */
  const tentarDeNovo = useCallback(() => {
    setTentandoDeNovo(true);
    return executar(false);
  }, [executar]);

  /** Recarrega sem tirar os dados da tela (ex.: depois de um erro de estoque). */
  const recarregar = useCallback(() => executar(true), [executar]);

  return { dados, setDados, erro, carregando, tentandoDeNovo, tentarDeNovo, recarregar };
}
