import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { mensagemDeErro } from "../../api/http";
import { listarCardapio } from "../../api/produtos";
import { EmptyState, EstadoErro } from "../../components/EmptyState";
import { IconeCardapio } from "../../components/Icones";
import { SeletorCategorias } from "../../components/SeletorCategorias";
import { Carregando, Skeleton } from "../../components/Skeleton";
import { useAuth } from "../../contexts/useAuth";
import { useCarrinho } from "../../contexts/useCarrinho";
import { useComputador } from "../../hooks/useLargura";
import { useRecurso } from "../../hooks/useRecurso";
import { useContextoAluno } from "../../layouts/contextoAluno";
import { formatarPreco } from "../../lib/formatar";
import { notificar } from "../../lib/notificar";
import { plural } from "../../lib/texto";
import type { Produto } from "../../types";
import { CarrinhoLateral } from "./CarrinhoLateral";
import { CarrinhoSheet } from "./CarrinhoSheet";
import { ProdutoCard } from "./ProdutoCard";
import { ProdutoLinha } from "./ProdutoLinha";
import estilos from "./Cardapio.module.css";

const TODOS = "Todos";

/** Intervalos da cascata: diminuem a cada item e param em 195ms (total abaixo de 300ms + duração). */
const ATRASOS = [0, 50, 90, 120, 145, 165, 180, 190];
const atraso = (i: number) => ATRASOS[i] ?? 195;

