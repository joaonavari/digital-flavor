import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useLayoutEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "../Button";
import estilos from "./AlertDialog.module.css";

interface Props {
  aberto: boolean;
  titulo: string;
  mensagem?: ReactNode;
  /** Texto da ação principal: diga o que acontece ("Cancelar pedido", "Excluir"). */
  rotuloConfirmar: string;
  rotuloVoltar?: string;
  destrutivo?: boolean;
  carregando?: boolean;
  aoConfirmar: () => void;
  aoFechar: () => void;
}

const SAIDA = [0.23, 1, 0.32, 1] as const;

/**
 * Confirmação de ação importante (ex.: cancelar pedido, excluir produto).
 * O foco começa no botão seguro; Esc e tocar fora cancelam.
 */
export function AlertDialog(props: Props) {
  return createPortal(
    <AnimatePresence>{props.aberto && <Dialogo key="dialogo" {...props} />}</AnimatePresence>,
    document.body,
  );
}

function Dialogo({
  titulo,
  mensagem,
  rotuloConfirmar,
  rotuloVoltar = "Voltar",
  destrutivo = false,
  carregando = false,
  aoConfirmar,
  aoFechar,
}: Props) {
  const reduzir = useReducedMotion() ?? false;
  const idTitulo = useId();
  const idMensagem = useId();
  const voltar = useRef<HTMLButtonElement>(null);
  const aoFecharRef = useRef(aoFechar);
  const carregandoRef = useRef(carregando);
  useLayoutEffect(() => {
    aoFecharRef.current = aoFechar;
    carregandoRef.current = carregando;
  });

  useEffect(() => {
    const raizApp = document.getElementById("root");
    const focoAnterior = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    raizApp?.setAttribute("inert", "");
    voltar.current?.focus();
    function teclar(evento: KeyboardEvent) {
      if (evento.key === "Escape" && !carregandoRef.current) aoFecharRef.current();
    }
    document.addEventListener("keydown", teclar);
    return () => {
      document.removeEventListener("keydown", teclar);
      // Só libera o app se nenhuma folha estiver aberta por baixo.
      if (!document.querySelector('[role="dialog"][aria-modal="true"]')) raizApp?.removeAttribute("inert");
      focoAnterior?.focus({ preventScroll: true });
    };
  }, []);

  const inicio = reduzir ? { opacity: 0 } : { opacity: 0, scale: 0.96 };

  return (
    <div className={estilos.raiz}>
      <motion.div
        className={estilos.fundo}
        aria-hidden="true"
        onClick={() => !carregando && aoFechar()}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.25, ease: SAIDA } }}
        exit={{ opacity: 0, transition: { duration: 0.15, ease: SAIDA } }}
      />
      <motion.div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        aria-describedby={mensagem ? idMensagem : undefined}
        className={estilos.dialogo}
        initial={inicio}
        animate={{ opacity: 1, scale: 1, transition: { duration: 0.25, ease: SAIDA } }}
        exit={{ ...inicio, transition: { duration: 0.15, ease: SAIDA } }}
      >
        <h2 id={idTitulo} className={estilos.titulo}>
          {titulo}
        </h2>
        {mensagem && (
          <div id={idMensagem} className={estilos.mensagem}>
            {mensagem}
          </div>
        )}
        <div className={estilos.acoes}>
          <Button
            variante={destrutivo ? "perigoSolido" : "primario"}
            larguraTotal
            carregando={carregando}
            onClick={aoConfirmar}
          >
            {rotuloConfirmar}
          </Button>
          <Button ref={voltar} variante="secundario" larguraTotal onClick={aoFechar} disabled={carregando}>
            {rotuloVoltar}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
