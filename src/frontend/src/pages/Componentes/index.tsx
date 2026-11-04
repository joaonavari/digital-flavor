import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { BotaoIcone, Button } from "../../components/Button";
import { EmptyState, EstadoErro } from "../../components/EmptyState";
import { IconePedidos } from "../../components/Icones";
import { SegmentedControl } from "../../components/SegmentedControl";
import { Sheet } from "../../components/Sheet";
import { Carregando, Skeleton } from "../../components/Skeleton";
import { Switch } from "../../components/Switch";
import { GrupoCampos, TextField } from "../../components/TextField";
import { formatarPreco } from "../../lib/formatar";
import { notificar } from "../../lib/notificar";
import { ErroApi } from "../../api/http";
import { DADOS, type Conjunto } from "./dados";
import estilos from "./Componentes.module.css";

const IconeMais = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
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

/** Vitrine dos componentes base. Só existe em desenvolvimento (rota /componentes). */
export function Componentes() {
  const [busca] = useSearchParams();
  const conjunto: Conjunto = busca.get("dados") === "pior" ? "pior" : "demo";
  const d = DADOS[conjunto];

  const [categoria, setCategoria] = useState("Todos");
  const [metodo, setMetodo] = useState<"PIX" | "CARTAO">("PIX");
  const [noCardapio, setNoCardapio] = useState(true);
  const [outroSwitch, setOutroSwitch] = useState(false);
  const [folhaAberta, setFolhaAberta] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [cartao, setCartao] = useState(d.valorCampo);

  const total = d.itensFolha.reduce((s, i) => s + i.preco * i.quantidade, 0);
  const categoriaValida = d.categorias.includes(categoria) ? categoria : "Todos";

  function simularCarregamento() {
    setCarregando(true);
    setTimeout(() => setCarregando(false), 1500);
  }

  return (
    <main className={estilos.tela}>
      <h1 className={estilos.titulo}>Componentes</h1>

      <section className={estilos.secao}>
        <span className="section-label">Seletor segmentado</span>
        <SegmentedControl
          rotulo="Categorias"
          papel="tablist"
          opcoes={d.categorias.map((c) => ({ valor: c, rotulo: c }))}
          valor={categoriaValida}
          aoMudar={setCategoria}
        />
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
      </section>

      <section className={estilos.secao}>
        <span className="section-label">Botões</span>
        <Button tamanho="grande" larguraTotal onClick={simularCarregamento} carregando={carregando}>
          {d.rotuloBotao}
        </Button>
        <div className={estilos.linha}>
          <Button variante="secundario">Cancelar</Button>
          <Button variante="neutro" tamanho="pequeno">Iniciar preparo</Button>
          <Button variante="sucesso" tamanho="pequeno">Entregar</Button>
          <Button variante="perigo">Excluir</Button>
          <Button variante="simples">Criar conta</Button>
          <Button disabled>Desabilitado</Button>
        </div>
        <div className={estilos.linha}>
          <BotaoIcone rotulo={`Adicionar ${d.nomeProduto}`} variante="primario" tamanho={44}>
            <IconeMais />
          </BotaoIcone>
          <BotaoIcone rotulo={`Editar ${d.nomeProduto}`} variante="neutro" tamanho={34}>
            <IconeEditar />
          </BotaoIcone>
          <BotaoIcone rotulo={`Excluir ${d.nomeProduto}`} variante="perigo" tamanho={34}>
            <IconeLixo />
          </BotaoIcone>
        </div>
      </section>

      <section className={estilos.secao}>
        <span className="section-label">Interruptor</span>
        <div className={estilos.card}>
          <label className={estilos.linhaSwitch}>
            <span>No cardápio · {d.nomeProduto}</span>
            <Switch ligado={noCardapio} aoMudar={setNoCardapio} />
          </label>
          <label className={estilos.linhaSwitch}>
            <span>Usuário ativo</span>
            <Switch ligado={outroSwitch} aoMudar={setOutroSwitch} />
          </label>
        </div>
      </section>

      <section className={estilos.secao}>
        <span className="section-label">Campos</span>
        <GrupoCampos>
          <TextField agrupado rotulo="E-mail" type="email" placeholder="voce@escola.com" autoComplete="off" />
          <TextField
            agrupado
            rotulo={d.rotuloCampo}
            inputMode="numeric"
            placeholder="0000 0000 0000 0000"
            value={cartao}
            onChange={(e) => setCartao(e.target.value)}
            erro={d.erroCampo}
          />
        </GrupoCampos>
        <TextField rotulo="Preço" prefixo="R$" inputMode="decimal" placeholder="0,00" dica="Use vírgula para os centavos." />
        <TextField rotulo="Descrição" multilinha placeholder="Opcional" />
      </section>

      <section className={estilos.secao}>
        <span className="section-label">Notificações</span>
        <div className={estilos.linha}>
          <Button variante="secundario" onClick={() => notificar.sucesso(d.toastSucesso)}>
            Sucesso
          </Button>
          <Button variante="secundario" onClick={() => notificar.erro(new ErroApi(422, d.toastErro))}>
            Erro de estoque
          </Button>
          <Button variante="secundario" onClick={() => notificar.erro(new ErroApi(0, d.erroRede), "Sem conexão")}>
            Erro de rede
          </Button>
        </div>
      </section>

      <section className={estilos.secao}>
        <span className="section-label">Folha</span>
        <Button variante="secundario" onClick={() => setFolhaAberta(true)}>
          Abrir folha
        </Button>
      </section>

      <section className={estilos.secao}>
        <span className="section-label">Carregando</span>
        <Carregando>
          {[0, 1].map((i) => (
            <div key={i} className={estilos.esqueleto} style={{ marginTop: i ? 10 : 0 }}>
              <Skeleton largura={64} altura={64} raio={16} />
              <div className={estilos.esqueletoTexto}>
                <Skeleton largura="70%" altura={17} />
                <Skeleton largura="45%" altura={13} />
              </div>
            </div>
          ))}
        </Carregando>
      </section>

      <section className={estilos.secao}>
        <span className="section-label">Vazio e erro</span>
        <div className={estilos.card}>
          <EmptyState
            icone={<IconePedidos tamanho={26} />}
            titulo={d.tituloVazio}
            descricao={d.descricaoVazio}
            acao={{ rotulo: "Ver cardápio", aoClicar: () => undefined }}
          />
        </div>
        <div className={estilos.card}>
          <EstadoErro mensagem={d.erroRede} aoTentarDeNovo={simularCarregamento} tentando={carregando} />
        </div>
      </section>

      <Sheet
        aberto={folhaAberta}
        aoFechar={() => setFolhaAberta(false)}
        titulo={d.tituloFolha}
        rodape={
          <>
            <div className={estilos.total}>
              <span className={estilos.totalRotulo}>Total · retirar no balcão</span>
              <span className={estilos.totalValor}>{formatarPreco(total)}</span>
            </div>
            <Button tamanho="grande" larguraTotal onClick={() => setFolhaAberta(false)}>
              {d.rotuloBotao}
            </Button>
          </>
        }
      >
        <div className={estilos.lista}>
          {d.itensFolha.map((item) => (
            <div key={item.nome} className={estilos.item}>
              <div className={estilos.itemTexto}>
                <span className={estilos.itemNome}>{item.nome}</span>
                <span className={estilos.itemPreco}>
                  {item.quantidade}× · {formatarPreco(item.preco)} cada
                </span>
              </div>
              <span className={estilos.itemSubtotal}>{formatarPreco(item.preco * item.quantidade)}</span>
            </div>
          ))}
        </div>
        <div className={estilos.secao} style={{ marginTop: 22 }}>
          <span className="section-label">Forma de pagamento</span>
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
          {metodo === "CARTAO" && (
            <TextField
              rotulo="Número do cartão"
              inputMode="numeric"
              placeholder="0000 0000 0000 0000"
              dica="Guardamos só os 4 últimos dígitos."
            />
          )}
        </div>
      </Sheet>

      <nav className={estilos.alternador} aria-label="Dados de teste">
        <Link to="?dados=demo" aria-current={conjunto === "demo"}>
          Demo
        </Link>
        <Link to="?dados=pior" aria-current={conjunto === "pior"}>
          Pior caso
        </Link>
      </nav>
    </main>
  );
}