export function Cardapio() {
  const { estado } = useAuth();
  const carrinho = useCarrinho();
  const { acessorio } = useContextoAluno();
  const reduzirMovimento = useReducedMotion() ?? false;
  // A partir de 900px: grade de cards + carrinho fixo à direita (sem barra nem folha).
  const computador = useComputador();
  // Ao chegar o cardápio, o carrinho acompanha preços e estoque.
  const { sincronizar } = carrinho;
  const buscar = useCallback(async () => {
    const lista = await listarCardapio();
    const { removidos, reduzidos } = sincronizar(lista);
    if (removidos.length) notificar.info("Carrinho atualizado", `${removidos.join(", ")} saiu do cardápio.`);
    else if (reduzidos.length)
      notificar.info("Carrinho atualizado", `Ajustamos a quantidade de ${reduzidos.join(", ")} ao estoque.`);
    return lista;
  }, [sincronizar]);
  const { dados: produtos, erro, carregando, tentandoDeNovo, tentarDeNovo, recarregar } = useRecurso(buscar);

  const [categoria, setCategoria] = useState(TODOS);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  // Janela alargada com a folha aberta: a folha fecha (no computador o carrinho já está ao lado).
  const [eraComputador, setEraComputador] = useState(computador);
  if (eraComputador !== computador) {
    setEraComputador(computador);
    if (computador) setCarrinhoAberto(false);
  }
  const barraVisivel = !computador && carrinho.totalItens > 0 && !carrinhoAberto;
  // A cascata roda só na primeira carga; trocar de categoria nunca anima a lista.
  const [animarEntrada, setAnimarEntrada] = useState(true);

  const primeiroNome = estado.usuario?.nome.trim().split(/\s+/)[0];

  const categorias = useMemo(() => {
    const unicas = new Set<string>();
    produtos?.forEach((p) => p.categoria?.trim() && unicas.add(p.categoria.trim()));
    return [TODOS, ...[...unicas].sort((a, b) => a.localeCompare(b, "pt-BR"))];
  }, [produtos]);

  const categoriaAtual = categorias.includes(categoria) ? categoria : TODOS;
  const visiveis = useMemo(
    () => (produtos ?? []).filter((p) => categoriaAtual === TODOS || p.categoria?.trim() === categoriaAtual),
    [produtos, categoriaAtual],
  );

  // Depois da primeira cascata, a lista não anima mais.
  useEffect(() => {
    if (!produtos || !animarEntrada) return;
    const id = window.setTimeout(() => setAnimarEntrada(false), 600);
    return () => window.clearTimeout(id);
  }, [produtos, animarEntrada]);

  function escolherCategoria(nova: string) {
    setAnimarEntrada(false);
    setCategoria(nova);
  }

  const Item = computador ? ProdutoCard : ProdutoLinha;

  return (
    <>
      <div className={estilos.pagina} data-barra={barraVisivel || undefined}>
        <div className={estilos.principal}>
          <div className={estilos.topo}>
            <header className={estilos.cabecalho}>
              {primeiroNome && <p className={estilos.saudacao}>Olá, {primeiroNome}</p>}
              <h1 className={estilos.titulo}>Cardápio</h1>
            </header>
            {carregando ? (
              <div className={estilos.categorias} aria-hidden="true">
                <Skeleton altura={44} raio={999} />
              </div>
            ) : (
              produtos?.length && categorias.length > 1 ? (
                <div className={estilos.categorias}>
                  <SeletorCategorias categorias={categorias} valor={categoriaAtual} aoMudar={escolherCategoria} />
                </div>
              ) : null
            )}
          </div>

          {carregando ? (
            <Carregando rotulo="Carregando o cardápio…">
              <div className={computador ? estilos.grade : estilos.lista}>
                {[0, 1, 2, 3, 4].map((i) =>
                  computador ? (
                    <div key={i} className={estilos.card}>
                      <Skeleton altura={120} raio={14} />
                      <Skeleton largura={`${70 - i * 6}%`} altura={16} />
                      <Skeleton largura="50%" altura={13} />
                      <Skeleton largura={56} altura={16} />
                    </div>
                  ) : (
                    <div key={i} className={estilos.esqueleto}>
                      <Skeleton largura={64} altura={64} raio={16} />
                      <div className={estilos.esqueletoTexto}>
                        <Skeleton largura={`${70 - i * 6}%`} altura={17} />
                        <Skeleton largura="50%" altura={13} />
                        <Skeleton largura={56} altura={15} />
                      </div>
                    </div>
                  ),
                )}
              </div>
            </Carregando>
          ) : erro && !produtos ? (
            <div className={estilos.estado}>
              <EstadoErro mensagem={mensagemDeErro(erro)} aoTentarDeNovo={tentarDeNovo} tentando={tentandoDeNovo} />
            </div>
          ) : !produtos?.length ? (
            <div className={estilos.estado}>
              <EmptyState
                icone={<IconeCardapio tamanho={26} />}
                titulo="Nada no cardápio agora"
                descricao="A cantina ainda não publicou os produtos de hoje. Tente de novo daqui a pouco."
                acao={{ rotulo: "Atualizar", aoClicar: tentarDeNovo, carregando: tentandoDeNovo }}
              />
            </div>
          ) : visiveis.length === 0 ? (
            <div className={estilos.estado}>
              <EmptyState titulo={`Nada em ${categoriaAtual} agora`} descricao="Veja as outras categorias." />
            </div>
          ) : (
            <ul className={computador ? estilos.grade : estilos.lista} aria-label={`Produtos: ${categoriaAtual}`}>
              {visiveis.map((produto: Produto, i) => (
                <Item
                  key={produto.id}
                  produto={produto}
                  quantidade={carrinho.quantidadeDe(produto.id)}
                  aoAdicionar={() => carrinho.adicionar(produto)}
                  aoRemover={() => carrinho.remover(produto.id)}
                  atrasoEntrada={animarEntrada ? atraso(i) : undefined}
                />
              ))}
            </ul>
          )}
        </div>

        {computador && <CarrinhoLateral aoEstoqueMudar={() => void recarregar()} />}
      </div>

      {acessorio &&
        createPortal(
          <AnimatePresence>
            {barraVisivel && (
              <motion.button
                key="barra"
                type="button"
                className={estilos.barra}
                onClick={() => setCarrinhoAberto(true)}
                initial={reduzirMovimento ? { opacity: 0 } : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.23, 1, 0.32, 1] } }}
                exit={reduzirMovimento ? { opacity: 0 } : { opacity: 0, y: 16, transition: { duration: 0.15, ease: [0.23, 1, 0.32, 1] } }}
                aria-label={`Ver carrinho: ${plural(carrinho.totalItens, "item", "itens")}, total ${formatarPreco(carrinho.total)}`}
              >
                <span className={estilos.barraEsquerda} aria-hidden="true">
                  <span className={estilos.contador}>{carrinho.totalItens}</span>
                  <span>
                    <span className={estilos.textoLongo}>Ver carrinho</span>
                    <span className={estilos.textoCurto}>Carrinho</span>
                  </span>
                </span>
                <span className={estilos.barraTotal} aria-hidden="true">
                  {formatarPreco(carrinho.total)}
                </span>
              </motion.button>
            )}
          </AnimatePresence>,
          acessorio,
        )}

      <CarrinhoSheet
        aberto={carrinhoAberto && !computador}
        aoFechar={() => setCarrinhoAberto(false)}
        aoEstoqueMudar={() => void recarregar()}
      />
    </>
  );
}
