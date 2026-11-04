import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { ErroApi, mensagemDeErro } from "../../api/http";
import { alterarProdutoAtivo, excluirProduto, listarTodosProdutos } from "../../api/produtos";
import { AlertDialog } from "../../components/AlertDialog";
import { BotaoIcone, Button } from "../../components/Button";
import { CampoBusca } from "../../components/CampoBusca";
import { EmptyState, EstadoErro } from "../../components/EmptyState";
import { IconeProdutos } from "../../components/Icones";
import { ProdutoFoto } from "../../components/ProdutoFoto";
import { Selo } from "../../components/SeloStatus";
import { Carregando, Skeleton } from "../../components/Skeleton";
import { Switch } from "../../components/Switch";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useRecurso } from "../../hooks/useRecurso";
import { formatarPreco } from "../../lib/formatar";
import { notificar } from "../../lib/notificar";
import { ESTOQUE_BAIXO, normalizar } from "../../lib/produto";
import { plural } from "../../lib/texto";
import type { Produto } from "../../types";
import { AjusteEstoque } from "./AjusteEstoque";
import { FolhaProduto } from "./FormularioProduto";
import estilos from "./Produtos.module.css";

const SAIR = { opacity: 0, transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] } } as const;

const IconeMais = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const IconeEditar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 20h4l10.5-10.5a2.1 2.1 0 00-3-3L5 17v3z" />
  </svg>
);
const IconeLixo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </svg>
);

function SeloEstoque({ quantidade }: { quantidade: number }) {
  if (quantidade === 0) return <Selo cor="vermelho">Sem estoque</Selo>;
  if (quantidade <= ESTOQUE_BAIXO) return <Selo cor="laranja">Acabando</Selo>;
  return null;
}

