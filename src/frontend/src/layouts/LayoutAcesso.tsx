import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { IconeCartao, IconeCheck, IconeEstoque, IconeFolha } from "../components/Icones";
import { IconeDoApp } from "../components/MarcaApp";
import estilos from "./LayoutAcesso.module.css";

/* A entrada suave roda uma vez por visita: ir de "Entrar" para "Criar conta" não anima de novo. */
let jaEntrou = false;

const atraso = (ordem: number) => ({ "--atraso": `${ordem * 60}ms` }) as CSSProperties;

/** Card decorativo de "pedido pronto": mostra o que o app faz, sem ser um dado real. */
function CardPronto({ noPainel = false }: { noPainel?: boolean }) {
  return (
    <div className={`${estilos.cardPronto} ${noPainel ? estilos.cardPainel : ""}`} aria-hidden="true">
      <span className={estilos.cardIcone}>
        <IconeCheck tamanho={18} traco={2.6} />
      </span>
      <span className={estilos.cardTexto}>
        <span className={estilos.cardTitulo}>Seu pedido está pronto</span>
        <span className={estilos.cardDetalhe}>2× Coxinha · 1× Suco · retire no balcão</span>
      </span>
    </div>
  );
}

const BENEFICIOS = [
  { Icone: IconeEstoque, texto: "Só aparece o que tem no estoque" },
  { Icone: IconeCartao, texto: "PIX ou cartão, direto no pedido" },
  { Icone: IconeFolha, texto: "Menos desperdício na cantina · ODS 12" },
];

/** Painel azul da esquerda, só no computador (≥ 900px). */
function Painel() {
  return (
    <aside className={`${estilos.painel} ${estilos.surge}`} style={atraso(0)} aria-label="Sobre o Digital Flavor">
      <div className={estilos.painelMarca}>
        <IconeDoApp tamanho={32} />
        <span>Digital Flavor</span>
      </div>
      <div className={estilos.painelCorpo}>
        <p className={estilos.painelTitulo}>Peça antes. Retire sem fila.</p>
        <p className={estilos.painelTexto}>
          Monte o lanche pelo celular antes do intervalo. A cantina prepara e avisa quando estiver pronto.
        </p>
        <ul className={estilos.beneficios}>
          {BENEFICIOS.map(({ Icone, texto }) => (
            <li key={texto}>
              <span className={estilos.beneficioIcone} aria-hidden="true">
                <Icone tamanho={18} traco={2} />
              </span>
              {texto}
            </li>
          ))}
        </ul>
      </div>
      <CardPronto noPainel />
    </aside>
  );
}

interface Props {
  variante: "entrar" | "cadastro";
  titulo: string;
  subtitulo: string;
  children: ReactNode;
  /** Abaixo do formulário (ex.: aviso do modo de exemplo). */
  rodape?: ReactNode;
}

/** Moldura das telas de login e cadastro. */
export function LayoutAcesso({ variante, titulo, subtitulo, children, rodape }: Props) {
  const [animar] = useState(() => !jaEntrou);
  useEffect(() => {
    jaEntrou = true;
  }, []);
  const entrar = variante === "entrar";

  return (
    <div className={estilos.tela} data-animar={animar || undefined}>
      <Painel />

      <main className={estilos.lado}>
        <div className={`${estilos.coluna} ${entrar ? estilos.colunaEntrar : ""}`}>
          {entrar ? (
            /* Celular: marca grande no centro, com o card de exemplo. */
            <div className={`${estilos.heroi} ${estilos.surge}`} style={atraso(0)}>
              <IconeDoApp tamanho={76} sombra />
              <p className={estilos.nomeApp}>Digital Flavor</p>
              <p className={estilos.slogan}>Peça antes do intervalo. Retire sem fila.</p>
              <CardPronto />
            </div>
          ) : (
            <div className={`${estilos.marcaPequena} ${estilos.surge}`} style={atraso(0)}>
              <IconeDoApp tamanho={56} sombra />
              <span>Digital Flavor</span>
            </div>
          )}

          <header className={`${estilos.cabecalho} ${entrar ? estilos.cabecalhoEntrar : ""} ${estilos.surge}`} style={atraso(1)}>
            <h1 className={estilos.titulo}>{titulo}</h1>
            <p className={estilos.subtitulo}>{subtitulo}</p>
          </header>

          <div className={`${estilos.conteudo} ${estilos.surge}`} style={atraso(entrar ? 1 : 2)}>
            {children}
          </div>

          {rodape && <div className={estilos.rodape}>{rodape}</div>}

          {entrar && (
            <p className={estilos.selo}>
              <IconeFolha tamanho={16} traco={2} />
              <span>
                Menos desperdício na cantina · <span className={estilos.semQuebra}>ODS 12</span>
              </span>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
