import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import estilos from "./TextField.module.css";

interface BaseProps {
  rotulo: string;
  /** Mensagem de erro mostrada junto ao campo (deixa o campo inválido). */
  erro?: string | null;
  /** Texto de ajuda abaixo do campo. */
  dica?: ReactNode;
  /** Texto fixo antes da entrada, como "R$". */
  prefixo?: string;
  /** Elemento à direita, como um botão de mostrar senha. */
  acessorio?: ReactNode;
  /** true quando está dentro de <GrupoCampos>. */
  agrupado?: boolean;
}

export type TextFieldInputProps = BaseProps & InputHTMLAttributes<HTMLInputElement> & { multilinha?: false };
type AreaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement> & { multilinha: true };

export function TextField(props: TextFieldInputProps | AreaProps) {
  const { rotulo, erro, dica, prefixo, acessorio, agrupado = false, id, className, ...resto } = props;
  const idGerado = useId();
  const idCampo = id ?? idGerado;
  const idMensagem = `${idCampo}-mensagem`;
  const temMensagem = Boolean(erro || dica);

  const atributos = {
    id: idCampo,
    className: estilos.entrada,
    "aria-invalid": erro ? true : undefined,
    "aria-describedby": temMensagem ? idMensagem : undefined,
  };

  return (
    <div
      className={[estilos.campo, agrupado ? "" : estilos.sozinho, erro ? estilos.invalido : "", className ?? ""].join(
        " ",
      )}
    >
      <label htmlFor={idCampo} className={estilos.rotulo}>
        {rotulo}
      </label>
      <div className={estilos.linha}>
        {prefixo && (
          <span className={estilos.prefixo} aria-hidden="true">
            {prefixo}
          </span>
        )}
        {resto.multilinha ? (
          <textarea {...omitirMultilinha(resto)} {...atributos} />
        ) : (
          <input {...omitirMultilinha(resto)} {...atributos} />
        )}
        {acessorio && <span className={estilos.acessorio}>{acessorio}</span>}
      </div>
      {temMensagem && (
        <p id={idMensagem} className={erro ? estilos.erro : estilos.mensagem}>
          {erro || dica}
        </p>
      )}
    </div>
  );
}

function omitirMultilinha<T extends { multilinha?: boolean }>(valor: T): Omit<T, "multilinha"> {
  const { multilinha: _ignorado, ...resto } = valor;
  void _ignorado;
  return resto;
}

/** Card que junta vários campos com divisórias, estilo Ajustes do iOS. */
export function GrupoCampos({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`${estilos.grupo} ${className ?? ""}`}>{children}</div>;
}