export function Produtos() {
  const { dados, setDados, erro, carregando, tentandoDeNovo, tentarDeNovo } = useRecurso(listarTodosProdutos);
  // A tabela do mockup precisa de ~1000px de conteúdo: abaixo de 1280px de janela (com a sidebar), usa cards.
  const estreito = useMediaQuery("(max-width: 1279px)");
  const [busca, setBusca] = useState("");
  const [folha, setFolha] = useState<{ aberta: boolean; produto: Produto | null }>({ aberta: false, produto: null });
  // O produto continua guardado enquanto a confirmação some (o título não fica vazio na animação).
  const [paraExcluir, setParaExcluir] = useState<Produto | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const produtos = useMemo(
    () => [...(dados ?? [])].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    [dados],
  );
  const categorias = useMemo(
    () => [...new Set(produtos.map((p) => p.categoria?.trim()).filter((c): c is string => Boolean(c)))].sort(),
    [produtos],
  );
  const termo = normalizar(busca.trim());
  const visiveis = termo
    ? produtos.filter((p) => normalizar(`${p.nome} ${p.categoria ?? ""} ${p.descricao ?? ""}`).includes(termo))
    : produtos;

  const noCardapio = produtos.filter((p) => p.ativo && p.quantidadeEstoque > 0).length;
  const acabando = produtos.filter((p) => p.quantidadeEstoque <= ESTOQUE_BAIXO).length;

  function substituir(produto: Produto) {
    setDados((lista) => (lista ?? []).map((p) => (p.id === produto.id ? produto : p)));
  }

  async function alternarAtivo(produto: Produto, ativo: boolean) {
    substituir({ ...produto, ativo }); // otimista
    try {
      substituir(await alterarProdutoAtivo(produto.id, ativo));
    } catch (e) {
      substituir(produto);
      notificar.erro(e, `Não deu para ${ativo ? "colocar" : "tirar"} ${produto.nome} do cardápio`);
    }
  }

  async function confirmarExclusao() {
    if (!paraExcluir) return;
    setExcluindo(true);
    try {
      const resposta = await excluirProduto(paraExcluir.id);
      if (resposta) {
        // 200: já vendido, o back só desativou.
        substituir(resposta);
        notificar.info("Este produto já foi vendido, então foi tirado do cardápio em vez de excluído");
      } else {
        // 204: apagado de verdade.
        const id = paraExcluir.id;
        setDados((lista) => (lista ?? []).filter((p) => p.id !== id));
        notificar.sucesso("Produto excluído");
      }
      setConfirmando(false);
    } catch (e) {
      notificar.erro(e, e instanceof ErroApi && e.ehErroDeRede ? "Sem conexão" : "Não deu para excluir");
    } finally {
      setExcluindo(false);
    }
  }

  function aoSalvar(produto: Produto, novo: boolean) {
    setDados((lista) => (novo ? [...(lista ?? []), produto] : (lista ?? []).map((p) => (p.id === produto.id ? produto : p))));
    setFolha((f) => ({ ...f, aberta: false }));
    notificar.sucesso(novo ? "Produto criado" : "Alterações salvas", produto.nome);
  }

  const abrirNovo = () => setFolha({ aberta: true, produto: null });
  const abrirEdicao = (produto: Produto) => setFolha({ aberta: true, produto });

  const acoes = (produto: Produto) => (
    <div className={estilos.acoes}>
      <BotaoIcone rotulo={`Editar ${produto.nome}`} variante="neutro" tamanho={34} onClick={() => abrirEdicao(produto)}>
        <IconeEditar />
      </BotaoIcone>
      <BotaoIcone rotulo={`Excluir ${produto.nome}`} variante="perigo" tamanho={34} onClick={() => {
          setParaExcluir(produto);
          setConfirmando(true);
        }}>
        <IconeLixo />
      </BotaoIcone>
    </div>
  );

  return (
    <>
      <div className={estilos.topo}>
        <header className={estilos.cabecalho}>
          <h1 className={estilos.titulo}>Produtos e estoque</h1>
          {dados && (
            <p className={estilos.resumo}>
              {plural(produtos.length, "produto", "produtos")} · {noCardapio} no cardápio
              {acabando > 0 && ` · ${acabando} acabando ou sem estoque`}
            </p>
          )}
        </header>
        <div className={estilos.ferramentas}>
          <CampoBusca className={estilos.busca} rotulo="Buscar produto" valor={busca} aoMudar={setBusca} />
          <Button tamanho="pequeno" icone={<IconeMais />} onClick={abrirNovo}>
            Novo produto
          </Button>
        </div>
      </div>

      {carregando ? (
        <Carregando rotulo="Carregando produtos…">
          <div className={estilos.estado} style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Skeleton largura={40} altura={40} raio={10} />
                <Skeleton largura={`${40 - i * 4}%`} altura={15} />
              </div>
            ))}
          </div>
        </Carregando>
      ) : erro && !dados ? (
        <div className={estilos.estado}>
          <EstadoErro mensagem={mensagemDeErro(erro)} aoTentarDeNovo={tentarDeNovo} tentando={tentandoDeNovo} />
        </div>
      ) : produtos.length === 0 ? (
        <div className={estilos.estado}>
          <EmptyState
            icone={<IconeProdutos tamanho={26} />}
            titulo="Nenhum produto cadastrado"
            descricao="Cadastre o primeiro produto para ele aparecer no cardápio dos alunos."
            acao={{ rotulo: "Novo produto", aoClicar: abrirNovo }}
          />
        </div>
      ) : visiveis.length === 0 ? (
        <div className={estilos.estado}>
          <EmptyState
            titulo={`Nenhum produto para “${busca.trim()}”`}
            descricao="Confira a grafia ou busque pela categoria."
            acao={{ rotulo: "Limpar busca", aoClicar: () => setBusca("") }}
          />
        </div>
      ) : estreito ? (
        <ul className={estilos.cards} aria-label="Produtos">
          <AnimatePresence initial={false}>
            {visiveis.map((produto) => (
              <motion.li key={produto.id} className={`${estilos.card} ${produto.ativo ? "" : estilos.inativo}`} exit={SAIR}>
                <div className={estilos.cardTopo}>
                  <span className={estilos.foto}>
                    <ProdutoFoto nome={produto.nome} imagemUrl={produto.imagemUrl} tamanho="pequena" />
                  </span>
                  <span className={estilos.produtoTexto}>
                    <span className={estilos.produtoNome}>{produto.nome}</span>
                    {produto.categoria && (
                      <span className={estilos.produtoDescricao} title={produto.categoria}>
                        {produto.categoria}
                      </span>
                    )}
                    <span className={estilos.preco}>{formatarPreco(produto.preco)}</span>
                  </span>
                  {acoes(produto)}
                </div>
                <div className={estilos.cardLinha}>
                  <span className={estilos.estoque}>
                    <span className={estilos.cardRotulo}>Estoque</span>
                    <AjusteEstoque produto={produto} aoAtualizar={substituir} />
                    <SeloEstoque quantidade={produto.quantidadeEstoque} />
                  </span>
                  <label className={estilos.cardSwitch}>
                    No cardápio
                    <Switch ligado={produto.ativo} aoMudar={(v) => void alternarAtivo(produto, v)} />
                  </label>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        <div className={estilos.tabelaCaixa}>
          <table className={estilos.tabela}>
            <thead>
              <tr>
                <th scope="col" className={estilos.colunaProduto}>
                  Produto
                </th>
                <th scope="col" className={estilos.colunaCategoria}>
                  Categoria
                </th>
                <th scope="col" className={`${estilos.direita} ${estilos.compacta}`}>
                  Preço
                </th>
                <th scope="col" className={estilos.compacta}>
                  Estoque
                </th>
                <th scope="col" className={estilos.compacta}>
                  No cardápio
                </th>
                <th scope="col" className={`${estilos.direita} ${estilos.compacta}`}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {visiveis.map((produto) => (
                  <motion.tr key={produto.id} className={produto.ativo ? "" : estilos.inativo} exit={SAIR}>
                    <td>
                      <div className={estilos.produto}>
                        <span className={estilos.foto}>
                          <ProdutoFoto nome={produto.nome} imagemUrl={produto.imagemUrl} tamanho="pequena" />
                        </span>
                        <span className={estilos.produtoTexto}>
                          <span className={estilos.produtoNome}>{produto.nome}</span>
                          {produto.descricao && (
                            <span className={estilos.produtoDescricao} title={produto.descricao}>
                              {produto.descricao}
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className={estilos.categoria}>{produto.categoria ?? "—"}</td>
                    <td className={`${estilos.preco} ${estilos.direita}`}>{formatarPreco(produto.preco)}</td>
                    <td>
                      <div className={estilos.estoque}>
                        <AjusteEstoque produto={produto} aoAtualizar={substituir} />
                        <SeloEstoque quantidade={produto.quantidadeEstoque} />
                      </div>
                    </td>
                    <td>
                      <Switch
                        ligado={produto.ativo}
                        rotulo={`Mostrar ${produto.nome} no cardápio`}
                        aoMudar={(v) => void alternarAtivo(produto, v)}
                      />
                    </td>
                    <td>{acoes(produto)}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {dados && produtos.length > 0 && (
        <p className={estilos.rodapeNota}>Produtos fora do cardápio ou sem estoque não aparecem para os alunos.</p>
      )}

      <FolhaProduto
        aberto={folha.aberta}
        produto={folha.produto}
        categorias={categorias}
        aoFechar={() => setFolha((f) => ({ ...f, aberta: false }))}
        aoSalvar={aoSalvar}
      />

      <AlertDialog
        aberto={confirmando}
        titulo={`Excluir “${paraExcluir?.nome ?? ""}”?`}
        mensagem="Se o produto já tiver sido vendido, ele só será removido do cardápio."
        rotuloConfirmar="Excluir"
        rotuloVoltar="Cancelar"
        destrutivo
        carregando={excluindo}
        aoConfirmar={() => void confirmarExclusao()}
        aoFechar={() => setConfirmando(false)}
      />
    </>
  );
}
