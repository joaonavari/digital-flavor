import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";
import estilos from "./Button.module.css";

type Variante = "primario" | "secundario" | "neutro" | "sucesso" | "perigo" | "perigoSolido" | "simples";
type Tamanho = "grande" | "medio" | "pequeno";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamanho?: Tamanho;
  larguraTotal?: boolean;
  /** Mostra um indicador e ignora cliques, sem mudar o tamanho do botão. */
  carregando?: boolean;
  icone?: ReactNode;
}

export function Button({
  variante = "primario",
  tamanho = "medio",
  larguraTotal = false,
  carregando = false,
  icone,
  className,
  children,
  type = "button",
  onClick,
  ...resto
}: ButtonProps) {
  const classes = [
    estilos.botao,
    estilos[variante],
    estilos[tamanho],
    larguraTotal ? estilos.larguraTotal : "",
    className ?? "",
  ].join(" ");

  function clicar(evento: MouseEvent<HTMLButtonElement>) {
    // Enquanto carrega o botão segue focável (aria-disabled), mas não repete a ação.
    if (carregando) {
      evento.preventDefault();
      return;
    }
    onClick?.(evento);
  }

  return (
    <button
      type={type}
      className={classes}
      aria-busy={carregando || undefined}
      aria-disabled={carregando || undefined}
      onClick={clicar}
      {...resto}
    >
      <span className={`${estilos.conteudo} ${carregando ? estilos.carregandoConteudo : ""}`}>
        {icone}
        {children}
      </span>
      {carregando && <span className={estilos.spinner} aria-hidden="true" />}
    </button>
  );
}

type VarianteIcone = "primario" | "secundario" | "neutro" | "perigo";

interface BotaoIconeProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  /** Obrigatório: o botão não tem texto visível. */
  rotulo: string;
  variante?: VarianteIcone;
  tamanho?: 32 | 34 | 44;
  children: ReactNode;
}

const CLASSE_VARIANTE_ICONE: Record<VarianteIcone, string | undefined> = {
  primario: estilos.iconePrimario,
  secundario: estilos.iconeSecundario,
  neutro: estilos.iconeNeutro,
  perigo: estilos.iconePerigo,
};

/** Botão redondo só com ícone (fechar, editar, excluir, +). */
export function BotaoIcone({
  rotulo,
  variante = "secundario",
  tamanho = 32,
  className,
  type = "button",
  children,
  ...resto
}: BotaoIconeProps) {
  return (
    <button
      type={type}
      aria-label={rotulo}
      className={`${estilos.icone} ${estilos[`icone${tamanho}`]} ${CLASSE_VARIANTE_ICONE[variante]} ${className ?? ""}`}
      {...resto}
    >
      {children}
    </button>
  );
}
